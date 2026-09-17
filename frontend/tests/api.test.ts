import { describe, it, expect, vi, afterEach } from 'vitest';
import { api, API_BASE_URL, ApiError } from '../lib/api/client';

describe('Frontend API Client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have a configured API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('checkHealth should throw ApiError on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Connection refused'));

    await expect(api.checkHealth()).rejects.toThrow(ApiError);
  });

  it('checkHealth should return data on successful response', async () => {
    const mockData = {
      service: 'bidguard-api',
      status: 'healthy',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: 10,
      environment: 'test',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    } as Response);

    const result = await api.checkHealth();
    expect(result.status).toBe('healthy');
    expect(result.service).toBe('bidguard-api');
  });
});
