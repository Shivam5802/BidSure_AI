import { describe, it, expect, beforeEach } from 'vitest';
import { reportsService } from '../src/modules/reports/reports.service.js';
import { reportsRepository } from '../src/modules/reports/reports.repository.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { evaluationRepository } from '../src/modules/evaluations/evaluation.repository.js';
import { conflictRepository } from '../src/modules/conflicts/conflict.repository.js';
import { investigationRepository } from '../src/modules/investigation/investigation.repository.js';
import { RequirementCategory, EvaluationStatus } from '@prisma/client';

describe('Feature 1L — Audit Trail & Explainable Compliance Report', () => {
  const tenderId = 'tender_rep_test_202';
  let bidderA: any;
  let req1: any;
  let req2: any;

  beforeEach(async () => {
    reportsRepository.clear();
    bidderRepository.clear();
    requirementRepository.clear();
    evaluationRepository.clear();
    conflictRepository.clear();
    investigationRepository.clear();

    bidderA = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BID-ABC',
      legalName: 'ABC Industrial Systems Pvt Ltd',
      displayName: 'ABC Industrial',
    });

    req1 = await requirementRepository.createRequirement({
      tenderId,
      blueprintId: 'bp_rep_1',
      requirementCode: 'REQ-FIN-001',
      clauseReference: 'Cl 4.1',
      requirementText: 'Minimum Average Annual Turnover of ₹10 Crore',
      category: RequirementCategory.FINANCIAL,
      mandatory: 'YES',
    });

    req2 = await requirementRepository.createRequirement({
      tenderId,
      blueprintId: 'bp_rep_1',
      requirementCode: 'REQ-FIN-002',
      clauseReference: 'Cl 4.2',
      requirementText: 'Minimum Net Worth of ₹5 Crore',
      category: RequirementCategory.FINANCIAL,
      mandatory: 'YES',
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderA.id,
      bidSubmissionId: 'sub_a',
      requirementId: req1.id,
      ruleId: 'rule_1',
      result: EvaluationStatus.PASS,
      reasonCode: 'TURNOVER_THRESHOLD_MET',
      summary: 'Average turnover ₹12.4 Cr meets minimum requirement of ₹10 Cr',
      explanation: 'Average turnover ₹12.4 Cr >= ₹10 Cr',
      version: 1,
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderA.id,
      bidSubmissionId: 'sub_a',
      requirementId: req2.id,
      ruleId: 'rule_2',
      result: EvaluationStatus.REVIEW,
      reasonCode: 'EVIDENCE_CONFLICT',
      summary: 'Two conflicting CA certificates provided (₹4.7 Cr vs ₹5.4 Cr)',
      explanation: 'Human officer review required to resolve conflict',
      version: 1,
    });

    await conflictRepository.saveConflict({
      tenderId,
      bidderId: bidderA.id,
      bidSubmissionId: 'sub_a',
      conflictType: 'NUMERIC_VALUE_CONFLICT' as any,
      severity: 'HIGH' as any,
      status: 'UNDER_REVIEW' as any,
      fieldKey: 'net_worth',
      description: 'Conflicting Net Worth values across CA certificate pages 4 and 8',
      fingerprint: 'fp_net_worth_abc',
      confidence: 0.95,
      contextSnapshot: { reason: 'Page 4 vs Page 8 variance' },
      detectedBy: 'SYSTEM',
      detectorVersion: '1.0.0',
      requiresInvestigation: true,
      items: [],
    });
  });

  describe('Report Generation & Immutable Snapshot', () => {
    it('should generate a complete tender compliance report with SHA-256 checksum', async () => {
      const report = await reportsService.generateReport(tenderId);

      expect(report.metadata.reportType).toBe('TENDER_COMPLIANCE');
      expect(report.metadata.status).toBe('COMPLETED');
      expect(report.metadata.reportChecksum).toBeDefined();
      expect(report.metadata.reportChecksum.length).toBe(64); // SHA-256 hex string
      expect(report.executiveSummary.totalRequirements).toBe(2);
      expect(report.executiveSummary.passCount).toBe(1);
      expect(report.executiveSummary.reviewCount).toBe(1);
      expect(report.requirements).toHaveLength(2);
    });

    it('should generate a bidder-specific compliance report', async () => {
      const report = await reportsService.generateReport(tenderId, {
        bidderId: bidderA.id,
        reportType: 'BIDDER_COMPLIANCE',
      });

      expect(report.metadata.reportType).toBe('BIDDER_COMPLIANCE');
      expect(report.bidder?.legalName).toBe('ABC Industrial Systems Pvt Ltd');
      expect(report.bidder?.bidderCode).toBe('BID-ABC');
    });

    it('should re-use existing report snapshot if data checksum matches (idempotency)', async () => {
      const report1 = await reportsService.generateReport(tenderId);
      const report2 = await reportsService.generateReport(tenderId);

      expect(report2.metadata.id).toBe(report1.metadata.id);
      expect(report2.metadata.reportChecksum).toBe(report1.metadata.reportChecksum);
    });
  });

  describe('Traceability & Provenance', () => {
    it('should include full requirement, evaluation, and Why? explanation trace in report', async () => {
      const report = await reportsService.generateReport(tenderId);
      const reqItem1 = report.requirements.find((r) => r.requirement.requirementCode === 'REQ-FIN-001');

      expect(reqItem1).toBeDefined();
      expect(reqItem1?.requirement.requirementText).toBe('Minimum Average Annual Turnover of ₹10 Crore');
      expect(reqItem1?.evaluation.result).toBe('PASS');
      expect(reqItem1?.whyExplanation.summary).toContain('Deterministic rule scan passed');
    });
  });

  describe('PDF Generation', () => {
    it('should generate a valid PDF buffer containing header, summary, and audit sections', async () => {
      const report = await reportsService.generateReport(tenderId);
      const { buffer, filename } = await reportsService.generatePDF(report.metadata.id);

      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(500);
      // PDF header signature check (%PDF-1.)
      expect(buffer.toString('utf8', 0, 5)).toBe('%PDF-');
      expect(filename).toContain('BidGuard_Compliance_Report');
    });
  });

  describe('Neutrality & Decision Boundary Safeguards', () => {
    it('should NOT output winner predictions, ranks, or winner scores in reports', async () => {
      const report = await reportsService.generateReport(tenderId);

      expect((report as any).winner).toBeUndefined();
      expect((report as any).recommendedBidder).toBeUndefined();
      expect((report as any).winningScore).toBeUndefined();
      expect(report.disclaimer).toContain('Final procurement qualification, disqualification, and award decisions remain with the authorized procurement authority.');
    });
  });
});
