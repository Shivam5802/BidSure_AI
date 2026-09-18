import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { applicationRepository } from '../src/modules/applications/application.repository.js';

describe('Bidder Application Canonical Flow & Requirements Contract', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let officerToken: string;
  let bidderToken1: string;
  let bidderToken2: string;
  let bidder1Id: string;
  let bidder2Id: string;
  const canonicalTenderId = 'tnd_1789567202603_77g22a';
  let createdAppId: string;
  let createdAppNumber: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // 1. Admin login & reset demo data
    const adminRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@gem.gov.in', password: 'Admin@123' },
    });
    expect(adminRes.statusCode).toBe(200);
    adminToken = JSON.parse(adminRes.payload).data.token;

    await app.inject({
      method: 'POST',
      url: '/api/admin/demo-reset',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    // 2. Officer login
    const officerRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'officer@gem.gov.in', password: 'Officer@123' },
    });
    expect(officerRes.statusCode).toBe(200);
    officerToken = JSON.parse(officerRes.payload).data.token;

    // 3. Register Bidder 1
    const bidder1Res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/bidder',
      payload: {
        name: 'Rohan Sharma',
        email: `rohan_${Date.now()}@infraworks.com`,
        password: 'Password@123',
        companyName: 'InfraWorks Mega Corp Ltd',
        companyType: 'Public Limited',
        gstin: '33AABCI1234F1Z1',
        pan: 'AABCI1234F',
        registeredAddress: '100 Industrial Corridor, Guindy, Chennai',
        phone: '+91 91234 56789',
      },
    });
    expect(bidder1Res.statusCode).toBe(201);
    const b1Body = JSON.parse(bidder1Res.payload);
    bidderToken1 = b1Body.data.token;
    bidder1Id = b1Body.data.user.id;

    // 4. Register Bidder 2 (for IDOR tests)
    const bidder2Res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/bidder',
      payload: {
        name: 'Kavita Iyer',
        email: `kavita_${Date.now()}@metrocorp.com`,
        password: 'Password@123',
        companyName: 'Metro Urban Infra Pvt Ltd',
        companyType: 'Private Limited',
        gstin: '33AABCM1234F1Z2',
        pan: 'AABCM1234F',
        registeredAddress: '45 Anna Salai, Chennai',
        phone: '+91 98765 43211',
      },
    });
    expect(bidder2Res.statusCode).toBe(201);
    const b2Body = JSON.parse(bidder2Res.payload);
    bidderToken2 = b2Body.data.token;
    bidder2Id = b2Body.data.user.id;
  });

  describe('Tender Requirements & Eligibility Checklist Data Contract', () => {
    it('GET /api/tenders/published returns real requirements and metadata', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/tenders/published',
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const tender = body.data.find((t: any) => t.referenceNumber === 'CPCL-INFRA-DEMO-2026');
      expect(tender).toBeDefined();
      expect(tender.tenderNumber).toBe('CPCL-INFRA-DEMO-2026');
      expect(tender.requirementsCount).toBeGreaterThan(0);
      expect(tender.submissionDeadline).toBeDefined();
    });

    it('GET /api/tenders/published/:id returns requirements list and eligibility checklist with N > 0', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/tenders/published/${canonicalTenderId}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      const data = body.data;

      // Tender metadata
      expect(data.tenderNumber).toBe('CPCL-INFRA-DEMO-2026');
      expect(data.title).toContain('CPCL');
      expect(data.submissionDeadline).toBeDefined();

      // Requirements array
      expect(Array.isArray(data.requirementsList)).toBe(true);
      expect(data.requirementsList.length).toBeGreaterThan(0);
      expect(data.requirementsCount).toBe(data.requirementsList.length);

      // Eligibility checklist array
      expect(Array.isArray(data.eligibilityChecklist)).toBe(true);
      expect(data.eligibilityChecklist.length).toBeGreaterThan(0);
      expect(data.eligibilityChecklist[0].recommendedDocument).toBeDefined();
      expect(data.eligibilityChecklist[0].mandatory).toBeDefined();

      // Backward compatibility with grouped structure
      expect(data.requirements.technical).toBeDefined();
      expect(data.requirements.financial).toBeDefined();
      expect(data.requirements.statutory).toBeDefined();
    });
  });

  describe('Canonical Application Creation Endpoint', () => {
    it('POST /api/tenders/:tenderId/apply successfully creates DRAFT application for BIDDER', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${canonicalTenderId}/apply`,
        headers: { authorization: `Bearer ${bidderToken1}` },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('DRAFT');
      expect(body.data.applicationNumber).toMatch(/^APP-/);
      expect(body.data.companyDetails.companyName).toBe('InfraWorks Mega Corp Ltd');
      expect(body.data.documents).toHaveLength(0);

      createdAppId = body.data.id;
      createdAppNumber = body.data.applicationNumber;
    });

    it('rejects duplicate application by the same bidder with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${canonicalTenderId}/apply`,
        headers: { authorization: `Bearer ${bidderToken1}` },
      });

      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.payload);
      expect(body.error.message).toContain('already applied');
    });

    it('rejects unauthenticated application attempts with 401 Unauthorized', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${canonicalTenderId}/apply`,
      });

      expect(res.statusCode).toBe(401);
    });

    it('rejects non-BIDDER (PROCUREMENT_OFFICER) attempts with 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${canonicalTenderId}/apply`,
        headers: { authorization: `Bearer ${officerToken}` },
      });

      expect(res.statusCode).toBe(403);
    });

    it('rejects application to non-existent tender with 404', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tenders/non_existent_tender_999/apply',
        headers: { authorization: `Bearer ${bidderToken2}` },
      });

      expect(res.statusCode).toBe(404);
    });

    it('rejects application to closed tender with 400', async () => {
      // Create closed tender
      const closedTender = await tenderRepository.createTender({
        title: 'Past Expired Tender',
        referenceNumber: `EXPIRED-${Date.now()}`,
        organization: 'Expired Corp',
        closingDate: new Date(Date.now() - 86400000), // yesterday
      });
      await tenderRepository.updateTenderStatus(closedTender.id, 'PUBLISHED' as any);

      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${closedTender.id}/apply`,
        headers: { authorization: `Bearer ${bidderToken2}` },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.error.message).toContain('deadline has passed');
    });

    it('rejects application to DRAFT/unpublished tender with 400', async () => {
      const draftTender = await tenderRepository.createTender({
        title: 'Internal Draft Tender',
        referenceNumber: `DRAFT-${Date.now()}`,
        organization: 'Internal Org',
        closingDate: new Date(Date.now() + 86400000 * 10),
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${draftTender.id}/apply`,
        headers: { authorization: `Bearer ${bidderToken2}` },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.error.message).toContain('not accepting applications');
    });
  });

  describe('Application Workspace, Document Dossier & Submission', () => {
    it('allows bidder to fetch their application via GET /api/bidder/applications/:id', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/bidder/applications/${createdAppId}`,
        headers: { authorization: `Bearer ${bidderToken1}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data.id).toBe(createdAppId);
      expect(body.data.applicationNumber).toBe(createdAppNumber);
    });

    it('prevents IDOR: Bidder 2 cannot access Bidder 1 application (403 Forbidden)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/bidder/applications/${createdAppId}`,
        headers: { authorization: `Bearer ${bidderToken2}` },
      });

      expect(res.statusCode).toBe(403);
    });

    it('allows bidder to update draft details via PATCH /api/bidder/applications/:id', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bidder/applications/${createdAppId}`,
        headers: { authorization: `Bearer ${bidderToken1}` },
        payload: {
          companyDetails: {
            contactPhone: '+91 99999 88888',
          },
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data.companyDetails.contactPhone).toBe('+91 99999 88888');
    });

    it('allows bidder to upload evidence document to application', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/bidder/applications/${createdAppId}/documents`,
        headers: { authorization: `Bearer ${bidderToken1}` },
        payload: {
          originalFilename: 'Audited_Balance_Sheet_2025.pdf',
          documentType: 'FINANCIAL_STATEMENT',
          fileSize: 1048576,
          mimeType: 'application/pdf',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.data.documents).toHaveLength(1);
      expect(body.data.documents[0].originalFilename).toBe('Audited_Balance_Sheet_2025.pdf');
    });

    it('allows bidder to formally submit the application', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/bidder/applications/${createdAppId}/submit`,
        headers: { authorization: `Bearer ${bidderToken1}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data.status).toBe('SUBMITTED');
      expect(body.data.submittedAt).toBeDefined();
    });

    it('enforces immutability: rejects edits and document uploads after submission (400)', async () => {
      const uploadRes = await app.inject({
        method: 'POST',
        url: `/api/bidder/applications/${createdAppId}/documents`,
        headers: { authorization: `Bearer ${bidderToken1}` },
        payload: {
          originalFilename: 'Post_Submission_Doc.pdf',
          documentType: 'OTHER',
          fileSize: 2048,
          mimeType: 'application/pdf',
        },
      });
      expect(uploadRes.statusCode).toBe(400);

      const patchRes = await app.inject({
        method: 'PATCH',
        url: `/api/bidder/applications/${createdAppId}`,
        headers: { authorization: `Bearer ${bidderToken1}` },
        payload: { companyDetails: { companyName: 'Changed Name' } },
      });
      expect(patchRes.statusCode).toBe(400);
    });

    it('officer can view submitted application under tender applications', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/tenders/${canonicalTenderId}/applications`,
        headers: { authorization: `Bearer ${officerToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data.some((a: any) => a.id === createdAppId)).toBe(true);
    });
  });
});
