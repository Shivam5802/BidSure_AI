import { describe, it, expect, beforeEach } from 'vitest';
import {
  conflictNormalizerService,
  conflictDetectorService,
  conflictRepository,
  conflictService,
  ComparabilityResultType,
  ConflictType,
  ConflictStatus,
  ConflictSeverity,
} from '../src/modules/conflicts/index.js';
import { evidenceRepository } from '../src/modules/evidence/evidence.repository.js';
import { evaluationRepository } from '../src/modules/evaluations/evaluation.repository.js';

describe('Feature 1I — Contradiction Detection Engine & Evidence Conflict Graph', () => {
  beforeEach(async () => {
    await conflictRepository.clear();
    await evidenceRepository.clear();
    await evaluationRepository.clear();
  });

  describe('1. Unit & Period Normalization and Comparability Engine', () => {
    it('normalizes financial periods cleanly', () => {
      expect(conflictNormalizerService.normalizeFinancialPeriod('FY 2024-25')).toBe('FY2024-2025');
      expect(conflictNormalizerService.normalizeFinancialPeriod('FY2025')).toBe('FY2025');
      expect(conflictNormalizerService.normalizeFinancialPeriod('2024-2025')).toBe('FY2024-2025');
    });

    it('prevents false positive when periods differ (FY2024 vs FY2025)', () => {
      const fact1 = {
        evidenceId: 'e1',
        bidDocumentId: 'doc1',
        fieldKey: 'net_worth',
        fieldLabel: 'Net Worth',
        rawValue: '₹10 Cr',
        normalizedValue: { financialYear: 'FY2024' },
        valueType: 'CURRENCY',
        financialYear: 'FY2024',
        normalizedPeriod: 'FY2024',
        documentType: 'CA_CERTIFICATE',
        documentName: 'CA Cert.pdf',
        pageNumber: 1,
        confidence: 0.9,
        evidenceStatus: 'EXTRACTED',
        sourceText: 'Turnover FY2024: 10 Cr',
      };

      const fact2 = {
        ...fact1,
        evidenceId: 'e2',
        rawValue: '₹15 Cr',
        financialYear: 'FY2025',
        normalizedPeriod: 'FY2025',
      };

      const res = conflictNormalizerService.evaluateComparability(fact1, fact2);
      expect(res.type).toBe(ComparabilityResultType.DIFFERENT_PERIOD);
    });

    it('prevents false positive when numeric values are equivalent (₹1 Cr vs ₹100 Lakh)', () => {
      const fact1 = {
        evidenceId: 'e1',
        bidDocumentId: 'doc1',
        fieldKey: 'net_worth',
        fieldLabel: 'Net Worth',
        rawValue: '₹1 Cr',
        normalizedValue: {},
        valueType: 'CURRENCY',
        unit: 'INR',
        documentType: 'CA_CERTIFICATE',
        documentName: 'CA Cert.pdf',
        pageNumber: 1,
        confidence: 0.95,
        evidenceStatus: 'EXTRACTED',
        sourceText: 'Net Worth is 1 Cr',
      };

      const fact2 = {
        ...fact1,
        evidenceId: 'e2',
        rawValue: '₹100 Lakh',
      };

      const res = conflictNormalizerService.evaluateComparability(fact1, fact2);
      expect(res.type).toBe(ComparabilityResultType.EQUAL_VALUE);
    });

    it('normalizes legal entity names safely', () => {
      const name1 = conflictNormalizerService.normalizeEntityName('ABC Technologies Pvt. Ltd.');
      const name2 = conflictNormalizerService.normalizeEntityName('ABC Technologies Private Limited');
      expect(name1).toBe('abctechnologies');
      expect(name2).toBe('abctechnologies');
    });
  });

  describe('2. Contradiction Detector Engine (Controlled Types)', () => {
    const tenderId = 'tender_101';
    const bidderId = 'bidder_abc';
    const submissionId = 'sub_abc';

    it('detects NUMERIC_VALUE_CONFLICT (Net Worth ₹3 Cr vs ₹5 Cr)', () => {
      const evidence = [
        {
          id: 'ev_ca_1',
          bidDocumentId: 'doc_ca',
          fieldKey: 'net_worth',
          fieldLabel: 'Net Worth',
          rawValue: '₹3 Crore',
          normalizedValue: { financialYear: 'FY2025' },
          valueType: 'CURRENCY',
          confidence: 0.95,
          status: 'EXTRACTED',
          pageNumber: 4,
          bidDocument: { originalFilename: 'CA_Certificate.pdf', documentType: 'CA_CERTIFICATE' },
        },
        {
          id: 'ev_fin_1',
          bidDocumentId: 'doc_fin',
          fieldKey: 'net_worth',
          fieldLabel: 'Net Worth',
          rawValue: '₹5 Crore',
          normalizedValue: { financialYear: 'FY2025' },
          valueType: 'CURRENCY',
          confidence: 0.92,
          status: 'EXTRACTED',
          pageNumber: 18,
          bidDocument: { originalFilename: 'Financial_Statement.pdf', documentType: 'FINANCIAL_STATEMENT' },
        },
      ];

      const drafts = conflictDetectorService.detectConflicts(tenderId, bidderId, submissionId, evidence);

      expect(drafts).toHaveLength(1);
      expect(drafts[0].conflictType).toBe(ConflictType.NUMERIC_VALUE_CONFLICT);
      expect(drafts[0].severity).toBe(ConflictSeverity.HIGH);
      expect(drafts[0].description).toContain('₹3 Crore');
      expect(drafts[0].description).toContain('₹5 Crore');
      expect(drafts[0].items).toHaveLength(2);
    });

    it('detects ENTITY_NAME_CONFLICT (ABC Technologies Pvt Ltd vs ABC Technology Limited)', () => {
      const evidence = [
        {
          id: 'ev_gst',
          bidDocumentId: 'doc_gst',
          fieldKey: 'legal_name',
          fieldLabel: 'Legal Entity Name',
          rawValue: 'ABC Technologies Pvt Ltd',
          normalizedValue: {},
          valueType: 'ENTITY',
          confidence: 0.98,
          status: 'EXTRACTED',
          pageNumber: 1,
          bidDocument: { originalFilename: 'GST_Cert.pdf', documentType: 'GST_CERTIFICATE' },
        },
        {
          id: 'ev_pan',
          bidDocumentId: 'doc_pan',
          fieldKey: 'legal_name',
          fieldLabel: 'Legal Entity Name',
          rawValue: 'ABC Technology Limited',
          normalizedValue: {},
          valueType: 'ENTITY',
          confidence: 0.97,
          status: 'EXTRACTED',
          pageNumber: 1,
          bidDocument: { originalFilename: 'PAN_Doc.pdf', documentType: 'PAN_DOCUMENT' },
        },
      ];

      const drafts = conflictDetectorService.detectConflicts(tenderId, bidderId, submissionId, evidence);

      expect(drafts).toHaveLength(1);
      expect(drafts[0].conflictType).toBe(ConflictType.ENTITY_NAME_CONFLICT);
      expect(drafts[0].severity).toBe(ConflictSeverity.HIGH);
    });

    it('detects PERCENTAGE_CONFLICT (Local Content 42% vs 60%)', () => {
      const evidence = [
        {
          id: 'ev_mii_cert',
          bidDocumentId: 'doc_mii',
          fieldKey: 'local_content',
          fieldLabel: 'Local Content Percentage',
          rawValue: '42%',
          normalizedValue: {},
          valueType: 'PERCENTAGE',
          unit: '%',
          confidence: 0.94,
          status: 'EXTRACTED',
          pageNumber: 2,
          bidDocument: { originalFilename: 'Make_in_India_Cert.pdf' },
        },
        {
          id: 'ev_decl',
          bidDocumentId: 'doc_decl',
          fieldKey: 'local_content',
          fieldLabel: 'Local Content Percentage',
          rawValue: '60%',
          normalizedValue: {},
          valueType: 'PERCENTAGE',
          unit: '%',
          confidence: 0.91,
          status: 'EXTRACTED',
          pageNumber: 1,
          bidDocument: { originalFilename: 'Bidder_Declaration.pdf' },
        },
      ];

      const drafts = conflictDetectorService.detectConflicts(tenderId, bidderId, submissionId, evidence);

      expect(drafts).toHaveLength(1);
      expect(drafts[0].conflictType).toBe(ConflictType.PERCENTAGE_CONFLICT);
      expect(drafts[0].severity).toBe(ConflictSeverity.MEDIUM);
    });

    it('ensures conflict detection is idempotent and computes duplicate fingerprint hash', () => {
      const evidence = [
        {
          id: 'ev_1',
          bidDocumentId: 'doc_1',
          fieldKey: 'turnover',
          fieldLabel: 'Turnover',
          rawValue: '12 Cr',
          normalizedValue: { financialYear: 'FY2025' },
          valueType: 'CURRENCY',
          confidence: 0.9,
          status: 'EXTRACTED',
        },
        {
          id: 'ev_2',
          bidDocumentId: 'doc_2',
          fieldKey: 'turnover',
          fieldLabel: 'Turnover',
          rawValue: '15 Cr',
          normalizedValue: { financialYear: 'FY2025' },
          valueType: 'CURRENCY',
          confidence: 0.9,
          status: 'EXTRACTED',
        },
      ];

      const drafts1 = conflictDetectorService.detectConflicts(tenderId, bidderId, submissionId, evidence);
      const drafts2 = conflictDetectorService.detectConflicts(tenderId, bidderId, submissionId, evidence);

      expect(drafts1[0].fingerprint).toBe(drafts2[0].fingerprint);
    });
  });

  describe('3. End-to-End Conflict Service & Evidence Conflict Graph', () => {
    const bidderId = 'bidder_xyz';
    const tenderId = 'tender_xyz';

    it('runs detection, saves conflict, generates graph, and allows human resolution', async () => {
      // 1. Setup mock evidence in repository
      await evidenceRepository.createEvidenceItem({
        bidDocumentId: 'doc_ca',
        fieldKey: 'net_worth',
        fieldLabel: 'Net Worth',
        rawValue: '₹3 Cr',
        normalizedValue: { financialYear: 'FY2025' },
        valueType: 'CURRENCY',
        sourceText: 'CA Certified Net Worth is ₹3 Cr',
        pageNumber: 4,
        confidence: 0.95,
      });

      await evidenceRepository.createEvidenceItem({
        bidDocumentId: 'doc_fin',
        fieldKey: 'net_worth',
        fieldLabel: 'Net Worth',
        rawValue: '₹5 Cr',
        normalizedValue: { financialYear: 'FY2025' },
        valueType: 'CURRENCY',
        sourceText: 'Balance Sheet Net Worth is ₹5 Cr',
        pageNumber: 18,
        confidence: 0.91,
      });

      // 2. Trigger conflict detection service
      const detectResult = await conflictService.detectConflictsForBidder(bidderId, tenderId);

      expect(detectResult.detectedCount).toBe(1);
      const conflict = detectResult.conflicts[0];
      expect(conflict.status).toBe(ConflictStatus.DETECTED);
      expect(conflict.fieldKey).toBe('net_worth');

      // 3. Generate Evidence Conflict Graph
      const graph = await conflictService.getConflictGraph(conflict.id);
      expect(graph.nodes.some((n) => n.type === 'CONFLICT')).toBe(true);
      expect(graph.nodes.some((n) => n.type === 'EVIDENCE')).toBe(true);
      expect(graph.edges.some((e) => e.label === 'SUPPORTED_BY')).toBe(true);

      // 4. Record Human Officer Resolution
      const updated = await conflictService.updateConflictStatus(conflict.id, {
        status: ConflictStatus.RESOLVED,
        resolution: 'CA Certificate verified as authoritative document per tender clause 4.2',
        resolutionReason: 'Approved deterministic clause precedence',
        reviewerId: 'officer_sharma',
      });

      expect(updated.status).toBe(ConflictStatus.RESOLVED);
      expect(updated.resolution).toContain('CA Certificate verified');
      expect(updated.resolvedBy).toBe('officer_sharma');
    });

    it('connects unresolved conflict to Feature 1H AI Compliance Investigation Agent', async () => {
      await evidenceRepository.createEvidenceItem({
        bidDocumentId: 'doc_1',
        fieldKey: 'gstin',
        fieldLabel: 'GSTIN Number',
        rawValue: '27AAAAA0000A1Z5',
        valueType: 'IDENTIFIER',
        confidence: 0.99,
        sourceText: 'GSTIN 27AAAAA0000A1Z5',
      });

      await evidenceRepository.createEvidenceItem({
        bidDocumentId: 'doc_2',
        fieldKey: 'gstin',
        fieldLabel: 'GSTIN Number',
        rawValue: '27BBBBB1111B2Z9',
        valueType: 'IDENTIFIER',
        confidence: 0.99,
        sourceText: 'GSTIN 27BBBBB1111B2Z9',
      });

      const detectResult = await conflictService.detectConflictsForBidder(bidderId, tenderId);
      const conflict = detectResult.conflicts[0];

      // Trigger AI investigation
      const invResult = await conflictService.startInvestigationForConflict(conflict.id, 'officer_sharma');

      expect(invResult.conflictId).toBe(conflict.id);
      expect(invResult.investigation).toBeDefined();
      expect(invResult.investigation.triggerType).toBe('MULTI_DOCUMENT_CONFLICT');

      const reFetched = await conflictService.getConflictById(conflict.id);
      expect(reFetched.status).toBe(ConflictStatus.INVESTIGATING);
    });
  });
});
