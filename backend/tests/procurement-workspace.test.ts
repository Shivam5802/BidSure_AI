import { describe, it, expect, beforeEach } from 'vitest';
import { workspaceService, workspaceRepository } from '../src/modules/workspace/index.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { evaluationRepository } from '../src/modules/evaluations/evaluation.repository.js';
import { conflictRepository } from '../src/modules/conflicts/conflict.repository.js';

describe('Feature 1J — Procurement Officer Command Center Workspace', () => {
  const tenderId = 'tender_cpcl_042';

  beforeEach(async () => {
    await bidderRepository.clear();
    await requirementRepository.clear();
    await evaluationRepository.clear();
    await conflictRepository.clear();
  });

  describe('1. Workspace Summary & Priority Action Queue', () => {
    it('aggregates counts and builds deterministic priority action queue', async () => {
      // Setup mock bidders
      const b1 = await bidderRepository.createBidder({
        tenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Industrial Systems Pvt Ltd',
      });

      const b2 = await bidderRepository.createBidder({
        tenderId,
        bidderCode: 'BID-002',
        legalName: 'Nova PetroTech Solutions',
      });

      // Setup mock requirement
      const req1 = await requirementRepository.createRequirement({
        blueprintId: 'bp_101',
        requirementCode: 'REQ-FIN-001',
        requirementText: 'Minimum Net Worth >= 5 Crore',
        normalizedRequirementText: 'minimum net worth >= 5 crore',
        category: 'FINANCIAL',
        aiExplanation: 'Financial eligibility requirement',
        sourcePageIds: [],
        sourceEvidenceBlockIds: [],
      });

      // Setup mock evaluation results
      await evaluationRepository.createEvaluation({
        tenderId,
        bidderId: b1.id,
        bidSubmissionId: 'sub_1',
        requirementId: req1.id,
        ruleId: 'rule_1',
        result: 'PASS',
        reasonCode: 'MEETS_RULE',
        summary: 'Net Worth >= 5 Cr satisfied',
        explanation: 'Extracted Net Worth ₹6 Cr >= Required ₹5 Cr',
      });

      await evaluationRepository.createEvaluation({
        tenderId,
        bidderId: b2.id,
        bidSubmissionId: 'sub_2',
        requirementId: req1.id,
        ruleId: 'rule_1',
        result: 'FAIL',
        reasonCode: 'BELOW_THRESHOLD',
        summary: 'Net Worth below threshold',
        explanation: 'Extracted Net Worth ₹3 Cr < Required ₹5 Cr',
      });

      // Setup mock evidence conflict
      await conflictRepository.saveConflict({
        tenderId,
        bidderId: b2.id,
        bidSubmissionId: 'sub_2',
        conflictType: 'NUMERIC_VALUE_CONFLICT' as any,
        severity: 'CRITICAL' as any,
        status: 'DETECTED' as any,
        fieldKey: 'net_worth',
        description: 'CA Certificate ₹3 Cr vs Financial Statement ₹5 Cr',
        fingerprint: 'fp_net_worth_1',
        confidence: 0.95,
        contextSnapshot: {},
        detectedBy: 'SYSTEM',
        detectorVersion: '1.0.0',
        requiresInvestigation: true,
        items: [],
      });

      const summary = await workspaceService.getWorkspaceSummary(tenderId);

      expect(summary.counts.bidderCount).toBe(2);
      expect(summary.counts.passCount).toBe(1);
      expect(summary.counts.failCount).toBe(1);
      expect(summary.counts.conflictCount).toBe(1);

      // Verify Priority Actions Queue ordering
      expect(summary.actions.length).toBeGreaterThan(0);
      expect(summary.actions[0].priority).toBe('CRITICAL');
      expect(summary.actions[0].conflictId).toBeDefined();
    });
  });

  describe('2. Requirement Compliance Matrix', () => {
    it('returns paginated matrix with category and result filters', async () => {
      const b1 = await bidderRepository.createBidder({
        tenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Industrial Systems Pvt Ltd',
      });

      const req1 = await requirementRepository.createRequirement({
        blueprintId: 'bp_101',
        requirementCode: 'REQ-FIN-001',
        requirementText: 'Turnover >= 10 Crore',
        normalizedRequirementText: 'turnover >= 10 crore',
        category: 'FINANCIAL',
        aiExplanation: 'Financial turnover rule',
        sourcePageIds: [],
        sourceEvidenceBlockIds: [],
      });

      await evaluationRepository.createEvaluation({
        tenderId,
        bidderId: b1.id,
        bidSubmissionId: 'sub_1',
        requirementId: req1.id,
        ruleId: 'rule_1',
        result: 'PASS',
        reasonCode: 'MEETS_RULE',
        summary: 'Turnover rule satisfied',
        explanation: 'Extracted ₹12 Cr >= Required ₹10 Cr',
      });

      const matrix = await workspaceService.getComplianceMatrix(tenderId, {
        category: 'FINANCIAL',
        result: 'PASS',
        page: 1,
        pageSize: 10,
      });

      expect(matrix.items).toHaveLength(1);
      expect(matrix.items[0].requirementCode).toBe('REQ-FIN-001');
      expect(matrix.items[0].bidderResults[b1.id].result).toBe('PASS');
    });
  });

  describe('3. "Why?" Evaluation Trace Explanation', () => {
    it('provides transparent, auditable explanation for an evaluation result', async () => {
      const b1 = await bidderRepository.createBidder({
        tenderId,
        bidderCode: 'BID-001',
        legalName: 'ABC Industrial Systems Pvt Ltd',
      });

      const req1 = await requirementRepository.createRequirement({
        blueprintId: 'bp_101',
        requirementCode: 'REQ-FIN-001',
        requirementText: 'Turnover >= 10 Crore',
        normalizedRequirementText: 'turnover >= 10 crore',
        category: 'FINANCIAL',
        aiExplanation: 'Financial turnover rule',
        sourcePageIds: [],
        sourceEvidenceBlockIds: [],
      });

      await evaluationRepository.createEvaluation({
        tenderId,
        bidderId: b1.id,
        bidSubmissionId: 'sub_1',
        requirementId: req1.id,
        ruleId: 'rule_1',
        result: 'PASS',
        reasonCode: 'MEETS_RULE',
        summary: 'Turnover rule satisfied',
        explanation: 'Extracted Turnover ₹12 Cr >= Required ₹10 Cr',
      });

      const why = await workspaceService.getWhyExplanation(tenderId, req1.id, b1.id);

      expect(why.requirement.requirementCode).toBe('REQ-FIN-001');
      expect(why.bidder.legalName).toBe('ABC Industrial Systems Pvt Ltd');
      expect(why.evaluation.result).toBe('PASS');
      expect(why.evaluation.explanation).toContain('₹12 Cr');
    });
  });
});
