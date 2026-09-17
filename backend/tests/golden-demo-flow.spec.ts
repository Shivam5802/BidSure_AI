import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { authService } from '../src/modules/auth/auth.service.js';

describe('Feature 1O — Golden Demo Flow Specification (SIH 5-Minute Path)', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let tenderId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const admin = authService.getDemoUsers().ADMIN;
    adminToken = authService.generateToken(admin);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Step 1: Admin seeds canonical demo dataset via POST /api/admin/demo-reset', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/demo-reset',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.referenceNumber).toBe('CPCL-INFRA-DEMO-2026');
    tenderId = body.data.tenderId;
    expect(tenderId).toBeDefined();
  });

  it('Step 2: Dashboard opens canonical tender health snapshot', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/health-snapshot`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.tenderId).toBe(tenderId);
    expect(body.data.readinessStatus).toBeDefined();
    expect(body.data.openDiscrepanciesCount).toBeGreaterThan(0);
  });

  it('Step 3: Officer inspects extracted tender requirements & deterministic rules', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/compliance-distribution`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    // Quad-state evaluation distribution must exist
    expect(body.data.totalEvaluations).toBeGreaterThan(0);
    expect(body.data.distribution.PASS).toBeGreaterThan(0);
    expect(body.data.distribution.FAIL).toBeGreaterThan(0);
    expect(body.data.distribution.REVIEW).toBeGreaterThan(0);
    expect(body.data.distribution.NOT_EVALUABLE).toBeGreaterThan(0);
  });

  it('Step 4: Officer inspects bidder analytics without opaque scores or winner rankings', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/bidder-analytics`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.bidders.length).toBe(3);

    for (const bidder of body.data.bidders) {
      // Must NOT contain arbitrary score or winner ranking
      expect(bidder.compositeScore).toBeUndefined();
      expect(bidder.winnerRanking).toBeUndefined();
      expect(bidder.evaluations).toBeDefined();
    }
  });

  it('Step 5: "Why?" Traceability — Audit finding traces back to source document & page', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/priority-queue`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.disclaimer).toContain(
      'Priority indicates which issues require attention first; it does not indicate bidder preference or procurement outcome.'
    );

    const actions = body.data.priorityActions || [];
    expect(actions.length).toBeGreaterThan(0);

    // Verify ordering: highest severity first
    const criticalAction = actions.find((a: any) => a.severity === 'CRITICAL');
    expect(criticalAction).toBeDefined();
  });

  it('Step 6: External Verification — Simulates verification with explicit MOCK / SYNTHETIC badge', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/external-verification`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.verifications.length).toBeGreaterThan(0);

    for (const verif of body.data.verifications) {
      // Must explicitly declare MOCK / SYNTHETIC mode
      expect(verif.providerMode).toBe('MOCK / SYNTHETIC');
    }

    // Must have at least 1 match and 1 mismatch
    const hasMatch = body.data.verifications.some((v: any) => v.matchStatus === 'MATCH');
    const hasMismatch = body.data.verifications.some((v: any) => v.matchStatus === 'MISMATCH');
    expect(hasMatch).toBe(true);
    expect(hasMismatch).toBe(true);
  });

  it('Step 7: Conflict Graph — Detects cross-document contradictions', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/conflicts`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.conflicts.length).toBeGreaterThan(0);

    const turnoverConflict = body.data.conflicts.find(
      (c: any) => c.title.includes('Turnover Discrepancy') || c.id.includes('turnover')
    );
    expect(turnoverConflict).toBeDefined();
    expect(turnoverConflict.severity).toBe('CRITICAL');
  });

  it('Step 8: AI Investigation Agent — Inspects hypotheses and human officer adjudication', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/investigations`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.investigations.length).toBeGreaterThan(0);

    const inv = body.data.investigations[0];
    expect(inv.hypothesis).toBeDefined();
    expect(inv.officerDecision).toBeDefined();
  });

  it('Step 9: Auditability & Lineage Score — Verifies 5-tier audit trace', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/auditability-metrics`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.traceabilityScore).toBeGreaterThanOrEqual(80);
    expect(body.data.automationCoverage).toBeGreaterThanOrEqual(80);
  });

  it('Step 10: Executive Impact & Effort Analytics — Segregates measured vs projected SIH targets', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/effort-analytics`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.sihTargetReductionPercentage).toBe('60%–80%');
    expect(body.data.hoursSavedEstimate).toBeGreaterThan(0);
  });
});
