import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { VerificationAdapterRegistry } from '../src/modules/verification/adapters/verificationAdapter.registry.js';
import { VerificationCrossCheckService } from '../src/modules/verification/services/verificationCrossCheck.service.js';
import {
  VerificationType,
  VerificationResultStatus,
  VerificationComparisonStatus,
} from '../src/modules/verification/types/verification.types.js';
import { getMockFixture } from '../src/modules/verification/fixtures/mockVerificationFixtures.js';

describe('Feature 1M — Verification Adapter Layer & Government Simulation', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Adapter Registry Unit Tests
  describe('VerificationAdapterRegistry', () => {
    const registry = VerificationAdapterRegistry.getInstance();

    it('should list all available providers with mode MOCK and supportsLive false', () => {
      const providers = registry.getProviderMetadataList();
      expect(providers.length).toBeGreaterThanOrEqual(5);

      for (const p of providers) {
        expect(p.mode).toBe('MOCK');
        expect(p.supportsLive).toBe(false);
        expect(p.enabled).toBe(true);
        expect(p.description).toContain('Synthetic demonstration provider');
      }
    });

    it('should resolve specific adapters for GST, PAN, UDYAM, and BLACKLISTING', () => {
      const gstAdapter = registry.resolveAdapter(VerificationType.GST, 'MOCK_GST_PROVIDER');
      expect(gstAdapter.providerCode).toBe('MOCK_GST_PROVIDER');

      const panAdapter = registry.resolveAdapter(VerificationType.PAN, 'MOCK_PAN_PROVIDER');
      expect(panAdapter.providerCode).toBe('MOCK_PAN_PROVIDER');

      const udyamAdapter = registry.resolveAdapter(VerificationType.UDYAM, 'MOCK_UDYAM_PROVIDER');
      expect(udyamAdapter.providerCode).toBe('MOCK_UDYAM_PROVIDER');

      const blacklistAdapter = registry.resolveAdapter(VerificationType.BLACKLISTING, 'MOCK_BLACKLIST_PROVIDER');
      expect(blacklistAdapter.providerCode).toBe('MOCK_BLACKLIST_PROVIDER');
    });

    it('should fallback to generic adapter for unknown provider code', () => {
      const adapter = registry.resolveAdapter(VerificationType.STARTUP_INDIA, 'UNKNOWN_CODE');
      expect(adapter).toBeDefined();
      expect(adapter.supportedVerificationTypes).toContain(VerificationType.STARTUP_INDIA);
    });
  });

  // 2. Deterministic Mock Scenarios (A - E)
  describe('Deterministic Mock Provider Fixtures', () => {
    it('Scenario A (MATCH): should return GST MATCH fixture', () => {
      const fixture = getMockFixture('DEMO-GST-MATCH', VerificationType.GST);
      expect(fixture.status).toBe(VerificationResultStatus.MATCH);
      expect(fixture.normalizedResult.legalName).toBe('ABC Engineering Pvt Ltd');
      expect(fixture.normalizedResult.registrationStatus).toBe('ACTIVE');
    });

    it('Scenario B (MISMATCH): should return GST MISMATCH fixture', () => {
      const fixture = getMockFixture('DEMO-GST-MISMATCH', VerificationType.GST);
      expect(fixture.status).toBe(VerificationResultStatus.MISMATCH);
      expect(fixture.normalizedResult.legalName).toBe('ABC Infrastructure Pvt Ltd');
    });

    it('Scenario C (UNAVAILABLE): should return UNAVAILABLE status without becoming FAIL', () => {
      const fixture = getMockFixture('DEMO-UDYAM-UNAVAILABLE', VerificationType.UDYAM);
      expect(fixture.status).toBe(VerificationResultStatus.UNAVAILABLE);
      expect(fixture.normalizedResult.registrationStatus).toBe('UNAVAILABLE');
    });

    it('Scenario D (NOT FOUND): should return NOT_FOUND status', () => {
      const fixture = getMockFixture('DEMO-GST-NOTFOUND', VerificationType.GST);
      expect(fixture.status).toBe(VerificationResultStatus.NOT_FOUND);
      expect(fixture.normalizedResult.registrationStatus).toBe('NOT_FOUND');
    });

    it('Scenario E (BLACKLISTING): clear and review required records', () => {
      const clear = getMockFixture('DEMO-BLACKLIST-CLEAR', VerificationType.BLACKLISTING);
      expect(clear.status).toBe(VerificationResultStatus.MATCH);

      const review = getMockFixture('DEMO-BLACKLIST-REVIEW', VerificationType.BLACKLISTING);
      expect(review.status).toBe(VerificationResultStatus.REVIEW_REQUIRED);
    });
  });

  // 3. Cross-Check Engine Unit Tests
  describe('VerificationCrossCheckService', () => {
    const service = new VerificationCrossCheckService();

    it('should evaluate exact identifier match and mismatch', () => {
      const match = service.compareIdentifiers('29ABCDE1234F1Z5', '29ABCDE1234F1Z5');
      expect(match.status).toBe(VerificationComparisonStatus.MATCH);

      const mismatch = service.compareIdentifiers('29ABCDE1234F1Z5', '27XYZAB9876Q1Z9');
      expect(mismatch.status).toBe(VerificationComparisonStatus.MISMATCH);
    });

    it('should normalize company suffixes for legal entity comparison', () => {
      const norm1 = service.normalizeEntityName('ABC Engineering Private Limited');
      const norm2 = service.normalizeEntityName('ABC Engineering Pvt Ltd');
      expect(norm1).toBe(norm2);

      const comp = service.compareEntityNames('ABC Engineering Private Limited', 'ABC Engineering Pvt Ltd');
      expect(comp.status).toBe(VerificationComparisonStatus.MATCH);
    });

    it('should flag REVIEW_REQUIRED for partial name overlap', () => {
      const comp = service.compareEntityNames('ABC Engineering Pvt Ltd', 'ABC Engineering Systems Pvt Ltd');
      expect(comp.status).toBe(VerificationComparisonStatus.REVIEW_REQUIRED);
    });

    it('should return MISMATCH for distinct legal entity names', () => {
      const comp = service.compareEntityNames('ABC Engineering Pvt Ltd', 'XYZ Infrastructure Ltd');
      expect(comp.status).toBe(VerificationComparisonStatus.MISMATCH);
    });
  });

  // 4. API Integration Endpoints Test
  describe('Verification API Endpoints', () => {
    it('GET /api/verifications/providers should return provider metadata list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verifications/providers',
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.payload);
      expect(json.success).toBe(true);
      expect(json.data.count).toBeGreaterThanOrEqual(5);
      expect(json.data.providers[0].mode).toBe('MOCK');
    });

    it('POST /api/bidders/:bidderId/verifications should validate input schema', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/bidders/00000000-0000-0000-0000-000000000000/verifications',
        payload: {
          requestedIdentifier: '', // Invalid empty identifier
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
