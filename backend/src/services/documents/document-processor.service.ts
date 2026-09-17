import {
  DocumentProcessingStatus,
  DocumentPageStatus,
  TenderStatus,
  AuditEventType,
} from '@prisma/client';
import { tenderRepository } from '../../modules/tenders/tender.repository.js';
import { InMemoryStorageService } from '../storage/storage.interface.js';
import { pdfExtractorService } from './pdf-extractor.service.js';
import { ocrProvider } from './ocr.provider.js';
import { auditService } from '../audit/audit.service.js';

export class DocumentProcessorService {
  private storageService: InMemoryStorageService;

  constructor(storageService: InMemoryStorageService) {
    this.storageService = storageService;
  }

  /**
   * Orchestrates the 9-stage asynchronous processing pipeline for a tender document
   */
  async processDocument(tenderId: string, documentId: string): Promise<void> {
    const document = await tenderRepository.findDocumentById(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // 1. Stage: VALIDATE & START
    await tenderRepository.updateDocumentProgress(documentId, {
      status: DocumentProcessingStatus.PROCESSING,
      progress: 10,
      currentStage: 'Validating document integrity',
      started: true,
    });
    await tenderRepository.updateTenderStatus(tenderId, TenderStatus.PROCESSING);

    await auditService.log(AuditEventType.DOCUMENT_PROCESSING_STARTED, {
      tenderId,
      documentId,
      metadata: { originalFilename: document.originalFilename },
    });

    try {
      // 2. Stage: INSPECT & DOWNLOAD
      await tenderRepository.updateDocumentProgress(documentId, {
        progress: 25,
        currentStage: 'Retrieving stored PDF stream',
      });

      const buffer = await this.storageService.download(document.storageKey);

      // 3. Stage: EXTRACT NATIVE TEXT
      await tenderRepository.updateDocumentProgress(documentId, {
        status: DocumentProcessingStatus.EXTRACTING,
        progress: 40,
        currentStage: 'Extracting native page text',
      });

      const extractedPages = await pdfExtractorService.extractPages(buffer);
      const totalPages = Math.max(extractedPages.length, document.pageCount, 1);

      let ocrUsedTotal = false;
      let reviewRequiredCount = 0;

      // 4-8. Page-by-page processing
      for (let i = 0; i < extractedPages.length; i++) {
        const pageRaw = extractedPages[i]!;
        const pageNum = pageRaw.pageNumber;

        const progressPercent = Math.min(
          90,
          Math.floor(40 + ((i + 1) / extractedPages.length) * 50)
        );

        await tenderRepository.updateDocumentProgress(documentId, {
          progress: progressPercent,
          currentStage: `Processing page ${pageNum} of ${totalPages}`,
        });

        let pageText = pageRaw.text;
        let hasTextLayer = pageRaw.hasMeaningfulText;
        let ocrUsedForPage = false;
        let textConfidence: number | null = null;
        let reviewRequired = false;

        // Stage: OCR TEXT-POOR PAGES if needed
        if (!hasTextLayer) {
          ocrUsedTotal = true;
          ocrUsedForPage = true;
          await tenderRepository.updateDocumentProgress(documentId, {
            status: DocumentProcessingStatus.OCR_PROCESSING,
            currentStage: `OCR processing page ${pageNum} of ${totalPages}`,
          });

          try {
            const ocrResult = await ocrProvider.processPage({
              documentId,
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
            // One page OCR failure must not crash the entire document
            reviewRequired = true;
          }
        }

        if (reviewRequired) {
          reviewRequiredCount++;
        }

        // Stage: EXTRACT TABLES & BUILD EVIDENCE BLOCKS
        const evidenceBlocks = pdfExtractorService.buildEvidenceBlocks(pageText);

        // Stage: SAVE PAGE DATA
        const savedPage = await tenderRepository.createDocumentPage({
          documentId,
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
          await tenderRepository.createEvidenceBlock({
            pageId: savedPage.id,
            blockType: block.blockType,
            content: block.content,
            sequence: block.sequence,
            confidence: block.confidence,
          });
        }
      }

      // 9. Stage: FINALIZE
      const finalStatus =
        reviewRequiredCount > 0
          ? DocumentProcessingStatus.PARTIAL
          : DocumentProcessingStatus.COMPLETED;

      await tenderRepository.updateDocumentProgress(documentId, {
        status: finalStatus,
        progress: 100,
        currentStage:
          finalStatus === DocumentProcessingStatus.COMPLETED
            ? 'Processing complete'
            : `Completed with ${reviewRequiredCount} pages flagged for review`,
        pageCount: totalPages,
        ocrUsed: ocrUsedTotal,
        completed: true,
      });

      // Update Tender status based on all its documents
      const allDocs = await tenderRepository.listDocumentsByTender(tenderId);
      const anyFailed = allDocs.some((d) => d.processingStatus === DocumentProcessingStatus.FAILED);
      const anyPartial = allDocs.some(
        (d) => d.processingStatus === DocumentProcessingStatus.PARTIAL
      );
      const allDone = allDocs.every(
        (d) =>
          d.processingStatus === DocumentProcessingStatus.COMPLETED ||
          d.processingStatus === DocumentProcessingStatus.PARTIAL
      );

      if (allDone) {
        await tenderRepository.updateTenderStatus(
          tenderId,
          anyFailed
            ? TenderStatus.FAILED
            : anyPartial
            ? TenderStatus.PARTIAL
            : TenderStatus.READY
        );
      }

      await auditService.log(
        finalStatus === DocumentProcessingStatus.COMPLETED
          ? AuditEventType.DOCUMENT_PROCESSING_COMPLETED
          : AuditEventType.DOCUMENT_PROCESSING_PARTIAL,
        {
          tenderId,
          documentId,
          metadata: {
            totalPages,
            ocrUsed: ocrUsedTotal,
            reviewRequiredPages: reviewRequiredCount,
          },
        }
      );
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Unknown processing error';

      await tenderRepository.updateDocumentProgress(documentId, {
        status: DocumentProcessingStatus.FAILED,
        progress: 100,
        currentStage: 'Processing failed',
        error: errorMsg,
        completed: true,
      });

      await tenderRepository.updateTenderStatus(tenderId, TenderStatus.PARTIAL);

      await auditService.log(AuditEventType.DOCUMENT_PROCESSING_FAILED, {
        tenderId,
        documentId,
        metadata: { error: errorMsg },
      });
    }
  }

  /**
   * Retries processing for a failed or partially processed document
   */
  async retryDocument(tenderId: string, documentId: string): Promise<void> {
    await auditService.log(AuditEventType.DOCUMENT_PROCESSING_RETRIED, {
      tenderId,
      documentId,
    });

    // Run processing in background
    setImmediate(() => {
      void this.processDocument(tenderId, documentId);
    });
  }
}
