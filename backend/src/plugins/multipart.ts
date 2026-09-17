import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { env } from '../config/env.js';

export async function registerMultipart(app: FastifyInstance): Promise<void> {
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_TENDER_FILE_SIZE_MB * 1024 * 1024,
      files: 20, // Allow up to 20 files per batch
    },
    attachFieldsToBody: false,
  });
}
