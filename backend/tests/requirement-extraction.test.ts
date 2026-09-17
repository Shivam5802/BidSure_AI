import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { ambiguityEngineService } from '../src/services/ai/ambiguity-engine.service.js';
import { conflictEngineService } from '../src/services/ai/conflict-engine.service.js';
import { duplicateEngineService } from '../src/services/ai/duplicate-engine.service.js';
import { ExtractedRequirement } from '../src/services/ai/llm-provider.interface.js';

describe('Feature 1B — Requirement Extraction & Analysis Engines', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await tenderRepository.clear();
    await requirementRepository.clear();
  });

  describe('Ambiguity Engine', () => {
    it('should flag qualitative requirements without explicit numbers as ambiguous and clear rule candidate', () => {
      const ambiguousReq: ExtractedRequirement = {
        temporaryId: 'req_1',
        clauseReference: '5.4',
        requirementText: 'The bidder should have adequate experience in similar projects and good track record.',
        normalizedRequirementText: 'Adequate experience required',
        category: 'TECHNICAL',
        mandatory: 'YES',
        condition: null,
        evidenceRequired: ['Work orders'],
        verificationSource: null,
        ruleCandidate: {
          type: 'NUMERIC',
          parameters: { metric: 'experience_years', operator: '>=', value: 5 },
        },
        confidence: 0.7,
        explanation: 'Qualitative experience statement.',
        ambiguityFlag: false,
        ambiguityReason: null,
        sourceReferences: [{ documentId: 'doc_1', pageNumber: 12 }],
      };

      const result = ambiguityEngineService.evaluate(ambiguousReq);

      expect(result.ambiguityFlag).toBe(true);
      expect(result.ruleCandidate).toBeNull();
      expect(result.ambiguityReason).toContain('qualitative terms');
    });

    it('should not flag requirements with quantitative numeric thresholds as ambiguous', () => {
      const clearReq: ExtractedRequirement = {
        temporaryId: 'req_2',
        clauseReference: '4.2',
        requirementText: 'Average annual turnover shall not be less than INR 10 crore during last 3 financial years.',
        normalizedRequirementText: 'Average turnover >= 10 crore INR',
        category: 'FINANCIAL',
        mandatory: 'YES',
        condition: null,
        evidenceRequired: ['Audited statements'],
        verificationSource: 'MCA',
        ruleCandidate: {
          type: 'NUMERIC',
          parameters: { metric: 'average_annual_turnover', operator: '>=', value: 100000000 },
        },
        confidence: 0.96,
        explanation: 'Explicit turnover minimum.',
        ambiguityFlag: false,
        ambiguityReason: null,
        sourceReferences: [{ documentId: 'doc_1', pageNumber: 17 }],
      };

      const result = ambiguityEngineService.evaluate(clearReq);

      expect(result.ambiguityFlag).toBe(false);
      expect(result.ruleCandidate).not.toBeNull();
    });
  });

  describe('Conflict Engine', () => {
    it('should detect contradictory numeric thresholds across clauses', () => {
      const reqs: ExtractedRequirement[] = [
        {
          temporaryId: 'req_a',
          clauseReference: '4.2',
          requirementText: 'Minimum turnover: INR 10 crore on Page 17',
          normalizedRequirementText: 'Turnover 10 Cr',
          category: 'FINANCIAL',
          mandatory: 'YES',
          condition: null,
          evidenceRequired: [],
          verificationSource: null,
          ruleCandidate: {
            type: 'NUMERIC',
            parameters: { metric: 'average_annual_turnover', operator: '>=', value: 100000000 },
          },
          confidence: 0.95,
          explanation: '',
          ambiguityFlag: false,
          ambiguityReason: null,
          sourceReferences: [{ documentId: 'doc_1', pageNumber: 17 }],
        },
        {
          temporaryId: 'req_b',
          clauseReference: '8.2',
          requirementText: 'Minimum turnover: INR 15 crore on Page 68',
          normalizedRequirementText: 'Turnover 15 Cr',
          category: 'FINANCIAL',
          mandatory: 'YES',
          condition: null,
          evidenceRequired: [],
          verificationSource: null,
          ruleCandidate: {
            type: 'NUMERIC',
            parameters: { metric: 'average_annual_turnover', operator: '>=', value: 150000000 },
          },
          confidence: 0.95,
          explanation: '',
          ambiguityFlag: false,
          ambiguityReason: null,
          sourceReferences: [{ documentId: 'doc_1', pageNumber: 68 }],
        },
      ];

      const conflicts = conflictEngineService.detectConflicts(reqs);

      expect(conflicts[0]!.conflictFlag).toBe(true);
      expect(conflicts[1]!.conflictFlag).toBe(true);
      expect(conflicts[0]!.conflictReason).toContain('100000000');
      expect(conflicts[0]!.conflictReason).toContain('150000000');
    });
  });

  describe('Duplicate Engine', () => {
    it('should detect repeated requirements across tender pages', () => {
      const reqs: ExtractedRequirement[] = [
        {
          temporaryId: 'req_1',
          clauseReference: '4.3',
          requirementText: 'Valid GST registration required.',
          normalizedRequirementText: 'Valid GST registration required.',
          category: 'STATUTORY',
          mandatory: 'YES',
          condition: null,
          evidenceRequired: ['GST Certificate'],
          verificationSource: 'GSTN',
          ruleCandidate: { type: 'BOOLEAN', parameters: { flag: 'has_gst' } },
          confidence: 0.98,
          explanation: '',
          ambiguityFlag: false,
          ambiguityReason: null,
          sourceReferences: [{ documentId: 'doc_1', pageNumber: 12 }],
        },
        {
          temporaryId: 'req_2',
          clauseReference: '9.1',
          requirementText: 'Bidder shall possess a valid GST registration.',
          normalizedRequirementText: 'Valid GST registration required.',
          category: 'STATUTORY',
          mandatory: 'YES',
          condition: null,
          evidenceRequired: ['GST Certificate'],
          verificationSource: 'GSTN',
          ruleCandidate: { type: 'BOOLEAN', parameters: { flag: 'has_gst' } },
          confidence: 0.98,
          explanation: '',
          ambiguityFlag: false,
          ambiguityReason: null,
          sourceReferences: [{ documentId: 'doc_1', pageNumber: 47 }],
        },
      ];

      const duplicates = duplicateEngineService.detectDuplicates(reqs);

      expect(duplicates[0]!.duplicateFlag).toBe(false);
      expect(duplicates[1]!.duplicateFlag).toBe(true);
      expect(duplicates[1]!.duplicateOfIndex).toBe(0);
    });
  });

  describe('End-to-End Requirement Extraction Pipeline API Flow', () => {
    let tenderId: string;

    it('should set up a tender with processed document pages', async () => {
      const tender = await tenderRepository.createTender({
        title: 'CPCL Procurement Tender 2026',
        referenceNumber: 'REF-CPCL-2026-001',
        organization: 'Chennai Petroleum Corporation Limited',
        closingDate: new Date(Date.now() + 86400000 * 30),
      });
      tenderId = tender.id;

      const doc = await tenderRepository.createDocument({
        tenderId,
        originalFilename: 'Tender_Document.pdf',
        storageKey: `tenders/${tenderId}/documents/doc1/original.pdf`,
        mimeType: 'application/pdf',
        fileSize: 1024500,
        fileHash: 'sha256_mock_hash_1',
        pageCount: 2,
      });

      const page1 = await tenderRepository.createDocumentPage({
        documentId: doc.id,
        pageNumber: 17,
        processingStatus: 'COMPLETED',
        hasTextLayer: true,
        ocrUsed: false,
        textContent: 'Clause 4.2: The bidder shall have an average annual turnover of not less than INR 10 crore during the last three financial years.',
        reviewRequired: false,
      });

      await tenderRepository.createEvidenceBlock({
        pageId: page1.id,
        blockType: 'PARAGRAPH',
        content: 'Clause 4.2: The bidder shall have an average annual turnover of not less than INR 10 crore during the last three financial years.',
        sequence: 1,
      });

      const page2 = await tenderRepository.createDocumentPage({
        documentId: doc.id,
        pageNumber: 43,
        processingStatus: 'COMPLETED',
        hasTextLayer: true,
        ocrUsed: false,
        textContent: 'Clause 4.3: The bidder must possess a valid GST registration.',
        reviewRequired: false,
      });

      await tenderRepository.createEvidenceBlock({
        pageId: page2.id,
        blockType: 'PARAGRAPH',
        content: 'Clause 4.3: The bidder must possess a valid GST registration.',
        sequence: 1,
      });
    });

    it('should trigger requirement extraction via POST /api/tenders/:tenderId/requirements/extract', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${tenderId}/requirements/extract`,
      });

      expect(res.statusCode).toBe(202);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.blueprintVersion).toBe(1);
      expect(json.data.totalExtracted).toBeGreaterThan(0);
    });

    it('should retrieve extracted blueprint via GET /api/tenders/:tenderId/blueprint', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/tenders/${tenderId}/blueprint`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.blueprint.version).toBe(1);
      expect(json.data.summary.total).toBeGreaterThan(0);
      expect(json.data.requirements.length).toBeGreaterThan(0);
    });

    it('should list requirements with category filter', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/tenders/${tenderId}/requirements?category=FINANCIAL`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.every((r: any) => r.category === 'FINANCIAL')).toBe(true);
    });

    it('should allow editing and approving a requirement as Procurement Officer', async () => {
      const bpRes = await app.inject({
        method: 'GET',
        url: `/api/tenders/${tenderId}/blueprint`,
      });
      const reqId = JSON.parse(bpRes.payload).data.requirements[0].id;

      // Edit requirement
      const editRes = await app.inject({
        method: 'PATCH',
        url: `/api/tenders/${tenderId}/requirements/${reqId}`,
        payload: {
          requirementText: 'Average annual turnover shall be at least INR 15 crore (Officer Revised).',
        },
      });

      expect(editRes.statusCode).toBe(200);
      expect(JSON.parse(editRes.payload).data.requirementText).toContain('15 crore');

      // Approve requirement
      const approveRes = await app.inject({
        method: 'POST',
        url: `/api/tenders/${tenderId}/requirements/${reqId}/approve`,
      });

      expect(approveRes.statusCode).toBe(200);
      expect(JSON.parse(approveRes.payload).data.status).toBe('APPROVED');
    });

    it('should allow locking blueprint via POST /api/tenders/:tenderId/blueprint/lock', async () => {
      const bpRes = await app.inject({
        method: 'GET',
        url: `/api/tenders/${tenderId}/blueprint`,
      });
      const bpId = JSON.parse(bpRes.payload).data.blueprint.id;

      const lockRes = await app.inject({
        method: 'POST',
        url: `/api/tenders/${tenderId}/blueprint/lock`,
        payload: { blueprintId: bpId },
      });

      expect(lockRes.statusCode).toBe(200);
      expect(JSON.parse(lockRes.payload).data.status).toBe('LOCKED');
    });
  });
});
