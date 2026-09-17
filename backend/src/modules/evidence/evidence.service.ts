import {
  AuditEventType,
  BidDocumentType,
  EvidenceStatus,
  EvidenceValueType,
  ExtractionMethod,
  ExtractionRunStatus,
} from '@prisma/client';
import { evidenceRepository } from './evidence.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { evidenceExtractorService } from '../../services/evidence/evidence-extractor.service.js';
import { evidenceNormalizerService } from '../../services/evidence/evidence-normalizer.service.js';
import { auditService } from '../../services/audit/audit.service.js';
import { FIELD_REGISTRY } from '../../services/evidence/field-registry.js';

export interface HumanEvidenceCorrectionInput {
  rawValue: string;
  normalizedValue?: any;
  valueType?: EvidenceValueType;
  unit?: string;
  reason: string;
  reviewer: string;
}

export interface AddManualEvidenceInput {
  bidDocumentId: string;
  fieldKey: string;
  rawValue: string;
  pageNumber?: number;
  sourceText: string;
  reviewer: string;
  reason?: string;
}

export class EvidenceService {
  /**
   * Triggers asynchronous evidence extraction for a processed bid document
   */
  async triggerExtraction(bidDocumentId: string) {
    const document = await bidderRepository.findBidDocumentById(bidDocumentId);
    if (!document) {
      throw new Error(`Bid document "${bidDocumentId}" not found.`);
    }

    const submission = await bidderRepository.findSubmissionById(document.bidSubmissionId);
    const tenderId = submission?.tenderId;
    const bidderId = submission?.bidderId;

    // Create an extraction run version
    const run = await evidenceRepository.createExtractionRun({ bidDocumentId });

    await auditService.log(AuditEventType.EVIDENCE_EXTRACTION_STARTED, {
      tenderId,
      bidderId,
      submissionId: document.bidSubmissionId,
      bidDocumentId,
      metadata: { runId: run.id, documentType: document.documentType },
    });

    // Run extraction processing asynchronously
    setImmediate(async () => {
      try {
        await evidenceRepository.updateExtractionRun(run.id, { status: ExtractionRunStatus.PROCESSING });

        // Retrieve document pages directly
        const docPages = await bidderRepository.listPagesByBidDocument(bidDocumentId);

        const latestDoc = await bidderRepository.findBidDocumentById(bidDocumentId);
        const docType = latestDoc?.documentType || document.documentType || BidDocumentType.UNKNOWN;

        const extractedCandidates = await evidenceExtractorService.extractEvidence({
          bidDocumentId,
          documentType: docType,
          pages: docPages.map((p) => ({
            id: p.id,
            pageNumber: p.pageNumber,
            textContent: p.textContent,
            ocrUsed: p.ocrUsed,
          })),
        });

        let reviewCount = 0;
        let conflictCount = 0;

        for (const cand of extractedCandidates) {
          if (cand.status === EvidenceStatus.REVIEW_REQUIRED) reviewCount++;
          if (cand.conflictFlag) conflictCount++;

          await evidenceRepository.createEvidenceItem({
            bidDocumentId,
            documentPageId: cand.documentPageId,
            evidenceBlockId: cand.evidenceBlockId,
            extractionRunId: run.id,
            fieldKey: cand.fieldKey,
            fieldLabel: cand.fieldLabel,
            rawValue: cand.rawValue,
            normalizedValue: cand.normalizedValue,
            valueType: cand.valueType,
            unit: cand.unit,
            sourceText: cand.sourceText,
            pageNumber: cand.pageNumber,
            boundingBox: cand.boundingBox,
            confidence: cand.confidence,
            extractionMethod: cand.extractionMethod,
            status: cand.status,
            conflictFlag: cand.conflictFlag,
            conflictReason: cand.conflictReason,
            reviewReason: cand.reviewReason,
          });
        }

        await evidenceRepository.updateExtractionRun(run.id, {
          status: ExtractionRunStatus.COMPLETED,
          completed: true,
        });

        if (conflictCount > 0) {
          await auditService.log(AuditEventType.EVIDENCE_CONFLICT_DETECTED, {
            tenderId,
            bidderId,
            submissionId: document.bidSubmissionId,
            bidDocumentId,
            metadata: { conflictCount },
          });
        }

        await auditService.log(
          reviewCount > 0 ? AuditEventType.EVIDENCE_REVIEW_REQUESTED : AuditEventType.EVIDENCE_EXTRACTION_COMPLETED,
          {
            tenderId,
            bidderId,
            submissionId: document.bidSubmissionId,
            bidDocumentId,
            metadata: {
              totalExtracted: extractedCandidates.length,
              reviewRequiredCount: reviewCount,
              conflictCount,
            },
          }
        );
      } catch (err: unknown) {
        const errorMsg = (err as Error).message || 'Extraction failed';
        await evidenceRepository.updateExtractionRun(run.id, {
          status: ExtractionRunStatus.FAILED,
          error: errorMsg,
          completed: true,
        });

        await auditService.log(AuditEventType.EVIDENCE_EXTRACTION_FAILED, {
          tenderId,
          bidderId,
          submissionId: document.bidSubmissionId,
          bidDocumentId,
          metadata: { error: errorMsg },
        });
      }
    });

    return {
      run,
      message: 'Evidence extraction job queued successfully.',
    };
  }

  /**
   * List extracted evidence items for a bid document with summary counts
   */
  async getEvidenceForDocument(bidDocumentId: string) {
    const document = await bidderRepository.findBidDocumentById(bidDocumentId);
    if (!document) {
      throw new Error(`Bid document "${bidDocumentId}" not found.`);
    }

    const items = await evidenceRepository.listEvidenceByDocument(bidDocumentId);
    const run = await evidenceRepository.findLatestRunByDocument(bidDocumentId);

    const highConfidence = items.filter((i) => i.confidence >= 0.85 && i.status !== EvidenceStatus.REVIEW_REQUIRED).length;
    const reviewRequired = items.filter((i) => i.status === EvidenceStatus.REVIEW_REQUIRED || i.conflictFlag).length;
    const humanVerified = items.filter((i) => i.status === EvidenceStatus.VERIFIED_BY_HUMAN).length;
    const conflicts = items.filter((i) => i.conflictFlag).length;

    return {
      document,
      latestRun: run,
      evidence: items,
      summary: {
        totalExtracted: items.length,
        highConfidence,
        reviewRequired,
        humanVerified,
        conflicts,
      },
    };
  }

  /**
   * Get single evidence item details
   */
  async getEvidenceById(evidenceId: string) {
    const item = await evidenceRepository.findEvidenceById(evidenceId);
    if (!item) {
      throw new Error(`Evidence item "${evidenceId}" not found.`);
    }
    const doc = await bidderRepository.findBidDocumentById(item.bidDocumentId);
    return { evidence: item, document: doc };
  }

  /**
   * Human evidence correction / editing
   */
  async updateEvidenceByHuman(evidenceId: string, correction: HumanEvidenceCorrectionInput) {
    const item = await evidenceRepository.findEvidenceById(evidenceId);
    if (!item) {
      throw new Error(`Evidence record "${evidenceId}" not found.`);
    }

    const doc = await bidderRepository.findBidDocumentById(item.bidDocumentId);
    const submission = doc ? await bidderRepository.findSubmissionById(doc.bidSubmissionId) : null;

    const normResult = evidenceNormalizerService.normalize(
      correction.rawValue,
      correction.valueType || item.valueType,
      correction.unit || item.unit || undefined
    );

    const updated = await evidenceRepository.updateEvidenceItem(evidenceId, {
      rawValue: correction.rawValue,
      normalizedValue: correction.normalizedValue !== undefined ? correction.normalizedValue : normResult.normalizedValue,
      valueType: correction.valueType || item.valueType,
      unit: correction.unit || item.unit,
      status: EvidenceStatus.VERIFIED_BY_HUMAN,
      reviewReason: `Human correction applied: ${correction.reason}`,
      conflictFlag: false,
      conflictReason: null,
      originalValue: item.originalValue || {
        rawValue: item.rawValue,
        normalizedValue: item.normalizedValue,
      },
      humanReviewed: true,
      reviewedBy: correction.reviewer,
      reviewedAt: new Date(),
    });

    await auditService.log(AuditEventType.EVIDENCE_UPDATED, {
      tenderId: submission?.tenderId,
      bidderId: submission?.bidderId,
      submissionId: doc?.bidSubmissionId,
      bidDocumentId: item.bidDocumentId,
      metadata: {
        evidenceId: item.id,
        previousValue: item.rawValue,
        newValue: correction.rawValue,
        reviewer: correction.reviewer,
        reason: correction.reason,
      },
    });

    return updated;
  }

  /**
   * Confirm human verification of extracted fact
   */
  async verifyEvidenceFact(evidenceId: string, reviewer: string) {
    const item = await evidenceRepository.findEvidenceById(evidenceId);
    if (!item) throw new Error(`Evidence record "${evidenceId}" not found.`);

    const doc = await bidderRepository.findBidDocumentById(item.bidDocumentId);
    const submission = doc ? await bidderRepository.findSubmissionById(doc.bidSubmissionId) : null;

    const updated = await evidenceRepository.updateEvidenceItem(evidenceId, {
      status: EvidenceStatus.VERIFIED_BY_HUMAN,
      humanReviewed: true,
      reviewedBy: reviewer,
      reviewedAt: new Date(),
    });

    await auditService.log(AuditEventType.EVIDENCE_HUMAN_VERIFIED, {
      tenderId: submission?.tenderId,
      bidderId: submission?.bidderId,
      submissionId: doc?.bidSubmissionId,
      bidDocumentId: item.bidDocumentId,
      metadata: { evidenceId: item.id, reviewer },
    });

    return updated;
  }

  /**
   * Reject incorrect extracted evidence item
   */
  async rejectEvidenceFact(evidenceId: string, reviewer: string, reason: string) {
    const item = await evidenceRepository.findEvidenceById(evidenceId);
    if (!item) throw new Error(`Evidence record "${evidenceId}" not found.`);

    const doc = await bidderRepository.findBidDocumentById(item.bidDocumentId);
    const submission = doc ? await bidderRepository.findSubmissionById(doc.bidSubmissionId) : null;

    const updated = await evidenceRepository.updateEvidenceItem(evidenceId, {
      status: EvidenceStatus.REJECTED,
      reviewReason: reason || 'Marked as rejected by procurement officer',
      humanReviewed: true,
      reviewedBy: reviewer,
      reviewedAt: new Date(),
    });

    await auditService.log(AuditEventType.EVIDENCE_REJECTED, {
      tenderId: submission?.tenderId,
      bidderId: submission?.bidderId,
      submissionId: doc?.bidSubmissionId,
      bidDocumentId: item.bidDocumentId,
      metadata: { evidenceId: item.id, reviewer, reason },
    });

    return updated;
  }

  /**
   * Add a manual evidence entry with explicit source provenance
   */
  async addManualEvidence(input: AddManualEvidenceInput) {
    const doc = await bidderRepository.findBidDocumentById(input.bidDocumentId);
    if (!doc) throw new Error(`Bid document "${input.bidDocumentId}" not found.`);

    const submission = await bidderRepository.findSubmissionById(doc.bidSubmissionId);

    const fieldDef = FIELD_REGISTRY[input.fieldKey] || {
      fieldKey: input.fieldKey,
      fieldLabel: input.fieldKey,
      valueType: EvidenceValueType.STRING,
    };

    const normResult = evidenceNormalizerService.normalize(input.rawValue, fieldDef.valueType);

    const item = await evidenceRepository.createEvidenceItem({
      bidDocumentId: input.bidDocumentId,
      fieldKey: input.fieldKey,
      fieldLabel: fieldDef.fieldLabel,
      rawValue: input.rawValue,
      normalizedValue: normResult.normalizedValue,
      valueType: normResult.valueType,
      unit: normResult.unit,
      sourceText: input.sourceText,
      pageNumber: input.pageNumber || 1,
      confidence: 1.0,
      extractionMethod: ExtractionMethod.HUMAN_VERIFIED,
      status: EvidenceStatus.VERIFIED_BY_HUMAN,
    });

    const updatedItem = await evidenceRepository.updateEvidenceItem(item.id, {
      humanReviewed: true,
      reviewedBy: input.reviewer,
      reviewedAt: new Date(),
      reviewReason: input.reason || 'Manually added by procurement officer',
    });

    await auditService.log(AuditEventType.EVIDENCE_HUMAN_VERIFIED, {
      tenderId: submission?.tenderId,
      bidderId: submission?.bidderId,
      submissionId: doc.bidSubmissionId,
      bidDocumentId: input.bidDocumentId,
      metadata: { evidenceId: item.id, manualEntry: true, reviewer: input.reviewer },
    });

    return updatedItem;
  }
}

export const evidenceService = new EvidenceService();
