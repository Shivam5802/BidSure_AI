import crypto from 'crypto';
import {
  ConflictType,
  ConflictSeverity,
  ConflictStatus,
  ConflictRole,
} from '@prisma/client';
import {
  NormalizedComparableFact,
  ComparabilityResultType,
  DetectedConflictDraft,
} from './conflict.types.js';
import { conflictNormalizerService } from './conflict-normalizer.service.js';

export class ConflictDetectorService {
  /**
   * Main entry point to detect all contradictions across a list of bidder evidence items.
   */
  detectConflicts(
    tenderId: string,
    bidderId: string,
    bidSubmissionId: string,
    evidenceItems: any[]
  ): DetectedConflictDraft[] {
    // 1. Filter usable evidence (only EXTRACTED, VERIFIED_BY_HUMAN, or REVIEW_REQUIRED)
    const validItems = evidenceItems.filter(
      (e) => e.status !== 'REJECTED'
    );

    if (validItems.length < 2) {
      return [];
    }

    // 2. Convert evidence records into NormalizedComparableFacts
    const facts: NormalizedComparableFact[] = validItems.map((e) =>
      this.toComparableFact(e)
    );

    // 3. Group facts by fieldKey (and normalized period where applicable)
    const grouped = this.groupFactsByCandidateContext(facts);

    const detectedDrafts: DetectedConflictDraft[] = [];

    // 4. For each candidate group with >= 2 facts, perform pairwise / multi-source conflict detection
    for (const groupKey of Object.keys(grouped)) {
      const groupFacts = grouped[groupKey];
      if (!groupFacts || groupFacts.length < 2) continue;

      const groupConflicts = this.evaluateFactGroup(
        tenderId,
        bidderId,
        bidSubmissionId,
        groupFacts
      );
      detectedDrafts.push(...groupConflicts);
    }

    // 5. Deduplicate by fingerprint
    const uniqueDrafts = new Map<string, DetectedConflictDraft>();
    for (const draft of detectedDrafts) {
      if (!uniqueDrafts.has(draft.fingerprint)) {
        uniqueDrafts.set(draft.fingerprint, draft);
      }
    }

    return Array.from(uniqueDrafts.values());
  }

  private toComparableFact(e: any): NormalizedComparableFact {
    const norm = e.normalizedValue || {};
    return {
      evidenceId: e.id,
      bidDocumentId: e.bidDocumentId,
      documentPageId: e.documentPageId,
      fieldKey: e.fieldKey,
      fieldLabel: e.fieldLabel || e.fieldKey,
      rawValue: e.rawValue,
      normalizedValue: norm,
      valueType: e.valueType || 'STRING',
      unit: e.unit || norm.unit || null,
      entityReference: norm.entityReference || norm.entity || null,
      financialYear: norm.financialYear || norm.year || norm.period || null,
      normalizedPeriod: conflictNormalizerService.normalizeFinancialPeriod(
        norm.financialYear || norm.year || norm.period
      ),
      periodStart: norm.periodStart || null,
      periodEnd: norm.periodEnd || null,
      sourceDate: norm.sourceDate || norm.date || null,
      documentType: e.bidDocument?.documentType || 'DOCUMENT',
      documentName: e.bidDocument?.originalFilename || 'Bid Document',
      pageNumber: e.pageNumber || 1,
      confidence: e.confidence || 0.9,
      evidenceStatus: e.status || 'EXTRACTED',
      sourceText: e.sourceText || e.rawValue,
    };
  }

  private groupFactsByCandidateContext(
    facts: NormalizedComparableFact[]
  ): Record<string, NormalizedComparableFact[]> {
    const grouped: Record<string, NormalizedComparableFact[]> = {};

    for (const fact of facts) {
      const normalizedField = fact.fieldKey.toLowerCase();
      // Group by fieldKey + normalizedPeriod (if present)
      const periodKey = fact.normalizedPeriod ? `__${fact.normalizedPeriod}` : '';
      const groupKey = `${normalizedField}${periodKey}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(fact);
    }

    return grouped;
  }

  private evaluateFactGroup(
    tenderId: string,
    bidderId: string,
    bidSubmissionId: string,
    facts: NormalizedComparableFact[]
  ): DetectedConflictDraft[] {
    const conflicts: DetectedConflictDraft[] = [];

    // Compare pairwise combinations in group
    for (let i = 0; i < facts.length; i++) {
      for (let j = i + 1; j < facts.length; j++) {
        const factA = facts[i];
        const factB = facts[j];
        if (!factA || !factB) continue;

        // 1. Run Comparability check
        const comp = conflictNormalizerService.evaluateComparability(factA, factB);

        // FALSE POSITIVE PROTECTION:
        // If different financial period or equal numeric value, skip
        if (
          comp.type === ComparabilityResultType.DIFFERENT_PERIOD ||
          comp.type === ComparabilityResultType.EQUAL_VALUE ||
          comp.type === ComparabilityResultType.INSUFFICIENT_CONTEXT
        ) {
          continue;
        }

        if (comp.type === ComparabilityResultType.DIFFERENT_ENTITY) {
          // Document context / entity ambiguity
          const conflict = this.buildConflictDraft({
            tenderId,
            bidderId,
            bidSubmissionId,
            conflictType: ConflictType.DOCUMENT_CONTEXT_CONFLICT,
            fieldKey: factA.fieldKey,
            factA,
            factB,
            description: comp.reason,
            severity: ConflictSeverity.MEDIUM,
            confidence: 0.8,
            requiresInvestigation: true,
          });
          conflicts.push(conflict);
          continue;
        }

        // 2. Determine Conflict Type based on valueType & field semantics
        const conflictType = this.determineConflictType(factA, factB);
        if (!conflictType) continue;

        // 3. Build Natural Language Explanation
        const explanation = this.generateExplanation(factA, factB, conflictType, comp);

        // 4. Calculate Severity & Confidence
        const severity = this.calculateSeverity(factA, conflictType);
        const confidence = Math.min(factA.confidence, factB.confidence);

        // 5. Create Conflict Draft
        const conflict = this.buildConflictDraft({
          tenderId,
          bidderId,
          bidSubmissionId,
          conflictType,
          fieldKey: factA.fieldKey,
          factA,
          factB,
          description: explanation,
          severity,
          confidence,
          requiresInvestigation: severity === ConflictSeverity.HIGH || severity === ConflictSeverity.CRITICAL,
        });

        conflicts.push(conflict);
      }
    }

    return conflicts;
  }

  private determineConflictType(
    factA: NormalizedComparableFact,
    factB: NormalizedComparableFact
  ): ConflictType | null {
    const valTypeA = factA.valueType.toUpperCase();
    const valTypeB = factB.valueType.toUpperCase();
    const fieldKey = factA.fieldKey.toLowerCase();

    // Check Entity Name
    if (valTypeA === 'ENTITY' || valTypeB === 'ENTITY' || fieldKey.includes('name') || fieldKey.includes('legal')) {
      const nameA = conflictNormalizerService.normalizeEntityName(factA.rawValue);
      const nameB = conflictNormalizerService.normalizeEntityName(factB.rawValue);
      if (nameA !== nameB) {
        return ConflictType.ENTITY_NAME_CONFLICT;
      }
    }

    // Check Identifier
    if (
      valTypeA === 'IDENTIFIER' ||
      valTypeB === 'IDENTIFIER' ||
      fieldKey.includes('pan') ||
      fieldKey.includes('gst') ||
      fieldKey.includes('udyam') ||
      fieldKey.includes('cin')
    ) {
      const idA = factA.rawValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const idB = factB.rawValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (idA !== idB) {
        return ConflictType.IDENTIFIER_CONFLICT;
      }
    }

    // Check Percentage
    if (valTypeA === 'PERCENTAGE' || valTypeB === 'PERCENTAGE' || factA.unit === '%' || factB.unit === '%') {
      const normA = conflictNormalizerService.normalizeNumericValue(factA.rawValue, factA.unit);
      const normB = conflictNormalizerService.normalizeNumericValue(factB.rawValue, factB.unit);
      if (normA.value !== null && normB.value !== null && Math.abs(normA.value - normB.value) > 0.01) {
        return ConflictType.PERCENTAGE_CONFLICT;
      }
    }

    // Check Numeric Currency / Financial Value
    if (
      valTypeA === 'CURRENCY' ||
      valTypeB === 'CURRENCY' ||
      valTypeA === 'DECIMAL' ||
      valTypeB === 'DECIMAL' ||
      valTypeA === 'INTEGER' ||
      valTypeB === 'INTEGER' ||
      fieldKey.includes('worth') ||
      fieldKey.includes('turnover') ||
      fieldKey.includes('amount') ||
      fieldKey.includes('capital')
    ) {
      const normA = conflictNormalizerService.normalizeNumericValue(factA.rawValue, factA.unit);
      const normB = conflictNormalizerService.normalizeNumericValue(factB.rawValue, factB.unit);
      if (normA.value !== null && normB.value !== null && Math.abs(normA.value - normB.value) > 0.001) {
        return ConflictType.NUMERIC_VALUE_CONFLICT;
      }
    }

    // Check Dates
    if (valTypeA === 'DATE' || valTypeB === 'DATE' || fieldKey.includes('date')) {
      const dateA = new Date(factA.rawValue).getTime();
      const dateB = new Date(factB.rawValue).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
        if (fieldKey.includes('validity') || fieldKey.includes('expiry')) {
          return ConflictType.VALIDITY_CONFLICT;
        }
        return ConflictType.DATE_CONFLICT;
      }
    }

    // Check Boolean
    if (valTypeA === 'BOOLEAN' || valTypeB === 'BOOLEAN' || fieldKey.includes('blacklisted') || fieldKey.includes('declared')) {
      const boolA = factA.rawValue.toLowerCase().includes('yes') || factA.rawValue.toLowerCase() === 'true';
      const boolB = factB.rawValue.toLowerCase().includes('yes') || factB.rawValue.toLowerCase() === 'true';
      if (boolA !== boolB) {
        return ConflictType.BOOLEAN_CONFLICT;
      }
    }

    // Check Count
    if (valTypeA === 'COUNT' || valTypeB === 'COUNT' || fieldKey.includes('count') || fieldKey.includes('projects')) {
      const normA = conflictNormalizerService.normalizeNumericValue(factA.rawValue);
      const normB = conflictNormalizerService.normalizeNumericValue(factB.rawValue);
      if (normA.value !== null && normB.value !== null && normA.value !== normB.value) {
        return ConflictType.COUNT_CONFLICT;
      }
    }

    // Generic string / raw value mismatch
    if (factA.rawValue.trim().toLowerCase() !== factB.rawValue.trim().toLowerCase()) {
      return ConflictType.NUMERIC_VALUE_CONFLICT;
    }

    return null;
  }

  private generateExplanation(
    factA: NormalizedComparableFact,
    factB: NormalizedComparableFact,
    conflictType: ConflictType,
    _comp: any
  ): string {
    const fieldName = factA.fieldLabel || factA.fieldKey;
    const periodText = factA.normalizedPeriod
      ? ` for period ${factA.normalizedPeriod}`
      : '';

    return (
      `Potential ${conflictType.replace(/_/g, ' ')} detected for ${fieldName}${periodText}.\n\n` +
      `Source 1: ${factA.documentName} (Page ${factA.pageNumber}): "${factA.rawValue}"\n` +
      `Source 2: ${factB.documentName} (Page ${factB.pageNumber}): "${factB.rawValue}"\n\n` +
      `Both records refer to the same bidder and comparable context. ` +
      `No approved deterministic source-precedence rule currently resolves the difference.`
    );
  }

  private calculateSeverity(
    fact: NormalizedComparableFact,
    conflictType: ConflictType
  ): ConflictSeverity {
    const key = fact.fieldKey.toLowerCase();
    if (conflictType === ConflictType.ENTITY_NAME_CONFLICT || conflictType === ConflictType.IDENTIFIER_CONFLICT) {
      return ConflictSeverity.HIGH;
    }
    if (key.includes('blacklisted') || key.includes('eligibility')) {
      return ConflictSeverity.CRITICAL;
    }
    if (key.includes('net_worth') || key.includes('turnover') || conflictType === ConflictType.NUMERIC_VALUE_CONFLICT) {
      return ConflictSeverity.HIGH;
    }
    if (conflictType === ConflictType.PERCENTAGE_CONFLICT || conflictType === ConflictType.VALIDITY_CONFLICT) {
      return ConflictSeverity.MEDIUM;
    }
    return ConflictSeverity.LOW;
  }

  private buildConflictDraft(params: {
    tenderId: string;
    bidderId: string;
    bidSubmissionId: string;
    conflictType: ConflictType;
    fieldKey: string;
    factA: NormalizedComparableFact;
    factB: NormalizedComparableFact;
    description: string;
    severity: ConflictSeverity;
    confidence: number;
    requiresInvestigation: boolean;
  }): DetectedConflictDraft {
    const {
      tenderId,
      bidderId,
      bidSubmissionId,
      conflictType,
      fieldKey,
      factA,
      factB,
      description,
      severity,
      confidence,
      requiresInvestigation,
    } = params;

    // Idempotent Fingerprint Hash
    const sortedEvidenceIds = [factA.evidenceId, factB.evidenceId].sort();
    const fingerprintContent = `${tenderId}:${bidderId}:${fieldKey}:${conflictType}:${sortedEvidenceIds.join('-')}`;
    const fingerprint = crypto.createHash('sha256').update(fingerprintContent).digest('hex');

    return {
      tenderId,
      bidderId,
      bidSubmissionId,
      conflictType,
      severity,
      status: ConflictStatus.DETECTED,
      fieldKey,
      description,
      fingerprint,
      confidence,
      contextSnapshot: {
        fieldKey,
        financialPeriod: factA.normalizedPeriod || factB.normalizedPeriod,
        entityReference: factA.entityReference || factB.entityReference,
        comparedEvidenceIds: sortedEvidenceIds,
      },
      detectedBy: 'SYSTEM_CONTRADICTION_ENGINE',
      detectorVersion: '1.0.0',
      requiresInvestigation,
      items: [
        {
          evidenceId: factA.evidenceId,
          role: ConflictRole.CONFLICTING_SOURCE,
          normalizedValueSnapshot: factA.normalizedValue,
          sourceSnapshot: {
            rawValue: factA.rawValue,
            documentName: factA.documentName,
            documentType: factA.documentType,
            pageNumber: factA.pageNumber,
            sourceText: factA.sourceText,
          },
        },
        {
          evidenceId: factB.evidenceId,
          role: ConflictRole.CONFLICTING_SOURCE,
          normalizedValueSnapshot: factB.normalizedValue,
          sourceSnapshot: {
            rawValue: factB.rawValue,
            documentName: factB.documentName,
            documentType: factB.documentType,
            pageNumber: factB.pageNumber,
            sourceText: factB.sourceText,
          },
        },
      ],
    };
  }
}

export const conflictDetectorService = new ConflictDetectorService();
