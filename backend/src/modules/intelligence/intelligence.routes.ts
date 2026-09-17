import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { IntelligenceController } from './intelligence.controller.js';

export async function intelligenceRoutes(fastify: FastifyInstance) {
  const prisma = (fastify as any).prisma || new PrismaClient();
  const controller = new IntelligenceController(prisma);

  // High-level tender health snapshot
  fastify.get('/api/tenders/:tenderId/intelligence/summary', controller.getSummary);
  fastify.get('/api/tenders/:tenderId/intelligence/health-snapshot', controller.getSummary);

  // Indicators & Priority Action Queue
  fastify.get('/api/tenders/:tenderId/intelligence/indicators', controller.getIndicatorsAndActions);
  fastify.get('/api/tenders/:tenderId/intelligence/actions', controller.getIndicatorsAndActions);
  fastify.get('/api/tenders/:tenderId/intelligence/priority-queue', controller.getIndicatorsAndActions);

  // Granular analytics
  fastify.get('/api/tenders/:tenderId/intelligence/compliance', controller.getComplianceDistribution);
  fastify.get('/api/tenders/:tenderId/intelligence/compliance-distribution', controller.getComplianceDistribution);
  fastify.get('/api/tenders/:tenderId/intelligence/evidence', controller.getEvidenceCoverage);
  fastify.get('/api/tenders/:tenderId/intelligence/evidence-coverage', controller.getEvidenceCoverage);
  fastify.get('/api/tenders/:tenderId/intelligence/bidders', controller.getBidderAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/bidder-analytics', controller.getBidderAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/processing', controller.getDocumentProcessing);
  fastify.get('/api/tenders/:tenderId/intelligence/verification', controller.getVerificationAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/external-verification', controller.getVerificationAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/investigations', controller.getInvestigationAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/investigation-summary', controller.getInvestigationAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/conflicts', controller.getConflictAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/auditability', controller.getAuditabilityMetrics);
  fastify.get('/api/tenders/:tenderId/intelligence/auditability-metrics', controller.getAuditabilityMetrics);
  fastify.get('/api/tenders/:tenderId/intelligence/performance', controller.getPerformanceMetrics);
  fastify.get('/api/tenders/:tenderId/intelligence/effort', controller.getEffortAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/effort-analytics', controller.getEffortAnalytics);
  fastify.get('/api/tenders/:tenderId/intelligence/ai-contribution', controller.getAiContributionAnalytics);

  // Prototype benchmark recording & retrieval
  fastify.post('/api/tenders/:tenderId/intelligence/benchmark', controller.recordBenchmark);
  fastify.get('/api/tenders/:tenderId/intelligence/benchmark', controller.getBenchmarks);
  fastify.post('/api/tenders/:tenderId/intelligence/benchmark-sessions', controller.recordBenchmark);
  fastify.get('/api/tenders/:tenderId/intelligence/benchmark-sessions', controller.getBenchmarks);
}
