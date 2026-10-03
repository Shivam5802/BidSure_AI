import { FastifyRequest, FastifyReply } from 'fastify';
import { adminService } from './admin.service.js';
import { UserRole, UserStatus } from '@prisma/client';

export class AdminController {
  async getDashboardStats(_request: FastifyRequest, reply: FastifyReply) {
    const stats = await adminService.getDashboardMetrics();
    return reply.status(200).send({
      success: true,
      data: stats,
    });
  }

  async listUsers(request: FastifyRequest, reply: FastifyReply) {
    const query = (request.query || {}) as { search?: string; role?: string; status?: string; page?: string; limit?: string };
    const res = await adminService.listUsers({
      search: query.search,
      role: query.role,
      status: query.status,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
    });
    return reply.status(200).send({
      success: true,
      data: res.users,
      pagination: res.pagination,
    });
  }

  async getUserDetail(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const detail = await adminService.getUserDetail(id);
    if (!detail) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }
    return reply.status(200).send({
      success: true,
      data: detail,
    });
  }

  async updateUserStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status, reason } = (request.body || {}) as { status: UserStatus; reason?: string };

    if (!id || !['ACTIVE', 'DISABLED'].includes(status)) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Valid status (ACTIVE or DISABLED) required.' },
      });
    }

    if (!reason || reason.trim().length < 5) {
      return reply.status(400).send({
        success: false,
        error: { code: 'REASON_REQUIRED', message: 'An administrative reason (minimum 5 characters) is required for status changes.' },
      });
    }

    const actor = request.user?.email || 'admin@gem.gov.in';

    try {
      const updated = await adminService.updateUserStatus(id, status, reason, actor);
      return reply.status(200).send({
        success: true,
        message: `Account status updated to ${status}.`,
        data: updated,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'STATUS_UPDATE_ERROR', message: err.message },
      });
    }
  }

  async updateUserRole(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { role, reason } = (request.body || {}) as { role: UserRole; reason?: string };

    if (!role) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Target role is required.' },
      });
    }

    if (!reason || reason.trim().length < 5) {
      return reply.status(400).send({
        success: false,
        error: { code: 'REASON_REQUIRED', message: 'An audit reason (minimum 5 characters) is required for role modification.' },
      });
    }

    const actorRole = request.user?.role || 'ADMIN';
    const actorEmail = request.user?.email || 'admin@gem.gov.in';

    try {
      const updated = await adminService.updateUserRole(id, role, reason, actorRole, actorEmail);
      return reply.status(200).send({
        success: true,
        message: `Role successfully changed to ${role}.`,
        data: updated,
      });
    } catch (err: any) {
      return reply.status(403).send({
        success: false,
        error: { code: 'ROLE_UPDATE_DENIED', message: err.message },
      });
    }
  }

  async addUserNote(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { note } = (request.body || {}) as { note: string };

    if (!note || note.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_NOTE', message: 'Note content cannot be empty.' },
      });
    }

    const authorId = request.user?.sub || 'usr_admin';
    const authorName = request.user?.email?.split('@')[0] || 'Administrator';

    try {
      const entry = await adminService.addUserNote(id, note, authorId, authorName);
      return reply.status(201).send({
        success: true,
        data: entry,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message },
      });
    }
  }

  async getRolesMatrix(_request: FastifyRequest, reply: FastifyReply) {
    const data = adminService.getRolesAndPermissions();
    return reply.status(200).send({
      success: true,
      data,
    });
  }

  async getTenderOversight(request: FastifyRequest, reply: FastifyReply) {
    const query = (request.query || {}) as { search?: string; status?: string };
    const data = await adminService.getTenderOversight(query);
    return reply.status(200).send({
      success: true,
      data,
    });
  }

  async getBidMonitoring(request: FastifyRequest, reply: FastifyReply) {
    const query = (request.query || {}) as { search?: string; status?: string; tenderId?: string };
    const data = await adminService.getBidMonitoring(query);
    return reply.status(200).send({
      success: true,
      data,
    });
  }

  async getComplianceRules(_request: FastifyRequest, reply: FastifyReply) {
    const rules = adminService.getComplianceRules();
    return reply.status(200).send({
      success: true,
      data: rules,
    });
  }

  async updateComplianceRule(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { enabled, parameters, reason } = (request.body || {}) as {
      enabled?: boolean;
      parameters?: Record<string, any>;
      reason?: string;
    };

    if (!reason || reason.trim().length < 5) {
      return reply.status(400).send({
        success: false,
        error: { code: 'REASON_REQUIRED', message: 'Justification reason is required for rule modification.' },
      });
    }

    const actor = request.user?.email || 'admin@gem.gov.in';

    try {
      const updated = adminService.updateComplianceRule(id, { enabled, parameters, reason }, actor);
      return reply.status(200).send({
        success: true,
        message: 'Compliance rule parameters updated with new version established.',
        data: updated,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message },
      });
    }
  }

  async getIntegrations(_request: FastifyRequest, reply: FastifyReply) {
    const integrations = adminService.getIntegrations();
    return reply.status(200).send({
      success: true,
      data: integrations,
    });
  }

  async testIntegration(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const actor = request.user?.email || 'admin@gem.gov.in';

    try {
      const result = await adminService.testIntegration(id, actor);
      return reply.status(200).send({
        success: true,
        message: `Health check completed for ${result.name}.`,
        data: result,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'TEST_FAILED', message: err.message },
      });
    }
  }

  async updateIntegration(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { enabled, mode } = (request.body || {}) as { enabled?: boolean; mode?: any };
    const actor = request.user?.email || 'admin@gem.gov.in';

    try {
      const result = adminService.updateIntegration(id, { enabled, mode }, actor);
      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message },
      });
    }
  }

  async getAuditLogs(request: FastifyRequest, reply: FastifyReply) {
    const query = (request.query || {}) as { actor?: string; event?: string; search?: string; limit?: string };
    const data = await adminService.getAuditLogs({
      actor: query.actor,
      event: query.event,
      search: query.search,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
    });
    return reply.status(200).send({
      success: true,
      data,
    });
  }

  async getSystemHealth(_request: FastifyRequest, reply: FastifyReply) {
    const health = adminService.getSystemHealth();
    return reply.status(200).send({
      success: true,
      data: health,
    });
  }

  async getIncidents(request: FastifyRequest, reply: FastifyReply) {
    const query = (request.query || {}) as { status?: string; severity?: string };
    const incidents = adminService.getIncidents(query);
    return reply.status(200).send({
      success: true,
      data: incidents,
    });
  }

  async createIncident(request: FastifyRequest, reply: FastifyReply) {
    const body = (request.body || {}) as { title: string; category: any; severity: any; description: string };
    if (!body.title || !body.description) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Incident title and description are required.' },
      });
    }
    const actor = request.user?.email || 'admin@gem.gov.in';
    const incident = adminService.createIncident(body, actor);
    return reply.status(201).send({
      success: true,
      data: incident,
    });
  }

  async updateIncident(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as { status?: any; assignedTo?: string; resolutionNotes?: string };
    const actor = request.user?.email || 'admin@gem.gov.in';

    try {
      const incident = adminService.updateIncident(id, body, actor);
      return reply.status(200).send({
        success: true,
        data: incident,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message },
      });
    }
  }

  async getSettings(_request: FastifyRequest, reply: FastifyReply) {
    const settings = adminService.getSettings();
    return reply.status(200).send({
      success: true,
      data: settings,
    });
  }

  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    const body = (request.body || {}) as any;
    const actor = request.user?.email || 'admin@gem.gov.in';
    const updated = adminService.updateSettings(body, actor);
    return reply.status(200).send({
      success: true,
      message: 'Platform settings saved successfully.',
      data: updated,
    });
  }
}

export const adminController = new AdminController();
