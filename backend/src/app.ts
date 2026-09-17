import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { registerCors } from './plugins/cors.js';
import { registerHelmet } from './plugins/helmet.js';
import { registerSwagger } from './plugins/swagger.js';
import { registerMultipart } from './plugins/multipart.js';
import { healthRoutes, metadataRoutes } from './modules/health/health.routes.js';
import { tenderRoutes } from './modules/tenders/tender.routes.js';
import { requirementRoutes } from './modules/requirements/requirement.routes.js';
import { ruleRoutes } from './modules/rules/rule.routes.js';
import { bidderRoutes } from './modules/bidders/bidder.routes.js';
import { evidenceRoutes } from './modules/evidence/evidence.routes.js';
import { mappingRoutes } from './modules/mappings/mapping.routes.js';
import { evaluationRoutes } from './modules/evaluations/evaluation.routes.js';
import { investigationRoutes } from './modules/investigation/investigation.routes.js';
import { conflictRoutes } from './modules/conflicts/conflict.routes.js';
import { workspaceRoutes } from './modules/workspace/workspace.routes.js';
import { comparisonRoutes } from './modules/comparison/comparison.routes.js';
import { reportRoutes } from './modules/reports/reports.routes.js';
import { verificationRoutes } from './modules/verification/verification.routes.js';
import { intelligenceRoutes } from './modules/intelligence/intelligence.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';

import { authenticate } from './middleware/auth.middleware.js';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            hostname: request.hostname,
            remoteAddress: request.ip,
          };
        },
      },
    },
    bodyLimit: 55 * 1024 * 1024, // 55MB to accommodate 50MB PDF uploads
    ...opts,
  });

  // Security & Utility Plugins
  await registerCors(app);
  await registerHelmet(app);
  await registerSwagger(app);
  await registerMultipart(app);

  // Centralized Error Handling
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  // Global API Authentication Hook for Protected Routes
  app.addHook('preHandler', async (request, reply) => {
    const rawUrl = request.url || '';
    const url = rawUrl.split('?')[0] || '';

    // Skip non-API routes and Swagger documentation
    if (!url.startsWith('/api') || url.startsWith('/api/docs')) {
      return;
    }

    // Explicitly public API endpoints
    const publicEndpoints = [
      '/api',
      '/api/health',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/demo-token',
    ];

    if (publicEndpoints.includes(url)) {
      return;
    }

    // Authenticate protected endpoints
    await authenticate(false)(request, reply);
  });

  // API Routes
  await app.register(metadataRoutes, { prefix: '/api' });
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(adminRoutes, { prefix: '/api' });
  await app.register(tenderRoutes, { prefix: '/api' });
  await app.register(requirementRoutes, { prefix: '/api' });
  await app.register(ruleRoutes, { prefix: '/api' });
  await app.register(bidderRoutes, { prefix: '/api' });
  await app.register(evidenceRoutes, { prefix: '/api' });
  await app.register(mappingRoutes, { prefix: '/api' });
  await app.register(evaluationRoutes, { prefix: '/api' });
  await app.register(investigationRoutes);
  await app.register(conflictRoutes);
  await app.register(workspaceRoutes);
  await app.register(comparisonRoutes);
  await app.register(reportRoutes);
  await app.register(verificationRoutes);
  await app.register(intelligenceRoutes);

  return app;
}
