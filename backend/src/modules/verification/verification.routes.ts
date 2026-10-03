import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { VerificationController } from './verification.controller.js';

export async function verificationRoutes(fastify: FastifyInstance) {
  const prisma = (fastify as any).prisma || new PrismaClient();
  const controller = new VerificationController(prisma);

  fastify.get('/verifications/providers', controller.getProviders);
  fastify.post('/bidders/:bidderId/verifications', controller.createBidderVerification);
  fastify.get('/bidders/:bidderId/verifications', controller.getBidderVerifications);
  fastify.get('/verifications/:verificationId', controller.getVerificationDetail);
  fastify.get('/verifications/:verificationId/result', controller.getVerificationResult);
  fastify.get('/verifications/:verificationId/comparison', controller.getVerificationComparison);
  fastify.post('/verifications/:verificationId/retry', controller.retryVerification);
  fastify.post('/evidence/:evidenceId/verify-external', controller.verifyEvidence);
  fastify.post('/verifications/evidence/:evidenceId', controller.verifyEvidence);
  fastify.get('/tenders/:tenderId/verifications/summary', controller.getTenderSummary);
}
