import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { userRepository } from '../src/modules/auth/user.repository.js';
import { loginRateLimiter } from '../src/middleware/rate-limit.middleware.js';

describe('Production Authentication & Session Hardening', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    loginRateLimiter.reset();
    await userRepository.clear();
  });

  it('1. should successfully login with valid credentials and set HttpOnly cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'officer@gem.gov.in',
        password: 'Officer@123',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe('officer@gem.gov.in');
    expect(body.data.user.role).toBe('PROCUREMENT_OFFICER');
    expect(body.data.token).toBeDefined();

    // Verify Set-Cookie header contains HttpOnly and SameSite=Lax
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('bidguard_token=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
  });

  it('2. should reject login with invalid password using generic 401 message', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'officer@gem.gov.in',
        password: 'WrongPassword999!',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe('Invalid email or password');
  });

  it('3. should reject login with unknown email using generic 401 message', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'nonexistent.user@gem.gov.in',
        password: 'SomePassword123!',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe('Invalid email or password');
  });

  it('4. should reject login with missing or invalid email format with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'not-an-email',
        password: 'SomePassword123!',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
  });

  it('5. should enforce rate limiting after repeated failed login attempts (429 Too Many Requests)', async () => {
    // Attempt 5 failed logins (configured limit)
    for (let i = 0; i < 5; i++) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'officer@gem.gov.in',
          password: `BadPassword_${i}`,
        },
      });
      expect(res.statusCode).toBe(401);
    }

    // 6th attempt should be blocked with 429
    const blockedRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'officer@gem.gov.in',
        password: 'Officer@123',
      },
    });

    expect(blockedRes.statusCode).toBe(429);
    const body = JSON.parse(blockedRes.payload);
    expect(body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(blockedRes.headers['retry-after']).toBeDefined();
  });

  it('6. should authenticate /api/auth/me via HttpOnly cookie', async () => {
    // 1. Login to get cookie
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@gem.gov.in',
        password: 'Admin@123',
      },
    });

    const token = JSON.parse(loginRes.payload).data.token;

    // 2. Access /api/auth/me passing cookie
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        cookie: `bidguard_token=${token}`,
      },
    });

    expect(meRes.statusCode).toBe(200);
    const body = JSON.parse(meRes.payload);
    expect(body.data.user.email).toBe('admin@gem.gov.in');
    expect(body.data.user.role).toBe('ADMIN');
    // Ensure password hash is never exposed
    expect(body.data.user.passwordHash).toBeUndefined();
  });

  it('7. should reject /api/auth/me when unauthenticated with 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('8. should invalidate session on logout and clear cookie', async () => {
    // 1. Login
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'officer@gem.gov.in',
        password: 'Officer@123',
      },
    });

    const token = JSON.parse(loginRes.payload).data.token;

    // 2. Call logout
    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: {
        cookie: `bidguard_token=${token}`,
      },
    });

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.headers['set-cookie']).toContain('Max-Age=0');

    // 3. Try to reuse the revoked token
    const afterLogoutRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        cookie: `bidguard_token=${token}`,
      },
    });

    expect(afterLogoutRes.statusCode).toBe(401);
  });

  it('9. should reject unauthenticated access to protected APIs when AUTH_ENFORCED is set', async () => {
    const originalEnforced = process.env.AUTH_ENFORCED;
    process.env.AUTH_ENFORCED = 'true';

    try {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tenders',
        payload: {
          title: 'Unauthorized Tender Attempt',
          referenceNumber: 'UNAUTH-001',
          organization: 'Test Org',
          closingDate: new Date().toISOString(),
        },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload);
      expect(body.error.code).toBe('UNAUTHORIZED');
    } finally {
      process.env.AUTH_ENFORCED = originalEnforced;
    }
  });
});
