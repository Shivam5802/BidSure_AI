import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { VerificationService } from './services/verification.service.js';
import {
  createVerificationRequestSchema,
  verifyEvidenceSchema,
  retryVerificationSchema,
  verificationListQuerySchema,
} from './schemas/verification.schemas.js';

export class VerificationController {
  private service: VerificationService;

  constructor(prisma: PrismaClient) {
    this.service = new VerificationService(prisma);
  }

  createBidderVerification = async (
    request: FastifyRequest<{ Params: { bidderId: string }; Body: unknown }>,
    reply: FastifyReply
  ) => {
    const { bidderId } = request.params;
    const body = createVerificationRequestSchema.parse(request.body);

    const result = await this.service.createVerificationRequest({
      bidderId,
      ...body,
    });

    return reply.status(201).send({
      success: true,
      data: result,
    });
  };

  getBidderVerifications = async (
    request: FastifyRequest<{ Params: { bidderId: string }; Querystring: unknown }>,
    reply: FastifyReply
  ) => {
    const { bidderId } = request.params;
    const query = verificationListQuerySchema.parse(request.query || {});

    const history = await this.service.getBidderVerifications(bidderId, {
      verificationType: query.verificationType,
      status: query.status,
    });

    return reply.send({
      success: true,
      data: {
        bidderId,
        count: history.length,
        verifications: history,
      },
    });
  };

  getVerificationDetail = async (
    request: FastifyRequest<{ Params: { verificationId: string } }>,
    reply: FastifyReply
  ) => {
    const { verificationId } = request.params;
    const details = await this.service.getVerificationDetails(verificationId);

    if (!details) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'VERIFICATION_NOT_FOUND',
          message: `Verification request ${verificationId} not found`,
        },
      });
    }

    return reply.send({
      success: true,
      data: details,
    });
  };

  getVerificationResult = async (
    request: FastifyRequest<{ Params: { verificationId: string } }>,
    reply: FastifyReply
  ) => {
    const { verificationId } = request.params;
    const details = await this.service.getVerificationDetails(verificationId);

    if (!details || !details.results || details.results.length === 0) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'VERIFICATION_RESULT_NOT_FOUND',
          message: `Result for verification ${verificationId} not found`,
        },
      });
    }

    return reply.send({
      success: true,
      data: details.results[0],
    });
  };

  getVerificationComparison = async (
    request: FastifyRequest<{ Params: { verificationId: string } }>,
    reply: FastifyReply
  ) => {
    const { verificationId } = request.params;
    const details = await this.service.getVerificationDetails(verificationId);

    if (!details || !details.results || details.results.length === 0) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'VERIFICATION_RESULT_NOT_FOUND',
          message: `Comparison for verification ${verificationId} not found`,
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        verificationId,
        comparisons: details.results[0]?.comparisons || [],
      },
    });
  };

  retryVerification = async (
    request: FastifyRequest<{ Params: { verificationId: string }; Body: unknown }>,
    reply: FastifyReply
  ) => {
    const { verificationId } = request.params;
    retryVerificationSchema.parse(request.body || {});

    const retried = await this.service.retryVerification(verificationId);

    return reply.status(200).send({
      success: true,
      data: retried,
    });
  };

  verifyEvidence = async (
    request: FastifyRequest<{ Params: { evidenceId: string }; Body: unknown }>,
    reply: FastifyReply
  ) => {
    const { evidenceId } = request.params;
    const body = verifyEvidenceSchema.parse(request.body);

    const result = await this.service.verifyFromEvidence(evidenceId, {
      tenderId: body.tenderId,
      bidderId: body.bidderId,
      providerCode: body.providerCode,
    });

    return reply.status(201).send({
      success: true,
      data: result,
    });
  };

  getTenderSummary = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    const summary = await this.service.getTenderSummary(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        summary,
      },
    });
  };

  getProviders = async (_request: FastifyRequest, reply: FastifyReply) => {
    const providers = await this.service.getProviders();

    return reply.send({
      success: true,
      data: {
        count: providers.length,
        providers,
      },
    });
  };
}
