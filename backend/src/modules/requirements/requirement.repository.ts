import {
  ComplianceBlueprint,
  TenderRequirement,
  RequirementSourceReference,
  BlueprintStatus,
  RequirementCategory,
  RequirementStatus,
  MandatoryStatus,
  RuleType,
} from '@prisma/client';

export interface CreateBlueprintInput {
  tenderId: string;
  version?: number;
  status?: BlueprintStatus;
  createdBy?: string;
}

export interface CreateRequirementInput {
  blueprintId: string;
  requirementCode: string;
  clauseReference?: string | null;
  requirementText: string;
  normalizedRequirementText: string;
  category?: RequirementCategory;
  mandatory?: MandatoryStatus;
  condition?: string | null;
  evidenceRequired?: string[];
  verificationSource?: string | null;
  ruleType?: RuleType | null;
  ruleParameters?: Record<string, any>;
  extractionConfidence?: number;
  status?: RequirementStatus;
  ambiguityFlag?: boolean;
  ambiguityReason?: string | null;
  conflictFlag?: boolean;
  conflictReason?: string | null;
  duplicateFlag?: boolean;
  duplicateOfRequirementId?: string | null;
  aiExplanation: string;
  sourcePageIds?: string[];
  sourceEvidenceBlockIds?: string[];
}

export interface CreateSourceReferenceInput {
  requirementId: string;
  documentId: string;
  pageNumber: number;
  pageId?: string;
  evidenceBlockId?: string;
}

export interface RequirementFilterOptions {
  category?: RequirementCategory;
  status?: RequirementStatus;
  ambiguityFlag?: boolean;
  conflictFlag?: boolean;
  duplicateFlag?: boolean;
  search?: string;
}

export type RequirementWithProvenance = TenderRequirement & {
  sourceReferences: RequirementSourceReference[];
};

export class RequirementRepository {
  private blueprints = new Map<string, ComplianceBlueprint>();
  private requirements = new Map<string, TenderRequirement>();
  private sourceReferences = new Map<string, RequirementSourceReference>();

  async createBlueprint(input: CreateBlueprintInput): Promise<ComplianceBlueprint> {
    const id = `bp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const bp: ComplianceBlueprint = {
      id,
      tenderId: input.tenderId,
      version: input.version || 1,
      status: input.status || BlueprintStatus.DRAFT,
      createdBy: input.createdBy || 'system',
      approvedBy: null,
      createdAt: new Date(),
      approvedAt: null,
      updatedAt: new Date(),
    };
    this.blueprints.set(id, bp);
    return bp;
  }

  async getLatestBlueprint(
    tenderId: string
  ): Promise<(ComplianceBlueprint & { requirements: RequirementWithProvenance[] }) | null> {
    const tenderBps = Array.from(this.blueprints.values())
      .filter((bp) => bp.tenderId === tenderId)
      .sort((a, b) => b.version - a.version);

    if (tenderBps.length === 0) return null;

    const bp = tenderBps[0]!;
    const reqs = await this.listRequirementsByBlueprint(bp.id);

    return {
      ...bp,
      requirements: reqs,
    };
  }

  async getBlueprintByVersion(tenderId: string, version: number) {
    for (const bp of this.blueprints.values()) {
      if (bp.tenderId === tenderId && bp.version === version) {
        const reqs = await this.listRequirementsByBlueprint(bp.id);
        return {
          ...bp,
          requirements: reqs,
        };
      }
    }
    return null;
  }

  async getBlueprintVersions(tenderId: string): Promise<ComplianceBlueprint[]> {
    return Array.from(this.blueprints.values())
      .filter((bp) => bp.tenderId === tenderId)
      .sort((a, b) => b.version - a.version);
  }

  async updateBlueprintStatus(
    blueprintId: string,
    status: BlueprintStatus,
    approvedBy?: string
  ): Promise<ComplianceBlueprint> {
    const bp = this.blueprints.get(blueprintId);
    if (!bp) throw new Error(`Blueprint ${blueprintId} not found`);

    bp.status = status;
    if (approvedBy) bp.approvedBy = approvedBy;
    if (status === BlueprintStatus.APPROVED || status === BlueprintStatus.LOCKED) {
      bp.approvedAt = new Date();
    }
    bp.updatedAt = new Date();
    this.blueprints.set(blueprintId, bp);
    return bp;
  }

  async createRequirement(input: CreateRequirementInput): Promise<TenderRequirement> {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const req: TenderRequirement = {
      id,
      blueprintId: input.blueprintId,
      requirementCode: input.requirementCode,
      clauseReference: input.clauseReference ?? null,
      requirementText: input.requirementText,
      normalizedRequirementText: input.normalizedRequirementText,
      category: input.category || RequirementCategory.TENDER_SPECIFIC,
      mandatory: input.mandatory || MandatoryStatus.YES,
      condition: input.condition ?? null,
      evidenceRequired: input.evidenceRequired || [],
      verificationSource: input.verificationSource ?? null,
      ruleType: input.ruleType ?? null,
      ruleParameters: (input.ruleParameters as any) ?? null,
      extractionConfidence: input.extractionConfidence ?? 1.0,
      status: input.status || RequirementStatus.DRAFT,
      ambiguityFlag: input.ambiguityFlag ?? false,
      ambiguityReason: input.ambiguityReason ?? null,
      conflictFlag: input.conflictFlag ?? false,
      conflictReason: input.conflictReason ?? null,
      duplicateFlag: input.duplicateFlag ?? false,
      duplicateOfRequirementId: input.duplicateOfRequirementId ?? null,
      aiExplanation: input.aiExplanation,
      sourcePageIds: input.sourcePageIds || [],
      sourceEvidenceBlockIds: input.sourceEvidenceBlockIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.requirements.set(id, req);
    return req;
  }

  async createSourceReference(input: CreateSourceReferenceInput): Promise<RequirementSourceReference> {
    const id = `sr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sr: RequirementSourceReference = {
      id,
      requirementId: input.requirementId,
      documentId: input.documentId,
      pageNumber: input.pageNumber,
      pageId: input.pageId ?? null,
      evidenceBlockId: input.evidenceBlockId ?? null,
      createdAt: new Date(),
    };
    this.sourceReferences.set(id, sr);
    return sr;
  }

  async findRequirementById(requirementId: string): Promise<RequirementWithProvenance | null> {
    const req = this.requirements.get(requirementId);
    if (!req) return null;

    const srs = Array.from(this.sourceReferences.values()).filter(
      (s) => s.requirementId === requirementId
    );

    return {
      ...req,
      sourceReferences: srs,
    };
  }

  async listRequirementsByBlueprint(
    blueprintId: string,
    filters?: RequirementFilterOptions
  ): Promise<RequirementWithProvenance[]> {
    let reqs = Array.from(this.requirements.values()).filter((r) => r.blueprintId === blueprintId);

    if (filters?.category) reqs = reqs.filter((r) => r.category === filters.category);
    if (filters?.status) reqs = reqs.filter((r) => r.status === filters.status);
    if (filters?.ambiguityFlag !== undefined) reqs = reqs.filter((r) => r.ambiguityFlag === filters.ambiguityFlag);
    if (filters?.conflictFlag !== undefined) reqs = reqs.filter((r) => r.conflictFlag === filters.conflictFlag);
    if (filters?.duplicateFlag !== undefined) reqs = reqs.filter((r) => r.duplicateFlag === filters.duplicateFlag);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      reqs = reqs.filter(
        (r) =>
          r.requirementText.toLowerCase().includes(q) ||
          (r.clauseReference && r.clauseReference.toLowerCase().includes(q)) ||
          r.requirementCode.toLowerCase().includes(q)
      );
    }

    return reqs
      .map((r) => ({
        ...r,
        sourceReferences: Array.from(this.sourceReferences.values()).filter(
          (s) => s.requirementId === r.id
        ),
      }))
      .sort((a, b) => a.requirementCode.localeCompare(b.requirementCode));
  }

  async updateRequirement(
    requirementId: string,
    data: Partial<CreateRequirementInput> & { status?: RequirementStatus }
  ): Promise<TenderRequirement> {
    const req = this.requirements.get(requirementId);
    if (!req) throw new Error(`Requirement ${requirementId} not found`);

    if (data.clauseReference !== undefined) req.clauseReference = data.clauseReference;
    if (data.requirementText !== undefined) req.requirementText = data.requirementText;
    if (data.normalizedRequirementText !== undefined) req.normalizedRequirementText = data.normalizedRequirementText;
    if (data.category !== undefined) req.category = data.category;
    if (data.mandatory !== undefined) req.mandatory = data.mandatory;
    if (data.condition !== undefined) req.condition = data.condition;
    if (data.evidenceRequired !== undefined) req.evidenceRequired = data.evidenceRequired;
    if (data.verificationSource !== undefined) req.verificationSource = data.verificationSource;
    if (data.ruleType !== undefined) req.ruleType = data.ruleType;
    if (data.ruleParameters !== undefined) req.ruleParameters = data.ruleParameters as any;
    if (data.status !== undefined) req.status = data.status;
    if (data.duplicateOfRequirementId !== undefined) req.duplicateOfRequirementId = data.duplicateOfRequirementId;
    if (data.aiExplanation !== undefined) req.aiExplanation = data.aiExplanation;

    req.updatedAt = new Date();
    this.requirements.set(requirementId, req);
    return req;
  }

  async listRequirementsByTender(tenderId: string): Promise<TenderRequirement[]> {
    const bp = await this.getLatestBlueprint(tenderId);
    if (!bp) return Array.from(this.requirements.values());
    return bp.requirements;
  }

  async clear(): Promise<void> {
    this.blueprints.clear();
    this.requirements.clear();
    this.sourceReferences.clear();
  }
}

export const requirementRepository = new RequirementRepository();
