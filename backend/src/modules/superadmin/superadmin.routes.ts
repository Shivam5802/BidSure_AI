import { FastifyInstance } from 'fastify';
import { superAdminController } from './superadmin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function superAdminRoutes(app: FastifyInstance): Promise<void> {
  // Pre-handler hook strictly enforced for all Super Admin endpoints
  const superAdminAuth = [authenticate(true), requireRole('SUPER_ADMIN')];

  // 1. Live Infrastructure & Telemetry Metrics
  app.get('/super-admin/metrics', { preHandler: superAdminAuth }, superAdminController.getSystemMetrics.bind(superAdminController));

  // 2. Administrator & Staff Governance
  app.get('/super-admin/admins', { preHandler: superAdminAuth }, superAdminController.listAdministrators.bind(superAdminController));
  app.post('/super-admin/admins', { preHandler: superAdminAuth }, superAdminController.createAdministrator.bind(superAdminController));
  app.patch('/super-admin/admins/:id/status', { preHandler: superAdminAuth }, superAdminController.updateAdminStatus.bind(superAdminController));

  // 3. Security Vault, Threat Logs & IP Firewall
  app.get('/super-admin/security-logs', { preHandler: superAdminAuth }, superAdminController.getSecurityLogs.bind(superAdminController));
  app.post('/super-admin/firewall/blacklist', { preHandler: superAdminAuth }, superAdminController.addBlacklistIp.bind(superAdminController));
  app.delete('/super-admin/firewall/blacklist/:ip', { preHandler: superAdminAuth }, superAdminController.removeBlacklistIp.bind(superAdminController));

  // 4. System Configurations & Feature Flags
  app.get('/super-admin/system-config', { preHandler: superAdminAuth }, superAdminController.getSystemConfig.bind(superAdminController));
  app.put('/super-admin/system-config', { preHandler: superAdminAuth }, superAdminController.updateSystemConfig.bind(superAdminController));

  // 5. Operations & Disaster Recovery
  app.post('/super-admin/maintenance/backup', { preHandler: superAdminAuth }, superAdminController.triggerBackup.bind(superAdminController));
  app.post('/super-admin/maintenance/purge-cache', { preHandler: superAdminAuth }, superAdminController.purgeCache.bind(superAdminController));
  app.post('/super-admin/emergency-lockdown', { preHandler: superAdminAuth }, superAdminController.toggleLockdown.bind(superAdminController));
}
