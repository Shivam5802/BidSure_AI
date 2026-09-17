import { env } from '../../config/env.js';
import { HealthCheckData, ApiMetadataData } from '../../types/api.js';

export class HealthService {
  private startTime = Date.now();

  getHealthStatus(): HealthCheckData {
    return {
      service: 'bidguard-api',
      status: 'healthy',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      environment: env.NODE_ENV,
    };
  }

  getApiMetadata(): ApiMetadataData {
    return {
      name: 'BidGuard AI',
      fullName: 'AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement',
      version: '0.1.0',
      description: 'Central API service for tender intelligence, evidence verification, and procurement compliance',
      documentationUrl: '/api/docs',
      healthUrl: '/api/health',
    };
  }
}

export const healthService = new HealthService();
