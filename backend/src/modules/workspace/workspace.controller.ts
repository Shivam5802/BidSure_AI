import { FastifyRequest, FastifyReply } from 'fastify';
import { workspaceService } from './workspace.service.js';
import { MatrixQueryDTO } from './workspace.types.js';

export class WorkspaceController {
  async getWorkspaceSummary(request: FastifyRequest, reply: FastifyReply) {
    const { tenderId } = request.params as { tenderId: string };

    const summary = await workspaceService.getWorkspaceSummary(tenderId);
    return reply.status(200).send({
      success: true,
      data: summary,
    });
  }

  async getComplianceMatrix(request: FastifyRequest, reply: FastifyReply) {
    const { tenderId } = request.params as { tenderId: string };
    const query = (request.query as MatrixQueryDTO) || {};

    const matrix = await workspaceService.getComplianceMatrix(tenderId, query);
    return reply.status(200).send({
      success: true,
      data: matrix,
    });
  }

  async getPriorityActions(request: FastifyRequest, reply: FastifyReply) {
    const { tenderId } = request.params as { tenderId: string };
    const query = (request.query as any) || {};

    const actions = await workspaceService.getPriorityActions(tenderId, query);
    return reply.status(200).send({
      success: true,
      data: actions,
    });
  }

  async getWhyExplanation(request: FastifyRequest, reply: FastifyReply) {
    const { tenderId } = request.params as { tenderId: string };
    const { requirementId, bidderId } = (request.query as { requirementId: string; bidderId: string }) || {};

    if (!requirementId || !bidderId) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'requirementId and bidderId query params are required.' },
      });
    }

    const explanation = await workspaceService.getWhyExplanation(tenderId, requirementId, bidderId);
    return reply.status(200).send({
      success: true,
      data: explanation,
    });
  }

  async searchWorkspace(request: FastifyRequest, reply: FastifyReply) {
    const { tenderId } = request.params as { tenderId: string };
    const { q } = (request.query as { q?: string }) || {};

    const results = await workspaceService.searchWorkspace(tenderId, q || '');
    return reply.status(200).send({
      success: true,
      data: results,
    });
  }
}

export const workspaceController = new WorkspaceController();
