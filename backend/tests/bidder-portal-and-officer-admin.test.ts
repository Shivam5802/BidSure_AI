import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { authService } from '../src/modules/auth/auth.service.js';

describe('Bidder Portal, Self-Registration & Admin Officer Management', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let officerToken: string;
  let bidderToken: string;
  let createdOfficerId: string;
  const testTenderId = 'tnd_1789567202603_77g22a';

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Login as Admin
    const adminRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@gem.gov.in', password: 'Admin@123' },
    });
    expect(adminRes.statusCode).toBe(200);
    adminToken = JSON.parse(adminRes.payload).data.token;

    // Reset demo database to ensure canonical tender is loaded
    await app.inject({
      method: 'POST',
      url: '/api/admin/demo-reset',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    // Login as Officer
    const officerRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'officer@gem.gov.in', password: 'Officer@123' },
    });
    expect(officerRes.statusCode).toBe(200);
    officerToken = JSON.parse(officerRes.payload).data.token;
  });

  describe('1. Admin-Controlled Procurement Officer Management', () => {
    it('allows ADMIN to create a new Procurement Officer account', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/officers',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          name: 'Pooja Verma',
          email: `pooja.verma_${Date.now()}@gem.gov.in`,
          password: 'Officer@12345',
          department: 'Refinery Infrastructure Directorate',
          designation: 'Executive Procurement Officer',
          phone: '+91 98765 11223',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.role).toBe('PROCUREMENT_OFFICER');
      expect(body.data.email).toContain('pooja.verma_');
      createdOfficerId = body.data.id;
    });

    it('rejects officer creation by non-ADMIN users (RBAC 403)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/officers',
        headers: { authorization: `Bearer ${officerToken}` },
        payload: {
          name: 'Unauthorized User',
          email: 'unauth@gem.gov.in',
          password: 'Password@123',
        },
      });

      expect(res.statusCode).toBe(403);
    });

    it('allows ADMIN to list officers and deactivate an officer', async () => {
      // List officers
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/admin/officers',
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(listRes.statusCode).toBe(200);
      const listBody = JSON.parse(listRes.payload);
      expect(listBody.data.length).toBeGreaterThan(0);

      // Deactivate officer
      const deactRes = await app.inject({
        method: 'POST',
        url: `/api/admin/officers/${createdOfficerId}/deactivate`,
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(deactRes.statusCode).toBe(200);
      const deactBody = JSON.parse(deactRes.payload);
      expect(deactBody.data.status).toBe('DISABLED');

      // Re-activate officer
      const actRes = await app.inject({
        method: 'POST',
        url: `/api/admin/officers/${createdOfficerId}/activate`,
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(actRes.statusCode).toBe(200);
      const actBody = JSON.parse(actRes.payload);
      expect(actBody.data.status).toBe('ACTIVE');
    });
  });

  describe('2. Public Bidder Self-Registration & Authentication', () => {
    const uniqueEmail = `bidder_${Date.now()}@infra.com`;

    it('allows public self-registration as a BIDDER with company details', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register/bidder',
        payload: {
          name: 'Sunil Gupta',
          email: uniqueEmail,
          password: 'SecureBidder@123',
          phone: '+91 99887 76655',
          companyName: 'Gupta Heavy Pipelines Pvt Ltd',
          companyType: 'Private Limited',
          gstin: '33AABCG1234F1Z9',
          pan: 'AABCG1234F',
          registeredAddress: 'Industrial Zone B, Chennai, Tamil Nadu',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.user.role).toBe('BIDDER');
      expect(body.data.token).toBeDefined();
      bidderToken = body.data.token;
    });

    it('rejects duplicate email during bidder registration', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register/bidder',
        payload: {
          name: 'Sunil Gupta Duplicate',
          email: uniqueEmail,
          password: 'AnotherPassword@123',
          companyName: 'Another Company',
        },
      });

      expect(res.statusCode).toBe(409);
    });

    it('allows bidder to login and fetch their profile', async () => {
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: uniqueEmail, password: 'SecureBidder@123' },
      });
      expect(loginRes.statusCode).toBe(200);
      const loginBody = JSON.parse(loginRes.payload);
      expect(loginBody.data.user.role).toBe('BIDDER');

      // Fetch profile
      const profRes = await app.inject({
        method: 'GET',
        url: '/api/bidder/profile',
        headers: { authorization: `Bearer ${bidderToken}` },
      });
      expect(profRes.statusCode).toBe(200);
      const profBody = JSON.parse(profRes.payload);
      expect(profBody.data.companyName).toBe('Gupta Heavy Pipelines Pvt Ltd');
    });
  });

  describe('3. Tender Publication Lifecycle & Bidder Application Flow', () => {
    let applicationId: string;

    it('allows officer to publish a tender', async () => {
      const pubRes = await app.inject({
        method: 'POST',
        url: `/api/tenders/${testTenderId}/publish`,
        headers: { authorization: `Bearer ${officerToken}` },
      });
      expect(pubRes.statusCode).toBe(200);
      const pubBody = JSON.parse(pubRes.payload);
      expect(pubBody.data.status).toBe('PUBLISHED');
    });

    it('allows bidder to browse published tenders', async () => {
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/tenders/published',
      });
      expect(listRes.statusCode).toBe(200);
      const listBody = JSON.parse(listRes.payload);
      expect(listBody.data.length).toBeGreaterThan(0);
      expect(listBody.data.some((t: any) => t.referenceNumber === 'CPCL-INFRA-DEMO-2026')).toBe(true);
    });

    it('allows bidder to view published tender details and requirements preview', async () => {
      const detailRes = await app.inject({
        method: 'GET',
        url: `/api/tenders/published/${testTenderId}`,
      });
      expect(detailRes.statusCode).toBe(200);
      const detailBody = JSON.parse(detailRes.payload);
      expect(detailBody.data.tender).toBeDefined();
      expect(detailBody.data.requirements.technical).toBeDefined();
      expect(detailBody.data.requirements.financial).toBeDefined();
      expect(detailBody.data.requirements.statutory).toBeDefined();
    });

    it('allows bidder to apply to the published tender', async () => {
      const applyRes = await app.inject({
        method: 'POST',
        url: `/api/tenders/${testTenderId}/apply`,
        headers: { authorization: `Bearer ${bidderToken}` },
        payload: {
          companyName: 'Gupta Heavy Pipelines Pvt Ltd',
          companyType: 'Private Limited',
          gstin: '33AABCG1234F1Z9',
          pan: 'AABCG1234F',
          registeredAddress: 'Industrial Zone B, Chennai, Tamil Nadu',
          contactPhone: '+91 99887 76655',
        },
      });

      expect(applyRes.statusCode).toBe(201);
      const applyBody = JSON.parse(applyRes.payload);
      expect(applyBody.data.status).toBe('DRAFT');
      expect(applyBody.data.applicationNumber).toBeDefined();
      applicationId = applyBody.data.id;
    });

    it('prevents duplicate applications for the same tender', async () => {
      const dupRes = await app.inject({
        method: 'POST',
        url: `/api/tenders/${testTenderId}/apply`,
        headers: { authorization: `Bearer ${bidderToken}` },
      });
      expect(dupRes.statusCode).toBe(409);
    });

    it('allows bidder to upload bid documents and submit the application', async () => {
      // Upload document
      const uploadRes = await app.inject({
        method: 'POST',
        url: `/api/bidder/applications/${applicationId}/documents`,
        headers: { authorization: `Bearer ${bidderToken}` },
        payload: {
          originalFilename: 'Gupta_Turnover_Audited_Certificate.pdf',
          documentType: 'FINANCIAL_STATEMENT',
          fileSize: 2048500,
          mimeType: 'application/pdf',
        },
      });
      expect(uploadRes.statusCode).toBe(201);
      const uploadBody = JSON.parse(uploadRes.payload);
      expect(uploadBody.data.documents.length).toBe(1);

      // Submit application
      const submitRes = await app.inject({
        method: 'POST',
        url: `/api/bidder/applications/${applicationId}/submit`,
        headers: { authorization: `Bearer ${bidderToken}` },
      });
      expect(submitRes.statusCode).toBe(200);
      const submitBody = JSON.parse(submitRes.payload);
      expect(submitBody.data.status).toBe('SUBMITTED');
      expect(submitBody.data.submittedAt).toBeDefined();
    });

    it('enforces immutability: rejects new uploads after application is SUBMITTED', async () => {
      const uploadRes = await app.inject({
        method: 'POST',
        url: `/api/bidder/applications/${applicationId}/documents`,
        headers: { authorization: `Bearer ${bidderToken}` },
        payload: {
          originalFilename: 'Late_Document.pdf',
          documentType: 'OTHER',
          fileSize: 1024,
          mimeType: 'application/pdf',
        },
      });
      expect(uploadRes.statusCode).toBe(400);
      const body = JSON.parse(uploadRes.payload);
      expect(body.error.message).toContain('locked');
    });

    it('allows officer to view submitted applications for the tender', async () => {
      const appsRes = await app.inject({
        method: 'GET',
        url: `/api/tenders/${testTenderId}/applications`,
        headers: { authorization: `Bearer ${officerToken}` },
      });
      expect(appsRes.statusCode).toBe(200);
      const appsBody = JSON.parse(appsRes.payload);
      expect(appsBody.data.length).toBeGreaterThan(0);
      expect(appsBody.data.some((a: any) => a.id === applicationId)).toBe(true);
    });
  });
});
