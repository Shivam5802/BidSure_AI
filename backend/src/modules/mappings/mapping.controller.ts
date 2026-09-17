import { FastifyRequest, FastifyReply } from 'fastify';
import { mappingService } from './mapping.service.js';
import { mappingRepository } from './mapping.repository.js';
import { ConfirmMappingSchema, RejectMappingSchema, UpdateMappingSchema, ManualMappingSchema } from './mapping.schema.js';

export class MappingController {
  async generateMappings(request: FastifyRequest<{ Params: { bidderId: string } }>, reply: FastifyReply) {
    const { bidderId } = request.params;
    const result = await mappingService.generateMappingsForBidder(bidderId);
    return reply.status(200).send({
      success: true,
      data: result,
      metadata: { generatedAt: new Date().toISOString() },
    });
  }

  async getBidderMappings(request: FastifyRequest<{ Params: { bidderId: string } }>, reply: FastifyReply) {
    const { bidderId } = request.params;
    const summary = await mappingService.getBidderCoverage(bidderId);
    const mappings = await mappingRepository.listMappingsByBidder(bidderId, true);
    return reply.status(200).send({
      success: true,
      data: {
        bidderId,
        summary,
        mappings,
      },
    });
  }

  async getRequirementMappings(
    request: FastifyRequest<{ Params: { requirementId: string }; Querystring: { bidderId?: string } }>,
    reply: FastifyReply
  ) {
    const { requirementId } = request.params;
    const { bidderId } = request.query;
    const mappings = await mappingRepository.listMappingsByRequirement(requirementId, bidderId, true);
    return reply.status(200).send({
      success: true,
      data: { requirementId, mappings },
    });
  }

  async getEvidenceMappings(request: FastifyRequest<{ Params: { evidenceId: string } }>, reply: FastifyReply) {
    const { evidenceId } = request.params;
    const mappings = await mappingRepository.listMappingsByEvidence(evidenceId, true);
    return reply.status(200).send({
      success: true,
      data: { evidenceId, mappings },
    });
  }

  async confirmMapping(request: FastifyRequest<{ Params: { mappingId: string } }>, reply: FastifyReply) {
    const { mappingId } = request.params;
    const body = ConfirmMappingSchema.parse(request.body || {});
    const updated = await mappingService.confirmMapping(mappingId, body.reviewer);
    return reply.status(200).send({
      success: true,
      data: updated,
    });
  }

  async rejectMapping(request: FastifyRequest<{ Params: { mappingId: string } }>, reply: FastifyReply) {
    const { mappingId } = request.params;
    const body = RejectMappingSchema.parse(request.body);
    const updated = await mappingService.rejectMapping(mappingId, body.reason, body.reviewer);
    return reply.status(200).send({
      success: true,
      data: updated,
    });
  }

  async updateMapping(request: FastifyRequest<{ Params: { mappingId: string } }>, reply: FastifyReply) {
    const { mappingId } = request.params;
    const body = UpdateMappingSchema.parse(request.body);
    const updated = await mappingRepository.updateMapping(mappingId, body);
    return reply.status(200).send({
      success: true,
      data: updated,
    });
  }

  async createManualMapping(request: FastifyRequest, reply: FastifyReply) {
    const body = ManualMappingSchema.parse(request.body);
    const mapping = await mappingService.createManualMapping(body);
    return reply.status(201).send({
      success: true,
      data: mapping,
    });
  }

  async getMappingHistory(request: FastifyRequest<{ Params: { mappingId: string } }>, reply: FastifyReply) {
    const { mappingId } = request.params;
    const history = await mappingRepository.getMappingHistory(mappingId);
    return reply.status(200).send({
      success: true,
      data: { mappingId, history },
    });
  }

  async getReviewQueue(request: FastifyRequest<{ Querystring: { tenderId?: string } }>, reply: FastifyReply) {
    const { tenderId } = request.query;
    const queue = await mappingRepository.listReviewQueue(tenderId);
    return reply.status(200).send({
      success: true,
      data: { queueCount: queue.length, items: queue },
    });
  }
}

export const mappingController = new MappingController();
