import {
  EvidenceExtractionRun,
  ExtractedEvidence,
  ExtractionRunStatus,
  EvidenceValueType,
  ExtractionMethod,
  EvidenceStatus,
} from '@prisma/client';

export interface CreateExtractionRunInput {
  bidDocumentId: string;
  extractorVersion?: string;
  schemaVersion?: string;
}

export interface CreateEvidenceInput {
  bidDocumentId: string;
  documentPageId?: string | null;
  evidenceBlockId?: string | null;
  extractionRunId?: string | null;
  fieldKey: string;
  fieldLabel: string;
  rawValue: string;
  normalizedValue?: any;
  valueType?: EvidenceValueType;
  unit?: string | null;
  sourceText: string;
  pageNumber?: number;
  boundingBox?: any;
  confidence?: number;
  extractionMethod?: ExtractionMethod;
  status?: EvidenceStatus;
  conflictFlag?: boolean;
  conflictReason?: string | null;
  reviewReason?: string | null;
}

export interface UpdateEvidenceInput {
  rawValue?: string;
  normalizedValue?: any;
  valueType?: EvidenceValueType;
  unit?: string | null;
  status?: EvidenceStatus;
  reviewReason?: string | null;
  conflictFlag?: boolean;
  conflictReason?: string | null;
  originalValue?: any;
  humanReviewed?: boolean;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
}

export class EvidenceRepository {
  private runs = new Map<string, EvidenceExtractionRun>();
  private evidenceItems = new Map<string, ExtractedEvidence>();

  // --- EXTRACTION RUNS ---
  async createExtractionRun(input: CreateExtractionRunInput): Promise<EvidenceExtractionRun> {
    const id = `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const run: EvidenceExtractionRun = {
      id,
      bidDocumentId: input.bidDocumentId,
      status: ExtractionRunStatus.QUEUED,
      extractorVersion: input.extractorVersion || '1.0.0',
      schemaVersion: input.schemaVersion || '1.0',
      startedAt: new Date(),
      completedAt: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.runs.set(id, run);
    return run;
  }

  async findExtractionRunById(id: string): Promise<EvidenceExtractionRun | null> {
    return this.runs.get(id) || null;
  }

  async findLatestRunByDocument(bidDocumentId: string): Promise<EvidenceExtractionRun | null> {
    const docRuns = Array.from(this.runs.values())
      .filter((r) => r.bidDocumentId === bidDocumentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return docRuns[0] || null;
  }

  async updateExtractionRun(
    id: string,
    update: { status?: ExtractionRunStatus; error?: string | null; completed?: boolean }
  ): Promise<EvidenceExtractionRun> {
    const run = await this.findExtractionRunById(id);
    if (!run) throw new Error(`Extraction run ${id} not found`);

    const updated: EvidenceExtractionRun = {
      ...run,
      ...(update.status !== undefined && { status: update.status }),
      ...(update.error !== undefined && { error: update.error }),
      ...(update.completed && { completedAt: new Date() }),
      updatedAt: new Date(),
    };

    this.runs.set(id, updated);
    return updated;
  }

  // --- EVIDENCE ITEMS ---
  async createEvidenceItem(input: CreateEvidenceInput): Promise<ExtractedEvidence> {
    const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const item: ExtractedEvidence = {
      id,
      bidDocumentId: input.bidDocumentId,
      documentPageId: input.documentPageId || null,
      evidenceBlockId: input.evidenceBlockId || null,
      extractionRunId: input.extractionRunId || null,
      fieldKey: input.fieldKey,
      fieldLabel: input.fieldLabel,
      rawValue: input.rawValue,
      normalizedValue: input.normalizedValue ?? null,
      valueType: input.valueType || EvidenceValueType.STRING,
      unit: input.unit || null,
      sourceText: input.sourceText,
      pageNumber: input.pageNumber || 1,
      boundingBox: input.boundingBox || null,
      confidence: input.confidence ?? 0.9,
      extractionMethod: input.extractionMethod || ExtractionMethod.AI_EXTRACTION,
      status: input.status || EvidenceStatus.EXTRACTED,
      conflictFlag: input.conflictFlag || false,
      conflictReason: input.conflictReason || null,
      reviewReason: input.reviewReason || null,
      originalValue: null,
      humanReviewed: false,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.evidenceItems.set(id, item);
    return item;
  }

  async findEvidenceById(id: string): Promise<ExtractedEvidence | null> {
    return this.evidenceItems.get(id) || null;
  }

  async listEvidenceByDocument(bidDocumentId: string): Promise<ExtractedEvidence[]> {
    const list: ExtractedEvidence[] = [];
    for (const item of this.evidenceItems.values()) {
      if (item.bidDocumentId === bidDocumentId) {
        list.push(item);
      }
    }
    return list.sort((a, b) => a.pageNumber - b.pageNumber || a.createdAt.getTime() - b.createdAt.getTime());
  }

  async listAllEvidence(): Promise<ExtractedEvidence[]> {
    return Array.from(this.evidenceItems.values());
  }

  async listEvidenceByBidder(_bidderId: string): Promise<ExtractedEvidence[]> {
    return Array.from(this.evidenceItems.values());
  }

  async updateEvidenceItem(id: string, update: UpdateEvidenceInput): Promise<ExtractedEvidence> {
    const item = await this.findEvidenceById(id);
    if (!item) throw new Error(`Evidence record ${id} not found`);

    const updated: ExtractedEvidence = {
      ...item,
      ...(update.rawValue !== undefined && { rawValue: update.rawValue }),
      ...(update.normalizedValue !== undefined && { normalizedValue: update.normalizedValue }),
      ...(update.valueType !== undefined && { valueType: update.valueType }),
      ...(update.unit !== undefined && { unit: update.unit }),
      ...(update.status !== undefined && { status: update.status }),
      ...(update.reviewReason !== undefined && { reviewReason: update.reviewReason }),
      ...(update.conflictFlag !== undefined && { conflictFlag: update.conflictFlag }),
      ...(update.conflictReason !== undefined && { conflictReason: update.conflictReason }),
      ...(update.originalValue !== undefined && { originalValue: update.originalValue }),
      ...(update.humanReviewed !== undefined && { humanReviewed: update.humanReviewed }),
      ...(update.reviewedBy !== undefined && { reviewedBy: update.reviewedBy }),
      ...(update.reviewedAt !== undefined && { reviewedAt: update.reviewedAt }),
      updatedAt: new Date(),
    };

    this.evidenceItems.set(id, updated);
    return updated;
  }

  async deleteEvidenceItem(id: string): Promise<void> {
    this.evidenceItems.delete(id);
  }

  async clear(): Promise<void> {
    this.runs.clear();
    this.evidenceItems.clear();
  }
}

const globalForEvidenceRepo = globalThis as unknown as { evidenceRepository: EvidenceRepository };
export const evidenceRepository = globalForEvidenceRepo.evidenceRepository || new EvidenceRepository();
if (process.env.NODE_ENV !== 'production') globalForEvidenceRepo.evidenceRepository = evidenceRepository;
