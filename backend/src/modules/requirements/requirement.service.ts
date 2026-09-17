import {
  BlueprintStatus,
  RequirementStatus,
  AuditEventType,
} from '@prisma/client';
import {
  requirementRepository,
  RequirementFilterOptions,
  RequirementWithProvenance,
} from './requirement.repository.js';
import { extractionPipelineService, ExtractionJobResult } from '../../services/ai/extraction-pipeline.service.js';
import { auditService } from '../../services/audit/audit.service.js';

export class RequirementService {
  async triggerExtraction(tenderId: string): Promise<ExtractionJobResult> {
    return extractionPipelineService.runExtraction(tenderId);
  }

  async getBlueprint(tenderId: string, version?: number) {
    const blueprint = version
      ? await requirementRepository.getBlueprintByVersion(tenderId, version)
      : await requirementRepository.getLatestBlueprint(tenderId);

    if (!blueprint) {
      return null;
    }

    const requirements = blueprint.requirements;

    const summary = {
      total: requirements.length,
      financial: requirements.filter((r) => r.category === 'FINANCIAL').length,
      technical: requirements.filter((r) => r.category === 'TECHNICAL').length,
      statutory: requirements.filter((r) => r.category === 'STATUTORY').length,
      eligibility: requirements.filter((r) => r.category === 'ELIGIBILITY').length,
      policy: requirements.filter((r) => r.category === 'POLICY').length,
      tenderSpecific: requirements.filter((r) => r.category === 'TENDER_SPECIFIC').length,
      reviewRequired: requirements.filter((r) => r.status === 'REVIEW' || r.ambiguityFlag).length,
      conflicts: requirements.filter((r) => r.status === 'CONFLICT' || r.conflictFlag).length,
      duplicates: requirements.filter((r) => r.duplicateFlag).length,
      approved: requirements.filter((r) => r.status === 'APPROVED').length,
    };

    return {
      blueprint: {
        id: blueprint.id,
        tenderId: blueprint.tenderId,
        version: blueprint.version,
        status: blueprint.status,
        createdBy: blueprint.createdBy,
        approvedBy: blueprint.approvedBy,
        createdAt: blueprint.createdAt,
        approvedAt: blueprint.approvedAt,
      },
      summary,
      requirements,
    };
  }

  async getBlueprintVersions(tenderId: string) {
    return requirementRepository.getBlueprintVersions(tenderId);
  }

  async listRequirements(
    tenderId: string,
    filters?: RequirementFilterOptions
  ): Promise<RequirementWithProvenance[]> {
    const blueprint = await requirementRepository.getLatestBlueprint(tenderId);
    if (!blueprint) {
      return [];
    }
    return requirementRepository.listRequirementsByBlueprint(blueprint.id, filters);
  }

  async getRequirement(requirementId: string): Promise<RequirementWithProvenance> {
    const req = await requirementRepository.findRequirementById(requirementId);
    if (!req) {
      throw new Error(`Requirement ${requirementId} not found`);
    }
    return req;
  }

  async updateRequirement(
    requirementId: string,
    data: any,
    officerId: string = 'procurement_officer'
  ): Promise<RequirementWithProvenance> {
    const existing = await requirementRepository.findRequirementById(requirementId);
    if (!existing) {
      throw new Error(`Requirement ${requirementId} not found`);
    }

    await requirementRepository.updateRequirement(requirementId, {
      ...data,
      normalizedRequirementText: data.requirementText
        ? data.requirementText.substring(0, 200)
        : existing.normalizedRequirementText,
      // Keep track of officer modification vs original AI extraction in AI explanation
      aiExplanation: `${existing.aiExplanation}\n[Officer Note]: Modified by officer (${officerId}) on ${new Date().toISOString()}`,
    });

    await auditService.log(AuditEventType.REQUIREMENT_EDITED, {
      tenderId: existing.blueprintId,
      metadata: {
        requirementId,
        requirementCode: existing.requirementCode,
        before: {
          requirementText: existing.requirementText,
          category: existing.category,
          mandatory: existing.mandatory,
        },
        after: {
          requirementText: data.requirementText || existing.requirementText,
          category: data.category || existing.category,
          mandatory: data.mandatory || existing.mandatory,
        },
        modifiedBy: officerId,
      },
    });

    return requirementRepository.findRequirementById(requirementId) as Promise<RequirementWithProvenance>;
  }

  async approveRequirement(
    requirementId: string,
    officerId: string = 'procurement_officer'
  ): Promise<RequirementWithProvenance> {
    const existing = await requirementRepository.findRequirementById(requirementId);
    if (!existing) {
      throw new Error(`Requirement ${requirementId} not found`);
    }

    await requirementRepository.updateRequirement(requirementId, {
      status: RequirementStatus.APPROVED,
    });

    await auditService.log(AuditEventType.REQUIREMENT_APPROVED, {
      metadata: {
        requirementId,
        requirementCode: existing.requirementCode,
        approvedBy: officerId,
      },
    });

    return requirementRepository.findRequirementById(requirementId) as Promise<RequirementWithProvenance>;
  }

  async rejectRequirement(
    requirementId: string,
    officerId: string = 'procurement_officer'
  ): Promise<RequirementWithProvenance> {
    const existing = await requirementRepository.findRequirementById(requirementId);
    if (!existing) {
      throw new Error(`Requirement ${requirementId} not found`);
    }

    await requirementRepository.updateRequirement(requirementId, {
      status: RequirementStatus.REJECTED,
    });

    await auditService.log(AuditEventType.REQUIREMENT_REJECTED, {
      metadata: {
        requirementId,
        requirementCode: existing.requirementCode,
        rejectedBy: officerId,
      },
    });

    return requirementRepository.findRequirementById(requirementId) as Promise<RequirementWithProvenance>;
  }

  async lockBlueprint(
    tenderId: string,
    blueprintId: string,
    officerId: string = 'procurement_officer'
  ) {
    const updated = await requirementRepository.updateBlueprintStatus(
      blueprintId,
      BlueprintStatus.LOCKED,
      officerId
    );

    await auditService.log(AuditEventType.BLUEPRINT_LOCKED, {
      tenderId,
      metadata: {
        blueprintId,
        version: updated.version,
        lockedBy: officerId,
      },
    });

    return updated;
  }
}

export const requirementService = new RequirementService();
