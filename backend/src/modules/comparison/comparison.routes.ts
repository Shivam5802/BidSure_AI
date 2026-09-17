import { FastifyInstance } from 'fastify';
import { comparisonController } from './comparison.controller.js';

export async function comparisonRoutes(fastify: FastifyInstance) {
  // Summary endpoint for comparison landing & bidder selection cards
  fastify.get('/api/tenders/:tenderId/comparison/summary', comparisonController.getComparisonSummary);

  // Main requirement comparison matrix endpoint
  fastify.get('/api/tenders/:tenderId/comparison/matrix', comparisonController.getComparisonMatrix);

  // Side-by-side requirement comparison detail drawer endpoint
  fastify.get(
    '/api/tenders/:tenderId/comparison/requirements/:requirementId',
    comparisonController.getRequirementComparisonDetail
  );

  // Specific bidder comparison detail endpoint
  fastify.get(
    '/api/tenders/:tenderId/comparison/bidders/:bidderId',
    comparisonController.getBidderComparisonDetail
  );
}
