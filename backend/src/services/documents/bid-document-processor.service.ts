import {
  DocumentProcessingStatus,
  DocumentPageStatus,
  ClassificationStatus,
  AuditEventType,
  BidDocumentType,
} from '@prisma/client';
import { bidderRepository } from '../../modules/bidders/bidder.repository.js';
import { InMemoryStorageService } from '../storage/storage.interface.js';
import { pdfExtractorService } from './pdf-extractor.service.js';
import { ocrProvider } from './ocr.provider.js';
import { auditService } from '../audit/audit.service.js';
import { bidDocumentClassifierService } from './bid-document-classifier.service.js';
import { requirementRepository } from '../../modules/requirements/requirement.repository.js';

export class BidDocumentProcessorService {
  private storageService: InMemoryStorageService;

  constructor(storageService: InMemoryStorageService) {
    this.storageService = storageService;
  }

  /**
   * Processes an uploaded bid document:
   * 1. Extracts native text or runs OCR if text-poor
   * 2. Creates DocumentPage and EvidenceBlock records for provenance
   * 3. Classifies the document type and calculates confidence score
   * 4. Flags low-confidence or unknown document for human review
   */
  async processBidDocument(bidDocumentId: string): Promise<void> {
    const document = await bidderRepository.findBidDocumentById(bidDocumentId);
    if (!document) {
      throw new Error(`Bid document ${bidDocumentId} not found`);
    }

    const submission = await bidderRepository.findSubmissionById(document.bidSubmissionId);
    const tenderId = submission?.tenderId;

    // 1. Stage: VALIDATE & START
    await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
      status: DocumentProcessingStatus.PROCESSING,
      progress: 10,
      currentStage: 'Validating bid document integrity',
      started: true,
    });

    await auditService.log(AuditEventType.BID_DOCUMENT_PROCESSING_STARTED, {
      tenderId,
      bidderId: submission?.bidderId,
      submissionId: document.bidSubmissionId,
      bidDocumentId,
      metadata: { originalFilename: document.originalFilename },
    });

    try {
      // 2. Stage: INSPECT & DOWNLOAD
      await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
        progress: 25,
        currentStage: 'Retrieving stored document stream',
      });

      const buffer = await this.storageService.download(document.storageKey);

      // 3. Stage: EXTRACT NATIVE TEXT
      await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
        status: DocumentProcessingStatus.EXTRACTING,
        progress: 40,
        currentStage: 'Extracting text layer',
      });

      const extractedPages = await pdfExtractorService.extractPages(buffer);
      const totalPages = Math.max(extractedPages.length, document.pageCount, 1);

      let ocrUsedTotal = false;
      let reviewRequiredCount = 0;
      let fullDocumentText = '';

      // Page-by-Page Processing
      for (let i = 0; i < extractedPages.length; i++) {
        const pageRaw = extractedPages[i]!;
        const pageNum = pageRaw.pageNumber;

        const progressPercent = Math.min(
          80,
          Math.floor(40 + ((i + 1) / extractedPages.length) * 40)
        );

        await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
          progress: progressPercent,
          currentStage: `Processing page ${pageNum} of ${totalPages}`,
        });

        let pageText = pageRaw.text;
        let hasTextLayer = pageRaw.hasMeaningfulText;
        let ocrUsedForPage = false;
        let textConfidence: number | null = null;
        let reviewRequired = false;

        if (!hasTextLayer) {
          ocrUsedTotal = true;
          ocrUsedForPage = true;
          await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
            status: DocumentProcessingStatus.OCR_PROCESSING,
            currentStage: `OCR processing page ${pageNum} of ${totalPages}`,
          });

          try {
            const ocrResult = await ocrProvider.processPage({
              documentId: bidDocumentId,
              pageNumber: pageNum,
              existingText: pageText,
            });

            if (ocrResult.success) {
              pageText = ocrResult.extractedText;
              textConfidence = ocrResult.confidence;
              reviewRequired = ocrResult.reviewRequired;
            } else {
              reviewRequired = true;
            }
          } catch {
            reviewRequired = true;
          }
        }

        if (reviewRequired) reviewRequiredCount++;

        fullDocumentText += `\n --- Page ${pageNum} ---\n` + pageText;

        const evidenceBlocks = pdfExtractorService.buildEvidenceBlocks(pageText);

        const savedPage = await bidderRepository.createDocumentPage({
          bidDocumentId,
          pageNumber: pageNum,
          processingStatus: reviewRequired
            ? DocumentPageStatus.PARTIAL
            : DocumentPageStatus.COMPLETED,
          hasTextLayer,
          ocrUsed: ocrUsedForPage,
          textContent: pageText,
          textConfidence,
          reviewRequired,
        });

        for (const block of evidenceBlocks) {
          await bidderRepository.createEvidenceBlock({
            pageId: savedPage.id,
            blockType: block.blockType,
            content: block.content,
            sequence: block.sequence,
            confidence: block.confidence,
          });
        }
      }

      // Stage: FINALIZE EXTRACTION
      const processingFinalStatus =
        reviewRequiredCount > 0
          ? DocumentProcessingStatus.PARTIAL
          : DocumentProcessingStatus.COMPLETED;

      await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
        status: processingFinalStatus,
        progress: 85,
        currentStage: 'Text extraction complete. Classifying document...',
        pageCount: totalPages,
        ocrUsed: ocrUsedTotal,
      });

      await auditService.log(
        processingFinalStatus === DocumentProcessingStatus.COMPLETED
          ? AuditEventType.BID_DOCUMENT_PROCESSING_COMPLETED
          : AuditEventType.DOCUMENT_PROCESSING_PARTIAL,
        {
          tenderId,
          bidderId: submission?.bidderId,
          submissionId: document.bidSubmissionId,
          bidDocumentId,
          metadata: { totalPages, ocrUsed: ocrUsedTotal },
        }
      );

      // 4. Stage: AUTOMATIC CLASSIFICATION
      let tenderRequirements: any[] = [];
      if (tenderId) {
        try {
          const blueprint = await requirementRepository.getLatestBlueprint(tenderId);
          if (blueprint && blueprint.requirements) {
            tenderRequirements = blueprint.requirements;
          }
        } catch {
          // Soft failure if blueprint not present yet
        }
      }

      const classificationOutput = await bidDocumentClassifierService.classifyDocument({
        filename: document.originalFilename,
        extractedText: fullDocumentText,
        tenderRequirements: tenderRequirements.map((r) => ({
          id: r.id,
          requirementCode: r.requirementCode,
          category: r.category,
          requirementText: r.requirementText,
        })),
      });

      const isReviewRequired =
        classificationOutput.reviewRequired ||
        classificationOutput.confidence < 0.75 ||
        classificationOutput.documentType === BidDocumentType.UNKNOWN;

      const classificationStatus = isReviewRequired
        ? classificationOutput.documentType === BidDocumentType.UNKNOWN
          ? ClassificationStatus.UNKNOWN
          : ClassificationStatus.REVIEW_REQUIRED
        : ClassificationStatus.CLASSIFIED;

      await bidderRepository.updateBidDocumentClassification(bidDocumentId, {
        documentType: classificationOutput.documentType,
        classificationStatus,
        classificationConfidence: classificationOutput.confidence,
        classificationReason: classificationOutput.reason,
        possibleRequirementCategories: classificationOutput.possibleRequirementCategories,
        possibleRequirementIds: classificationOutput.possibleRequirementIds,
        reviewRequired: isReviewRequired,
        originalClassification: classificationOutput,
      });

      await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
        status: DocumentProcessingStatus.COMPLETED,
        progress: 100,
        currentStage: isReviewRequired
          ? `Classified as ${classificationOutput.documentType} (Review Required - ${(classificationOutput.confidence * 100).toFixed(0)}%)`
          : `Classified as ${classificationOutput.documentType} (${(classificationOutput.confidence * 100).toFixed(0)}% confidence)`,
        completed: true,
      });

      await auditService.log(
        isReviewRequired
          ? AuditEventType.BID_DOCUMENT_CLASSIFICATION_REVIEW_REQUESTED
          : AuditEventType.BID_DOCUMENT_CLASSIFIED,
        {
          tenderId,
          bidderId: submission?.bidderId,
          submissionId: document.bidSubmissionId,
          bidDocumentId,
          metadata: {
            documentType: classificationOutput.documentType,
            confidence: classificationOutput.confidence,
            reviewRequired: isReviewRequired,
          },
        }
      );
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Unknown bid document processing error';

      await bidderRepository.updateBidDocumentProgress(bidDocumentId, {
        status: DocumentProcessingStatus.FAILED,
        progress: 100,
        currentStage: 'Processing failed',
        error: errorMsg,
        completed: true,
      });

      await bidderRepository.updateBidDocumentClassification(bidDocumentId, {
        documentType: BidDocumentType.UNKNOWN,
        classificationStatus: ClassificationStatus.FAILED,
        classificationConfidence: 0,
        classificationReason: errorMsg,
        possibleRequirementCategories: [],
        possibleRequirementIds: [],
        reviewRequired: true,
      });

      await auditService.log(AuditEventType.BID_DOCUMENT_CLASSIFICATION_FAILED, {
        tenderId,
        bidderId: submission?.bidderId,
        submissionId: document.bidSubmissionId,
        bidDocumentId,
        metadata: { error: errorMsg },
      });
    }
  }
}
