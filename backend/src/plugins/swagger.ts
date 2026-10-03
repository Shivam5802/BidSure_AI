import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from '../config/env.js';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  const servers = [
    { url: 'http://localhost:5000', description: 'Local Development' },
  ];

  if (env.NODE_ENV === 'production') {
    servers.unshift({ url: '/api', description: 'Production' });
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'BidSure AI — API Documentation',
        description: 'AI-Powered Bid Compliance Verification Platform for GeM Procurement.',
        version: '0.1.0',
      },
      servers,
      tags: [
        { name: 'System', description: 'Health, metadata, and diagnostic endpoints' },
        { name: 'Auth', description: 'Authentication and authorization' },
        { name: 'Tenders', description: 'Tender management' },
        { name: 'Bidders', description: 'Bidder portal' },
        { name: 'Admin', description: 'Administration' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}
