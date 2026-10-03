import { FastifyInstance } from 'fastify';
import { conflictController } from './conflict.controller.js';

export async function conflictRoutes(fastify: FastifyInstance) {
  fastify.post('/bidders/:bidderId/conflicts/detect', conflictController.detectConflicts);
  fastify.get('/bidders/:bidderId/conflicts', conflictController.getConflictsForBidder);
  fastify.get('/conflicts/:conflictId', conflictController.getConflictById);
  fastify.get('/conflicts/:conflictId/graph', conflictController.getConflictGraph);
  fastify.get('/conflicts/:conflictId/evidence', conflictController.getLinkedEvidence);
  fastify.patch('/conflicts/:conflictId/status', conflictController.updateConflictStatus);
  fastify.post('/conflicts/:conflictId/investigate', conflictController.investigateConflict);
}
