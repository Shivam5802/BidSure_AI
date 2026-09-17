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
});
