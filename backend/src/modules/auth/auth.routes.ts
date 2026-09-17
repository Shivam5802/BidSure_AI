import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { loginRateLimiter } from '../../middleware/rate-limit.middleware.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
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

  app.post('/auth/demo-token', authController.getDemoToken.bind(authController));

  app.get(
    '/auth/me',
    { preHandler: [authenticate(true)] },
    authController.getMe.bind(authController)
  );
}
