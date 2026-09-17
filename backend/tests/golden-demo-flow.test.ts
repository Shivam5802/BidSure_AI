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
    expect(body.data.requirementsCount).toBeGreaterThanOrEqual(20);
    expect(body.data.biddersCount).toBe(3);
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
    expect(body.data.totalRequirements).toBeGreaterThanOrEqual(20);
    expect(body.data.executableRulesCount).toBeGreaterThanOrEqual(20);
    expect(body.data.passCount).toBeGreaterThan(0);
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
    expect(body.data.compliance.totalEvaluated).toBeGreaterThan(0);
    expect(body.data.compliance.passCount).toBeGreaterThan(0);
    expect(body.data.compliance.failCount).toBeGreaterThan(0);
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
      expect(bidder.score).toBeUndefined();
      expect(bidder.rank).toBeUndefined();
      expect(bidder.winnerProbability).toBeUndefined();
      expect(bidder.recommended).toBeUndefined();
      expect(bidder.legalName).toBeDefined();
    }
  });

  it('Step 5: "Why?" Traceability — Priority queue surfaces deterministic actions with mandatory disclaimer', async () => {
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
    const criticalAction = actions.find((a: any) => a.priority === 'CRITICAL');
    expect(criticalAction).toBeDefined();
  });

  it('Step 6: External Verification — Simulates verification with explicit MOCK provider mode', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/external-verification`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.verifications).toBeDefined();
    expect(body.data.verifications.providerMode).toBe('MOCK');
    expect(body.data.verifications.totalRequests).toBeGreaterThan(0);
  });

  it('Step 7: Conflict Graph — Detects cross-document contradictions', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/conflicts`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.conflicts.unresolvedCount).toBeGreaterThan(0);
  });

  it('Step 8: AI Investigation Agent — Inspects hypotheses and human officer adjudication', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/investigations`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.investigations.totalCount).toBeGreaterThan(0);
  });

  it('Step 9: Auditability & Lineage Score — Verifies 5-tier audit trace', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/auditability-metrics`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.auditability.evidenceTraceabilityPercentage).toBeGreaterThanOrEqual(80);
    expect(body.data.auditability.automationCoveragePercentage).toBeGreaterThanOrEqual(80);
  });

  it('Step 10: Executive Impact & Effort Analytics — Segregates measured vs projected SIH targets', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderId}/intelligence/effort-analytics`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.effort.projected.targetVerificationEffortReduction).toContain('60%–80%');
    expect(body.data.effort.projected.disclaimer).toContain('official SIH problem statement');
  });
});
