import { describe, it, expect } from 'vitest';
import { validateEnv } from '../src/config/env.js';

describe('Environment Configuration Validation', () => {
  it('should accept valid default environment parameters', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: '5000',
      HOST: '0.0.0.0',
      CORS_ORIGIN: 'http://localhost:3000',
    };

    const parsed = validateEnv(validConfig);
    expect(parsed.PORT).toBe(5000);
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.HOST).toBe('0.0.0.0');
  });

  it('should throw validation error if production lacks DATABASE_URL', () => {
    const invalidProdConfig = {
      NODE_ENV: 'production',
      PORT: '5000',
      HOST: '0.0.0.0',
      CORS_ORIGIN: 'https://bidguard.gov.in',
    };

    expect(() => validateEnv(invalidProdConfig)).toThrowError(/DATABASE_URL is required in production/);
  });

  it('should reject wildcard CORS in production', () => {
    const wildcardProdConfig = {
      NODE_ENV: 'production',
      PORT: '5000',
      HOST: '0.0.0.0',
      CORS_ORIGIN: '*',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/bidguard',
    };

    expect(() => validateEnv(wildcardProdConfig)).toThrowError(/Wildcard CORS_ORIGIN is not permitted in production/);
  });
});
