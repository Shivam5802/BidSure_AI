import { FastifyInstance } from 'fastify';
import { InvestigationController } from './investigation.controller.js';

export async function investigationRoutes(fastify: FastifyInstance) {
  const controller = new InvestigationController();

  // Start an investigation for an evaluation result
  fastify.post('/api/evaluations/:evaluationId/investigations', controller.startInvestigation);

  // List all investigations for an evaluation result
  fastify.get('/api/evaluations/:evaluationId/investigations', controller.getEvaluationInvestigations);

  // Get investigation details
  fastify.get('/api/investigations/:investigationId', controller.getInvestigationDetail);

  // Retry an investigation
  fastify.post('/api/investigations/:investigationId/retry', controller.retryInvestigation);

  // Submit human officer review decision
  fastify.post('/api/investigations/:investigationId/review', controller.submitHumanReview);

  // Get evidence references used by investigation
  fastify.get('/api/investigations/:investigationId/evidence', controller.getInvestigationEvidence);
}
