import { FastifyInstance } from 'fastify';
import { healthController } from './health.controller.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    {
      schema: {
        description: 'Healthcheck endpoint to verify API service uptime and health status',
        tags: ['System'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  service: { type: 'string', example: 'bidguard-api' },
                  status: { type: 'string', example: 'healthy' },
                  version: { type: 'string', example: '0.1.0' },
                  timestamp: { type: 'string', format: 'date-time' },
                  uptime: { type: 'number', example: 42 },
                  environment: { type: 'string', example: 'development' },
                },
              },
            },
          },
        },
      },
    },
    healthController.getHealth.bind(healthController)
  );
}

export async function metadataRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/',
    {
      schema: {
        description: 'BidGuard AI API Metadata & Service Information',
        tags: ['System'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'BidGuard AI' },
                  fullName: { type: 'string' },
                  version: { type: 'string' },
                  description: { type: 'string' },
                  documentationUrl: { type: 'string' },
                  healthUrl: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    healthController.getMetadata.bind(healthController)
  );
}
