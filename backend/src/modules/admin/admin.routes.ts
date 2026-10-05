import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { demoService } from '../demo/demo.service.js';
import { officerController } from './officer.controller.js';
import { adminController } from './admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const adminAuth = [authenticate(true), requireRole(['ADMIN', 'SUPER_ADMIN'])];

  // 1. Demo Reset & Validation
  app.post(
    '/admin/demo-reset',
    {
      preHandler: adminAuth,
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

  app.get(
    '/admin/demo-status',
    {
      preHandler: [authenticate(false), requireRole(['ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_OFFICER'])],
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await demoService.validateDemoState();
      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  // 2. Operational Overview & Metrics
  app.get('/admin/metrics', { preHandler: adminAuth }, adminController.getDashboardStats.bind(adminController));

  // 3. Centralized User Directory & User Actions
  app.get('/admin/users', { preHandler: adminAuth }, adminController.listUsers.bind(adminController));
  app.get('/admin/users/:id', { preHandler: adminAuth }, adminController.getUserDetail.bind(adminController));
  app.patch('/admin/users/:id/status', { preHandler: adminAuth }, adminController.updateUserStatus.bind(adminController));
  app.patch('/admin/users/:id/role', { preHandler: adminAuth }, adminController.updateUserRole.bind(adminController));
  app.post('/admin/users/:id/notes', { preHandler: adminAuth }, adminController.addUserNote.bind(adminController));

  // 4. Roles & Permission Capabilities
  app.get('/admin/roles/matrix', { preHandler: adminAuth }, adminController.getRolesMatrix.bind(adminController));

  // 5. Tender & Bid Oversight
  app.get('/admin/tenders', { preHandler: adminAuth }, adminController.getTenderOversight.bind(adminController));
  app.get('/admin/bids', { preHandler: adminAuth }, adminController.getBidMonitoring.bind(adminController));

  // 6. Statutory Compliance Rules Configuration
  app.get('/admin/compliance-rules', { preHandler: adminAuth }, adminController.getComplianceRules.bind(adminController));
  app.patch('/admin/compliance-rules/:id', { preHandler: adminAuth }, adminController.updateComplianceRule.bind(adminController));

  // 7. Verification Integrations & Health Ping
  app.get('/admin/integrations', { preHandler: adminAuth }, adminController.getIntegrations.bind(adminController));
  app.post('/admin/integrations/:id/test', { preHandler: adminAuth }, adminController.testIntegration.bind(adminController));
  app.patch('/admin/integrations/:id', { preHandler: adminAuth }, adminController.updateIntegration.bind(adminController));

  // 8. Centralized Audit Logs
  app.get('/admin/audit-logs', { preHandler: adminAuth }, adminController.getAuditLogs.bind(adminController));

  // 9. System Health Telemetry
  app.get('/admin/system-health', { preHandler: adminAuth }, adminController.getSystemHealth.bind(adminController));

  // 10. Incidents Desk & Management
  app.get('/admin/incidents', { preHandler: adminAuth }, adminController.getIncidents.bind(adminController));
  app.post('/admin/incidents', { preHandler: adminAuth }, adminController.createIncident.bind(adminController));
  app.patch('/admin/incidents/:id', { preHandler: adminAuth }, adminController.updateIncident.bind(adminController));

  // 11. Platform Settings
  app.get('/admin/settings', { preHandler: adminAuth }, adminController.getSettings.bind(adminController));
  app.put('/admin/settings', { preHandler: adminAuth }, adminController.updateSettings.bind(adminController));

  // 12. Officer Management Endpoints (Preserved for backward compatibility)
  app.get('/admin/officers', { preHandler: adminAuth }, officerController.listOfficers.bind(officerController));
  app.post('/admin/officers', { preHandler: adminAuth }, officerController.createOfficer.bind(officerController));
  app.get('/admin/officers/:id', { preHandler: adminAuth }, officerController.getOfficer.bind(officerController));
  app.patch('/admin/officers/:id', { preHandler: adminAuth }, officerController.updateOfficer.bind(officerController));
  app.post('/admin/officers/:id/activate', { preHandler: adminAuth }, officerController.activateOfficer.bind(officerController));
  app.post('/admin/officers/:id/deactivate', { preHandler: adminAuth }, officerController.deactivateOfficer.bind(officerController));
  app.get('/admin/officers/:id/activity', { preHandler: adminAuth }, officerController.getOfficerActivity.bind(officerController));
}
