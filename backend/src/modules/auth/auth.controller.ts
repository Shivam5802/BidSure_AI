import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authService } from './auth.service.js';
import { UserRole } from './auth.types.js';
import { loginRateLimiter } from '../../middleware/rate-limit.middleware.js';

const normalizeEmail = (val: string): string => {
  const trimmed = val.trim().toLowerCase();
  if (trimmed === 'officer' || trimmed === 'officer@gem' || trimmed === 'officer@gem.gov') {
    return 'officer@gem.gov.in';
  }
  if (trimmed === 'admin' || trimmed === 'admin@gem' || trimmed === 'admin@gem.gov') {
    return 'admin@gem.gov.in';
  }
  if (trimmed === 'bidder' || trimmed === 'demo.bidder' || trimmed === 'bidder@bidguard') {
    return 'demo.bidder@bidguard.local';
  }
  return trimmed;
};

const LoginSchema = z
  .object({
    email: z.string().trim().transform(normalizeEmail).pipe(z.string().email('Enter a valid email address')),
    password: z.string().min(1, 'Password is required').optional(),
    role: z.enum(['PROCUREMENT_OFFICER', 'ADMIN', 'BIDDER']).optional(),
  })
  .refine((data) => Boolean(data.password || data.role), {
    message: 'Password is required',
    path: ['password'],
  });

const DemoTokenSchema = z.object({
  role: z.enum(['PROCUREMENT_OFFICER', 'ADMIN', 'BIDDER']).default('PROCUREMENT_OFFICER'),
});

const RegisterBidderSchema = z.object({
  name: z.string().trim().min(2, 'Full Name is required (minimum 2 characters)'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  companyName: z.string().trim().min(2, 'Company legal name is required'),
  companyType: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  registeredAddress: z.string().optional(),
});

export class AuthController {
  async registerBidder(request: FastifyRequest, reply: FastifyReply) {
    const body = RegisterBidderSchema.parse(request.body || {});
    const result = await authService.registerBidder(body);

    // Set secure HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSitePolicy = isProduction ? 'SameSite=None' : 'SameSite=Lax';
    const cookieHeader = [
      `bidguard_token=${result.token}`,
      'Path=/',
      'HttpOnly',
      sameSitePolicy,
      `Max-Age=${result.expiresIn}`,
      ...(isProduction ? ['Secure'] : []),
    ].join('; ');

    reply.header('Set-Cookie', cookieHeader);

    return reply.status(201).send({
      success: true,
      data: result,
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = LoginSchema.parse(request.body || {});
    const passwordOrRole = body.password || body.role;
    const result = await authService.login(body.email, passwordOrRole);

    // Reset rate limit on success
    loginRateLimiter.recordSuccess(request.ip);

    // Set secure HttpOnly cookie for browser sessions (SameSite=None; Secure required for cross-domain Vercel <-> Render)
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSitePolicy = isProduction ? 'SameSite=None' : 'SameSite=Lax';
    const cookieHeader = [
      `bidguard_token=${result.token}`,
      'Path=/',
      'HttpOnly',
      sameSitePolicy,
      `Max-Age=${result.expiresIn}`,
      ...(isProduction ? ['Secure'] : []),
    ].join('; ');

    reply.header('Set-Cookie', cookieHeader);

    return reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    // Extract token from header or cookie
    let token: string | undefined;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (request.headers.cookie) {
      const match = request.headers.cookie.match(/bidguard_token=([^;]+)/);
      if (match) token = match[1];
    }

    await authService.logout(token, request.user?.sub);

    // Clear HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSitePolicy = isProduction ? 'SameSite=None; Secure;' : 'SameSite=Lax;';
    const clearCookieHeader =
      `bidguard_token=; Path=/; HttpOnly; ${sameSitePolicy} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    reply.header('Set-Cookie', clearCookieHeader);

    return reply.status(200).send({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    return reply.status(200).send({
      success: true,
      data: {
        user: {
          id: request.user.sub,
          email: request.user.email,
          name: request.user.name,
          role: request.user.role,
        },
      },
    });
  }

  async getDemoToken(request: FastifyRequest, reply: FastifyReply) {
    const body = DemoTokenSchema.parse(request.body || {});
    const demoUsers = authService.getDemoUsers();
    const targetUser = demoUsers[body.role as UserRole];

    const expiresIn = 3600 * 8;
    const token = authService.generateToken(targetUser, expiresIn);

    return reply.status(200).send({
      success: true,
      data: {
        token,
        user: targetUser,
        expiresIn,
      },
    });
  }
}

export const authController = new AuthController();
