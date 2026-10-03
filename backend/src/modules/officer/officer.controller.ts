import { FastifyRequest, FastifyReply } from 'fastify';
import { officerService } from './officer.service.js';
import { CreateClarificationInput, RecordOfficerDecisionInput } from './officer.types.js';

export class OfficerController {
  async getDashboardStats(request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const stats = await officerService.getDashboardStats(user?.id);
      return reply.send({ success: true, data: stats });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        error: { code: 'OFFICER_STATS_ERROR', message: err?.message || 'Failed to fetch dashboard statistics' },
      });
    }
  }

  async getReceivedBids(request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      const { tenderId, status } = (request.query as any) || {};
      const bids = await officerService.getReceivedBids(tenderId, status);
      return reply.send({ success: true, data: bids });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        error: { code: 'OFFICER_BIDS_ERROR', message: err?.message || 'Failed to fetch received bids' },
      });
    }
  }

  async recordDecision(request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const officerId = user?.id || 'usr_officer_demo_01';
      const officerName = user?.name || user?.email || 'Senior Procurement Officer';

      const body = request.body as RecordOfficerDecisionInput;
      const result = await officerService.recordDecision(body, officerId, officerName);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(400).send({
        success: false,
        error: { code: 'OFFICER_DECISION_ERROR', message: err?.message || 'Failed to record officer decision' },
      });
    }
  }

  async listClarifications(request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      const query = (request.query as any) || {};
      const items = await officerService.listClarifications(query);
      return reply.send({ success: true, data: items });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        error: { code: 'CLARIFICATION_LIST_ERROR', message: err?.message || 'Failed to list clarifications' },
      });
    }
  }

  async createClarification(request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const officerId = user?.id || 'usr_officer_demo_01';
      const officerName = user?.name || user?.email || 'Senior Procurement Officer';

      const body = request.body as CreateClarificationInput;
      const created = await officerService.createClarification(body, officerId, officerName);
      return reply.status(201).send({ success: true, data: created });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(400).send({
        success: false,
        error: { code: 'CLARIFICATION_CREATE_ERROR', message: err?.message || 'Failed to issue clarification' },
      });
    }
  }

  async listNotifications(_request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      const notifs = await officerService.listNotifications();
      return reply.send({ success: true, data: notifs });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'NOTIFICATIONS_FETCH_ERROR', message: err?.message || 'Failed to list notifications' },
      });
    }
  }

  async markNotificationRead(request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      const id = (request.params as any)?.id;
      const success = await officerService.markNotificationRead(id);
      return reply.send({ success });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'NOTIFICATION_UPDATE_ERROR', message: err?.message || 'Failed to mark notification read' },
      });
    }
  }

  async markAllNotificationsRead(_request: FastifyRequest<any>, reply: FastifyReply) {
    try {
      await officerService.markAllNotificationsRead();
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'NOTIFICATIONS_UPDATE_ERROR', message: err?.message || 'Failed to mark all read' },
      });
    }
  }
}

export const officerController = new OfficerController();
