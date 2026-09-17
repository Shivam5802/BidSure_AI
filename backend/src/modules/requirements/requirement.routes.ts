import { FastifyInstance } from 'fastify';
import {
  triggerRequirementExtractionHandler,
  getBlueprintHandler,
  getBlueprintVersionsHandler,
  listRequirementsHandler,
  getRequirementHandler,
  updateRequirementHandler,
  approveRequirementHandler,
  rejectRequirementHandler,
  lockBlueprintHandler,
} from './requirement.controller.js';

export async function requirementRoutes(app: FastifyInstance): Promise<void> {
  // Requirement Extraction Trigger
  app.post('/tenders/:tenderId/requirements/extract', triggerRequirementExtractionHandler);

  // Blueprint Operations
  app.get('/tenders/:tenderId/blueprint', getBlueprintHandler);
  app.get('/tenders/:tenderId/blueprint/versions', getBlueprintVersionsHandler);
  app.post('/tenders/:tenderId/blueprint/lock', lockBlueprintHandler);

  // Requirement CRUD & Operations
  app.get('/tenders/:tenderId/requirements', listRequirementsHandler);
  app.get('/tenders/:tenderId/requirements/:requirementId', getRequirementHandler);
  app.patch('/tenders/:tenderId/requirements/:requirementId', updateRequirementHandler);
  app.post('/tenders/:tenderId/requirements/:requirementId/approve', approveRequirementHandler);
  app.post('/tenders/:tenderId/requirements/:requirementId/reject', rejectRequirementHandler);
}
