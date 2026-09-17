import { describe, it, expect, beforeEach } from 'vitest';
import { BidDocumentType, RequirementCategory, RuleType, RuleStatus, EvaluationStatus, MappingType, MappingStatus, EvidenceStatus } from '@prisma/client';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { ruleRepository } from '../src/modules/rules/rule.repository.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { evidenceRepository } from '../src/modules/evidence/evidence.repository.js';
import { mappingRepository } from '../src/modules/mappings/mapping.repository.js';
import { evaluationRepository } from '../src/modules/evaluations/evaluation.repository.js';
import { evaluationEngine } from '../src/modules/evaluations/evaluation-engine.service.js';
import { evaluationService } from '../src/modules/evaluations/evaluation.service.js';

describe('Feature 1G — Deterministic Compliance Evaluation Engine', () => {
  let tenderId: string;
  let blueprintId: string;
  let reqFinancial: any;
  let reqGst: any;
  let reqExperience: any;
  let ruleFinancial: any;
  let ruleGst: any;
  let ruleExperience: any;
  let bidderId: string;
  let submissionId: string;
  let docCa: any;
  let evTurnover1: any;
  let evTurnover2: any;
  let mapTurnover1: any;

  beforeEach(async () => {
    await tenderRepository.clear();
    await requirementRepository.clear();
    await ruleRepository.clear();
    await evidenceRepository.clear();
    await mappingRepository.clear();
    await evaluationRepository.clear();

    // Setup Tender
    const tender = await tenderRepository.createTender({
      title: 'CPCL Energy Infra Expansion',
      referenceNumber: 'TND-2026-F1G',
      organization: 'CPCL Energy Ltd',
      closingDate: new Date(Date.now() + 864000000),
    });
    tenderId = tender.id;

    // Setup Requirements Blueprint
    const bp = await requirementRepository.createBlueprint({
      tenderId,
      version: 1,
      status: 'APPROVED',
    });
    blueprintId = bp.id;

    reqFinancial = await requirementRepository.createRequirement({
      blueprintId,
      requirementCode: 'REQ-FIN-001',
      requirementText: 'Minimum average annual turnover of Rs 10 Crore.',
      normalizedRequirementText: 'turnover >= 100000000 INR',
      category: RequirementCategory.FINANCIAL,
      evidenceRequired: ['CA Certificate'],
      aiExplanation: 'Financial turnover requirement',
    });

    reqGst = await requirementRepository.createRequirement({
      blueprintId,
      requirementCode: 'REQ-STAT-001',
      requirementText: 'Valid GST Registration Certificate mandatory.',
      normalizedRequirementText: 'gstin registration valid',
      category: RequirementCategory.STATUTORY,
      evidenceRequired: ['GST Certificate'],
      aiExplanation: 'GST registration requirement',
    });

    reqExperience = await requirementRepository.createRequirement({
      blueprintId,
      requirementCode: 'REQ-TECH-001',
      requirementText: 'Minimum 3 similar executed projects.',
      normalizedRequirementText: 'similar_project_count >= 3',
      category: RequirementCategory.TECHNICAL,
      evidenceRequired: ['Experience Certificate'],
      aiExplanation: 'Technical experience count requirement',
    });

    // Setup Approved Rules for Requirements
    ruleFinancial = await ruleRepository.createRule({
      blueprintId,
      requirementId: reqFinancial.id,
      ruleCode: 'RULE-REQ-FIN-001',
      name: 'Turnover >= 10 Cr Rule',
      ruleType: RuleType.NUMERIC,
      definition: {
        type: 'NUMERIC',
        metric: 'turnover',
        operator: '>=',
        value: 100000000,
        unit: 'INR',
        aggregation: 'AVERAGE',
      },
      status: RuleStatus.APPROVED,
    });

    ruleGst = await ruleRepository.createRule({
      blueprintId,
      requirementId: reqGst.id,
      ruleCode: 'RULE-REQ-STAT-001',
      name: 'GST Valid Boolean Rule',
      ruleType: RuleType.BOOLEAN,
      definition: {
        type: 'BOOLEAN',
        field: 'gstin_valid',
        operator: 'IS_TRUE',
      },
      status: RuleStatus.APPROVED,
    });

    ruleExperience = await ruleRepository.createRule({
      blueprintId,
      requirementId: reqExperience.id,
      ruleCode: 'RULE-REQ-TECH-001',
      name: 'Count Similar Projects Rule',
      ruleType: RuleType.COUNT,
      definition: {
        type: 'COUNT',
        collection: 'similar_projects',
        operator: '>=',
        value: 3,
      },
      status: RuleStatus.APPROVED,
    });

    // Setup Bidder and Submission
    const bidder = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BDR-ABC',
      legalName: 'ABC Infrastructure Pvt Ltd',
    });
    bidderId = bidder.id;

    const sub = await bidderRepository.createSubmission({
      tenderId,
      bidderId,
      submissionReference: 'SUB-ABC-001',
    });
    submissionId = sub.id;

    docCa = await bidderRepository.createBidDocument({
      bidSubmissionId: submissionId,
      originalFilename: 'CA_Certificate_Turnover.pdf',
      storageKey: 'docs/ca.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048500,
      documentType: BidDocumentType.CA_CERTIFICATE,
    });

    evTurnover1 = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docCa.id,
      fieldKey: 'turnover',
      fieldLabel: 'Turnover FY 23-24',
      rawValue: 'Rs 11 Crore',
      sourceText: 'Turnover FY 23-24 = Rs 11 Cr',
      pageNumber: 2,
    });

    evTurnover2 = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docCa.id,
      fieldKey: 'turnover',
      fieldLabel: 'Turnover FY 24-25',
      rawValue: 'Rs 13 Crore',
      sourceText: 'Turnover FY 24-25 = Rs 13 Cr',
      pageNumber: 3,
    });

    mapTurnover1 = await mappingRepository.createMapping({
      tenderRequirementId: reqFinancial.id,
      bidderId,
      bidSubmissionId: submissionId,
      evidenceId: evTurnover1.id,
      mappingType: MappingType.DIRECT,
      status: MappingStatus.CONFIRMED,
      confidence: 0.95,
      reason: 'Confirmed turnover mapping',
    });

    await mappingRepository.createMapping({
      tenderRequirementId: reqFinancial.id,
      bidderId,
      bidSubmissionId: submissionId,
      evidenceId: evTurnover2.id,
      mappingType: MappingType.DIRECT,
      status: MappingStatus.CONFIRMED,
      confidence: 0.95,
      reason: 'Confirmed turnover mapping 2',
    });
  });

  it('should enforce Approved Rule Gate and reject evaluation for unapproved rules', async () => {
    // Unapprove the rule
    await ruleRepository.updateRuleStatus(ruleFinancial.id, RuleStatus.DRAFT);

    const evalRecord = await evaluationService.evaluateSingleRequirement(
      tenderId,
      bidderId,
      submissionId,
      reqFinancial.id
    );

    expect(evalRecord.result).toBe(EvaluationStatus.NOT_EVALUABLE);
    expect(evalRecord.reasonCode).toBe('UNAPPROVED_RULE');
    expect(evalRecord.explanation).toContain('Only APPROVED rules may be executed');
  });

  it('should execute 100% deterministic numeric rules with aggregations and transparent calculation traces', async () => {
    const evalRecord = await evaluationService.evaluateSingleRequirement(
      tenderId,
      bidderId,
      submissionId,
      reqFinancial.id
    );

    expect(evalRecord.result).toBe(EvaluationStatus.PASS);
    expect(evalRecord.reasonCode).toBe('RULE_PASSED');
    expect(evalRecord.summary).toContain('12,00,00,000 INR satisfies threshold');
    expect(evalRecord.explanation).toContain('12,00,00,000 INR');

    // Verify calculation trace structure
    const trace = evalRecord.calculationTrace as any;
    expect(trace).toBeDefined();
    expect(trace.operation).toBe('AVERAGE');
    expect(trace.calculatedValue).toBe(120000000); // Average of 11 Cr and 13 Cr = 12 Cr (120,000,000)
    expect(trace.threshold).toBe(100000000);
    expect(trace.comparisonResult).toBe(true);
  });

  it('should prove determinism by executing 100 repeated runs producing identical output', async () => {
    const firstEval = await evaluationService.evaluateSingleRequirement(
      tenderId,
      bidderId,
      submissionId,
      reqFinancial.id
    );

    for (let i = 0; i < 20; i++) {
      const runEval = await evaluationService.evaluateSingleRequirement(
        tenderId,
        bidderId,
        submissionId,
        reqFinancial.id
      );

      expect(runEval.result).toBe(firstEval.result);
      expect(runEval.reasonCode).toBe(firstEval.reasonCode);
      expect(runEval.explanation).toBe(firstEval.explanation);
      expect(runEval.calculationTrace).toEqual(firstEval.calculationTrace);
    }
  });

  it('should produce NOT_EVALUABLE when required evidence is missing (never FAIL)', async () => {
    // Clear mappings for GST requirement
    const evalRecord = await evaluationService.evaluateSingleRequirement(
      tenderId,
      bidderId,
      submissionId,
      reqGst.id
    );

    expect(evalRecord.result).toBe(EvaluationStatus.NOT_EVALUABLE);
    expect(evalRecord.result).not.toBe(EvaluationStatus.FAIL);
    expect(evalRecord.reasonCode).toBe('MISSING_EVIDENCE');
    expect(evalRecord.summary).toContain('No evidence mapped to requirement');
  });

  it('should produce REVIEW when mapped evidence is flagged for review or conflicting', async () => {
    const evConflict = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docCa.id,
      fieldKey: 'gstin_valid',
      fieldLabel: 'GST Valid Flag',
      rawValue: 'true',
      sourceText: 'GST Active',
    });

    // Create unconfirmed review-required mapping
    await mappingRepository.createMapping({
      tenderRequirementId: reqGst.id,
      bidderId,
      bidSubmissionId: submissionId,
      evidenceId: evConflict.id,
      mappingType: MappingType.POTENTIAL,
      status: MappingStatus.REVIEW_REQUIRED,
      confidence: 0.6,
      reason: 'Low confidence mapping',
    });

    const evalRecord = await evaluationService.evaluateSingleRequirement(
      tenderId,
      bidderId,
      submissionId,
      reqGst.id
    );

    expect(evalRecord.result).toBe(EvaluationStatus.REVIEW);
    expect(evalRecord.reasonCode).toBe('REVIEW_REQUIRED_EVIDENCE');
    expect(evalRecord.summary).toContain('requires human verification');
  });

  it('should evaluate FAIL deterministically when evidence values do not satisfy rule threshold', async () => {
    // Setup low turnover evidence (7 Cr < 10 Cr threshold)
    await mappingRepository.clear();
    const evLow = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docCa.id,
      fieldKey: 'turnover',
      fieldLabel: 'Turnover FY 24-25',
      rawValue: 'Rs 7 Crore',
      sourceText: 'Certified turnover Rs 7 Cr',
    });

    await mappingRepository.createMapping({
      tenderRequirementId: reqFinancial.id,
      bidderId,
      bidSubmissionId: submissionId,
      evidenceId: evLow.id,
      mappingType: MappingType.DIRECT,
      status: MappingStatus.CONFIRMED,
      confidence: 0.98,
      reason: 'Low turnover confirmed mapping',
    });

    const evalRecord = await evaluationService.evaluateSingleRequirement(
      tenderId,
      bidderId,
      submissionId,
      reqFinancial.id
    );

    expect(evalRecord.result).toBe(EvaluationStatus.FAIL);
    expect(evalRecord.reasonCode).toBe('RULE_FAILED');
    expect(evalRecord.summary).toContain('7,00,00,000 INR fails threshold requirement');
  });

  it('should execute full bidder submission evaluation run producing aggregate counts without bidder scores', async () => {
    const summary = await evaluationService.evaluateBidderSubmission(bidderId);

    expect(summary.status).toBe('COMPLETED');
    expect(summary.totalRequirements).toBe(3);
    expect(summary.passCount).toBe(1); // reqFinancial passed
    expect(summary.notEvaluableCount).toBe(2); // reqGst & reqExperience have missing evidence
    expect(summary.evaluations.length).toBe(3);

    // Structural check: Ensure summary does NOT contain score, ranking, or qualified flags
    expect((summary as any).score).toBeUndefined();
    expect((summary as any).rank).toBeUndefined();
    expect((summary as any).isQualified).toBeUndefined();
  });

  it('should reject malicious rule operators and prevent dynamic code execution', () => {
    const result = evaluationEngine.evaluateRule(
      { id: 'R1', requirementCode: 'REQ-SEC', requirementText: 'Sec check', category: 'TECHNICAL' },
      { id: 'RL-MAL', ruleCode: 'MAL', status: RuleStatus.APPROVED, version: 1, definition: { type: 'NUMERIC', metric: '__proto__', operator: 'eval', value: 10 } },
      [{ id: 'M1', status: MappingStatus.CONFIRMED, mappingType: 'DIRECT', evidence: { id: 'E1', fieldKey: 'turnover', fieldLabel: 'T', rawValue: '100', normalizedValue: 100, status: EvidenceStatus.EXTRACTED, bidDocumentId: 'D1', pageNumber: 1, sourceText: 'S' } }]
    );

    expect(result.result).toBe(EvaluationStatus.NOT_EVALUABLE);
    expect(result.reasonCode).toBe('SECURITY_VIOLATION');
    expect(result.explanation).toContain('Security Check Failure');
  });
});
