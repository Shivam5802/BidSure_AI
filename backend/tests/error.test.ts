import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('Error Handling Middleware', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 404 with structured error response for nonexistent routes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/non-existent-endpoint',
    });

    expect(response.statusCode).toBe(404);
    const json = JSON.parse(response.payload);

    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe('NOT_FOUND');
    expect(typeof json.error.message).toBe('string');
  });
});
