import { FastifyInstance } from 'fastify';
import { conflictController } from './conflict.controller.js';

export async function conflictRoutes(fastify: FastifyInstance) {
  // Trigger contradiction detection for a bidder
  fastify.post('/api/bidders/:bidderId/conflicts/detect', conflictController.detectConflicts);

  // List all detected conflicts for a bidder
  fastify.get('/api/bidders/:bidderId/conflicts', conflictController.getConflictsForBidder);

  // Get specific conflict detail
  fastify.get('/api/conflicts/:conflictId', conflictController.getConflictById);

  // Get visual evidence conflict graph for a conflict
  fastify.get('/api/conflicts/:conflictId/graph', conflictController.getConflictGraph);

  // Get linked source evidence items for a conflict
  fastify.get('/api/conflicts/:conflictId/evidence', conflictController.getLinkedEvidence);

  // Update conflict review status / record human resolution
  fastify.patch('/api/conflicts/:conflictId/status', conflictController.updateConflictStatus);

  // Trigger AI investigation for conflict (Feature 1H integration)
  fastify.post('/api/conflicts/:conflictId/investigate', conflictController.investigateConflict);
}
