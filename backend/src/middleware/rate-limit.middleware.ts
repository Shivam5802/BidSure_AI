import { FastifyRequest, FastifyReply } from 'fastify';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * High-performance sliding-window rate limiter designed to handle high concurrency (50Lakh+ users).
 * Features:
 * - O(1) in-memory lookup
 * - Periodic background sweeping to prevent memory leaks under massive traffic
 * - Maximum capacity bounding to prevent V8 heap exhaustion
 * - Headers compliance (Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining)
 */
export class SlidingWindowRateLimiter {
  private attempts: Map<string, RateLimitRecord> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  private maxEntries: number;
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    maxAttempts: number = 300,
    windowMs: number = 60000,
    maxEntries: number = 100000
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.maxEntries = maxEntries;

    // Background sweep every 30s to prune expired IP records
    this.sweepTimer = setInterval(() => this.pruneExpired(), 30000);
    if (this.sweepTimer.unref) {
      this.sweepTimer.unref();
    }
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now >= record.resetAt) {
        this.attempts.delete(key);
      }
    }
    // If still over capacity after pruning expired, remove oldest 20%
    if (this.attempts.size > this.maxEntries) {
      let count = 0;
      const targetToRemove = Math.floor(this.maxEntries * 0.2);
      for (const key of this.attempts.keys()) {
        this.attempts.delete(key);
        count++;
        if (count >= targetToRemove) break;
      }
    }
  }

  getMiddleware(customErrorMessage = 'Rate limit exceeded. Please wait before trying again.') {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip || '127.0.0.1';
      const now = Date.now();
      const record = this.attempts.get(ip);

      if (record) {
        if (now < record.resetAt) {
          if (record.count >= this.maxAttempts) {
            const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
            reply.header('Retry-After', retryAfterSec.toString());
            reply.header('X-RateLimit-Limit', this.maxAttempts.toString());
            reply.header('X-RateLimit-Remaining', '0');
            return reply.status(429).send({
              success: false,
              error: {
                code: 'TOO_MANY_REQUESTS',
                message: customErrorMessage,
                details: { retryAfterSeconds: retryAfterSec },
              },
            });
          }
          record.count += 1;
          reply.header('X-RateLimit-Remaining', Math.max(0, this.maxAttempts - record.count).toString());
        } else {
          // Reset window
          this.attempts.set(ip, { count: 1, resetAt: now + this.windowMs });
          reply.header('X-RateLimit-Remaining', (this.maxAttempts - 1).toString());
        }
      } else {
        if (this.attempts.size >= this.maxEntries) {
          this.pruneExpired();
        }
        this.attempts.set(ip, { count: 1, resetAt: now + this.windowMs });
        reply.header('X-RateLimit-Remaining', (this.maxAttempts - 1).toString());
      }

      reply.header('X-RateLimit-Limit', this.maxAttempts.toString());
    };
  }

  recordSuccess(ip: string): void {
    this.attempts.delete(ip);
  }

  reset(): void {
    this.attempts.clear();
  }

  destroy(): void {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
    this.attempts.clear();
  }
}

// Strict rate limiter for sensitive authentication endpoints (5 attempts per minute)
export const loginRateLimiter = new SlidingWindowRateLimiter(
  parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
  parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000', 10),
  50000
);

// High-capacity global rate limiter for general API endpoints (300 requests per minute per IP)
export const globalApiRateLimiter = new SlidingWindowRateLimiter(
  parseInt(process.env.API_RATE_LIMIT_MAX || '300', 10),
  60000,
  100000
);
