import {
  Tender,
  TenderDocument,
  DocumentProcessingStatus,
  AuditEventType,
  TenderStatus,
} from '@prisma/client';
import {
  tenderRepository,
  CreateTenderInput,
  TenderWithDocuments,
  DocumentWithPages,
} from './tender.repository.js';
import { InMemoryStorageService } from '../../services/storage/storage.interface.js';
import { pdfValidatorService } from '../../services/documents/pdf-validator.service.js';
import { DocumentProcessorService } from '../../services/documents/document-processor.service.js';
import { auditService } from '../../services/audit/audit.service.js';
import { requirementRepository } from '../requirements/requirement.repository.js';

export interface TenderSummaryStatistics {
  documentCount: number;
  totalPages: number;
  processedPages: number;
  ocrPages: number;
  tablesDetected: number;
  reviewRequired: number;
  status: string;
}

export class TenderService {
  private storageService: InMemoryStorageService;
  private processorService: DocumentProcessorService;

  constructor() {
    this.storageService = new InMemoryStorageService();
    this.processorService = new DocumentProcessorService(this.storageService);
  }

  async createTender(input: CreateTenderInput): Promise<Tender> {
    const tender = await tenderRepository.createTender(input);
    await auditService.log(AuditEventType.TENDER_CREATED, {
      tenderId: tender.id,
      metadata: {
        referenceNumber: tender.referenceNumber,
        organization: tender.organization,
      },
    });
    return tender;
  }

  async getTender(tenderId: string): Promise<{ tender: TenderWithDocuments; statistics: TenderSummaryStatistics }> {
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }

    const documents = await tenderRepository.listDocumentsByTender(tenderId);

    // Calculate real backend-derived statistics
    let totalPages = 0;
    let processedPages = 0;
    let ocrPages = 0;
    let tablesDetected = 0;
    let reviewRequired = 0;

    for (const doc of documents) {
      totalPages += doc.pageCount;
      const fullDoc = await tenderRepository.getDocumentWithPages(doc.id);
      if (fullDoc) {
        for (const pg of fullDoc.pages) {
          processedPages++;
          if (pg.ocrUsed) ocrPages++;
          if (pg.reviewRequired) reviewRequired++;
          tablesDetected += pg.evidenceBlocks.filter((b) => b.blockType === 'TABLE').length;
        }
      }
    }

    const statistics: TenderSummaryStatistics = {
      documentCount: documents.length,
      totalPages,
      processedPages,
      ocrPages,
      tablesDetected,
      reviewRequired,
      status: tender.status,
    };

    return {
      tender: {
        ...tender,
        documents,
        documentCount: documents.length,
        totalPageCount: totalPages,
      },
      statistics,
    };
  }

  async listTenders(): Promise<TenderWithDocuments[]> {
    return tenderRepository.listTenders();
  }

  async uploadDocument(
    tenderId: string,
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType?: string
  ): Promise<TenderDocument> {
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      throw new Error(`Tender ${tenderId} not found`);
    }

    // 1. Validate PDF structure, encryption, size, mime, SHA-256
    const validation = await pdfValidatorService.validate(
      fileBuffer,
      originalFilename,
      mimeType
    );

    // 2. Duplicate Detection within this tender
    const existing = await tenderRepository.findDocumentByHash(tenderId, validation.fileHash);
    if (existing) {
      await auditService.log(AuditEventType.DOCUMENT_DUPLICATE_DETECTED, {
        tenderId,
        documentId: existing.id,
        metadata: {
          attemptedFilename: originalFilename,
          existingFilename: existing.originalFilename,
          fileHash: validation.fileHash,
        },
      });

      const err: any = new Error(
        `DUPLICATE_DOCUMENT: A document with identical content has already been uploaded to this tender as "${existing.originalFilename}".`
      );
      err.code = 'DUPLICATE_DOCUMENT';
      err.details = {
        existingDocumentId: existing.id,
        existingFilename: existing.originalFilename,
        fileHash: validation.fileHash,
      };
      throw err;
    }

    // 3. Generate secure storage key and upload
    const tempDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const storageKey = `tenders/${tenderId}/documents/${tempDocId}/original.pdf`;

    await this.storageService.upload(storageKey, fileBuffer, validation.mimeType);

    // 4. Save TenderDocument record
    const document = await tenderRepository.createDocument({
      tenderId,
      originalFilename,
      storageKey,
      mimeType: validation.mimeType,
      fileSize: validation.fileSize,
      fileHash: validation.fileHash,
      pageCount: validation.pageCount,
    });

    await auditService.log(AuditEventType.DOCUMENT_UPLOADED, {
      tenderId,
      documentId: document.id,
      metadata: {
        filename: originalFilename,
        fileSize: validation.fileSize,
        pageCount: validation.pageCount,
        fileHash: validation.fileHash,
      },
    });

    return document;
  }

  async startProcessing(
    tenderId: string,
    documentIds?: string[]
  ): Promise<{ jobId: string; documentIds: string[]; status: string }> {
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      throw new Error(`Tender ${tenderId} not found`);
    }

    const allDocs = await tenderRepository.listDocumentsByTender(tenderId);
    const targetDocs = documentIds && documentIds.length > 0
      ? allDocs.filter((d) => documentIds.includes(d.id))
      : allDocs.filter(
          (d) =>
            d.processingStatus === DocumentProcessingStatus.UPLOADED ||
            d.processingStatus === DocumentProcessingStatus.FAILED
        );

    const targetIds = targetDocs.map((d) => d.id);
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Trigger processing asynchronously (HTTP 202 Accepted)
    for (const docId of targetIds) {
      setImmediate(() => {
        void this.processorService.processDocument(tenderId, docId);
      });
    }

    return {
      jobId,
      documentIds: targetIds,
      status: 'PROCESSING',
    };
  }

  async getDocument(documentId: string): Promise<DocumentWithPages> {
    const doc = await tenderRepository.getDocumentWithPages(documentId);
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }
    return doc;
  }

  async getDocumentStatus(documentId: string): Promise<{
    id: string;
    processingStatus: DocumentProcessingStatus;
    processingProgress: number;
    currentStage: string;
    ocrUsed: boolean;
    pageCount: number;
    error: string | null;
  }> {
    const doc = await tenderRepository.findDocumentById(documentId);
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }

    return {
      id: doc.id,
      processingStatus: doc.processingStatus,
      processingProgress: doc.processingProgress,
      currentStage: doc.currentStage,
      ocrUsed: doc.ocrUsed,
      pageCount: doc.pageCount,
      error: doc.processingError,
    };
  }

  async getDocumentPage(documentId: string, pageNumber: number) {
    const page = await tenderRepository.getPageByNumber(documentId, pageNumber);
    if (!page) {
      throw new Error(`Page ${pageNumber} not found for document ${documentId}`);
    }
    return page;
  }

  async retryDocument(tenderId: string, documentId: string): Promise<void> {
    const doc = await tenderRepository.findDocumentById(documentId);
    if (!doc || doc.tenderId !== tenderId) {
      throw new Error(`Document ${documentId} not found under tender ${tenderId}`);
    }
    await this.processorService.retryDocument(tenderId, documentId);
  }

  async publishTender(tenderId: string, officerId?: string): Promise<Tender> {
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      const err = new Error(`Tender ${tenderId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    // Verify minimum prerequisites: Documents must exist
    const docs = await tenderRepository.listDocumentsByTender(tenderId);
    if (docs.length === 0) {
      const err = new Error('Cannot publish tender: At least one RFP specification document must be uploaded.');
      (err as any).statusCode = 400;
      throw err;
    }

    // Update tender status to PUBLISHED
    const updated = await tenderRepository.updateTenderStatus(tenderId, 'PUBLISHED' as TenderStatus);

    void auditService.log(AuditEventType.TENDER_PUBLISHED, {
      tenderId,
      actor: officerId || 'procurement_officer',
      metadata: {
        referenceNumber: tender.referenceNumber,
        publishedAt: new Date().toISOString(),
      },
    });

    return updated;
  }

  async listPublishedTenders(filters?: {
    query?: string;
    organization?: string;
  }): Promise<TenderWithDocuments[]> {
    const all = await tenderRepository.listTenders();
    // Allow PUBLISHED or READY (for canonical demo tenders)
    let published = all.filter((t) => t.status === 'PUBLISHED' || t.status === 'READY');

    if (filters?.organization) {
      const orgLower = filters.organization.toLowerCase();
      published = published.filter((t) => t.organization.toLowerCase().includes(orgLower));
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      published = published.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.referenceNumber.toLowerCase().includes(q) ||
          t.organization.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return published;
  }

  async getPublishedTender(tenderId: string) {
    const details = await this.getTender(tenderId);
    const blueprint = await requirementRepository.getLatestBlueprint(tenderId);

    const technicalReqs: any[] = [];
    const financialReqs: any[] = [];
    const statutoryReqs: any[] = [];
    const otherReqs: any[] = [];

    if (blueprint?.requirements) {
      for (const req of blueprint.requirements) {
        const categoryStr = String(req.category);
        const mandatoryStr = String(req.mandatory);

        const item = {
          id: req.id,
          code: req.requirementCode,
          title: req.requirementText,
          description: req.normalizedRequirementText || req.requirementText,
          category: req.category,
          mandatory: mandatoryStr === 'MANDATORY',
        };

        if (categoryStr === 'TECHNICAL' || categoryStr === 'EXPERIENCE') {
          technicalReqs.push(item);
        } else if (categoryStr === 'FINANCIAL') {
          financialReqs.push(item);
        } else if (
          categoryStr === 'STATUTORY' ||
          categoryStr === 'POLICY' ||
          categoryStr === 'ELIGIBILITY' ||
          categoryStr === 'LEGAL'
        ) {
          statutoryReqs.push(item);
        } else {
          otherReqs.push(item);
        }
      }
    }

    return {
      tender: details.tender,
      statistics: details.statistics,
      requirements: {
        technical: technicalReqs,
        financial: financialReqs,
        statutory: statutoryReqs,
        other: otherReqs,
        total: (blueprint?.requirements || []).length,
      },
    };
  }
}

export const tenderService = new TenderService();
