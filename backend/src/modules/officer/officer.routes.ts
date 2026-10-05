import { FastifyInstance } from 'fastify';
import { officerController } from './officer.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function officerRoutes(app: FastifyInstance): Promise<void> {
  const officerAuth = [authenticate(false), requireRole(['PROCUREMENT_OFFICER', 'ADMIN', 'SUPER_ADMIN'])];

  // Dashboard Overview Metrics
  app.get('/officer/dashboard-stats', { preHandler: officerAuth }, officerController.getDashboardStats.bind(officerController));

  // Centralized Received Bids
  app.get('/officer/bids', { preHandler: officerAuth }, officerController.getReceivedBids.bind(officerController));

  // Human Review & Final Officer Decision
  app.post('/officer/decisions', { preHandler: officerAuth }, officerController.recordDecision.bind(officerController));

  // Clarifications Workflow
  app.get('/officer/clarifications', { preHandler: officerAuth }, officerController.listClarifications.bind(officerController));
  app.post('/officer/clarifications', { preHandler: officerAuth }, officerController.createClarification.bind(officerController));

  // Officer Notification Center
  app.get('/officer/notifications', { preHandler: officerAuth }, officerController.listNotifications.bind(officerController));
  app.patch('/officer/notifications/:id/read', { preHandler: officerAuth }, officerController.markNotificationRead.bind(officerController));
  app.post('/officer/notifications/read-all', { preHandler: officerAuth }, officerController.markAllNotificationsRead.bind(officerController));
}
