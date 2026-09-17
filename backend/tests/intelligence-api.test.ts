import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { evaluationRepository } from '../src/modules/evaluations/evaluation.repository.js';
import { conflictRepository } from '../src/modules/conflicts/conflict.repository.js';

describe('Feature 1N — Demo Intelligence, Risk Indicators & Impact Analytics API', () => {
  let app: FastifyInstance;
  let tenderId: string;
  let bidderId: string;
  let req1Id: string;
  let req2Id: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Create test tender in repository
    const tender = await tenderRepository.createTender({
      title: 'Intelligence Test Tender for AI Compliance',
      referenceNumber: `INTEL-TENDER-${Date.now()}`,
      organization: 'Ministry of Heavy Industries',
      closingDate: new Date(Date.now() + 86400000 * 30),
      description: 'Procurement test tender for intelligence testing',
    });
    tenderId = tender.id;

    // Create requirements (1 Mandatory, 1 Technical)
    const req1 = await requirementRepository.createRequirement({
      blueprintId: `bp_${tenderId}`,
      requirementCode: 'REQ-INTEL-MAND-01',
      requirementText: 'Bidder must possess valid Class-1 GeM Vendor Certification.',
      normalizedRequirementText: 'class-1 gem vendor certification',
      category: 'STATUTORY',
      aiExplanation: 'Statutory compliance certification',
      sourcePageIds: [],
      sourceEvidenceBlockIds: [],
    });
    req1Id = req1.id;
    // Mark req1 as mandatory for test
    (req1 as any).mandatory = 'YES';

    const req2 = await requirementRepository.createRequirement({
      blueprintId: `bp_${tenderId}`,
      requirementCode: 'REQ-INTEL-TECH-02',
      requirementText: 'Bidder annual turnover >= 10 Crore for past 3 fiscal years.',
      normalizedRequirementText: 'turnover >= 10 crore',
      category: 'FINANCIAL',
      aiExplanation: 'Financial turnover threshold',
      sourcePageIds: [],
      sourceEvidenceBlockIds: [],
    });
    req2Id = req2.id;
    (req2 as any).mandatory = 'NO';

    // Create bidder
    const bidder = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BID-INTEL-01',
      legalName: 'Apex Precision Infrastructure Ltd',
    });
    bidderId = bidder.id;

    // Create evaluations (1 FAIL on mandatory, 1 PASS on technical)
    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId,
      bidSubmissionId: 'sub_1',
      requirementId: req1Id,
      ruleId: 'rule_1',
      result: 'FAIL',
      reasonCode: 'MISSING_MANDATORY_CRITERIA',
      summary: 'Vendor class certificate expired',
      explanation: 'Deterministic evaluation check failed for statutory criteria.',
    });

    await evaluationRepository.createEvaluation({
      tenderId,
      bidderId,
      bidSubmissionId: 'sub_1',
      requirementId: req2Id,
      ruleId: 'rule_2',
      result: 'PASS',
      reasonCode: 'MEETS_RULE',
      summary: 'Turnover verified ₹14.5 Cr >= ₹10 Cr',
      explanation: 'Deterministic financial threshold met.',
    });

    // Create evidence conflict
    await conflictRepository.saveConflict({
      tenderId,
      bidderId,
      fieldKey: 'annualTurnover',
      conflictType: 'NUMERIC_CONFLICT' as any,
      severity: 'HIGH' as any,
      status: 'DETECTED' as any,
      description: 'Audited balance sheet declares ₹14.5 Cr, but CA certificate declares ₹11.2 Cr',
      fingerprint: `fp_turnover_${Date.now()}`,
      confidence: 0.95,
      detectedBy: 'SYSTEM',
      items: [
        {
          evidenceId: 'fact_1',
          role: 'PRIMARY',
          normalizedValueSnapshot: { value: 145000000 },
          sourceSnapshot: { text: '₹14.5 Cr' },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/tenders/:tenderId/intelligence/summary returns health snapshot', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/summary`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.tenderId).toBe(tenderId);
    expect(json.data.totalRequirements).toBe(2);
    expect(json.data.failCount).toBe(1);
    expect(json.data.passCount).toBe(1);
    expect(json.data.unresolvedConflictCount).toBe(1);
  });

  it('2. GET /api/tenders/:tenderId/intelligence/indicators returns deterministic indicators with sources', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/indicators`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.indicatorCount).toBeGreaterThan(0);

    const categories = json.data.indicators.map((i: any) => i.category);
    expect(categories).toContain('COMPLIANCE_FAILURE');
    expect(categories).toContain('CONFLICT');

    for (const ind of json.data.indicators) {
      expect(ind.sourceReferences.length).toBeGreaterThan(0);
      expect(ind.recommendedAction).toBeDefined();
    }
  });

  it('3. GET /api/tenders/:tenderId/intelligence/actions returns ordered priority queue', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/actions`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.actionCount).toBeGreaterThan(0);

    const actions = json.data.priorityActions;
    expect(actions[0].priority).toMatch(/CRITICAL|HIGH/);
  });

  it('4. GET /api/tenders/:tenderId/intelligence/compliance returns distribution and supports filters', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/compliance`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.compliance.passCount).toBe(1);
    expect(json.data.compliance.failCount).toBe(1);
    expect(json.data.compliance.totalEvaluated).toBe(2);

    // Filter by category
    const filteredRes = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/compliance?category=FINANCIAL`,
    });
    expect(filteredRes.statusCode).toBe(200);
    const filteredJson = JSON.parse(filteredRes.payload);
    expect(filteredJson.data.compliance.passCount).toBe(1);
    expect(filteredJson.data.compliance.failCount).toBe(0);
  });

  it('5. GET /api/tenders/:tenderId/intelligence/evidence returns coverage metrics', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/evidence`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.evidenceCoverage.totalMappedRequirements).toBe(2);
    expect(typeof json.data.evidenceCoverage.coveredPercentage).toBe('number');
  });

  it('6. GET /api/tenders/:tenderId/intelligence/bidders returns bidder analytics WITHOUT scores/ranks', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/bidders`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.count).toBe(1);

    const b = json.data.bidders[0];
    expect(b.bidderCode).toBe('BID-INTEL-01');
    expect(b.passCount).toBe(1);
    expect(b.failCount).toBe(1);
    expect(b.conflictCount).toBe(1);

    // Strict compliance principle check: No score, rank, or winner probability
    expect(b.score).toBeUndefined();
    expect(b.rank).toBeUndefined();
    expect(b.winnerProbability).toBeUndefined();
    expect(b.recommended).toBeUndefined();
  });

  it('7. GET /api/tenders/:tenderId/intelligence/verification returns provider breakdown and mode', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/verification`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.verifications.providerMode).toBe('MOCK');
  });

  it('8. GET /api/tenders/:tenderId/intelligence/auditability returns calculated metrics', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/auditability`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    const m = json.data.auditability;
    expect(typeof m.requirementProvenancePercentage).toBe('number');
    expect(typeof m.evidenceTraceabilityPercentage).toBe('number');
    expect(typeof m.automationCoveragePercentage).toBe('number');
    expect(typeof m.humanReviewRatePercentage).toBe('number');
  });

  it('9. GET /api/tenders/:tenderId/intelligence/effort separates measured and projected targets', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/effort`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.effort.measured.evaluationsPerformed).toBe(2);
    expect(json.data.effort.projected.targetVerificationEffortReduction).toContain('60%–80%');
    expect(json.data.effort.projected.disclaimer).toContain('official SIH problem statement');
  });

  it('10. GET /api/tenders/:tenderId/intelligence/ai-contribution returns 3-tier architecture breakdown', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/ai-contribution`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(true);
    expect(json.data.aiAssistedActivities.length).toBeGreaterThanOrEqual(4);
    expect(json.data.deterministicActivities.length).toBeGreaterThanOrEqual(3);
    expect(json.data.humanGovernanceActivities.length).toBeGreaterThanOrEqual(2);
  });

  it('11. Benchmark session persistence and retrieval works', async () => {
    const postRes = await app.inject({
      method: 'POST',
      url: `/api/tenders/${tenderId}/intelligence/benchmark`,
      payload: {
        scenarioName: 'Prototype Evaluation Benchmark 25 Reqs',
        baselineMethod: 'MANUAL_SIMULATION',
        baselineDurationSeconds: 2700, // 45 mins
        bidguardDurationSeconds: 480, // 8 mins
        requirementsCount: 25,
        documentsCount: 40,
        notes: 'Controlled prototype trial',
      },
    });

    expect(postRes.statusCode).toBe(201);
    const postJson = JSON.parse(postRes.payload);
    expect(postJson.success).toBe(true);
    expect(postJson.data.scenarioName).toBe('Prototype Evaluation Benchmark 25 Reqs');

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/benchmark`,
    });

    expect(getRes.statusCode).toBe(200);
    const getJson = JSON.parse(getRes.payload);
    expect(getJson.data.count).toBeGreaterThanOrEqual(1);
    expect(getJson.data.benchmarks[0].baselineDurationSeconds).toBe(2700);
  });

  it('12. Security & Tender Isolation: requests for non-existent tender return 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/tenders/non-existent-tender-uuid/intelligence/summary',
    });

    expect(res.statusCode).toBe(404);
    const json = JSON.parse(res.payload);
    expect(json.success).toBe(false);
  });
});
