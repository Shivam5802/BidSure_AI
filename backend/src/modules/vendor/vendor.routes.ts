import { FastifyInstance } from 'fastify';
import { vendorController } from './vendor.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function vendorRoutes(app: FastifyInstance): Promise<void> {
  const bidderAuth = { preHandler: [authenticate(true), requireRole('BIDDER')] };

  // Profile endpoints (available at both /bidder/profile and /vendor/profile)
  app.get('/bidder/profile', bidderAuth, vendorController.getProfile.bind(vendorController));
  app.put('/bidder/profile', bidderAuth, vendorController.updateProfile.bind(vendorController));
  app.get('/vendor/profile', bidderAuth, vendorController.getProfile.bind(vendorController));
  app.put('/vendor/profile', bidderAuth, vendorController.updateProfile.bind(vendorController));

  // Authorized Representative
  app.get('/bidder/representative', bidderAuth, vendorController.getRepresentative.bind(vendorController));
  app.put('/bidder/representative', bidderAuth, vendorController.updateRepresentative.bind(vendorController));
  app.get('/vendor/representative', bidderAuth, vendorController.getRepresentative.bind(vendorController));
  app.put('/vendor/representative', bidderAuth, vendorController.updateRepresentative.bind(vendorController));

  // Government Registrations & Certifications
  app.get('/bidder/registrations', bidderAuth, vendorController.listRegistrations.bind(vendorController));
  app.post('/bidder/registrations', bidderAuth, vendorController.addRegistration.bind(vendorController));
  app.put('/bidder/registrations/:id', bidderAuth, vendorController.updateRegistration.bind(vendorController));
  app.delete('/bidder/registrations/:id', bidderAuth, vendorController.deleteRegistration.bind(vendorController));
  app.post('/bidder/registrations/:id/verify', bidderAuth, vendorController.verifyRegistration.bind(vendorController));

  // Document Vault
  app.get('/bidder/documents', bidderAuth, vendorController.listDocuments.bind(vendorController));
  app.post('/bidder/documents/upload', bidderAuth, vendorController.uploadDocument.bind(vendorController));
  app.delete('/bidder/documents/:id', bidderAuth, vendorController.deleteDocument.bind(vendorController));

  // Compliance Center & Inconsistency Engine
  app.get('/bidder/compliance/summary', bidderAuth, vendorController.getComplianceSummary.bind(vendorController));
  app.get('/vendor/compliance/summary', bidderAuth, vendorController.getComplianceSummary.bind(vendorController));

  // Dashboard Overview Metrics
  app.get('/bidder/overview', bidderAuth, vendorController.getOverviewMetrics.bind(vendorController));
  app.get('/vendor/overview', bidderAuth, vendorController.getOverviewMetrics.bind(vendorController));

  // Notifications
  app.get('/bidder/notifications', bidderAuth, vendorController.listNotifications.bind(vendorController));
  app.patch('/bidder/notifications/:id/read', bidderAuth, vendorController.markNotificationRead.bind(vendorController));
  app.post('/bidder/notifications/read-all', bidderAuth, vendorController.markAllNotificationsRead.bind(vendorController));
}
