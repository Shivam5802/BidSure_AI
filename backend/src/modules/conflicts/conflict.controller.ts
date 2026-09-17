import { FastifyRequest, FastifyReply } from 'fastify';
import { conflictService } from './conflict.service.js';
import { UpdateConflictStatusDTO } from './conflict.types.js';

export class ConflictController {
  async detectConflicts(request: FastifyRequest, reply: FastifyReply) {
    const { bidderId } = request.params as { bidderId: string };
    const { tenderId } = (request.query as { tenderId?: string }) || {};

    const result = await conflictService.detectConflictsForBidder(bidderId, tenderId);
    return reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async getConflictsForBidder(request: FastifyRequest, reply: FastifyReply) {
    const { bidderId } = request.params as { bidderId: string };

    const conflicts = await conflictService.getConflictsForBidder(bidderId);
    return reply.status(200).send({
      success: true,
      data: conflicts,
    });
  }

  async getConflictById(request: FastifyRequest, reply: FastifyReply) {
    const { conflictId } = request.params as { conflictId: string };

    const conflict = await conflictService.getConflictById(conflictId);
    return reply.status(200).send({
      success: true,
      data: conflict,
    });
  }

  async getConflictGraph(request: FastifyRequest, reply: FastifyReply) {
    const { conflictId } = request.params as { conflictId: string };

    const graph = await conflictService.getConflictGraph(conflictId);
    return reply.status(200).send({
      success: true,
      data: graph,
    });
  }

  async getLinkedEvidence(request: FastifyRequest, reply: FastifyReply) {
    const { conflictId } = request.params as { conflictId: string };

    const conflict = await conflictService.getConflictById(conflictId);
    const items = conflict.items || [];
    return reply.status(200).send({
      success: true,
      data: items,
    });
  }

  async updateConflictStatus(request: FastifyRequest, reply: FastifyReply) {
    const { conflictId } = request.params as { conflictId: string };
    const body = request.body as UpdateConflictStatusDTO;

    const updated = await conflictService.updateConflictStatus(conflictId, body);
    return reply.status(200).send({
      success: true,
      data: updated,
    });
  }

  async investigateConflict(request: FastifyRequest, reply: FastifyReply) {
    const { conflictId } = request.params as { conflictId: string };
    const { requesterId } = (request.body as { requesterId?: string }) || {};

    const result = await conflictService.startInvestigationForConflict(conflictId, requesterId);
    return reply.status(200).send({
      success: true,
      data: result,
    });
  }
}

export const conflictController = new ConflictController();
