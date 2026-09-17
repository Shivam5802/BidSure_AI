import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';

describe('Feature 1O — IDOR, Multi-Tender & Bidder Isolation Tests', () => {
  let app: FastifyInstance;
  let tenderAId: string;
  let tenderBId: string;
  let bidderAId: string;
  let bidderBId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Create Tender A
    const tA = await tenderRepository.createTender({
      title: 'Tender A — Hydrocarbon Pipeline',
      referenceNumber: `REF-IDOR-A-${Date.now()}`,
      organization: 'CPCL Energy A',
      closingDate: new Date(Date.now() + 86400000),
    });
    tenderAId = tA.id;

    // Create Tender B
    const tB = await tenderRepository.createTender({
      title: 'Tender B — Solar Infrastructure',
      referenceNumber: `REF-IDOR-B-${Date.now()}`,
      organization: 'CPCL Green Energy B',
      closingDate: new Date(Date.now() + 86400000),
    });
    tenderBId = tB.id;

    // Register Bidder A under Tender A
    const bA = await bidderRepository.createBidder({
      tenderId: tenderAId,
      bidderCode: 'BIDDER-A',
      legalName: 'Alpha Engineering Ltd',
      displayName: 'Alpha Eng',
    });
    bidderAId = bA.id;

    // Register Bidder B under Tender B
    const bB = await bidderRepository.createBidder({
      tenderId: tenderBId,
      bidderCode: 'BIDDER-B',
      legalName: 'Beta Solar Projects Ltd',
      displayName: 'Beta Solar',
    });
    bidderBId = bB.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. should allow fetching Bidder A under Tender A', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderAId}/bidders/${bidderAId}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.bidder.id).toBe(bidderAId);
    expect(body.data.bidder.tenderId).toBe(tenderAId);
  });

  it('2. should reject IDOR access: Bidder A cannot be accessed under Tender B path (returns 404)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderBId}/bidders/${bidderAId}`,
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('not found');
  });

  it('3. should isolate bidder lists: Tender B list must NOT contain Bidder A', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderBId}/bidders`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    const bidderIds = body.data.map((b: any) => b.id);
    expect(bidderIds).toContain(bidderBId);
    expect(bidderIds).not.toContain(bidderAId);
  });

  it('4. should return 404 when querying intelligence for non-existent tender', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/tenders/non-existent-tender-uuid-12345/intelligence/health-snapshot',
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('5. should enforce tender isolation on priority-queue endpoint', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/tenders/${tenderAId}/intelligence/priority-queue`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    // Any actions present must belong exclusively to tenderA
    const actions = body.data.priorityActions || [];
    for (const action of actions) {
      if (action.bidderId) {
        expect(action.bidderId).not.toBe(bidderBId);
      }
    }
  });
});
