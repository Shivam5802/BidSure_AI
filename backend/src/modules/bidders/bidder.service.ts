import crypto from 'node:crypto';
import {
  BidDocumentType,
  ClassificationStatus,
  AuditEventType,
} from '@prisma/client';
import { bidderRepository, CreateBidderInput } from './bidder.repository.js';
import { tenderRepository } from '../tenders/tender.repository.js';
import { pdfValidatorService } from '../../services/documents/pdf-validator.service.js';
import { InMemoryStorageService } from '../../services/storage/storage.interface.js';
import { BidDocumentProcessorService } from '../../services/documents/bid-document-processor.service.js';
import { auditService } from '../../services/audit/audit.service.js';

export interface UploadBidDocumentInput {
  tenderId: string;
  bidderId: string;
  submissionId: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
  uploadedById?: string;
}

export interface HumanClassificationOverrideInput {
  documentType: BidDocumentType;
  reason?: string;
  reviewedBy: string;
}

export class BidderService {
  private storageService: InMemoryStorageService;
  private processorService: BidDocumentProcessorService;

  constructor(storageService: InMemoryStorageService) {
    this.storageService = storageService;
    this.processorService = new BidDocumentProcessorService(storageService);
  }

  /**
   * Register a new bidder under a tender
   */
  async createBidder(input: CreateBidderInput) {
    const tender = await tenderRepository.findTenderById(input.tenderId);
    if (!tender) {
      throw new Error(`Tender with ID "${input.tenderId}" not found.`);
    }

    const existing = await bidderRepository.findBidderByCode(input.tenderId, input.bidderCode);
    if (existing) {
      throw new Error(`Bidder code "${input.bidderCode}" already registered for this tender.`);
    }

    const bidder = await bidderRepository.createBidder(input);

    // Auto-create initial draft submission for the bidder
    const submissionRef = `SUB-${bidder.bidderCode}-${Date.now().toString(36).toUpperCase()}`;
    const submission = await bidderRepository.createSubmission({
      tenderId: input.tenderId,
      bidderId: bidder.id,
      submissionReference: submissionRef,
    });

    await auditService.log(AuditEventType.BIDDER_CREATED, {
      tenderId: input.tenderId,
      bidderId: bidder.id,
      submissionId: submission.id,
      metadata: { bidderCode: bidder.bidderCode, legalName: bidder.legalName },
    });

    return { bidder, activeSubmission: submission };
  }

  /**
   * Get all bidders participating in a tender
   */
  async getBiddersByTender(tenderId: string) {
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID "${tenderId}" not found.`);
    }
    return bidderRepository.listBiddersByTender(tenderId);
  }

  /**
   * Get single bidder details
   */
  async getBidderById(tenderId: string, bidderId: string) {
    const bidder = await bidderRepository.findBidderById(bidderId);
    if (!bidder || bidder.tenderId !== tenderId) {
      throw new Error(`Bidder "${bidderId}" not found under tender "${tenderId}".`);
    }
    const submissions = await bidderRepository.listSubmissionsByBidder(bidderId);
    return { bidder, submissions };
  }

  /**
   * Ensure or fetch active bid submission for a bidder
   */
  async getOrCreateActiveSubmission(tenderId: string, bidderId: string) {
    const bidder = await bidderRepository.findBidderById(bidderId);
    if (!bidder || bidder.tenderId !== tenderId) {
      throw new Error(`Bidder "${bidderId}" not found for tender "${tenderId}".`);
    }

    let submission = await bidderRepository.findActiveSubmissionByBidder(bidderId);
    if (!submission) {
      const submissionRef = `SUB-${bidder.bidderCode}-${Date.now().toString(36).toUpperCase()}`;
      submission = await bidderRepository.createSubmission({
        tenderId,
        bidderId,
        submissionReference: submissionRef,
      });

      await auditService.log(AuditEventType.BID_SUBMISSION_CREATED, {
        tenderId,
        bidderId,
        submissionId: submission.id,
        metadata: { submissionReference: submission.submissionReference },
      });
    }

    return submission;
  }

  /**
   * Upload and process a bid document with validation and duplicate hash detection
   */
  async uploadBidDocument(input: UploadBidDocumentInput) {
    // 1. File Validation (Reuse Feature 1A PDF validator)
    try {
      await pdfValidatorService.validate(
        input.buffer,
        input.filename,
        input.mimeType
      );
    } catch (err: unknown) {
      throw new Error(`File validation failed: ${(err as Error).message}`);
    }

    // 2. Compute SHA-256 Hash
    const fileHash = crypto.createHash('sha256').update(input.buffer).digest('hex');

    // 3. Duplicate Detection
    const duplicate = await bidderRepository.findBidDocumentByHash(input.submissionId, fileHash);
    if (duplicate) {
      await auditService.log(AuditEventType.BID_DOCUMENT_DUPLICATE_DETECTED, {
        tenderId: input.tenderId,
        bidderId: input.bidderId,
        submissionId: input.submissionId,
        bidDocumentId: duplicate.id,
        metadata: { filename: input.filename, fileHash },
      });

      return {
        document: duplicate,
        isDuplicate: true,
        message: `Duplicate document detected. Same SHA-256 hash already exists in this bid submission.`,
      };
    }

    // 4. Store securely using storage service
    const storageKey = `tenders/${input.tenderId}/bidders/${input.bidderId}/${Date.now()}_${input.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageResult = await this.storageService.upload(
      storageKey,
      input.buffer,
      input.mimeType
    );

    // 5. Create database record
    const document = await bidderRepository.createBidDocument({
      bidSubmissionId: input.submissionId,
      originalFilename: input.filename,
      storageKey: storageResult.key,
      mimeType: input.mimeType,
      fileSize: input.buffer.length,
      fileHash,
      uploadedById: input.uploadedById,
    });

    await auditService.log(AuditEventType.BID_DOCUMENT_UPLOADED, {
      tenderId: input.tenderId,
      bidderId: input.bidderId,
      submissionId: input.submissionId,
      bidDocumentId: document.id,
      metadata: { originalFilename: input.filename, fileSize: input.buffer.length, fileHash },
    });

    // 6. Trigger async processing & classification pipeline
    setImmediate(() => {
      void this.processorService.processBidDocument(document.id);
    });

    return {
      document,
      isDuplicate: false,
      message: `Document uploaded successfully. Processing and classification started.`,
    };
  }

  /**
   * Get all bid documents for a submission
   */
  async getSubmissionDocuments(submissionId: string) {
    return bidderRepository.listBidDocumentsBySubmission(submissionId);
  }

  /**
   * Get single bid document by ID
   */
  async getBidDocument(documentId: string) {
    const doc = await bidderRepository.findBidDocumentById(documentId);
    if (!doc) {
      throw new Error(`Bid document "${documentId}" not found.`);
    }
    const submission = await bidderRepository.findSubmissionById(doc.bidSubmissionId);
    const bidder = submission ? await bidderRepository.findBidderById(submission.bidderId) : null;

    return { document: doc, submission, bidder };
  }

  /**
   * Human review override for document classification
   */
  async updateDocumentClassification(documentId: string, override: HumanClassificationOverrideInput) {
    const doc = await bidderRepository.findBidDocumentById(documentId);
    if (!doc) {
      throw new Error(`Bid document "${documentId}" not found.`);
    }

    const updated = await bidderRepository.updateBidDocumentClassification(documentId, {
      documentType: override.documentType,
      classificationStatus: ClassificationStatus.CLASSIFIED,
      classificationConfidence: 1.0,
      classificationReason: override.reason || `Manually reclassified by ${override.reviewedBy}`,
      possibleRequirementCategories: doc.possibleRequirementCategories,
      possibleRequirementIds: doc.possibleRequirementIds,
      reviewRequired: false,
      originalClassification: doc.originalClassification || {
        documentType: doc.documentType,
        confidence: doc.classificationConfidence,
        reason: doc.classificationReason,
      },
      humanReviewed: true,
      reviewedBy: override.reviewedBy,
      reviewedAt: new Date(),
    });

    const submission = await bidderRepository.findSubmissionById(doc.bidSubmissionId);

    await auditService.log(AuditEventType.BID_DOCUMENT_CLASSIFICATION_UPDATED_BY_HUMAN, {
      tenderId: submission?.tenderId,
      bidderId: submission?.bidderId,
      submissionId: doc.bidSubmissionId,
      bidDocumentId: doc.id,
      metadata: {
        previousType: doc.documentType,
        newType: override.documentType,
        reviewedBy: override.reviewedBy,
        reason: override.reason,
      },
    });

    return updated;
  }

  /**
   * Retry failed or partial document processing
   */
  async retryDocumentProcessing(documentId: string) {
    const doc = await bidderRepository.findBidDocumentById(documentId);
    if (!doc) {
      throw new Error(`Bid document "${documentId}" not found.`);
    }

    const submission = await bidderRepository.findSubmissionById(doc.bidSubmissionId);

    await auditService.log(AuditEventType.BID_DOCUMENT_RETRIED, {
      tenderId: submission?.tenderId,
      bidderId: submission?.bidderId,
      submissionId: doc.bidSubmissionId,
      bidDocumentId: doc.id,
    });

    setImmediate(() => {
      void this.processorService.processBidDocument(documentId);
    });

    return { message: 'Document re-processing queued.' };
  }
}
