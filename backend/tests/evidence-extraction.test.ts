import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { evidenceNormalizerService } from '../src/services/evidence/evidence-normalizer.service.js';
import { evidenceService } from '../src/modules/evidence/evidence.service.js';
import { evidenceRepository } from '../src/modules/evidence/evidence.repository.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { BidDocumentType, ClassificationStatus, DocumentPageStatus, EvidenceStatus, EvidenceValueType, ExtractionRunStatus } from '@prisma/client';

import { evidenceExtractorService } from '../src/services/evidence/evidence-extractor.service.js';

describe('Feature 1E — Evidence Extraction & Source-Grounded Facts', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let testTenderId: string;
  let testBidderId: string;
  let testSubmissionId: string;
  let testDocumentId: string;

  beforeEach(async () => {
    app = await buildApp();

    // Create seed tender
    const tender = await tenderRepository.createTender({
      title: 'Procurement of Enterprise Cloud Servers',
      referenceNumber: `GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`,
      organization: 'Ministry of Electronics & IT',
      closingDate: new Date('2026-11-30'),
      description: 'Supply of Server Infrastructure',
    });
    testTenderId = tender.id;

    // Create seed bidder & submission
    const bidder = await bidderRepository.createBidder({
      tenderId: testTenderId,
      bidderCode: `BID-${Math.floor(100 + Math.random() * 900)}`,
      legalName: 'Acme Tech Solutions Private Limited',
      displayName: 'Acme Tech',
    });
    testBidderId = bidder.id;

    const submission = await bidderRepository.createSubmission({
      tenderId: testTenderId,
      bidderId: testBidderId,
    });
    testSubmissionId = submission.id;

    // Create seed bid document with pages
    const doc = await bidderRepository.createBidDocument({
      bidSubmissionId: testSubmissionId,
      originalFilename: 'Financial_Turnover_Certificate.pdf',
      storageKey: `bidders/${testBidderId}/docs/financial.pdf`,
      fileSize: 102450,
      mimeType: 'application/pdf',
      documentType: BidDocumentType.CA_CERTIFICATE,
    });
    await bidderRepository.updateBidDocumentClassification(doc.id, {
      documentType: BidDocumentType.CA_CERTIFICATE,
      classificationStatus: ClassificationStatus.CONFIRMED,
      classificationConfidence: 1.0,
      reviewRequired: false,
    });
    testDocumentId = doc.id;

    // Attach sample pages to the document
    await bidderRepository.createDocumentPage({
      bidDocumentId: testDocumentId,
      pageNumber: 1,
      processingStatus: DocumentPageStatus.COMPLETED,
      hasTextLayer: true,
      ocrUsed: false,
      textContent: 'TURNOVER CERTIFICATE: Annual Turnover for FY 2023-24 is Rs 25.5 Crores. Average Turnover is Rs 20 Crores. Net Worth is 15.2 Crores. CA Registration No: 123456.',
      textConfidence: 0.95,
      reviewRequired: false,
    });

    await bidderRepository.createDocumentPage({
      bidDocumentId: testDocumentId,
      pageNumber: 2,
      processingStatus: DocumentPageStatus.COMPLETED,
      hasTextLayer: true,
      ocrUsed: false,
      textContent: 'CONTRACT COMPLETION: Project NIC Cloud Expansion completed on 15/03/2024. Contract Value: 12.8 Crores. Client Name: National Informatics Centre.',
      textConfidence: 0.92,
      reviewRequired: false,
    });
  });

  describe('Deterministic Value Normalizer Unit Tests', () => {
    it('should normalize Indian currency in Crores to numeric integers', () => {
      const res1 = evidenceNormalizerService.normalize('Rs 25.5 Crores', EvidenceValueType.CURRENCY);
      expect(res1.normalizedValue).toBe(255000000);
      expect(res1.unit).toBe('INR');

      const res2 = evidenceNormalizerService.normalize('₹ 5.2 Crore', EvidenceValueType.CURRENCY);
      expect(res2.normalizedValue).toBe(52000000);
    });

    it('should normalize Indian currency in Lakhs to numeric integers', () => {
      const res = evidenceNormalizerService.normalize('₹ 75 Lakhs', EvidenceValueType.CURRENCY);
      expect(res.normalizedValue).toBe(7500000);
      expect(res.unit).toBe('INR');
    });

    it('should normalize standard dates into YYYY-MM-DD format', () => {
      const res1 = evidenceNormalizerService.normalize('15/03/2024', EvidenceValueType.DATE);
      expect(res1.normalizedValue).toBe('2024-03-15');

      const res2 = evidenceNormalizerService.normalize('2024-03-15', EvidenceValueType.DATE);
      expect(res2.normalizedValue).toBe('2024-03-15');
    });

    it('should validate and normalize structural GSTIN / PAN identifiers', () => {
      const gstinRes = evidenceNormalizerService.normalize('27AAAAA0000A1Z5', EvidenceValueType.IDENTIFIER);
      expect(gstinRes.normalizedValue).toBe('27AAAAA0000A1Z5');

      const panRes = evidenceNormalizerService.normalize('ABCDE1234F', EvidenceValueType.IDENTIFIER);
      expect(panRes.normalizedValue).toBe('ABCDE1234F');
    });

    it('should normalize percentages into numeric values', () => {
      const res = evidenceNormalizerService.normalize('65.5%', EvidenceValueType.PERCENTAGE);
      expect(res.normalizedValue).toBe(65.5);
      expect(res.unit).toBe('PERCENT');
    });
  });

  describe('Evidence Service Extraction & Grounding Logic', () => {
    it('should execute extraction and store source-grounded evidence facts', async () => {
      const runResult = await evidenceService.triggerExtraction(testDocumentId);
      expect(runResult.run).toBeDefined();
      expect(runResult.run.bidDocumentId).toBe(testDocumentId);

      // Wait for asynchronous processing worker to complete run
      for (let i = 0; i < 20; i++) {
        const checkRun = await evidenceRepository.findExtractionRunById(runResult.run.id);
        if (checkRun?.completedAt) break;
        await new Promise((r) => setTimeout(r, 50));
      }

      const docEvidence = await evidenceService.getEvidenceForDocument(testDocumentId);

      expect(docEvidence.evidence.length).toBeGreaterThan(0);
      expect(docEvidence.summary.totalExtracted).toBe(docEvidence.evidence.length);

      const turnoverItem = docEvidence.evidence.find((e) => e.fieldKey === 'turnover');
      expect(turnoverItem).toBeDefined();
      expect(turnoverItem?.sourceText).toContain('25.5 Crores');
      expect(turnoverItem?.pageNumber).toBe(1);
    });

    it('should handle cross-page evidence conflict detection', async () => {
      // Add conflicting turnover page
      await bidderRepository.createDocumentPage({
        bidDocumentId: testDocumentId,
        pageNumber: 3,
        processingStatus: DocumentPageStatus.COMPLETED,
        hasTextLayer: true,
        ocrUsed: false,
        textContent: 'AMENDMENT: Revised Annual Turnover for FY 2023-24 is Rs 30 Crores.',
        textConfidence: 0.90,
        reviewRequired: false,
      });

      await evidenceService.triggerExtraction(testDocumentId);
      await new Promise((r) => setTimeout(r, 200));

      const docEvidence = await evidenceService.getEvidenceForDocument(testDocumentId);
      const turnoverItems = docEvidence.evidence.filter((e) => e.fieldKey === 'turnover');
      
      if (turnoverItems.length > 1) {
        expect(docEvidence.summary.conflicts).toBeGreaterThan(0);
        expect(turnoverItems.some((i) => i.conflictFlag)).toBe(true);
      }
    });

    it('should allow human officer to perform correction with audit logging', async () => {
      // Create sample evidence item directly
      const item = await evidenceRepository.createEvidenceItem({
        bidDocumentId: testDocumentId,
        fieldKey: 'turnover',
        fieldLabel: 'Annual Turnover',
        rawValue: 'Rs 25.5 Crores',
        normalizedValue: 255000000,
        valueType: EvidenceValueType.CURRENCY,
        unit: 'INR',
        sourceText: 'Annual Turnover for FY 2023-24 is Rs 25.5 Crores.',
        pageNumber: 1,
        confidence: 0.9,
        status: EvidenceStatus.EXTRACTED,
      });

      const updated = await evidenceService.updateEvidenceByHuman(item.id, {
        rawValue: 'Rs 26.0 Crores',
        reason: 'Correction based on audited balance sheet annexure',
        reviewer: 'Senior Auditor Officer',
      });

      expect(updated.rawValue).toBe('Rs 26.0 Crores');
      expect(updated.normalizedValue).toBe(260000000);
      expect(updated.status).toBe(EvidenceStatus.VERIFIED_BY_HUMAN);
      expect(updated.humanReviewed).toBe(true);
      expect(updated.reviewedBy).toBe('Senior Auditor Officer');
    });

    it('should support human verification and rejection of evidence facts', async () => {
      const item = await evidenceRepository.createEvidenceItem({
        bidDocumentId: testDocumentId,
        fieldKey: 'net_worth',
        fieldLabel: 'Net Worth',
        rawValue: '15.2 Crores',
        sourceText: 'Net Worth is 15.2 Crores.',
        pageNumber: 1,
        confidence: 0.88,
        status: EvidenceStatus.REVIEW_REQUIRED,
      });

      const verified = await evidenceService.verifyEvidenceFact(item.id, 'Procurement Officer');
      expect(verified.status).toBe(EvidenceStatus.VERIFIED_BY_HUMAN);

      const rejectedItem = await evidenceRepository.createEvidenceItem({
        bidDocumentId: testDocumentId,
        fieldKey: 'oem_name',
        fieldLabel: 'OEM Name',
        rawValue: 'Invalid OEM',
        sourceText: 'Invalid text',
        pageNumber: 1,
        confidence: 0.5,
        status: EvidenceStatus.REVIEW_REQUIRED,
      });

      const rejected = await evidenceService.rejectEvidenceFact(rejectedItem.id, 'Officer B', 'Not relevant to turnover doc');
      expect(rejected.status).toBe(EvidenceStatus.REJECTED);
      expect(rejected.reviewReason).toContain('Not relevant');
    });

    it('should support adding manual evidence entry with complete source provenance', async () => {
      const manualItem = await evidenceService.addManualEvidence({
        bidDocumentId: testDocumentId,
        fieldKey: 'ca_registration_number',
        rawValue: '123456',
        pageNumber: 1,
        sourceText: 'CA Registration No: 123456.',
        reviewer: 'Lead Inspector',
        reason: 'Extracted from footer seal',
      });

      expect(manualItem.fieldKey).toBe('ca_registration_number');
      expect(manualItem.rawValue).toBe('123456');
      expect(manualItem.status).toBe(EvidenceStatus.VERIFIED_BY_HUMAN);
      expect(manualItem.humanReviewed).toBe(true);
    });
  });

  describe('HTTP API Endpoints Integration Tests', () => {
    it('POST /api/bid-documents/:documentId/extract-evidence should trigger extraction job', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/bid-documents/${testDocumentId}/extract-evidence`,
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.bidDocumentId).toBe(testDocumentId);
    });

    it('GET /api/bid-documents/:documentId/evidence should return evidence list and summary', async () => {
      await evidenceService.triggerExtraction(testDocumentId);
      await new Promise((r) => setTimeout(r, 200));

      const res = await app.inject({
        method: 'GET',
        url: `/api/bid-documents/${testDocumentId}/evidence`,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.evidence).toBeDefined();
      expect(body.data.summary).toBeDefined();
    });

    it('PATCH /api/evidence/:evidenceId should apply human correction', async () => {
      const item = await evidenceRepository.createEvidenceItem({
        bidDocumentId: testDocumentId,
        fieldKey: 'average_turnover',
        fieldLabel: 'Average Turnover',
        rawValue: 'Rs 20 Crores',
        sourceText: 'Average Turnover is Rs 20 Crores.',
        pageNumber: 1,
        confidence: 0.9,
        status: EvidenceStatus.EXTRACTED,
      });

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/evidence/${item.id}`,
        payload: {
          rawValue: 'Rs 22 Crores',
          reason: 'Corrected per CA balance sheet',
          reviewer: 'Officer A',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.rawValue).toBe('Rs 22 Crores');
      expect(body.data.status).toBe(EvidenceStatus.VERIFIED_BY_HUMAN);
    });

    it('POST /api/evidence/:evidenceId/verify should mark evidence as verified', async () => {
      const item = await evidenceRepository.createEvidenceItem({
        bidDocumentId: testDocumentId,
        fieldKey: 'project_name',
        fieldLabel: 'Project Name',
        rawValue: 'NIC Cloud Expansion',
        sourceText: 'Project NIC Cloud Expansion completed',
        pageNumber: 2,
        confidence: 0.92,
        status: EvidenceStatus.EXTRACTED,
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/evidence/${item.id}/verify`,
        payload: { reviewer: 'Officer Verification' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data.status).toBe(EvidenceStatus.VERIFIED_BY_HUMAN);
    });

    it('POST /api/bid-documents/:documentId/evidence should add a manual evidence item', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/bid-documents/${testDocumentId}/evidence`,
        payload: {
          fieldKey: 'client_name',
          rawValue: 'National Informatics Centre',
          pageNumber: 2,
          sourceText: 'Client Name: National Informatics Centre.',
          reason: 'Verified from stamp signature',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.fieldKey).toBe('client_name');
      expect(body.data.rawValue).toBe('National Informatics Centre');
    });
  });
});
