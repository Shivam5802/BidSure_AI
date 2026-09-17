import {
  Bidder,
  BidSubmission,
  BidDocument,
  DocumentPage,
  EvidenceBlock,
  BidderStatus,
  SubmissionStatus,
  BidDocumentType,
  ClassificationStatus,
  DocumentProcessingStatus,
  DocumentPageStatus,
  EvidenceBlockType,
  RequirementCategory,
} from '@prisma/client';

export interface CreateBidderInput {
  tenderId: string;
  bidderCode: string;
  legalName: string;
  displayName?: string | null;
  createdById?: string | null;
}

export interface CreateSubmissionInput {
  tenderId: string;
  bidderId: string;
  submissionReference?: string;
}

export interface CreateBidDocumentInput {
  bidSubmissionId: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  fileHash?: string;
  uploadedById?: string | null;
  documentType?: BidDocumentType;
}

export interface UpdateBidDocumentProgressInput {
  status?: DocumentProcessingStatus;
  progress?: number;
  currentStage?: string;
  pageCount?: number;
  ocrUsed?: boolean;
  error?: string | null;
  started?: boolean;
  completed?: boolean;
}

export interface UpdateBidDocumentClassificationInput {
  documentType: BidDocumentType;
  classificationStatus: ClassificationStatus;
  classificationConfidence: number;
  classificationReason: string;
  possibleRequirementCategories: RequirementCategory[];
  possibleRequirementIds?: string[];
  reviewRequired: boolean;
  originalClassification?: any;
  humanReviewed?: boolean;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
}

export interface BidDocumentWithDetails extends BidDocument {
  pages: (DocumentPage & { evidenceBlocks: EvidenceBlock[] })[];
}

export interface BidderWithDetails extends Bidder {
  submissions: (BidSubmission & { documents: BidDocument[] })[];
  documentCount: number;
  classifiedCount: number;
  reviewRequiredCount: number;
  failedCount: number;
}

export class BidderRepository {
  private bidders = new Map<string, Bidder>();
  private submissions = new Map<string, BidSubmission>();
  private bidDocuments = new Map<string, BidDocument>();
  private pages = new Map<string, DocumentPage>();
  private evidenceBlocks = new Map<string, EvidenceBlock>();

  // --- BIDDERS ---
  async createBidder(input: CreateBidderInput): Promise<Bidder> {
    for (const b of this.bidders.values()) {
      if (b.tenderId === input.tenderId && b.bidderCode.toLowerCase() === input.bidderCode.toLowerCase()) {
        throw new Error(`Bidder with code "${input.bidderCode}" already exists for this tender.`);
      }
    }

    const id = `bdr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const bidder: Bidder = {
      id,
      tenderId: input.tenderId,
      bidderCode: input.bidderCode.trim(),
      legalName: input.legalName.trim(),
      displayName: input.displayName?.trim() || null,
      status: BidderStatus.ACTIVE,
      createdById: input.createdById || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.bidders.set(id, bidder);
    return bidder;
  }

  async findBidderById(id: string): Promise<Bidder | null> {
    return this.bidders.get(id) || null;
  }

  async findBidderByCode(tenderId: string, bidderCode: string): Promise<Bidder | null> {
    for (const b of this.bidders.values()) {
      if (b.tenderId === tenderId && b.bidderCode.toLowerCase() === bidderCode.toLowerCase()) {
        return b;
      }
    }
    return null;
  }

  async listBiddersByTender(tenderId: string): Promise<BidderWithDetails[]> {
    const result: BidderWithDetails[] = [];
    for (const bidder of this.bidders.values()) {
      if (bidder.tenderId === tenderId) {
        const bidderSubmissions: (BidSubmission & { documents: BidDocument[] })[] = [];
        let totalDocs = 0;
        let classifiedCount = 0;
        let reviewRequiredCount = 0;
        let failedCount = 0;

        for (const sub of this.submissions.values()) {
          if (sub.bidderId === bidder.id) {
            const docs: BidDocument[] = [];
            for (const doc of this.bidDocuments.values()) {
              if (doc.bidSubmissionId === sub.id) {
                docs.push(doc);
                totalDocs++;
                if (doc.classificationStatus === ClassificationStatus.CLASSIFIED) classifiedCount++;
                if (doc.classificationStatus === ClassificationStatus.REVIEW_REQUIRED || doc.reviewRequired) reviewRequiredCount++;
                if (doc.processingStatus === DocumentProcessingStatus.FAILED || doc.classificationStatus === ClassificationStatus.FAILED) failedCount++;
              }
            }
            bidderSubmissions.push({ ...sub, documents: docs });
          }
        }

        result.push({
          ...bidder,
          submissions: bidderSubmissions,
          documentCount: totalDocs,
          classifiedCount,
          reviewRequiredCount,
          failedCount,
        });
      }
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateBidder(id: string, data: Partial<Bidder>): Promise<Bidder> {
    const existing = await this.findBidderById(id);
    if (!existing) throw new Error(`Bidder ${id} not found`);

    const updated: Bidder = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.bidders.set(id, updated);
    return updated;
  }

  // --- BID SUBMISSIONS ---
  async createSubmission(input: CreateSubmissionInput): Promise<BidSubmission> {
    const subRef = (input.submissionReference || `SUB-${Date.now()}`).trim();
    for (const sub of this.submissions.values()) {
      if (sub.bidderId === input.bidderId && sub.submissionReference.toLowerCase() === subRef.toLowerCase()) {
        throw new Error(`Bid submission "${subRef}" already exists for this bidder.`);
      }
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const submission: BidSubmission = {
      id,
      tenderId: input.tenderId,
      bidderId: input.bidderId,
      submissionReference: subRef,
      status: SubmissionStatus.DRAFT,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.submissions.set(id, submission);
    return submission;
  }

  async findSubmissionById(id: string): Promise<BidSubmission | null> {
    return this.submissions.get(id) || null;
  }

  async findActiveSubmissionByBidder(bidderId: string): Promise<BidSubmission | null> {
    for (const sub of this.submissions.values()) {
      if (sub.bidderId === bidderId && sub.status !== SubmissionStatus.WITHDRAWN) {
        return sub;
      }
    }
    return null;
  }

  async listSubmissionsByBidder(bidderId: string): Promise<BidSubmission[]> {
    const list: BidSubmission[] = [];
    for (const sub of this.submissions.values()) {
      if (sub.bidderId === bidderId) {
        list.push(sub);
      }
    }
    return list;
  }

  async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<BidSubmission> {
    const sub = this.submissions.get(id);
    if (!sub) throw new Error(`Submission ${id} not found`);
    sub.status = status;
    if (status === SubmissionStatus.SUBMITTED) {
      sub.submittedAt = new Date();
    }
    sub.updatedAt = new Date();
    this.submissions.set(id, sub);
    return sub;
  }

  // --- BID DOCUMENTS ---
  async createBidDocument(input: CreateBidDocumentInput): Promise<BidDocument> {
    const id = `bdoc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const doc: BidDocument = {
      id,
      bidSubmissionId: input.bidSubmissionId,
      originalFilename: input.originalFilename,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      fileHash: input.fileHash || `hash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageCount: 0,
      documentType: input.documentType || BidDocumentType.UNKNOWN,
      classificationStatus: ClassificationStatus.PENDING,
      classificationConfidence: null,
      classificationReason: null,
      possibleRequirementCategories: [],
      possibleRequirementIds: [],
      reviewRequired: false,
      originalClassification: null,
      humanReviewed: false,
      reviewedBy: null,
      reviewedAt: null,
      processingStatus: DocumentProcessingStatus.UPLOADED,
      processingProgress: 0,
      currentStage: 'UPLOADED',
      ocrUsed: false,
      processingStartedAt: null,
      processingCompletedAt: null,
      processingError: null,
      uploadedById: input.uploadedById || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.bidDocuments.set(id, doc);
    return doc;
  }

  async findBidDocumentById(id: string): Promise<BidDocument | null> {
    return this.bidDocuments.get(id) || null;
  }

  async findBidDocumentByHash(submissionId: string, fileHash: string): Promise<BidDocument | null> {
    for (const doc of this.bidDocuments.values()) {
      if (doc.bidSubmissionId === submissionId && doc.fileHash === fileHash) {
        return doc;
      }
    }
    return null;
  }

  async listPagesByBidDocument(bidDocumentId: string): Promise<DocumentPage[]> {
    const pages: DocumentPage[] = [];
    for (const p of this.pages.values()) {
      if (p.bidDocumentId === bidDocumentId || p.documentId === bidDocumentId) {
        pages.push(p);
      }
    }
    return pages.sort((a, b) => a.pageNumber - b.pageNumber);
  }

  async listBidDocumentsBySubmission(submissionId: string): Promise<BidDocumentWithDetails[]> {
    const result: BidDocumentWithDetails[] = [];
    for (const doc of this.bidDocuments.values()) {
      if (doc.bidSubmissionId === submissionId) {
        const pages: (DocumentPage & { evidenceBlocks: EvidenceBlock[] })[] = [];
        for (const p of this.pages.values()) {
          if (p.bidDocumentId === doc.id || p.documentId === doc.id) {
            const blocks: EvidenceBlock[] = [];
            for (const b of this.evidenceBlocks.values()) {
              if (b.pageId === p.id) blocks.push(b);
            }
            pages.push({ ...p, evidenceBlocks: blocks.sort((a, b) => a.sequence - b.sequence) });
          }
        }
        result.push({ ...doc, pages: pages.sort((a, b) => a.pageNumber - b.pageNumber) });
      }
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateBidDocumentProgress(id: string, update: UpdateBidDocumentProgressInput): Promise<BidDocument> {
    const doc = await this.findBidDocumentById(id);
    if (!doc) throw new Error(`Bid document ${id} not found`);

    const updated: BidDocument = {
      ...doc,
      ...(update.status !== undefined && { processingStatus: update.status }),
      ...(update.progress !== undefined && { processingProgress: update.progress }),
      ...(update.currentStage !== undefined && { currentStage: update.currentStage }),
      ...(update.pageCount !== undefined && { pageCount: update.pageCount }),
      ...(update.ocrUsed !== undefined && { ocrUsed: update.ocrUsed }),
      ...(update.error !== undefined && { processingError: update.error }),
      ...(update.started && { processingStartedAt: new Date() }),
      ...(update.completed && { processingCompletedAt: new Date() }),
      updatedAt: new Date(),
    };

    this.bidDocuments.set(id, updated);
    return updated;
  }

  async updateBidDocumentClassification(id: string, classification: UpdateBidDocumentClassificationInput): Promise<BidDocument> {
    const doc = await this.findBidDocumentById(id);
    if (!doc) throw new Error(`Bid document ${id} not found`);

    const updated: BidDocument = {
      ...doc,
      documentType: classification.documentType,
      classificationStatus: classification.classificationStatus,
      classificationConfidence: classification.classificationConfidence,
      classificationReason: classification.classificationReason,
      possibleRequirementCategories: classification.possibleRequirementCategories || [],
      possibleRequirementIds: classification.possibleRequirementIds || [],
      reviewRequired: classification.reviewRequired,
      ...(classification.originalClassification !== undefined && { originalClassification: classification.originalClassification }),
      ...(classification.humanReviewed !== undefined && { humanReviewed: classification.humanReviewed }),
      ...(classification.reviewedBy !== undefined && { reviewedBy: classification.reviewedBy }),
      ...(classification.reviewedAt !== undefined && { reviewedAt: classification.reviewedAt }),
      updatedAt: new Date(),
    };

    this.bidDocuments.set(id, updated);
    return updated;
  }

  async deleteBidDocument(id: string): Promise<void> {
    this.bidDocuments.delete(id);
  }

  // --- PAGES & EVIDENCE ---
  async createDocumentPage(input: {
    bidDocumentId: string;
    pageNumber: number;
    processingStatus: DocumentPageStatus;
    hasTextLayer: boolean;
    ocrUsed: boolean;
    textContent: string;
    textConfidence?: number | null;
    reviewRequired: boolean;
  }): Promise<DocumentPage> {
    const id = `bpage_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const page: DocumentPage = {
      id,
      documentId: null,
      bidDocumentId: input.bidDocumentId,
      pageNumber: input.pageNumber,
      processingStatus: input.processingStatus,
      hasTextLayer: input.hasTextLayer,
      ocrUsed: input.ocrUsed,
      textContent: input.textContent,
      textConfidence: input.textConfidence || null,
      reviewRequired: input.reviewRequired,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.pages.set(id, page);
    return page;
  }

  async createEvidenceBlock(input: {
    pageId: string;
    blockType: EvidenceBlockType;
    content: string;
    sequence: number;
    boundingBox?: Record<string, unknown> | null;
    confidence?: number | null;
  }): Promise<EvidenceBlock> {
    const id = `beblk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const block: EvidenceBlock = {
      id,
      pageId: input.pageId,
      blockType: input.blockType,
      content: input.content,
      sequence: input.sequence,
      boundingBox: (input.boundingBox as any) || null,
      confidence: input.confidence || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.evidenceBlocks.set(id, block);
    return block;
  }

  async clear(): Promise<void> {
    this.bidders.clear();
    this.submissions.clear();
    this.bidDocuments.clear();
    this.pages.clear();
    this.evidenceBlocks.clear();
  }
}

const globalForBidderRepo = globalThis as unknown as { bidderRepository: BidderRepository };
export const bidderRepository = globalForBidderRepo.bidderRepository || new BidderRepository();
if (process.env.NODE_ENV !== 'production') globalForBidderRepo.bidderRepository = bidderRepository;
