import { FastifyRequest, FastifyReply } from 'fastify';
import { InvestigationService } from './investigation.service.js';
import {
  StartInvestigationSchema,
  SubmitHumanReviewSchema,
} from './investigation.schemas.js';

export class InvestigationController {
  private service: InvestigationService;

  constructor(service?: InvestigationService) {
    this.service = service || new InvestigationService();
  }

  startInvestigation = async (
    request: FastifyRequest<{ Params: { evaluationId: string }; Body: unknown }>,
    reply: FastifyReply
  ) => {
    const { evaluationId } = request.params;
    const body = StartInvestigationSchema.parse(request.body || {});

    const investigation = await this.service.startInvestigation({
      evaluationId,
      ...body,
    });

    return reply.status(201).send({
      success: true,
      data: investigation,
    });
  };

  getEvaluationInvestigations = async (
    request: FastifyRequest<{ Params: { evaluationId: string } }>,
    reply: FastifyReply
  ) => {
    const { evaluationId } = request.params;
    const investigations = await this.service.getInvestigationsForEvaluation(evaluationId);

    return reply.send({
      success: true,
      data: {
        evaluationId,
        count: investigations.length,
        investigations,
      },
    });
  };

  getInvestigationDetail = async (
    request: FastifyRequest<{ Params: { investigationId: string } }>,
    reply: FastifyReply
  ) => {
    const { investigationId } = request.params;
    const investigation = await this.service.getInvestigationById(investigationId);

    return reply.send({
      success: true,
      data: investigation,
    });
  };

  retryInvestigation = async (
    request: FastifyRequest<{ Params: { investigationId: string }; Body: { requesterId?: string } }>,
    reply: FastifyReply
  ) => {
    const { investigationId } = request.params;
    const body = request.body || {};

    const retried = await this.service.retryInvestigation(investigationId, body.requesterId);

    return reply.status(201).send({
      success: true,
      data: retried,
    });
  };

  submitHumanReview = async (
    request: FastifyRequest<{ Params: { investigationId: string }; Body: unknown }>,
    reply: FastifyReply
  ) => {
    const { investigationId } = request.params;
    const body = SubmitHumanReviewSchema.parse(request.body);

    const updated = await this.service.submitHumanReview({
      investigationId,
      ...body,
    });

    return reply.send({
      success: true,
      data: updated,
    });
  };

  getInvestigationEvidence = async (
    request: FastifyRequest<{ Params: { investigationId: string } }>,
    reply: FastifyReply
  ) => {
    const { investigationId } = request.params;
    const investigation = await this.service.getInvestigationById(investigationId);

    const resultData = (investigation.resultData as any) || {};

    return reply.send({
      success: true,
      data: {
        investigationId,
        evidenceReviewed: resultData.evidenceReviewed || [],
        sourceReferences: resultData.sourceReferences || [],
        contradictions: resultData.contradictions || [],
      },
    });
  };
}
