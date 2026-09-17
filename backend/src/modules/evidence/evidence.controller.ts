import { FastifyRequest, FastifyReply } from 'fastify';
import { evidenceService } from './evidence.service.js';
import {
  HumanCorrectionSchema,
  VerifyFactSchema,
  RejectFactSchema,
  AddManualEvidenceSchema,
} from './evidence.schema.js';

export class EvidenceController {
  async triggerExtraction(
    request: FastifyRequest<{ Params: { documentId: string } }>,
    reply: FastifyReply
  ) {
    const { documentId } = request.params;
    const result = await evidenceService.triggerExtraction(documentId);

    return reply.status(202).send({
      success: true,
      message: result.message,
      data: result.run,
    });
  }

  async getEvidenceForDocument(
    request: FastifyRequest<{ Params: { documentId: string } }>,
    reply: FastifyReply
  ) {
    const { documentId } = request.params;
    const result = await evidenceService.getEvidenceForDocument(documentId);

    return reply.send({
      success: true,
      data: result,
    });
  }

  async getEvidenceById(
    request: FastifyRequest<{ Params: { evidenceId: string } }>,
    reply: FastifyReply
  ) {
    const { evidenceId } = request.params;
    const result = await evidenceService.getEvidenceById(evidenceId);

    return reply.send({
      success: true,
      data: result,
    });
  }

  async updateEvidenceByHuman(
    request: FastifyRequest<{ Params: { evidenceId: string } }>,
    reply: FastifyReply
  ) {
    const { evidenceId } = request.params;
    const body = HumanCorrectionSchema.parse(request.body);

    const updated = await evidenceService.updateEvidenceByHuman(evidenceId, {
      rawValue: body.rawValue,
      normalizedValue: body.normalizedValue,
      valueType: body.valueType,
      unit: body.unit,
      reason: body.reason,
      reviewer: body.reviewer || (request as any).user?.name || 'Procurement Officer',
    });

    return reply.send({
      success: true,
      message: 'Evidence fact updated and verified by human officer.',
      data: updated,
    });
  }

  async verifyEvidenceFact(
    request: FastifyRequest<{ Params: { evidenceId: string } }>,
    reply: FastifyReply
  ) {
    const { evidenceId } = request.params;
    const body = VerifyFactSchema.parse(request.body || {});

    const reviewer = body.reviewer || (request as any).user?.name || 'Procurement Officer';
    const updated = await evidenceService.verifyEvidenceFact(evidenceId, reviewer);

    return reply.send({
      success: true,
      message: 'Evidence fact verified successfully.',
      data: updated,
    });
  }

  async rejectEvidenceFact(
    request: FastifyRequest<{ Params: { evidenceId: string } }>,
    reply: FastifyReply
  ) {
    const { evidenceId } = request.params;
    const body = RejectFactSchema.parse(request.body);

    const reviewer = body.reviewer || (request as any).user?.name || 'Procurement Officer';
    const updated = await evidenceService.rejectEvidenceFact(evidenceId, reviewer, body.reason);

    return reply.send({
      success: true,
      message: 'Evidence fact rejected.',
      data: updated,
    });
  }

  async addManualEvidence(
    request: FastifyRequest<{ Params: { documentId: string } }>,
    reply: FastifyReply
  ) {
    const { documentId } = request.params;
    const body = AddManualEvidenceSchema.parse(request.body);

    const reviewer = body.reviewer || (request as any).user?.name || 'Procurement Officer';

    const item = await evidenceService.addManualEvidence({
      bidDocumentId: documentId,
      fieldKey: body.fieldKey,
      rawValue: body.rawValue,
      pageNumber: body.pageNumber,
      sourceText: body.sourceText,
      reviewer,
      reason: body.reason,
    });

    return reply.status(201).send({
      success: true,
      message: 'Manual evidence fact added successfully.',
      data: item,
    });
  }
}

export const evidenceController = new EvidenceController();
