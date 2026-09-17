import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../config/env.js';

export async function registerCors(app: FastifyInstance): Promise<void> {
  const rawOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
  const allowedOrigins = rawOrigins.map((origin) => origin.replace(/\/+$/, ''));

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile, curl, SSR, server-to-server)
      if (!origin) {
        cb(null, true);
        return;
      }

      const normalized = origin.trim().replace(/\/+$/, '');

      // Direct match (ignoring trailing slash)
      if (allowedOrigins.includes(normalized)) {
        cb(null, true);
        return;
      }

      // Check if domain is a Vercel deployment (e.g. preview branch or production)
      try {
        const parsedUrl = new URL(normalized);
        const isVercelHost = parsedUrl.hostname.endsWith('.vercel.app');
        const allowsAnyVercel = allowedOrigins.some((o) => o.includes('vercel.app'));

        if (isVercelHost && (allowsAnyVercel || env.NODE_ENV !== 'production')) {
          cb(null, true);
          return;
        }
      } catch {
        // Invalid origin format
      }

      cb(new Error(`Origin '${origin}' not allowed by CORS policy`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });
}
