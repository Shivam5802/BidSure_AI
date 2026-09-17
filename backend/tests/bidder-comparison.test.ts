import { describe, it, expect, beforeEach } from 'vitest';
import { comparisonService } from '../src/modules/comparison/comparison.service.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { evaluationRepository } from '../src/modules/evaluations/evaluation.repository.js';
import { conflictRepository } from '../src/modules/conflicts/conflict.repository.js';
import { RequirementCategory, EvaluationStatus } from '@prisma/client';

describe('Feature 1K — Bidder Comparison & Tender-Level Intelligence', () => {
  const tenderId = 'tender_comp_test_101';
  let bidderA: any;
  let bidderB: any;
  let bidderC: any;
  let req1: any;
  let req2: any;
  let req3: any;

  beforeEach(async () => {
    // Clear and set up test data in in-memory repositories
    bidderRepository.clear();
    requirementRepository.clear();
    evaluationRepository.clear();
    conflictRepository.clear();

    // Register 3 fictional demo bidders
    bidderA = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BID-ABC',
      legalName: 'ABC Industrial Systems Pvt Ltd',
      displayName: 'ABC Industrial',
    });

    bidderB = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BID-NOVA',
      legalName: 'Nova PetroTech Solutions',
      displayName: 'Nova PetroTech',
    });

    bidderC = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BID-BHARAT',
      legalName: 'Bharat Process Equipment Pvt Ltd',
      displayName: 'Bharat Process',
    });

    // Create demo requirements
    req1 = await requirementRepository.createRequirement({
      tenderId,
      blueprintId: 'bp_1',
      requirementCode: 'REQ-FIN-001',
      clauseReference: 'Cl 4.1',
      requirementText: 'Minimum Average Annual Turnover of ₹10 Crore',
      category: RequirementCategory.FINANCIAL,
      mandatory: 'YES',
    });

    req2 = await requirementRepository.createRequirement({
      tenderId,
      blueprintId: 'bp_1',
      requirementCode: 'REQ-FIN-002',
      clauseReference: 'Cl 4.2',
      requirementText: 'Minimum Net Worth of ₹5 Crore',
      category: RequirementCategory.FINANCIAL,
      mandatory: 'YES',
    });

    req3 = await requirementRepository.createRequirement({
      tenderId,
      blueprintId: 'bp_1',
      requirementCode: 'REQ-TECH-001',
      clauseReference: 'Cl 6.1',
      requirementText: 'OEM Authorization Certificate for Valve Actuators',
      category: RequirementCategory.TECHNICAL,
      mandatory: 'YES',
    });

    // Create evaluation results for Scenario testing
    // REQ 1 (Turnover): ABC = PASS, Nova = FAIL, Bharat = PASS
    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderA.id,
      bidSubmissionId: 'sub_a',
      requirementId: req1.id,
      ruleId: 'rule_1',
      result: EvaluationStatus.PASS,
      reasonCode: 'TURNOVER_THRESHOLD_MET',
      summary: 'Turnover ₹12.4 Cr meets minimum requirement of ₹10 Cr',
      explanation: 'Average turnover ₹12.4 Cr >= ₹10 Cr',
      version: 1,
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderB.id,
      bidSubmissionId: 'sub_b',
      requirementId: req1.id,
      ruleId: 'rule_1',
      result: EvaluationStatus.FAIL,
      reasonCode: 'TURNOVER_BELOW_THRESHOLD',
      summary: 'Turnover ₹8.1 Cr is below required ₹10 Cr',
      explanation: 'Average turnover ₹8.1 Cr < ₹10 Cr',
      version: 1,
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderC.id,
      bidSubmissionId: 'sub_c',
      requirementId: req1.id,
      ruleId: 'rule_1',
      result: EvaluationStatus.PASS,
      reasonCode: 'TURNOVER_THRESHOLD_MET',
      summary: 'Turnover ₹10.7 Cr meets minimum requirement of ₹10 Cr',
      explanation: 'Average turnover ₹10.7 Cr >= ₹10 Cr',
      version: 1,
    });

    // REQ 2 (Net Worth): ABC = REVIEW, Nova = PASS, Bharat = FAIL
    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderA.id,
      bidSubmissionId: 'sub_a',
      requirementId: req2.id,
      ruleId: 'rule_2',
      result: EvaluationStatus.REVIEW,
      reasonCode: 'EVIDENCE_AMBIGUOUS',
      summary: 'Net worth certificate contains ambiguous financial figures',
      explanation: 'Net worth ₹4.8 Cr vs ₹5.2 Cr conflicting lines',
      version: 1,
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderB.id,
      bidSubmissionId: 'sub_b',
      requirementId: req2.id,
      ruleId: 'rule_2',
      result: EvaluationStatus.PASS,
      reasonCode: 'NET_WORTH_MET',
      summary: 'Net worth ₹6.2 Cr exceeds required ₹5 Cr',
      explanation: 'Net worth ₹6.2 Cr >= ₹5 Cr',
      version: 1,
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderC.id,
      bidSubmissionId: 'sub_c',
      requirementId: req2.id,
      ruleId: 'rule_2',
      result: EvaluationStatus.FAIL,
      reasonCode: 'NET_WORTH_DEFICIT',
      summary: 'Net worth ₹3.2 Cr is below required ₹5 Cr',
      explanation: 'Net worth ₹3.2 Cr < ₹5 Cr',
      version: 1,
    });

    // REQ 3 (OEM Auth): ABC = NOT_EVALUABLE, Nova = PASS, Bharat = REVIEW
    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderA.id,
      bidSubmissionId: 'sub_a',
      requirementId: req3.id,
      ruleId: 'rule_3',
      result: EvaluationStatus.NOT_EVALUABLE,
      reasonCode: 'EVIDENCE_MISSING',
      summary: 'No OEM Authorization document provided in submission',
      explanation: 'Required document OEM_AUTHORIZATION missing',
      version: 1,
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderB.id,
      bidSubmissionId: 'sub_b',
      requirementId: req3.id,
      ruleId: 'rule_3',
      result: EvaluationStatus.PASS,
      reasonCode: 'OEM_AUTH_VALID',
      summary: 'Valid OEM Authorization certificate attached',
      explanation: 'OEM authorization verified',
      version: 1,
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId: bidderC.id,
      bidSubmissionId: 'sub_c',
      requirementId: req3.id,
      ruleId: 'rule_3',
      result: EvaluationStatus.REVIEW,
      reasonCode: 'OEM_EXPIRING_SOON',
      summary: 'OEM authorization valid but expires within 30 days',
      explanation: 'Officer review recommended for expiry date',
      version: 1,
    });
  });

  describe('Bidder Selection & Limit Validation', () => {
    it('should calculate comparison summary for selected bidders', async () => {
      const summary = await comparisonService.getComparisonSummary(tenderId, [
        bidderA.id,
        bidderB.id,
        bidderC.id,
      ]);

      expect(summary.totalBidders).toBe(3);
      expect(summary.selectedBidders).toHaveLength(3);

      const abc = summary.selectedBidders.find((b) => b.bidderId === bidderA.id);
      expect(abc?.legalName).toBe('ABC Industrial Systems Pvt Ltd');
      expect(abc?.passCount).toBe(1);
      expect(abc?.reviewCount).toBe(1);
      expect(abc?.notEvaluableCount).toBe(1);
    });

    it('should automatically select available bidders if less than 2 are requested', async () => {
      const matrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id],
      });

      expect(matrix.selectedBidders.length).toBeGreaterThanOrEqual(2);
    });

    it('should cap bidder selection to a maximum of 5 bidders', async () => {
      // Pass 6 fake bidder IDs along with valid ones
      const ids = [bidderA.id, bidderB.id, bidderC.id, 'fake_1', 'fake_2', 'fake_3'];
      const summary = await comparisonService.getComparisonSummary(tenderId, ids);

      expect(summary.selectedBidders.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Requirement Comparison Matrix & Difference Detection', () => {
    it('should correctly detect MIXED_RESULTS, SOME_REVIEW, and SOME_UNEVALUABLE difference states', async () => {
      const matrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id, bidderB.id, bidderC.id],
      });

      expect(matrix.items).toHaveLength(3);

      // REQ 1 (Turnover): PASS, FAIL, PASS -> MIXED_RESULTS
      const item1 = matrix.items.find((i) => i.requirementId === req1.id);
      expect(item1?.differenceState).toBe('MIXED_RESULTS');
      expect(item1?.hasDifference).toBe(true);

      // REQ 2 (Net Worth): REVIEW, PASS, FAIL -> SOME_REVIEW
      const item2 = matrix.items.find((i) => i.requirementId === req2.id);
      expect(item2?.differenceState).toBe('SOME_REVIEW');
      expect(item2?.hasDifference).toBe(true);

      // REQ 3 (OEM Auth): NOT_EVALUABLE, PASS, REVIEW -> SOME_UNEVALUABLE
      const item3 = matrix.items.find((i) => i.requirementId === req3.id);
      expect(item3?.differenceState).toBe('SOME_UNEVALUABLE');
      expect(item3?.hasDifference).toBe(true);
    });

    it('should detect ALL_SAME when all selected bidders have identical results', async () => {
      // Add a 4th requirement where all bidders PASS
      const req4 = await requirementRepository.createRequirement({
        tenderId,
        blueprintId: 'bp_1',
        requirementCode: 'REQ-STAT-001',
        requirementText: 'GST Registration Certificate',
        category: RequirementCategory.STATUTORY,
        mandatory: 'YES',
      });

      for (const bId of [bidderA.id, bidderB.id, bidderC.id]) {
        await evaluationRepository.createEvaluation({
          tenderId,
          bidderId: bId,
          bidSubmissionId: `sub_${bId}`,
          requirementId: req4.id,
          ruleId: 'rule_4',
          result: EvaluationStatus.PASS,
          reasonCode: 'GST_VALID',
          summary: 'GST registration verified',
          version: 1,
        });
      }

      const matrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id, bidderB.id, bidderC.id],
      });

      const item4 = matrix.items.find((i) => i.requirementId === req4.id);
      expect(item4?.differenceState).toBe('ALL_SAME');
      expect(item4?.hasDifference).toBe(false);
    });

    it('should filter matrix by differenceOnly', async () => {
      // Add REQ 4 (ALL_SAME)
      const req4 = await requirementRepository.createRequirement({
        tenderId,
        blueprintId: 'bp_1',
        requirementCode: 'REQ-STAT-001',
        requirementText: 'GST Registration Certificate',
        category: RequirementCategory.STATUTORY,
        mandatory: 'YES',
      });
      for (const bId of [bidderA.id, bidderB.id, bidderC.id]) {
        await evaluationRepository.createEvaluation({
          tenderId,
          bidderId: bId,
          bidSubmissionId: `sub_${bId}`,
          requirementId: req4.id,
          ruleId: 'rule_4',
          result: EvaluationStatus.PASS,
          reasonCode: 'GST_VALID',
          summary: 'GST registration verified',
          version: 1,
        });
      }

      const diffMatrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id, bidderB.id, bidderC.id],
        differenceOnly: true,
      });

      expect(diffMatrix.items.every((item) => item.hasDifference)).toBe(true);
      expect(diffMatrix.items.find((i) => i.requirementId === req4.id)).toBeUndefined();
    });

    it('should filter matrix by category and search query', async () => {
      const searchMatrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id, bidderB.id],
        search: 'Turnover',
      });

      expect(searchMatrix.items).toHaveLength(1);
      expect(searchMatrix.items[0].requirementCode).toBe('REQ-FIN-001');

      const catMatrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id, bidderB.id],
        category: RequirementCategory.TECHNICAL,
      });

      expect(catMatrix.items).toHaveLength(1);
      expect(catMatrix.items[0].requirementCode).toBe('REQ-TECH-001');
    });
  });

  describe('Requirement Detail Side-by-Side Comparison', () => {
    it('should return side-by-side evidence, trace, and evaluation details for a specific requirement', async () => {
      const detail = await comparisonService.getRequirementComparisonDetail(
        tenderId,
        req1.id,
        [bidderA.id, bidderB.id, bidderC.id]
      );

      expect(detail.requirement.requirementCode).toBe('REQ-FIN-001');
      expect(detail.bidders).toHaveLength(3);

      const bidderAEval = detail.bidders.find((b) => b.bidderId === bidderA.id);
      expect(bidderAEval?.evaluation.result).toBe('PASS');

      const bidderBEval = detail.bidders.find((b) => b.bidderId === bidderB.id);
      expect(bidderBEval?.evaluation.result).toBe('FAIL');
    });
  });

  describe('Version Correctness & Obsolescence Prevention', () => {
    it('should always select the latest evaluation version per bidder and requirement', async () => {
      // Supersede bidder A's REQ-FIN-001 evaluation with version 2 (FAIL)
      await evaluationRepository.createEvaluation({
        tenderId,
        bidderId: bidderA.id,
        bidSubmissionId: 'sub_a',
        requirementId: req1.id,
        ruleId: 'rule_1',
        result: EvaluationStatus.FAIL,
        reasonCode: 'RE_EVALUATED_FAIL',
        summary: 'Re-evaluated: turnover certificate invalid',
        explanation: 'Version 2 supersede',
        version: 2,
      });

      const matrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id, bidderB.id, bidderC.id],
      });

      const item1 = matrix.items.find((i) => i.requirementId === req1.id);
      expect(item1?.evaluations[bidderA.id].result).toBe('FAIL');
      expect(item1?.evaluations[bidderA.id].version).toBe(2);
    });
  });

  describe('Absolute Decision Boundary & Neutrality Safeguards', () => {
    it('should NOT output winner predictions, ranks, or winner scores', async () => {
      const summary = await comparisonService.getComparisonSummary(tenderId, [
        bidderA.id,
        bidderB.id,
      ]);
      const matrix = await comparisonService.getComparisonMatrix(tenderId, {
        bidderIds: [bidderA.id, bidderB.id],
      });

      // Verify response structure does not contain winner fields
      expect((summary as any).winner).toBeUndefined();
      expect((summary as any).recommendedBidder).toBeUndefined();
      expect((summary as any).winningScore).toBeUndefined();
      expect((matrix as any).winnerRank).toBeUndefined();
    });
  });
});
