import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';

describe('Tender Management APIs', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    await tenderRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a valid tender', async () => {
    const payload = {
      title: 'Supply of High Precision Computing Equipment',
      referenceNumber: 'GEM-2026-COMP-001',
      organization: 'Ministry of Electronics and Information Technology',
      closingDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      description: 'Procurement of server clusters for data centers.',
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/tenders',
      payload,
    });

    expect(response.statusCode).toBe(201);
    const json = JSON.parse(response.payload);
    expect(json.success).toBe(true);
    expect(json.data.id).toBeDefined();
    expect(json.data.referenceNumber).toBe('GEM-2026-COMP-001');
    expect(json.data.status).toBe('DRAFT');
  });

  it('should reject tender with duplicate reference number', async () => {
    const payload = {
      title: 'Duplicate Tender Test',
      referenceNumber: 'GEM-2026-COMP-001', // Already created
      organization: 'Another Department',
      closingDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/tenders',
      payload,
    });

    expect(response.statusCode).toBe(409);
    const json = JSON.parse(response.payload);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('DUPLICATE_REFERENCE');
  });

  it('should reject invalid tender payload with 400 validation error', async () => {
    const invalidPayload = {
      title: 'AB', // too short (< 3)
      referenceNumber: '',
      organization: '',
      closingDate: 'not-a-date',
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/tenders',
      payload: invalidPayload,
    });

    expect(response.statusCode).toBe(400);
    const json = JSON.parse(response.payload);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(json.error.details)).toBe(true);
  });

  it('should retrieve tender by ID with statistics', async () => {
    // List tenders
    const listRes = await app.inject({ method: 'GET', url: '/api/tenders' });
    expect(listRes.statusCode).toBe(200);
    const listJson = JSON.parse(listRes.payload);
    expect(listJson.data.length).toBeGreaterThan(0);

    const tenderId = listJson.data[0].id;
    const detailRes = await app.inject({ method: 'GET', url: `/api/tenders/${tenderId}` });
    expect(detailRes.statusCode).toBe(200);
    const detailJson = JSON.parse(detailRes.payload);

    expect(detailJson.success).toBe(true);
    expect(detailJson.data.tender.id).toBe(tenderId);
    expect(detailJson.data.statistics).toBeDefined();
    expect(detailJson.data.statistics.documentCount).toBe(0);
  });

  it('should publish tender immediately when publishImmediately: true is provided and appear in published tenders', async () => {
    const payload = {
      title: 'Solar Panel Grid Infrastructure 2026',
      referenceNumber: 'MNRE-2026-SOLAR-PUB',
      organization: 'Ministry of New and Renewable Energy',
      department: 'Solar Power Directorate',
      category: 'TECHNICAL',
      estimatedValue: 75000000,
      closingDate: new Date(Date.now() + 86400000 * 20).toISOString(),
      publishImmediately: true,
    };

    const res = await app.inject({
      method: 'POST',
      url: '/api/tenders',
      payload,
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data.status).toBe('PUBLISHED');

    // Verify it is visible to bidders via /api/tenders/published
    const pubListRes = await app.inject({
      method: 'GET',
      url: '/api/tenders/published',
    });
    expect(pubListRes.statusCode).toBe(200);
    const pubList = JSON.parse(pubListRes.payload);
    const found = pubList.data.find((t: any) => t.referenceNumber === 'MNRE-2026-SOLAR-PUB');
    expect(found).toBeDefined();
    expect(found.title).toBe('Solar Panel Grid Infrastructure 2026');
    expect(found.organization).toBe('Ministry of New and Renewable Energy');
    expect(found.department).toBe('Solar Power Directorate');
    expect(found.estimatedValue).toBe(75000000);
    expect(found.categories).toContain('TECHNICAL');

    // Verify bidder can fetch details
    const pubDetailRes = await app.inject({
      method: 'GET',
      url: `/api/tenders/published/${found.id}`,
    });
    expect(pubDetailRes.statusCode).toBe(200);
    const pubDetail = JSON.parse(pubDetailRes.payload);
    expect(pubDetail.data.title).toBe('Solar Panel Grid Infrastructure 2026');
  });

  it('should allow publishing a draft tender directly via POST /api/tenders/:id/publish without documents', async () => {
    // 1. Create draft tender
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/tenders',
      payload: {
        title: 'Draft Road Construction Tender',
        referenceNumber: 'NHAI-2026-ROAD-01',
        organization: 'National Highways Authority of India',
        closingDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        publishImmediately: false,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const draftTender = JSON.parse(createRes.payload).data;
    expect(draftTender.status).toBe('DRAFT');

    // 2. Publish it
    const pubRes = await app.inject({
      method: 'POST',
      url: `/api/tenders/${draftTender.id}/publish`,
    });
    expect(pubRes.statusCode).toBe(200);
    expect(JSON.parse(pubRes.payload).data.status).toBe('PUBLISHED');

    // 3. Confirm visible on bidder portal
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/tenders/published',
    });
    const tenders = JSON.parse(listRes.payload).data;
    expect(tenders.some((t: any) => t.referenceNumber === 'NHAI-2026-ROAD-01')).toBe(true);
  });

  it('should auto-recover tender tnd_* on document processing request and return 202 Accepted', async () => {
    // Specifically test the exact tender ID reported by the user or any dynamic tnd_* id
    const dynamicTenderId = 'tnd_1790148657089_rmx4xh';

    const processRes = await app.inject({
      method: 'POST',
      url: `/api/tenders/${dynamicTenderId}/documents/process`,
      payload: {},
    });

    expect(processRes.statusCode).toBe(202);
    const processBody = JSON.parse(processRes.payload);
    expect(processBody.success).toBe(true);
    expect(processBody.data.jobId).toBeDefined();
    expect(processBody.data.status).toBe('PROCESSING');
    expect(processBody.data.documentIds.length).toBeGreaterThan(0);

    // Verify GET /api/tenders/:tenderId now returns the synthesized tender with documents
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/tenders/${dynamicTenderId}`,
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.payload);
    expect(getBody.data.tender.id).toBe(dynamicTenderId);
    expect(getBody.data.tender.documents.length).toBe(3);
    expect(getBody.data.statistics.totalPages).toBe(24);
  });
});

