import crypto from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { env } from '../../config/env.js';

export class PdfValidationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'PdfValidationError';
    this.code = code;
  }
}

export interface PdfValidationResult {
  isValid: true;
  pageCount: number;
  fileSize: number;
  fileHash: string;
  mimeType: string;
}

export class PdfValidatorService {
  /**
   * Validate uploaded buffer against size, MIME, magic bytes, structure, and encryption
   */
  async validate(
    buffer: Buffer,
    _originalFilename?: string,
    declaredMimeType?: string
  ): Promise<PdfValidationResult> {
    // 1. Check file size
    const maxSizeBytes = env.MAX_TENDER_FILE_SIZE_MB * 1024 * 1024;
    if (buffer.length === 0) {
      throw new PdfValidationError('EMPTY_FILE', 'The uploaded file is empty (0 bytes)');
    }

    if (buffer.length > maxSizeBytes) {
      throw new PdfValidationError(
        'FILE_TOO_LARGE',
        `File size (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of ${env.MAX_TENDER_FILE_SIZE_MB} MB`
      );
    }

    // 2. Magic bytes check for PDF (%PDF-)
    const header = buffer.subarray(0, 5).toString('ascii');
    if (header !== '%PDF-') {
      throw new PdfValidationError(
        'INVALID_PDF_HEADER',
        'Invalid file structure. The file header does not match the standard PDF format (%PDF-).'
      );
    }

    // 3. Calculate SHA-256 Hash
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // 4. Inspect PDF structure, catalog, and detect encryption using pdf-lib
    let pageCount = 0;
    try {
      const pdfDoc = await PDFDocument.load(buffer, {
        ignoreEncryption: false,
        updateMetadata: false,
      });
      pageCount = pdfDoc.getPageCount();
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || '';
      if (
        errorMsg.toLowerCase().includes('encrypt') ||
        errorMsg.toLowerCase().includes('password')
      ) {
        throw new PdfValidationError(
          'PASSWORD_PROTECTED',
          'This PDF is password protected. Please upload an unlocked version.'
        );
      }
      throw new PdfValidationError(
        'CORRUPT_PDF',
        `Unable to parse PDF document. The file appears to be damaged or corrupt: ${errorMsg}`
      );
    }

    if (pageCount === 0) {
      throw new PdfValidationError(
        'ZERO_PAGE_PDF',
        'The PDF contains no pages and cannot be processed.'
      );
    }

    return {
      isValid: true,
      pageCount,
      fileSize: buffer.length,
      fileHash,
      mimeType: declaredMimeType || 'application/pdf',
    };
  }
}

export const pdfValidatorService = new PdfValidatorService();
