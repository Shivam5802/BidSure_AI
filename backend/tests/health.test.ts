import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('Health & Metadata Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health should return 200 with healthy status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);

    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.service).toBe('bidguard-api');
    expect(json.data.status).toBe('healthy');
    expect(json.data.version).toBe('0.1.0');
    expect(typeof json.data.uptime).toBe('number');
    expect(typeof json.data.timestamp).toBe('string');
  });

  it('GET /api should return 200 with platform metadata', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api',
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);

    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.name).toBe('BidGuard AI');
    expect(json.data.healthUrl).toBe('/api/health');
    expect(json.data.documentationUrl).toBe('/api/docs');
  });
});
