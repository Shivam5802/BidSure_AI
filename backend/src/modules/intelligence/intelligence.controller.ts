import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { IntelligenceAnalyticsService } from './services/intelligenceAnalytics.service.js';
import { IndicatorCategory, IndicatorSeverity } from './types/intelligence.types.js';
import { createErrorResponse } from '../../utils/response.js';

export class IntelligenceController {
  private service: IntelligenceAnalyticsService;

  constructor(_prisma: PrismaClient) {
    this.service = new IntelligenceAnalyticsService(_prisma);
  }

  private async checkTenderExists(tenderId: string): Promise<boolean> {
    return this.service.checkTenderExists(tenderId);
  }

  private sendTenderNotFound(reply: FastifyReply, tenderId: string) {
    return reply.status(404).send(createErrorResponse('NOT_FOUND', `Tender ${tenderId} not found`));
  }

  getSummary = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const snapshot = await this.service.getTenderHealthSnapshot(tenderId);

    return reply.send({
      success: true,
      data: snapshot,
    });
  };

  getIndicatorsAndActions = async (
    request: FastifyRequest<{
      Params: { tenderId: string };
      Querystring: { severity?: IndicatorSeverity; category?: IndicatorCategory; bidderId?: string };
    }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const result = await this.service.getIndicatorsAndActions(tenderId, request.query);

    return reply.send({
      success: true,
      data: result,
    });
  };

  getComplianceDistribution = async (
    request: FastifyRequest<{
      Params: { tenderId: string };
      Querystring: { category?: string; mandatory?: string };
    }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const dist = await this.service.getComplianceDistribution(tenderId, request.query);

    return reply.send({
      success: true,
      data: {
        tenderId,
        compliance: dist,
      },
    });
  };

  getEvidenceCoverage = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const coverage = await this.service.getEvidenceCoverageAnalytics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        evidenceCoverage: coverage,
      },
    });
  };

  getBidderAnalytics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const bidders = await this.service.getBidderAnalytics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        count: bidders.length,
        bidders,
      },
    });
  };

  getDocumentProcessing = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const processing = await this.service.getDocumentProcessingAnalytics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        processing,
      },
    });
  };

  getVerificationAnalytics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const verifications = await this.service.getVerificationAnalytics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        verifications,
      },
    });
  };

  getInvestigationAnalytics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const investigations = await this.service.getInvestigationAnalytics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        investigations,
      },
    });
  };

  getConflictAnalytics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const conflicts = await this.service.getConflictAnalytics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        conflicts,
      },
    });
  };

  getAuditabilityMetrics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const auditability = await this.service.getAuditabilityMetrics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        auditability,
      },
    });
  };

  getPerformanceMetrics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const performance = await this.service.getSystemPerformanceMetrics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        performance,
      },
    });
  };

  getEffortAnalytics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const effort = await this.service.getEffortAnalytics(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        effort,
      },
    });
  };

  getAiContributionAnalytics = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const contribution = this.service.getAiContributionAnalytics();

    return reply.send({
      success: true,
      data: contribution,
    });
  };

  recordBenchmark = async (
    request: FastifyRequest<{ Params: { tenderId: string }; Body: any }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const body = (request.body as any) || {};

    const session = await this.service.recordBenchmarkSession({
      tenderId,
      scenarioName: body.scenarioName || 'Default Demo Scenario',
      baselineMethod: body.baselineMethod || 'MANUAL_ESTIMATE',
      baselineDurationSeconds: body.baselineDurationSeconds || 2700, // 45 mins
      bidguardDurationSeconds: body.bidguardDurationSeconds || 480, // 8 mins
      requirementsCount: body.requirementsCount || 0,
      documentsCount: body.documentsCount || 0,
      operators: body.operators,
      notes: body.notes,
    });

    return reply.status(201).send({
      success: true,
      data: session,
    });
  };

  getBenchmarks = async (
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ) => {
    const { tenderId } = request.params;
    if (!(await this.checkTenderExists(tenderId))) {
      return this.sendTenderNotFound(reply, tenderId);
    }
    const sessions = await this.service.getBenchmarkSessions(tenderId);

    return reply.send({
      success: true,
      data: {
        tenderId,
        count: sessions.length,
        benchmarks: sessions,
      },
    });
  };
}
