import { FastifyInstance } from 'fastify';
import { applicationController } from './application.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function applicationRoutes(app: FastifyInstance): Promise<void> {
  // Bidder Profile
  app.get(
    '/bidder/profile',
    { preHandler: [authenticate(true), requireRole('BIDDER')] },
    applicationController.getProfile.bind(applicationController)
  );

  app.put(
    '/bidder/profile',
    { preHandler: [authenticate(true), requireRole('BIDDER')] },
    applicationController.updateProfile.bind(applicationController)
  );

  // Bidder Applications
  app.post(
    '/tenders/:tenderId/apply',
    { preHandler: [authenticate(true), requireRole('BIDDER')] },
    applicationController.applyToTender.bind(applicationController)
  );

  app.get(
    '/bidder/applications',
    { preHandler: [authenticate(true), requireRole('BIDDER')] },
    applicationController.listMyApplications.bind(applicationController)
  );

  app.get(
    '/bidder/applications/:id',
    { preHandler: [authenticate(true), requireRole(['BIDDER', 'PROCUREMENT_OFFICER', 'ADMIN'])] },
    applicationController.getApplication.bind(applicationController)
  );

  app.post(
    '/bidder/applications/:id/documents',
    { preHandler: [authenticate(true), requireRole('BIDDER')] },
    applicationController.uploadDocument.bind(applicationController)
  );

  app.delete(
    '/bidder/applications/:id/documents/:documentId',
    { preHandler: [authenticate(true), requireRole('BIDDER')] },
    applicationController.deleteDocument.bind(applicationController)
  );

  app.post(
    '/bidder/applications/:id/submit',
    { preHandler: [authenticate(true), requireRole('BIDDER')] },
    applicationController.submitApplication.bind(applicationController)
  );

  // Officer View Applications
  app.get(
    '/tenders/:tenderId/applications',
    { preHandler: [authenticate(false), requireRole(['PROCUREMENT_OFFICER', 'ADMIN'])] },
    applicationController.listTenderApplications.bind(applicationController)
  );
}
