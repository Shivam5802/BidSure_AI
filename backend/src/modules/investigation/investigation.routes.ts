import { FastifyInstance } from 'fastify';
import { InvestigationController } from './investigation.controller.js';

export async function investigationRoutes(fastify: FastifyInstance) {
  const controller = new InvestigationController();

  fastify.post('/evaluations/:evaluationId/investigations', controller.startInvestigation);
  fastify.get('/evaluations/:evaluationId/investigations', controller.getEvaluationInvestigations);
  fastify.get('/investigations/:investigationId', controller.getInvestigationDetail);
  fastify.post('/investigations/:investigationId/retry', controller.retryInvestigation);
  fastify.post('/investigations/:investigationId/review', controller.submitHumanReview);
  fastify.get('/investigations/:investigationId/evidence', controller.getInvestigationEvidence);
}
