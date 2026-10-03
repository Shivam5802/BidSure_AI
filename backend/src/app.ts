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
import { applicationRoutes } from './modules/applications/application.routes.js';
import { env } from './config/env.js';

import { authenticate } from './middleware/auth.middleware.js';
import { globalApiRateLimiter } from './middleware/rate-limit.middleware.js';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: env.NODE_ENV === 'test' ? 'silent' : 'info',
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
    bodyLimit: env.MAX_TENDER_FILE_SIZE_MB * 1024 * 1024 + 5 * 1024 * 1024, // file limit + 5 MB overhead
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

  // Custom JSON parser to safely handle empty body requests with application/json header
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    const raw = typeof body === 'string' ? body : body ? body.toString('utf-8') : '';
    if (!raw || raw.trim().length === 0) {
      done(null, {});
      return;
    }
    try {
      const json = JSON.parse(raw);
      done(null, json);
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  // Global rate limiter hook to protect API against DoS / high concurrency floods
  app.addHook('preHandler', async (request, reply) => {
    const rawUrl = request.url || '';
    const url = rawUrl.split('?')[0] || '';
    // Skip health checks and Swagger UI from rate limiting
    if (url === '/api/health' || url.startsWith('/api/docs')) {
      return;
    }
    if (url.startsWith('/api')) {
      await globalApiRateLimiter.getMiddleware()(request, reply);
    }
  });

  // Global authentication & CDN cache-control hook for API routes
  app.addHook('preHandler', async (request, reply) => {
    const rawUrl = request.url || '';
    const url = rawUrl.split('?')[0] || '';

    // Cache-Control headers for high-volume public read endpoints (enables Edge/CDN caching for 5M users)
    if (request.method === 'GET') {
      if (url.startsWith('/api/tenders/published') || url === '/api' || url === '/api/health') {
        reply.header('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=120');
      }
    }

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
      '/api/auth/register/bidder',
      '/api/tenders/published',
    ];

    if (publicEndpoints.includes(url) || url.startsWith('/api/tenders/published/')) {
      return;
    }

    await authenticate(false)(request, reply);
  });

  // API Routes
  await app.register(metadataRoutes, { prefix: '/api' });
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(adminRoutes, { prefix: '/api' });
  await app.register(tenderRoutes, { prefix: '/api' });
  await app.register(applicationRoutes, { prefix: '/api' });
  await app.register(requirementRoutes, { prefix: '/api' });
  await app.register(ruleRoutes, { prefix: '/api' });
  await app.register(bidderRoutes, { prefix: '/api' });
  await app.register(evidenceRoutes, { prefix: '/api' });
  await app.register(mappingRoutes, { prefix: '/api' });
  await app.register(evaluationRoutes, { prefix: '/api' });
  await app.register(investigationRoutes, { prefix: '/api' });
  await app.register(conflictRoutes, { prefix: '/api' });
  await app.register(workspaceRoutes, { prefix: '/api' });
  await app.register(comparisonRoutes, { prefix: '/api' });
  await app.register(reportRoutes, { prefix: '/api' });
  await app.register(verificationRoutes, { prefix: '/api' });
  await app.register(intelligenceRoutes, { prefix: '/api' });

  return app;
}
