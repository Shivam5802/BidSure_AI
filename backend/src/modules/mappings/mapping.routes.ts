import { FastifyInstance } from 'fastify';
import { mappingController } from './mapping.controller.js';

export async function mappingRoutes(app: FastifyInstance) {
  // Bidder Mappings & Generation
  app.post('/bidders/:bidderId/mappings/generate', (req, reply) => mappingController.generateMappings(req as any, reply));
  app.get('/bidders/:bidderId/mappings', (req, reply) => mappingController.getBidderMappings(req as any, reply));

  // Requirement & Evidence Mappings
  app.get('/requirements/:requirementId/mappings', (req, reply) => mappingController.getRequirementMappings(req as any, reply));
  app.get('/evidence/:evidenceId/mappings', (req, reply) => mappingController.getEvidenceMappings(req as any, reply));

  // Officer Review & Manual Mapping
  app.post('/mappings/:mappingId/confirm', (req, reply) => mappingController.confirmMapping(req as any, reply));
  app.post('/mappings/:mappingId/reject', (req, reply) => mappingController.rejectMapping(req as any, reply));
  app.patch('/mappings/:mappingId', (req, reply) => mappingController.updateMapping(req as any, reply));
  app.post('/mappings/manual', (req, reply) => mappingController.createManualMapping(req, reply));
  app.get('/mappings/:mappingId/history', (req, reply) => mappingController.getMappingHistory(req as any, reply));

  // Review Queue
  app.get('/mappings/review-queue', (req, reply) => mappingController.getReviewQueue(req as any, reply));
}
