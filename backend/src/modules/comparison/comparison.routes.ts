import { FastifyInstance } from 'fastify';
import { comparisonController } from './comparison.controller.js';

export async function comparisonRoutes(fastify: FastifyInstance) {
  fastify.get('/tenders/:tenderId/comparison/summary', comparisonController.getComparisonSummary);
  fastify.get('/tenders/:tenderId/comparison/matrix', comparisonController.getComparisonMatrix);
  fastify.get(
    '/tenders/:tenderId/comparison/requirements/:requirementId',
    comparisonController.getRequirementComparisonDetail
  );
  fastify.get(
    '/tenders/:tenderId/comparison/bidders/:bidderId',
    comparisonController.getBidderComparisonDetail
  );
}
