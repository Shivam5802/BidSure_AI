import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { authService } from '../src/modules/auth/auth.service.js';

describe('Feature 1O — Authentication & RBAC Hardening Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. should successfully login and generate valid signed Bearer token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'officer@gem.gov.in',
        role: 'PROCUREMENT_OFFICER',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.role).toBe('PROCUREMENT_OFFICER');
  });

  it('2. should authenticate valid token on protected GET /api/auth/me', async () => {
    const officer = authService.getDemoUsers().PROCUREMENT_OFFICER;
    const token = authService.generateToken(officer);

    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(officer.email);
    expect(body.data.user.role).toBe('PROCUREMENT_OFFICER');
  });

  it('3. should reject unauthenticated request on strictly protected route with 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('4. should reject malformed Authorization header with 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: 'Basic dXNlcjpwYXNz',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('5. should reject token with invalid signature with 401', async () => {
    const officer = authService.getDemoUsers().PROCUREMENT_OFFICER;
    const validToken = authService.generateToken(officer);
    // Tamper with signature
    const parts = validToken.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.tamperedSignature12345`;

    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${tamperedToken}`,
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('6. should reject expired token with 401', async () => {
    const officer = authService.getDemoUsers().PROCUREMENT_OFFICER;
    // Generate token with negative expiration (already expired 10 seconds ago)
    const expiredToken = authService.generateToken(officer, -10);

    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('7. should reject PROCUREMENT_OFFICER role from ADMIN-only route with 403 Forbidden', async () => {
    const officer = authService.getDemoUsers().PROCUREMENT_OFFICER;
    const officerToken = authService.generateToken(officer);

    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/demo-reset',
      headers: {
        authorization: `Bearer ${officerToken}`,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toContain('Requires role ADMIN');
  });

  it('8. should allow ADMIN role to execute POST /api/admin/demo-reset', async () => {
    const admin = authService.getDemoUsers().ADMIN;
    const adminToken = authService.generateToken(admin);

    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/demo-reset',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    if (res.statusCode !== 200) console.error('TEST 8 FAILED:', res.payload);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.tenderId).toBeDefined();
    expect(body.data.referenceNumber).toBe('CPCL-INFRA-DEMO-2026');
    expect(body.data.requirementsCount).toBeGreaterThanOrEqual(20);
    expect(body.data.biddersCount).toBe(3);
  });
});
