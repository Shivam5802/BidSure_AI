import {
  RequirementEvidenceMapping,
  MappingType,
  MappingStatus,
  RequirementCategory,
} from '@prisma/client';

export interface MatchingSignals {
  documentTypeMatch: number;
  fieldMatch: number;
  categoryMatch: number;
  keywordMatch: number;
  semanticMatch: number;
  expectedEvidenceMatch?: number;
  explanation?: string;
  sourceContext?: {
    documentName?: string;
    documentType?: string;
    pageNumber?: number;
    sourceText?: string;
  };
}

export interface CreateMappingInput {
  tenderRequirementId: string;
  bidderId: string;
  bidSubmissionId: string;
  evidenceId: string;
  mappingType?: MappingType;
  status?: MappingStatus;
  confidence?: number;
  reason: string;
  matchedField?: string | null;
  matchedCategory?: RequirementCategory | null;
  matchingSignals?: MatchingSignals | Record<string, any> | null;
  source?: string;
  createdBy?: string | null;
  version?: number;
}

export interface UpdateMappingInput {
  mappingType?: MappingType;
  status?: MappingStatus;
  confidence?: number;
  reason?: string;
  matchedField?: string | null;
  matchedCategory?: RequirementCategory | null;
  matchingSignals?: MatchingSignals | Record<string, any> | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewReason?: string | null;
}

export class MappingRepository {
  private mappings = new Map<string, RequirementEvidenceMapping>();
  private history = new Map<string, RequirementEvidenceMapping[]>(); // mappingId or unique key -> list of versions

  async createMapping(input: CreateMappingInput): Promise<RequirementEvidenceMapping> {
    const id = `map_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Check if an active mapping exists for this (tenderRequirementId, evidenceId, bidSubmissionId)
    const existing = Array.from(this.mappings.values()).find(
      (m) =>
        m.tenderRequirementId === input.tenderRequirementId &&
        m.evidenceId === input.evidenceId &&
        m.bidSubmissionId === input.bidSubmissionId &&
        m.status !== MappingStatus.SUPERSEDED
    );

    const version = input.version || (existing ? existing.version + 1 : 1);

    // If existing active mapping found, mark it SUPERSEDED
    if (existing) {
      existing.status = MappingStatus.SUPERSEDED;
      existing.updatedAt = new Date();
      this.mappings.set(existing.id, existing);

      // Update existing item status in history array if present
      const histKey = `${input.tenderRequirementId}:${input.evidenceId}:${input.bidSubmissionId}`;
      const hist = this.history.get(histKey);
      if (hist) {
        const item = hist.find((h) => h.id === existing.id);
        if (item) {
          item.status = MappingStatus.SUPERSEDED;
          item.updatedAt = new Date();
        }
      }
    }

    const mapping: RequirementEvidenceMapping = {
      id,
      tenderRequirementId: input.tenderRequirementId,
      bidderId: input.bidderId,
      bidSubmissionId: input.bidSubmissionId,
      evidenceId: input.evidenceId,
      mappingType: input.mappingType || MappingType.POTENTIAL,
      status: input.status || MappingStatus.PROPOSED,
      confidence: input.confidence ?? 0.0,
      reason: input.reason,
      matchedField: input.matchedField || null,
      matchedCategory: input.matchedCategory || null,
      matchingSignals: (input.matchingSignals as any) || null,
      source: input.source || 'SYSTEM',
      createdBy: input.createdBy || null,
      reviewedBy: null,
      reviewedAt: null,
      reviewReason: null,
      version,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mappings.set(id, mapping);

    const histKey = `${input.tenderRequirementId}:${input.evidenceId}:${input.bidSubmissionId}`;
    const hist = this.history.get(histKey) || [];
    hist.push({ ...mapping });
    this.history.set(histKey, hist);

    return mapping;
  }

  async findMappingById(id: string): Promise<RequirementEvidenceMapping | null> {
    return this.mappings.get(id) || null;
  }

  async listMappingsByBidder(bidderId: string, activeOnly = true): Promise<RequirementEvidenceMapping[]> {
    const list: RequirementEvidenceMapping[] = [];
    for (const m of this.mappings.values()) {
      if (m.bidderId === bidderId) {
        if (!activeOnly || m.status !== MappingStatus.SUPERSEDED) {
          list.push(m);
        }
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async listMappingsByRequirement(
    requirementId: string,
    bidderId?: string,
    activeOnly = true
  ): Promise<RequirementEvidenceMapping[]> {
    const list: RequirementEvidenceMapping[] = [];
    for (const m of this.mappings.values()) {
      if (m.tenderRequirementId === requirementId) {
        if (!bidderId || m.bidderId === bidderId) {
          if (!activeOnly || m.status !== MappingStatus.SUPERSEDED) {
            list.push(m);
          }
        }
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async listMappingsByEvidence(evidenceId: string, activeOnly = true): Promise<RequirementEvidenceMapping[]> {
    const list: RequirementEvidenceMapping[] = [];
    for (const m of this.mappings.values()) {
      if (m.evidenceId === evidenceId) {
        if (!activeOnly || m.status !== MappingStatus.SUPERSEDED) {
          list.push(m);
        }
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateMapping(id: string, update: UpdateMappingInput): Promise<RequirementEvidenceMapping> {
    const mapping = await this.findMappingById(id);
    if (!mapping) throw new Error(`Mapping ${id} not found`);

    const updated: RequirementEvidenceMapping = {
      ...mapping,
      ...(update.mappingType !== undefined && { mappingType: update.mappingType }),
      ...(update.status !== undefined && { status: update.status }),
      ...(update.confidence !== undefined && { confidence: update.confidence }),
      ...(update.reason !== undefined && { reason: update.reason }),
      ...(update.matchedField !== undefined && { matchedField: update.matchedField }),
      ...(update.matchedCategory !== undefined && { matchedCategory: update.matchedCategory }),
      ...(update.matchingSignals !== undefined && { matchingSignals: (update.matchingSignals as any) }),
      ...(update.reviewedBy !== undefined && { reviewedBy: update.reviewedBy }),
      ...(update.reviewedAt !== undefined && { reviewedAt: update.reviewedAt }),
      ...(update.reviewReason !== undefined && { reviewReason: update.reviewReason }),
      updatedAt: new Date(),
    };

    this.mappings.set(id, updated);
    return updated;
  }

  async getMappingHistory(mappingId: string): Promise<RequirementEvidenceMapping[]> {
    const target = await this.findMappingById(mappingId);
    if (!target) return [];

    const histKey = `${target.tenderRequirementId}:${target.evidenceId}:${target.bidSubmissionId}`;
    return (this.history.get(histKey) || []).sort((a, b) => a.version - b.version);
  }

  async listReviewQueue(tenderId?: string): Promise<RequirementEvidenceMapping[]> {
    const list: RequirementEvidenceMapping[] = [];
    for (const m of this.mappings.values()) {
      if (m.status === MappingStatus.REVIEW_REQUIRED || m.status === MappingStatus.PROPOSED) {
        if (!tenderId) {
          list.push(m);
        } else {
          list.push(m);
        }
      }
    }
    return list.sort((a, b) => {
      if (a.mappingType === MappingType.CONFLICTING && b.mappingType !== MappingType.CONFLICTING) return -1;
      if (b.mappingType === MappingType.CONFLICTING && a.mappingType !== MappingType.CONFLICTING) return 1;
      return a.confidence - b.confidence;
    });
  }

  async clear(): Promise<void> {
    this.mappings.clear();
    this.history.clear();
  }
}

const globalForMappingRepo = globalThis as unknown as { mappingRepository: MappingRepository };
export const mappingRepository = globalForMappingRepo.mappingRepository || new MappingRepository();
if (process.env.NODE_ENV !== 'production') globalForMappingRepo.mappingRepository = mappingRepository;
