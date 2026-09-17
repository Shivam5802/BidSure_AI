import { FastifyRequest, FastifyReply } from 'fastify';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class LoginRateLimiter {
  private attempts: Map<string, RateLimitRecord> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor() {
    this.maxAttempts = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10);
    this.windowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000', 10);
  }

  getMiddleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const ip = request.ip || '127.0.0.1';
      const now = Date.now();
      const record = this.attempts.get(ip);

      if (record) {
        if (now < record.resetAt) {
          if (record.count >= this.maxAttempts) {
            const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
            reply.header('Retry-After', retryAfterSec.toString());
            return reply.status(429).send({
              success: false,
              error: {
                code: 'TOO_MANY_REQUESTS',
                message: 'Too many login attempts. Please wait before trying again.',
                details: { retryAfterSeconds: retryAfterSec },
              },
            });
          }
          record.count += 1;
        } else {
          // Reset window
          this.attempts.set(ip, { count: 1, resetAt: now + this.windowMs });
        }
      } else {
        this.attempts.set(ip, { count: 1, resetAt: now + this.windowMs });
      }
    };
  }

  recordSuccess(ip: string): void {
    this.attempts.delete(ip);
  }

  reset(): void {
    this.attempts.clear();
  }
}

export const loginRateLimiter = new LoginRateLimiter();
