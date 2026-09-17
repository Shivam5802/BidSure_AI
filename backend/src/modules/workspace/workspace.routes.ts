import { FastifyInstance } from 'fastify';
import { workspaceController } from './workspace.controller.js';

export async function workspaceRoutes(fastify: FastifyInstance) {
  // Aggregated workspace summary payload
  fastify.get('/api/tenders/:tenderId/workspace', workspaceController.getWorkspaceSummary);

  // Paginated Tender Requirement Compliance Matrix
  fastify.get('/api/tenders/:tenderId/workspace/matrix', workspaceController.getComplianceMatrix);

  // Priority Actions Queue
  fastify.get('/api/tenders/:tenderId/workspace/actions', workspaceController.getPriorityActions);

  // "Why?" evaluation trace explanation
  fastify.get('/api/tenders/:tenderId/workspace/why', workspaceController.getWhyExplanation);

  // Tender-level search
  fastify.get('/api/tenders/:tenderId/workspace/search', workspaceController.searchWorkspace);
}
