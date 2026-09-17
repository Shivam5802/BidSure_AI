import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { BidderService } from '../src/modules/bidders/bidder.service.js';
import { InMemoryStorageService } from '../src/services/storage/storage.interface.js';
import { BidDocumentType, ClassificationStatus } from '@prisma/client';

describe('Feature 1D — Bidder & Bid Document Ingestion', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let storageService: InMemoryStorageService;
  let bidderService: BidderService;
  let testTenderId: string;

  const validPdfBuffer = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n' +
    '4 0 obj\n<< /Length 120 >>\nstream\n' +
    'BT /F1 12 Tf 100 700 Td (GST Registration Certificate - GSTIN: 27AAAAA0000A1Z5 - Govt of India) Tj ET\n' +
    'endstream\nendobj\nxref\n0 5\n0000000000 65535 f \n' +
    'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n300\n%%EOF'
  );

  beforeEach(async () => {
    app = await buildApp();
    storageService = new InMemoryStorageService();
    bidderService = new BidderService(storageService);

    // Seed a test tender
    const tender = await tenderRepository.createTender({
      title: 'Supply & Installation of Data Center Equipment',
      referenceNumber: `GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`,
      organization: 'National Informatics Centre',
      closingDate: new Date('2026-10-31'),
      description: 'Procurement of High-Performance Compute Servers',
    });
    testTenderId = tender.id;
  });

  describe('Bidder Registration & Submission Management', () => {
    it('should successfully register a bidder for a tender', async () => {
      const result = await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
        displayName: 'ABC Infra',
      });

      expect(result.bidder).toBeDefined();
      expect(result.bidder.bidderCode).toBe('BID-001');
      expect(result.bidder.legalName).toBe('ABC Infrastructure Pvt Ltd');
      expect(result.activeSubmission).toBeDefined();
      expect(result.activeSubmission.bidderId).toBe(result.bidder.id);
    });

    it('should reject duplicate bidder code for the same tender', async () => {
      await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
      });

      await expect(
        bidderService.createBidder({
          tenderId: testTenderId,
          bidderCode: 'BID-001',
          legalName: 'Duplicate Code Co',
        })
      ).rejects.toThrow('already registered');
    });

    it('should list all bidders participating in a tender', async () => {
      await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
      });
      await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-002',
        legalName: 'XYZ Technologies Pvt Ltd',
      });

      const bidders = await bidderService.getBiddersByTender(testTenderId);
      expect(bidders.length).toBe(2);
    });
  });

  describe('Document Upload, SHA-256 Hashing & Duplicate Detection', () => {
    it('should upload a valid bid document and start processing', async () => {
      const { bidder, activeSubmission } = await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
      });

      const result = await bidderService.uploadBidDocument({
        tenderId: testTenderId,
        bidderId: bidder.id,
        submissionId: activeSubmission.id,
        filename: 'GST Certificate.pdf',
        buffer: validPdfBuffer,
        mimeType: 'application/pdf',
      });

      expect(result.isDuplicate).toBe(false);
      expect(result.document).toBeDefined();
      expect(result.document.originalFilename).toBe('GST Certificate.pdf');
      expect(result.document.fileHash).toBeDefined();
    });

    it('should detect exact SHA-256 duplicate document upload', async () => {
      const { bidder, activeSubmission } = await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
      });

      const firstUpload = await bidderService.uploadBidDocument({
        tenderId: testTenderId,
        bidderId: bidder.id,
        submissionId: activeSubmission.id,
        filename: 'PAN.pdf',
        buffer: validPdfBuffer,
        mimeType: 'application/pdf',
      });

      const secondUpload = await bidderService.uploadBidDocument({
        tenderId: testTenderId,
        bidderId: bidder.id,
        submissionId: activeSubmission.id,
        filename: 'PAN_Copy.pdf',
        buffer: validPdfBuffer,
        mimeType: 'application/pdf',
      });

      expect(firstUpload.isDuplicate).toBe(false);
      expect(secondUpload.isDuplicate).toBe(true);
      expect(secondUpload.document.id).toBe(firstUpload.document.id);
    });

    it('should reject invalid non-PDF file upload', async () => {
      const { bidder, activeSubmission } = await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
      });

      const exeBuffer = Buffer.from('MZ executable file payload');

      await expect(
        bidderService.uploadBidDocument({
          tenderId: testTenderId,
          bidderId: bidder.id,
          submissionId: activeSubmission.id,
          filename: 'invoice.pdf.exe',
          buffer: exeBuffer,
          mimeType: 'application/octet-stream',
        })
      ).rejects.toThrow('File validation failed');
    });
  });

  describe('Document Classification & Human Review', () => {
    it('should classify document correctly based on extracted content', async () => {
      const { bidder, activeSubmission } = await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
      });

      const uploadResult = await bidderService.uploadBidDocument({
        tenderId: testTenderId,
        bidderId: bidder.id,
        submissionId: activeSubmission.id,
        filename: 'GST Certificate.pdf',
        buffer: validPdfBuffer,
        mimeType: 'application/pdf',
      });

      // Wait for background setImmediate processBidDocument to complete
      await new Promise((r) => setTimeout(r, 250));

      const docDetails = await bidderService.getBidDocument(uploadResult.document.id);
      expect(docDetails.document.documentType).toBe(BidDocumentType.GST_CERTIFICATE);
      expect(docDetails.document.classificationConfidence).toBeGreaterThan(0.9);
      expect(docDetails.document.classificationStatus).toBe(ClassificationStatus.CLASSIFIED);
    });

    it('should allow human officer to override classification', async () => {
      const { bidder, activeSubmission } = await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Infrastructure Pvt Ltd',
      });

      const uploadResult = await bidderService.uploadBidDocument({
        tenderId: testTenderId,
        bidderId: bidder.id,
        submissionId: activeSubmission.id,
        filename: 'unknown_document.pdf',
        buffer: validPdfBuffer,
        mimeType: 'application/pdf',
      });

      await new Promise((r) => setTimeout(r, 250));

      // Manually override classification to CA_CERTIFICATE
      const updatedDoc = await bidderService.updateDocumentClassification(uploadResult.document.id, {
        documentType: BidDocumentType.CA_CERTIFICATE,
        reason: 'Verified manually as Chartered Accountant turnover certificate.',
        reviewedBy: 'Senior Officer Patel',
      });

      expect(updatedDoc.documentType).toBe(BidDocumentType.CA_CERTIFICATE);
      expect(updatedDoc.humanReviewed).toBe(true);
      expect(updatedDoc.reviewedBy).toBe('Senior Officer Patel');
      expect(updatedDoc.classificationStatus).toBe(ClassificationStatus.CLASSIFIED);
    });
  });

  describe('API Route Injection Tests', () => {
    it('POST /api/tenders/:tenderId/bidders should create bidder via HTTP API', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/tenders/${testTenderId}/bidders`,
        payload: {
          bidderCode: 'API-BID-100',
          legalName: 'Alpha Tech Solutions Pvt Ltd',
          displayName: 'Alpha Tech',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.bidder.bidderCode).toBe('API-BID-100');
    });

    it('GET /api/tenders/:tenderId/bidders should return bidder list', async () => {
      await bidderService.createBidder({
        tenderId: testTenderId,
        bidderCode: 'BID-300',
        legalName: 'Gamma Engineering Ltd',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/tenders/${testTenderId}/bidders`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });
});
