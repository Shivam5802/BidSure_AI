import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../config/env.js';

export async function registerCors(app: FastifyInstance): Promise<void> {
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) in development
      if (!origin && env.NODE_ENV !== 'production') {
        cb(null, true);
        return;
      }

      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }

      cb(new Error(`Origin '${origin}' not allowed by CORS policy`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });
}
