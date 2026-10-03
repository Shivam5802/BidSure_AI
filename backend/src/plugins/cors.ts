import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../config/env.js';

export async function registerCors(app: FastifyInstance): Promise<void> {
  const allowedOrigins = env.CORS_ORIGIN
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow server-to-server / non-browser requests (no origin header)
      if (!origin) {
        cb(null, true);
        return;
      }

      const normalized = origin.trim().replace(/\/+$/, '');

      if (allowedOrigins.includes(normalized)) {
        cb(null, true);
        return;
      }

      // In development, allow localhost on any port
      if (env.NODE_ENV !== 'production') {
        try {
          const { hostname } = new URL(normalized);
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            cb(null, true);
            return;
          }
        } catch {
          // ignore invalid URLs
        }
      }

      cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });
}
