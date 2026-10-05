import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { loginRateLimiter } from '../../middleware/rate-limit.middleware.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/register/bidder', authController.registerBidder.bind(authController));

  app.post(
    '/auth/login',
    { preHandler: [loginRateLimiter.getMiddleware()] },
    authController.login.bind(authController)
  );

  app.post(
    '/auth/logout',
    { preHandler: [authenticate(false)] },
    authController.logout.bind(authController)
  );

  app.post('/auth/demo-token', async (request, reply) => {
    if (process.env.NODE_ENV === 'production') {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Not found.' },
      });
    }
    return authController.getDemoToken(request, reply);
  });

  app.get(
    '/auth/me',
    { preHandler: [authenticate(true)] },
    authController.getMe.bind(authController)
  );
}
