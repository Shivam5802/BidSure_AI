import {
  RequirementEvidenceMapping,
  MappingType,
  MappingStatus,
  AuditEventType,
} from '@prisma/client';
import { mappingRepository } from './mapping.repository.js';
import { mappingEngine } from './mapping-engine.service.js';
import { mappingCoverageService, BidderCoverageSummary } from './mapping-coverage.service.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { evidenceRepository } from '../evidence/evidence.repository.js';
import { auditService } from '../../services/audit/audit.service.js';

export interface ManualMappingInput {
  tenderRequirementId: string;
  evidenceId: string;
  bidderId: string;
  mappingType?: MappingType;
  reason: string;
  createdBy?: string;
}

export class MappingService {
  /**
   * Generates evidence-requirement mappings for a bidder submission
   */
  async generateMappingsForBidder(
    bidderId: string,
    actor = 'procurement_officer'
  ): Promise<{ generatedCount: number; mappings: RequirementEvidenceMapping[]; summary: BidderCoverageSummary }> {
    const bidder = await bidderRepository.findBidderById(bidderId);
    if (!bidder) throw new Error(`Bidder ${bidderId} not found`);

    const submission = await bidderRepository.findActiveSubmissionByBidder(bidderId);
    if (!submission) throw new Error(`Active submission for bidder ${bidderId} not found`);

    // Fetch approved/latest requirements for tender
    const blueprint = await requirementRepository.getLatestBlueprint(bidder.tenderId);
    if (!blueprint || blueprint.requirements.length === 0) {
      throw new Error(`No requirements found for tender ${bidder.tenderId}`);
    }

    await auditService.log(AuditEventType.MAPPING_GENERATION_STARTED, {
      tenderId: bidder.tenderId,
      bidderId,
      submissionId: submission.id,
      actor,
      metadata: { requirementCount: blueprint.requirements.length },
    });

    // Fetch all bid documents and extracted evidence for submission
    const bidDocs = await bidderRepository.listBidDocumentsBySubmission(submission.id);
    const allEvidenceItems: any[] = [];

    for (const doc of bidDocs) {
      const evItems = await evidenceRepository.listEvidenceByDocument(doc.id);
      for (const ev of evItems) {
        allEvidenceItems.push({
          ...ev,
          documentType: doc.documentType,
          documentName: doc.originalFilename,
        });
      }
    }

    // Evaluate proposals using MappingEngine
    const proposals = await mappingEngine.evaluateMappingsForSubmission(
      bidderId,
      submission.id,
      blueprint.requirements,
      allEvidenceItems
    );

    const savedMappings: RequirementEvidenceMapping[] = [];

    for (const prop of proposals) {
      const saved = await mappingRepository.createMapping({
        tenderRequirementId: prop.tenderRequirementId,
        bidderId: prop.bidderId,
        bidSubmissionId: prop.bidSubmissionId,
        evidenceId: prop.evidenceId,
        mappingType: prop.mappingType,
        status: prop.status,
        confidence: prop.confidence,
        reason: prop.reason,
        matchedField: prop.matchedField,
        matchedCategory: prop.matchedCategory,
        matchingSignals: prop.matchingSignals,
        source: prop.source,
      });

      savedMappings.push(saved);

      await auditService.log(AuditEventType.MAPPING_PROPOSED, {
        tenderId: bidder.tenderId,
        bidderId,
        submissionId: submission.id,
        actor,
        metadata: {
          mappingId: saved.id,
          tenderRequirementId: saved.tenderRequirementId,
          evidenceId: saved.evidenceId,
          mappingType: saved.mappingType,
          confidence: saved.confidence,
        },
      });
    }

    const summary = mappingCoverageService.calculateBidderCoverage(
      bidderId,
      blueprint.requirements,
      savedMappings
    );

    await auditService.log(AuditEventType.MAPPING_GENERATION_COMPLETED, {
      tenderId: bidder.tenderId,
      bidderId,
      submissionId: submission.id,
      actor,
      metadata: {
        generatedCount: savedMappings.length,
        coveredCount: summary.coveredCount,
        noEvidenceCount: summary.noEvidenceCount,
      },
    });

    return {
      generatedCount: savedMappings.length,
      mappings: savedMappings,
      summary,
    };
  }

  /**
   * Confirms a proposed mapping
   */
  async confirmMapping(mappingId: string, reviewer = 'procurement_officer'): Promise<RequirementEvidenceMapping> {
    const mapping = await mappingRepository.findMappingById(mappingId);
    if (!mapping) throw new Error(`Mapping ${mappingId} not found`);

    const updated = await mappingRepository.updateMapping(mappingId, {
      status: MappingStatus.CONFIRMED,
      reviewedBy: reviewer,
      reviewedAt: new Date(),
      reviewReason: 'Confirmed by procurement officer.',
    });

    await auditService.log(AuditEventType.MAPPING_CONFIRMED, {
      bidderId: updated.bidderId,
      submissionId: updated.bidSubmissionId,
      actor: reviewer,
      metadata: { mappingId, requirementId: updated.tenderRequirementId, evidenceId: updated.evidenceId },
    });

    return updated;
  }

  /**
   * Rejects a proposed mapping with a required reason
   */
  async rejectMapping(
    mappingId: string,
    reason: string,
    reviewer = 'procurement_officer'
  ): Promise<RequirementEvidenceMapping> {
    if (!reason || reason.trim().length === 0) {
      throw new Error('A reason is required when rejecting a mapping proposal.');
    }

    const mapping = await mappingRepository.findMappingById(mappingId);
    if (!mapping) throw new Error(`Mapping ${mappingId} not found`);

    const updated = await mappingRepository.updateMapping(mappingId, {
      status: MappingStatus.REJECTED,
      reviewedBy: reviewer,
      reviewedAt: new Date(),
      reviewReason: reason.trim(),
    });

    await auditService.log(AuditEventType.MAPPING_REJECTED, {
      bidderId: updated.bidderId,
      submissionId: updated.bidSubmissionId,
      actor: reviewer,
      metadata: { mappingId, reason: reason.trim() },
    });

    return updated;
  }

  /**
   * Manually creates a mapping between requirement and evidence
   */
  async createManualMapping(input: ManualMappingInput): Promise<RequirementEvidenceMapping> {
    const req = await requirementRepository.findRequirementById(input.tenderRequirementId);
    if (!req) throw new Error(`Requirement ${input.tenderRequirementId} not found`);

    const ev = await evidenceRepository.findEvidenceById(input.evidenceId);
    if (!ev) throw new Error(`Evidence ${input.evidenceId} not found`);

    const doc = await bidderRepository.findBidDocumentById(ev.bidDocumentId);
    if (!doc) throw new Error(`Bid Document for evidence ${input.evidenceId} not found`);

    const submission = await bidderRepository.findSubmissionById(doc.bidSubmissionId);
    if (!submission) throw new Error(`Bid Submission ${doc.bidSubmissionId} not found`);

    // Verify bidder isolation
    if (submission.bidderId !== input.bidderId) {
      throw new Error('Security Error: Evidence does not belong to the specified bidder submission.');
    }

    // Verify tender isolation
    const bidder = await bidderRepository.findBidderById(input.bidderId);
    if (!bidder) throw new Error(`Bidder ${input.bidderId} not found`);
    const bp = await requirementRepository.getLatestBlueprint(bidder.tenderId);
    if (!bp || req.blueprintId !== bp.id) {
      throw new Error('Security Error: Requirement does not belong to the bidder\'s tender.');
    }

    const mapping = await mappingRepository.createMapping({
      tenderRequirementId: input.tenderRequirementId,
      bidderId: input.bidderId,
      bidSubmissionId: submission.id,
      evidenceId: input.evidenceId,
      mappingType: input.mappingType || MappingType.DIRECT,
      status: MappingStatus.CONFIRMED,
      confidence: 1.0,
      reason: input.reason,
      source: 'MANUAL_OFFICER',
      createdBy: input.createdBy || 'procurement_officer',
    });

    await auditService.log(AuditEventType.MAPPING_MANUALLY_CREATED, {
      tenderId: bidder.tenderId,
      bidderId: input.bidderId,
      submissionId: submission.id,
      actor: input.createdBy || 'procurement_officer',
      metadata: {
        mappingId: mapping.id,
        requirementId: input.tenderRequirementId,
        evidenceId: input.evidenceId,
        reason: input.reason,
      },
    });

    return mapping;
  }

  /**
   * Retrieves bidder coverage summary and mappings
   */
  async getBidderCoverage(bidderId: string): Promise<BidderCoverageSummary> {
    const bidder = await bidderRepository.findBidderById(bidderId);
    if (!bidder) throw new Error(`Bidder ${bidderId} not found`);

    const bp = await requirementRepository.getLatestBlueprint(bidder.tenderId);
    const requirements = bp ? bp.requirements : [];

    const mappings = await mappingRepository.listMappingsByBidder(bidderId, true);

    return mappingCoverageService.calculateBidderCoverage(bidderId, requirements, mappings);
  }
}

export const mappingService = new MappingService();
