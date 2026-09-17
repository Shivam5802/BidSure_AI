import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { pdfValidatorService, PdfValidationError } from '../src/services/documents/pdf-validator.service.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { tenderService } from '../src/modules/tenders/tender.service.js';

describe('PDF Validation & Duplicate Detection', () => {
  it('should validate a clean PDF document and extract page count', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([500, 500]);
    pdfDoc.addPage([500, 500]);
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    const result = await pdfValidatorService.validate(buffer, 'test_tender.pdf');
    expect(result.isValid).toBe(true);
    expect(result.pageCount).toBe(2);
    expect(result.fileHash).toBeDefined();
    expect(result.fileHash.length).toBe(64); // SHA-256
  });

  it('should reject empty files', async () => {
    const emptyBuffer = Buffer.alloc(0);
    await expect(
      pdfValidatorService.validate(emptyBuffer, 'empty.pdf')
    ).rejects.toThrowError(PdfValidationError);
  });

  it('should reject non-PDF file headers', async () => {
    const fakeBuffer = Buffer.from('NOT_A_PDF_FILE_HEADER');
    await expect(
      pdfValidatorService.validate(fakeBuffer, 'fake.pdf')
    ).rejects.toThrowError(/standard PDF format/);
  });

  it('should reject corrupt PDF files', async () => {
    const corruptBuffer = Buffer.from('%PDF-1.4\nCorrupted content without valid xref table');
    await expect(
      pdfValidatorService.validate(corruptBuffer, 'corrupt.pdf')
    ).rejects.toThrowError(/damaged or corrupt/);
  });

  it('should prevent uploading identical PDF files to the same tender (SHA-256 duplicate detection)', async () => {
    await tenderRepository.clear();

    const tender = await tenderRepository.createTender({
      title: 'Duplicate Check Tender',
      referenceNumber: 'REF-DUP-001',
      organization: 'CPCL',
      closingDate: new Date(Date.now() + 86400000),
    });

    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([400, 400]);
    const buffer = Buffer.from(await pdfDoc.save());

    // 1st Upload: succeeds
    const doc1 = await tenderService.uploadDocument(tender.id, buffer, 'OriginalDoc.pdf');
    expect(doc1.id).toBeDefined();

    // 2nd Upload with different filename but identical content: MUST FAIL
    await expect(
      tenderService.uploadDocument(tender.id, buffer, 'CopyOfOriginalDoc.pdf')
    ).rejects.toThrowError(/DUPLICATE_DOCUMENT/);
  });
});
