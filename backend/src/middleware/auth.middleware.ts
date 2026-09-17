import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../modules/auth/auth.service.js';
import { TokenPayload, UserRole } from '../modules/auth/auth.types.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

/**
 * Fastify preHandler hook to verify Bearer token or HttpOnly cookie
 * When isStrict is true or AUTH_ENFORCED is set, missing token causes 401.
 * When isStrict is false and not enforced, falls back to demo officer session (for test backward compatibility).
 */
export function authenticate(isStrict: boolean = false) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader) {
      if (!authHeader.startsWith('Bearer ')) {
        const err = new Error('Malformed Authorization header: Must use Bearer scheme');
        (err as any).statusCode = 401;
        throw err;
      }
      token = authHeader.substring(7).trim();
    }

    // 2. Check HttpOnly cookie if no header
    if (!token && request.headers.cookie) {
      const match = request.headers.cookie.match(/bidguard_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    // 3. Handle missing token
    if (!token) {
      const enforceStrict = isStrict || process.env.AUTH_ENFORCED === 'true';
      if (enforceStrict) {
        const err = new Error('Authentication required: Missing or invalid authentication session');
        (err as any).statusCode = 401;
        throw err;
      }

      // Default demo officer session for unauthenticated requests in relaxed/test mode
      const defaultUser = authService.getDemoUsers().PROCUREMENT_OFFICER;
      request.user = {
        sub: defaultUser.id,
        email: defaultUser.email,
        name: defaultUser.name,
        role: defaultUser.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      return;
    }

    // 4. Verify token
    const payload = authService.verifyToken(token);
    request.user = payload;
  };
}

/**
 * Fastify preHandler hook to require specific role(s)
 */
export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (request: FastifyRequest, _reply: FastifyReply) => {
    // Ensure request.user exists first
    if (!request.user) {
      await authenticate(true)(request, _reply);
    }

    if (!request.user || !roles.includes(request.user.role)) {
      const err = new Error(`Access denied: Requires role ${roles.join(' or ')}`);
      (err as any).statusCode = 403;
      throw err;
    }
  };
}
