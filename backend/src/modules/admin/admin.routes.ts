import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { demoService } from '../demo/demo.service.js';
import { officerController } from './officer.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Demo Reset - strictly restricted to ADMIN role
  app.post(
    '/admin/demo-reset',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await demoService.seedCanonicalDemo();
        return reply.status(200).send({
          success: true,
          message: 'Canonical demo dataset has been successfully reset and initialized.',
          data: result,
        });
      } catch (err: any) {
        console.error('SEED_CANONICAL_DEMO_ERROR:', err);
        return reply.status(500).send({
          success: false,
          error: { code: 'DEMO_SEED_ERROR', message: err?.message || String(err) },
        });
      }
    }
  );

  // Demo Status & Validation - accessible to Officer & Admin
  app.get(
    '/admin/demo-status',
    {
      preHandler: [authenticate(false), requireRole(['ADMIN', 'PROCUREMENT_OFFICER'])],
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await demoService.validateDemoState();
      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  // Officer Management Endpoints - strictly restricted to ADMIN role
  app.get(
    '/admin/officers',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    officerController.listOfficers.bind(officerController)
  );

  app.post(
    '/admin/officers',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    officerController.createOfficer.bind(officerController)
  );

  app.get(
    '/admin/officers/:id',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    officerController.getOfficer.bind(officerController)
  );

  app.patch(
    '/admin/officers/:id',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    officerController.updateOfficer.bind(officerController)
  );

  app.post(
    '/admin/officers/:id/activate',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    officerController.activateOfficer.bind(officerController)
  );

  app.post(
    '/admin/officers/:id/deactivate',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    officerController.deactivateOfficer.bind(officerController)
  );

  app.get(
    '/admin/officers/:id/activity',
    {
      preHandler: [authenticate(true), requireRole('ADMIN')],
    },
    officerController.getOfficerActivity.bind(officerController)
  );
}
