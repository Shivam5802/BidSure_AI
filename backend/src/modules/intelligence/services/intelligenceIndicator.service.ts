import {
  IntelligenceIndicator,
  PriorityActionItem,
  IndicatorSeverity,
  IndicatorCategory,
} from '../types/intelligence.types.js';

export class IntelligenceIndicatorService {
  /**
   * Calculate deterministic operational indicators from underlying tender records.
   * Covers all 8 controlled indicator categories with deterministic severity assignment.
   */
  public generateIndicators(data: {
    requirements: any[];
    evaluations: any[];
    conflicts: any[];
    verifications: any[];
    investigations: any[];
    mappings: any[];
    tenderDocuments?: any[];
    bidDocuments?: any[];
  }): IntelligenceIndicator[] {
    const indicators: IntelligenceIndicator[] = [];
    const tenderId = data.requirements[0]?.blueprint?.tenderId || '';

    // Index requirements by ID for fast lookup
    const reqMap = new Map<string, any>();
    for (const r of data.requirements) {
      reqMap.set(r.id, r);
    }

    // -------------------------------------------------------------
    // 1. COMPLIANCE_FAILURE Indicators
    // -------------------------------------------------------------
    const failEvals = data.evaluations.filter((e) => e.result === 'FAIL');
    const mandatoryFailEvals = failEvals.filter(
      (e) => reqMap.get(e.requirementId)?.mandatory === 'YES' || e.requirement?.mandatory === 'YES'
    );
    const nonMandatoryFailEvals = failEvals.filter(
      (e) => (reqMap.get(e.requirementId)?.mandatory || e.requirement?.mandatory) !== 'YES'
    );

    if (mandatoryFailEvals.length > 0) {
      indicators.push({
        id: `ind_mand_fail_${tenderId}`,
        category: 'COMPLIANCE_FAILURE',
        code: 'MANDATORY_REQUIREMENT_FAIL',
        severity: 'HIGH',
        title: 'Mandatory requirement deterministic failures',
        description: `${mandatoryFailEvals.length} mandatory requirement evaluation(s) failed deterministic compliance checks.`,
        count: mandatoryFailEvals.length,
        entityType: 'TenderRequirement',
        entityId: mandatoryFailEvals[0]?.requirementId,
        sourceReferences: mandatoryFailEvals.map((e) => ({
          type: 'ComplianceEvaluation',
          id: e.id,
          label: e.requirement?.requirementCode || reqMap.get(e.requirementId)?.requirementCode || 'REQ',
          route: `/tenders/${tenderId}/workspace?filter=FAIL`,
        })),
        recommendedAction: 'Review Failed Mandatory Requirements',
        recommendedRoute: `/tenders/${tenderId}/workspace?filter=FAIL`,
        createdAt: new Date().toISOString(),
      });
    }

    if (nonMandatoryFailEvals.length > 0) {
      indicators.push({
        id: `ind_non_mand_fail_${tenderId}`,
        category: 'COMPLIANCE_FAILURE',
        code: 'NON_MANDATORY_REQUIREMENT_FAIL',
        severity: 'MEDIUM',
        title: 'Non-mandatory requirement deterministic failures',
        description: `${nonMandatoryFailEvals.length} non-mandatory requirement evaluation(s) failed deterministic compliance checks.`,
        count: nonMandatoryFailEvals.length,
        entityType: 'TenderRequirement',
        entityId: nonMandatoryFailEvals[0]?.requirementId,
        sourceReferences: nonMandatoryFailEvals.slice(0, 10).map((e) => ({
          type: 'ComplianceEvaluation',
          id: e.id,
          label: e.requirement?.requirementCode || reqMap.get(e.requirementId)?.requirementCode || 'REQ',
          route: `/tenders/${tenderId}/workspace?filter=FAIL`,
        })),
        recommendedAction: 'Review Failed Technical Requirements',
        recommendedRoute: `/tenders/${tenderId}/workspace?filter=FAIL`,
        createdAt: new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------
    // 2. COMPLIANCE_REVIEW Indicators
    // -------------------------------------------------------------
    const reviewEvals = data.evaluations.filter(
      (e) => e.result === 'REVIEW' || e.result === 'NOT_EVALUABLE'
    );
    const mandatoryReviewEvals = reviewEvals.filter(
      (e) => reqMap.get(e.requirementId)?.mandatory === 'YES' || e.requirement?.mandatory === 'YES'
    );
    const nonMandatoryReviewEvals = reviewEvals.filter(
      (e) => (reqMap.get(e.requirementId)?.mandatory || e.requirement?.mandatory) !== 'YES'
    );

    if (mandatoryReviewEvals.length > 0) {
      indicators.push({
        id: `ind_mand_review_${tenderId}`,
        category: 'COMPLIANCE_REVIEW',
        code: 'MANDATORY_REVIEW_REQUIRED',
        severity: 'HIGH',
        title: 'Mandatory requirements requiring officer review',
        description: `${mandatoryReviewEvals.length} mandatory requirement(s) have REVIEW or NOT_EVALUABLE status requiring manual evaluation.`,
        count: mandatoryReviewEvals.length,
        entityType: 'TenderRequirement',
        entityId: mandatoryReviewEvals[0]?.requirementId,
        sourceReferences: mandatoryReviewEvals.map((e) => ({
          type: 'TenderRequirement',
          id: e.requirementId,
          label: e.requirement?.requirementCode || reqMap.get(e.requirementId)?.requirementCode || 'REQ',
        })),
        recommendedAction: 'Review Mandatory Requirements',
        recommendedRoute: `/tenders/${tenderId}/workspace?filter=REVIEW`,
        createdAt: new Date().toISOString(),
      });
    }

    if (nonMandatoryReviewEvals.length > 0) {
      indicators.push({
        id: `ind_non_mand_review_${tenderId}`,
        category: 'COMPLIANCE_REVIEW',
        code: 'GENERAL_REVIEW_REQUIRED',
        severity: 'MEDIUM',
        title: 'Requirements requiring officer review',
        description: `${nonMandatoryReviewEvals.length} requirement(s) require officer verification or additional evidence.`,
        count: nonMandatoryReviewEvals.length,
        entityType: 'TenderRequirement',
        entityId: nonMandatoryReviewEvals[0]?.requirementId,
        sourceReferences: nonMandatoryReviewEvals.slice(0, 10).map((e) => ({
          type: 'TenderRequirement',
          id: e.requirementId,
          label: e.requirement?.requirementCode || reqMap.get(e.requirementId)?.requirementCode || 'REQ',
        })),
        recommendedAction: 'Review Pending Evaluations',
        recommendedRoute: `/tenders/${tenderId}/workspace?filter=REVIEW`,
        createdAt: new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------
    // 3. CONFLICT Indicators
    // -------------------------------------------------------------
    const activeConflicts = data.conflicts.filter(
      (c) => c.status === 'DETECTED' || c.status === 'UNDER_REVIEW' || c.status === 'INVESTIGATING'
    );

    for (const conflict of activeConflicts) {
      const linkedReq = conflict.requirementId ? reqMap.get(conflict.requirementId) : null;
      const isMandatoryLinked = linkedReq?.mandatory === 'YES';
      const isCriticalConflict =
        conflict.severity === 'CRITICAL' ||
        conflict.conflictType === 'ENTITY_NAME_CONFLICT' ||
        (conflict.severity === 'HIGH' && isMandatoryLinked);

      let severity: IndicatorSeverity = 'MEDIUM';
      if (isCriticalConflict) {
        severity = 'CRITICAL';
      } else if (conflict.severity === 'HIGH' || isMandatoryLinked) {
        severity = 'HIGH';
      }

      indicators.push({
        id: `ind_conflict_${conflict.id}`,
        category: 'CONFLICT',
        code: 'EVIDENCE_CONFLICT_DETECTED',
        severity,
        title: `Evidence conflict: ${conflict.fieldKey || conflict.conflictType}`,
        description: conflict.description || `Unresolved evidence contradiction detected for ${conflict.fieldKey}.`,
        count: 1,
        entityType: 'EvidenceConflict',
        entityId: conflict.id,
        bidderCode: conflict.bidder?.bidderCode,
        bidderName: conflict.bidder?.legalName,
        sourceReferences: [
          {
            type: 'EvidenceConflict',
            id: conflict.id,
            label: conflict.fingerprint || conflict.fieldKey,
            route: `/tenders/${tenderId}/conflicts?id=${conflict.id}`,
          },
        ],
        recommendedAction: 'Investigate Evidence Conflict',
        recommendedRoute: `/tenders/${tenderId}/conflicts?id=${conflict.id}`,
        createdAt: conflict.createdAt ? new Date(conflict.createdAt).toISOString() : new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------
    // 4. EXTERNAL_VERIFICATION Indicators
    // -------------------------------------------------------------
    for (const ver of data.verifications) {
      const isMismatch =
        ver.status === 'MISMATCH' ||
        ver.results?.some((r: any) => r.status === 'MISMATCH' || r.status === 'REVIEW_REQUIRED');

      if (!isMismatch && ver.status !== 'REVIEW_REQUIRED') continue;

      const isDebarmentOrBlacklist =
        ver.verificationType === 'BLACKLISTING' || ver.verificationType === 'DEBARMENT';
      const linkedReq = ver.requirementId ? reqMap.get(ver.requirementId) : null;
      const isMandatoryLinked = linkedReq?.mandatory === 'YES';

      let severity: IndicatorSeverity = 'HIGH';
      if (isDebarmentOrBlacklist) {
        severity = 'CRITICAL';
      } else if (isMandatoryLinked && isMismatch) {
        severity = 'CRITICAL';
      } else if (ver.status === 'REVIEW_REQUIRED' && !isMandatoryLinked) {
        severity = 'MEDIUM';
      }

      const result = ver.results?.[0];
      indicators.push({
        id: `ind_verif_${ver.id}`,
        category: 'EXTERNAL_VERIFICATION',
        code: isDebarmentOrBlacklist ? 'DEBARMENT_VERIFICATION_MISMATCH' : 'EXTERNAL_VERIFICATION_MISMATCH',
        severity,
        title: `External verification mismatch: ${ver.verificationType}`,
        description:
          result?.matchSummary ||
          `External provider response differs from bidder submission for identifier ${ver.requestedIdentifier}.`,
        count: 1,
        entityType: 'VerificationRequest',
        entityId: ver.id,
        bidderCode: ver.bidder?.bidderCode,
        bidderName: ver.bidder?.legalName,
        sourceReferences: [
          {
            type: 'VerificationRequest',
            id: ver.id,
            label: `${ver.verificationType}: ${ver.requestedIdentifier}`,
            route: `/tenders/${tenderId}/verifications?id=${ver.id}`,
          },
        ],
        recommendedAction: 'Investigate External Verification',
        recommendedRoute: `/tenders/${tenderId}/verifications?id=${ver.id}`,
        createdAt: ver.createdAt ? new Date(ver.createdAt).toISOString() : new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------
    // 5. INVESTIGATION Indicators
    // -------------------------------------------------------------
    const requiresHumanInvs = data.investigations.filter((i) => i.status === 'REQUIRES_HUMAN');
    const runningInvs = data.investigations.filter((i) => i.status === 'RUNNING' || i.status === 'QUEUED');

    if (requiresHumanInvs.length > 0) {
      indicators.push({
        id: `ind_inv_human_${tenderId}`,
        category: 'INVESTIGATION',
        code: 'INVESTIGATION_REQUIRES_HUMAN',
        severity: 'MEDIUM',
        title: 'AI investigations awaiting officer review',
        description: `${requiresHumanInvs.length} AI compliance investigation(s) have finished analysis and require officer review.`,
        count: requiresHumanInvs.length,
        entityType: 'ComplianceInvestigation',
        entityId: requiresHumanInvs[0]?.id,
        sourceReferences: requiresHumanInvs.map((i) => ({
          type: 'ComplianceInvestigation',
          id: i.id,
          label: i.triggerType || 'INVESTIGATION',
          route: `/tenders/${tenderId}/investigations?id=${i.id}`,
        })),
        recommendedAction: 'Review Investigation Findings',
        recommendedRoute: `/tenders/${tenderId}/investigations`,
        createdAt: new Date().toISOString(),
      });
    }

    if (runningInvs.length > 0) {
      indicators.push({
        id: `ind_inv_running_${tenderId}`,
        category: 'INVESTIGATION',
        code: 'INVESTIGATION_RUNNING',
        severity: 'LOW',
        title: 'Compliance investigations running in background',
        description: `${runningInvs.length} investigation case(s) are currently in-progress or queued.`,
        count: runningInvs.length,
        entityType: 'ComplianceInvestigation',
        entityId: runningInvs[0]?.id,
        sourceReferences: runningInvs.map((i) => ({
          type: 'ComplianceInvestigation',
          id: i.id,
          label: i.triggerType,
        })),
        recommendedAction: 'Monitor Investigations',
        recommendedRoute: `/tenders/${tenderId}/investigations`,
        createdAt: new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------
    // 6. EVIDENCE_GAP Indicators
    // -------------------------------------------------------------
    const missingEvidenceReqs = data.requirements.filter((req) => {
      const rMappings = data.mappings.filter((m) => m.tenderRequirementId === req.id);
      return rMappings.length === 0;
    });

    const partialOrAmbiguousMappings = data.mappings.filter(
      (m) => m.mappingType === 'PARTIAL' || m.mappingType === 'INDIRECT' || (m.confidence && m.confidence < 0.5)
    );

    if (missingEvidenceReqs.length > 0) {
      const mandatoryMissing = missingEvidenceReqs.filter((r) => r.mandatory === 'YES');
      indicators.push({
        id: `ind_gap_missing_${tenderId}`,
        category: 'EVIDENCE_GAP',
        code: 'MISSING_EVIDENCE_REQUIREMENTS',
        severity: mandatoryMissing.length > 0 ? 'HIGH' : 'MEDIUM',
        title: 'Requirements lacking submitted evidence facts',
        description: `${missingEvidenceReqs.length} requirement(s) (${mandatoryMissing.length} mandatory) have no grounded evidence mappings.`,
        count: missingEvidenceReqs.length,
        entityType: 'TenderRequirement',
        entityId: missingEvidenceReqs[0]?.id,
        sourceReferences: missingEvidenceReqs.slice(0, 8).map((r) => ({
          type: 'TenderRequirement',
          id: r.id,
          label: r.requirementCode,
        })),
        recommendedAction: 'Inspect Evidence Gaps',
        recommendedRoute: `/tenders/${tenderId}/evidence-mappings`,
        createdAt: new Date().toISOString(),
      });
    }

    if (partialOrAmbiguousMappings.length > 0) {
      indicators.push({
        id: `ind_gap_ambiguous_${tenderId}`,
        category: 'EVIDENCE_GAP',
        code: 'AMBIGUOUS_EVIDENCE_MAPPINGS',
        severity: 'LOW',
        title: 'Ambiguous or partial evidence mappings detected',
        description: `${partialOrAmbiguousMappings.length} evidence mapping(s) contain partial or low-confidence extractions.`,
        count: partialOrAmbiguousMappings.length,
        entityType: 'RequirementEvidenceMapping',
        entityId: partialOrAmbiguousMappings[0]?.id,
        sourceReferences: partialOrAmbiguousMappings.slice(0, 5).map((m) => ({
          type: 'RequirementEvidenceMapping',
          id: m.id,
        })),
        recommendedAction: 'Verify Evidence Grounding',
        recommendedRoute: `/tenders/${tenderId}/evidence-mappings`,
        createdAt: new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------
    // 7. DOCUMENT_PROCESSING Indicators
    // -------------------------------------------------------------
    const allDocs = [...(data.tenderDocuments || []), ...(data.bidDocuments || [])];
    const failedDocs = allDocs.filter((d) => d.processingStatus === 'FAILED');
    const processingDocs = allDocs.filter((d) => d.processingStatus === 'PROCESSING');

    if (failedDocs.length > 0) {
      indicators.push({
        id: `ind_doc_failed_${tenderId}`,
        category: 'DOCUMENT_PROCESSING',
        code: 'DOCUMENT_PROCESSING_FAILED',
        severity: 'HIGH',
        title: 'Document parsing or ingestion failures',
        description: `${failedDocs.length} uploaded document(s) failed text extraction or OCR processing.`,
        count: failedDocs.length,
        entityType: 'TenderDocument',
        entityId: failedDocs[0]?.id,
        sourceReferences: failedDocs.slice(0, 5).map((d) => ({
          type: 'Document',
          id: d.id,
          label: d.filename || d.originalName || 'Doc',
        })),
        recommendedAction: 'Retry Document Ingestion',
        recommendedRoute: `/tenders/${tenderId}/documents`,
        createdAt: new Date().toISOString(),
      });
    } else if (processingDocs.length > 0) {
      indicators.push({
        id: `ind_doc_proc_${tenderId}`,
        category: 'DOCUMENT_PROCESSING',
        code: 'DOCUMENT_PROCESSING_ACTIVE',
        severity: 'LOW',
        title: 'Documents undergoing OCR/parsing',
        description: `${processingDocs.length} document(s) are actively processing in the pipeline.`,
        count: processingDocs.length,
        entityType: 'TenderDocument',
        entityId: processingDocs[0]?.id,
        sourceReferences: processingDocs.slice(0, 5).map((d) => ({
          type: 'Document',
          id: d.id,
          label: d.filename || 'Processing doc',
        })),
        recommendedAction: 'Check Document Pipeline',
        recommendedRoute: `/tenders/${tenderId}/documents`,
        createdAt: new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------
    // 8. AUDIT Indicators
    // -------------------------------------------------------------
    const evaluationsWithoutSnapshots = data.evaluations.filter(
      (e) => !e.evidenceSnapshot || (Array.isArray(e.evidenceSnapshot) && e.evidenceSnapshot.length === 0)
    );
    if (evaluationsWithoutSnapshots.length > 0) {
      indicators.push({
        id: `ind_audit_snapshot_${tenderId}`,
        category: 'AUDIT',
        code: 'EVALUATION_SNAPSHOT_GAP',
        severity: 'LOW',
        title: 'Evaluations missing immutable evidence snapshots',
        description: `${evaluationsWithoutSnapshots.length} evaluation record(s) lack frozen evidence snapshots for auditability.`,
        count: evaluationsWithoutSnapshots.length,
        entityType: 'ComplianceEvaluation',
        entityId: evaluationsWithoutSnapshots[0]?.id,
        sourceReferences: evaluationsWithoutSnapshots.slice(0, 5).map((e) => ({
          type: 'ComplianceEvaluation',
          id: e.id,
          label: e.requirement?.requirementCode || 'Evaluation',
        })),
        recommendedAction: 'Audit Evaluation Traceability',
        recommendedRoute: `/tenders/${tenderId}/reports`,
        createdAt: new Date().toISOString(),
      });
    }

    return indicators;
  }

  /**
   * Derive ordered Priority Action Queue items from indicators.
   * Deterministic attention ordering:
   * 1. CRITICAL -> HIGH -> MEDIUM -> LOW
   * 2. Within same severity:
   *    mandatory requirement -> conflict -> verification mismatch -> investigation -> evidence gap -> document processing -> audit
   *
   * Note: This is an attention ordering for the procurement officer, NOT a bidder preference or ranking.
   */
  public generatePriorityActions(indicators: IntelligenceIndicator[]): PriorityActionItem[] {
    const actions: PriorityActionItem[] = [];

    for (const ind of indicators) {
      actions.push({
        id: `act_${ind.id}`,
        priority: ind.severity,
        category: ind.category,
        title: ind.title,
        reason: ind.description,
        bidderCode: ind.bidderCode,
        bidderName: ind.bidderName,
        entityType: ind.entityType || 'TenderRequirement',
        entityId: ind.entityId || ind.id,
        recommendedRoute: ind.recommendedRoute,
        actionLabel: ind.recommendedAction,
        sourceReferences: ind.sourceReferences,
        createdAt: ind.createdAt,
      });
    }

    const severityWeight: Record<IndicatorSeverity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const categoryImportanceWeight: Record<IndicatorCategory, number> = {
      COMPLIANCE_FAILURE: 7,
      CONFLICT: 6,
      EXTERNAL_VERIFICATION: 5,
      COMPLIANCE_REVIEW: 4,
      INVESTIGATION: 3,
      EVIDENCE_GAP: 2,
      DOCUMENT_PROCESSING: 1,
      AUDIT: 0,
    };

    return actions.sort((a, b) => {
      const sDiff = severityWeight[b.priority] - severityWeight[a.priority];
      if (sDiff !== 0) return sDiff;
      return (categoryImportanceWeight[b.category] || 0) - (categoryImportanceWeight[a.category] || 0);
    });
  }
}
