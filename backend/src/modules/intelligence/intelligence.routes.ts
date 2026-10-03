import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { IntelligenceController } from './intelligence.controller.js';

export async function intelligenceRoutes(fastify: FastifyInstance) {
  const prisma = (fastify as any).prisma || new PrismaClient();
  const controller = new IntelligenceController(prisma);

  // Health snapshot (aliased)
  fastify.get('/tenders/:tenderId/intelligence/summary', controller.getSummary);
  fastify.get('/tenders/:tenderId/intelligence/health-snapshot', controller.getSummary);

  // Indicators & Priority Action Queue (aliased)
  fastify.get('/tenders/:tenderId/intelligence/indicators', controller.getIndicatorsAndActions);
  fastify.get('/tenders/:tenderId/intelligence/actions', controller.getIndicatorsAndActions);
  fastify.get('/tenders/:tenderId/intelligence/priority-queue', controller.getIndicatorsAndActions);

  // Analytics endpoints
  fastify.get('/tenders/:tenderId/intelligence/compliance', controller.getComplianceDistribution);
  fastify.get('/tenders/:tenderId/intelligence/compliance-distribution', controller.getComplianceDistribution);
  fastify.get('/tenders/:tenderId/intelligence/evidence', controller.getEvidenceCoverage);
  fastify.get('/tenders/:tenderId/intelligence/evidence-coverage', controller.getEvidenceCoverage);
  fastify.get('/tenders/:tenderId/intelligence/bidders', controller.getBidderAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/bidder-analytics', controller.getBidderAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/processing', controller.getDocumentProcessing);
  fastify.get('/tenders/:tenderId/intelligence/verification', controller.getVerificationAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/external-verification', controller.getVerificationAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/investigations', controller.getInvestigationAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/investigation-summary', controller.getInvestigationAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/conflicts', controller.getConflictAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/auditability', controller.getAuditabilityMetrics);
  fastify.get('/tenders/:tenderId/intelligence/auditability-metrics', controller.getAuditabilityMetrics);
  fastify.get('/tenders/:tenderId/intelligence/performance', controller.getPerformanceMetrics);
  fastify.get('/tenders/:tenderId/intelligence/effort', controller.getEffortAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/effort-analytics', controller.getEffortAnalytics);
  fastify.get('/tenders/:tenderId/intelligence/ai-contribution', controller.getAiContributionAnalytics);

  // Benchmark recording & retrieval (aliased)
  fastify.post('/tenders/:tenderId/intelligence/benchmark', controller.recordBenchmark);
  fastify.get('/tenders/:tenderId/intelligence/benchmark', controller.getBenchmarks);
  fastify.post('/tenders/:tenderId/intelligence/benchmark-sessions', controller.recordBenchmark);
  fastify.get('/tenders/:tenderId/intelligence/benchmark-sessions', controller.getBenchmarks);
}
