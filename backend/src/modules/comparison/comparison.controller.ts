import { FastifyRequest, FastifyReply } from 'fastify';
import { comparisonService, ComparisonService } from './comparison.service.js';
import {
  TenderComparisonParamsSchema,
  RequirementComparisonParamsSchema,
  ComparisonSummaryQuerySchema,
  ComparisonMatrixQuerySchema,
} from './comparison.schemas.js';
import { createSuccessResponse } from '../../utils/response.js';

export class ComparisonController {
  private service: ComparisonService;

  constructor(service?: ComparisonService) {
    this.service = service || comparisonService;
  }

  getComparisonSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = TenderComparisonParamsSchema.parse(request.params);
    const query = ComparisonSummaryQuerySchema.parse(request.query);

    let bidderIds: string[] | undefined;
    if (query.bidderIds) {
      bidderIds = Array.isArray(query.bidderIds)
        ? query.bidderIds
        : query.bidderIds.split(',').map((s) => s.trim());
    }

    const summary = await this.service.getComparisonSummary(params.tenderId, bidderIds);
    return reply.status(200).send(createSuccessResponse(summary));
  };

  getComparisonMatrix = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = TenderComparisonParamsSchema.parse(request.params);
    const query = ComparisonMatrixQuerySchema.parse(request.query);

    let bidderIds: string[] | undefined;
    if (query.bidderIds) {
      bidderIds = Array.isArray(query.bidderIds)
        ? query.bidderIds
        : query.bidderIds.split(',').map((s) => s.trim());
    }

    const matrix = await this.service.getComparisonMatrix(params.tenderId, {
      ...query,
      bidderIds,
    });
    return reply.status(200).send(createSuccessResponse(matrix));
  };

  getRequirementComparisonDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = RequirementComparisonParamsSchema.parse(request.params);
    const query = ComparisonSummaryQuerySchema.parse(request.query);

    let bidderIds: string[] = [];
    if (query.bidderIds) {
      bidderIds = Array.isArray(query.bidderIds)
        ? query.bidderIds
        : query.bidderIds.split(',').map((s) => s.trim());
    }

    const detail = await this.service.getRequirementComparisonDetail(
      params.tenderId,
      params.requirementId,
      bidderIds
    );
    return reply.status(200).send(createSuccessResponse(detail));
  };

  getBidderComparisonDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenderId, bidderId } = request.params as { tenderId: string; bidderId: string };
    const summary = await this.service.getComparisonSummary(tenderId, [bidderId]);
    return reply.status(200).send(createSuccessResponse(summary));
  };
}

export const comparisonController = new ComparisonController();

