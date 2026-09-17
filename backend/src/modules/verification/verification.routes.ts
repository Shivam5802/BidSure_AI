import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { VerificationController } from './verification.controller.js';

export async function verificationRoutes(fastify: FastifyInstance) {
  const prisma = (fastify as any).prisma || new PrismaClient();
  const controller = new VerificationController(prisma);

  // Provider registry list
  fastify.get('/api/verifications/providers', controller.getProviders);

  // Bidder verification endpoints
  fastify.post('/api/bidders/:bidderId/verifications', controller.createBidderVerification);
  fastify.get('/api/bidders/:bidderId/verifications', controller.getBidderVerifications);

  // Verification request details, result & cross-check comparison
  fastify.get('/api/verifications/:verificationId', controller.getVerificationDetail);
  fastify.get('/api/verifications/:verificationId/result', controller.getVerificationResult);
  fastify.get('/api/verifications/:verificationId/comparison', controller.getVerificationComparison);
  fastify.post('/api/verifications/:verificationId/retry', controller.retryVerification);

  // Evidence direct verify endpoint
  fastify.post('/api/evidence/:evidenceId/verify-external', controller.verifyEvidence);
  fastify.post('/api/verifications/evidence/:evidenceId', controller.verifyEvidence);

  // Tender-level summary
  fastify.get('/api/tenders/:tenderId/verifications/summary', controller.getTenderSummary);
}
