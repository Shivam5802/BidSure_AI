import { FastifyInstance } from 'fastify';
import { workspaceController } from './workspace.controller.js';

export async function workspaceRoutes(fastify: FastifyInstance) {
  fastify.get('/tenders/:tenderId/workspace', workspaceController.getWorkspaceSummary);
  fastify.get('/tenders/:tenderId/workspace/matrix', workspaceController.getComplianceMatrix);
  fastify.get('/tenders/:tenderId/workspace/actions', workspaceController.getPriorityActions);
  fastify.get('/tenders/:tenderId/workspace/why', workspaceController.getWhyExplanation);
  fastify.get('/tenders/:tenderId/workspace/search', workspaceController.searchWorkspace);
}
