import { PrismaClient, AuditEventType, InvestigationStatus } from '@prisma/client';
import { InvestigationRepository, investigationRepository } from './investigation.repository.js';
import { evaluationRepository } from '../evaluations/evaluation.repository.js';
import { ComplianceInvestigationAgent } from './investigation.agent.js';
import { auditService } from '../../services/audit/audit.service.js';
import {
  StartInvestigationDTO,
  HumanReviewDTO,
} from './investigation.types.js';

export class InvestigationService {
  private repository: InvestigationRepository;
  private agent: ComplianceInvestigationAgent;
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
    this.repository = investigationRepository;
    this.agent = new ComplianceInvestigationAgent(this.prisma);
  }

  async startInvestigation(dto: StartInvestigationDTO) {
    const { evaluationId, triggerType, severity, question, requesterId } = dto;

    // 1. Fetch evaluation context
    let evalItem: any = null;
    try {
      evalItem = await this.prisma.complianceEvaluation.findUnique({
        where: { id: evaluationId },
      });
    } catch {
      // Fallback
    }

    if (!evalItem) {
      evalItem = await evaluationRepository.findEvaluationById(evaluationId);
    }

    if (!evalItem) {
      throw new Error(`ComplianceEvaluation with ID ${evaluationId} not found.`);
    }

    // 2. Create investigation record in QUEUED state
    const investigation = await this.repository.createInvestigation({
      tenderId: evalItem.tenderId,
      bidderId: evalItem.bidderId,
      bidSubmissionId: evalItem.bidSubmissionId,
      evaluationId: evalItem.id,
      requirementId: evalItem.requirementId,
      ruleId: evalItem.ruleId,
      triggerType,
      severity,
      question,
      createdById: requesterId || 'procurement_officer',
    });

    // 3. Log audit event
    await auditService.log(AuditEventType.INVESTIGATION_REQUESTED, {
      tenderId: evalItem.tenderId,
      bidderId: evalItem.bidderId,
      submissionId: evalItem.bidSubmissionId,
      actor: requesterId || 'procurement_officer',
      metadata: {
        investigationId: investigation.id,
        evaluationId: evalItem.id,
        triggerType: investigation.triggerType,
      },
    });

    // 4. Run investigation agent synchronously / inline
    await this.executeInvestigationAgent(investigation.id, {
      tenderId: evalItem.tenderId,
      bidderId: evalItem.bidderId,
      bidSubmissionId: evalItem.bidSubmissionId,
      evaluationId: evalItem.id,
      requirementId: evalItem.requirementId,
      ruleId: evalItem.ruleId,
      triggerType: investigation.triggerType,
      severity: investigation.severity,
      question: investigation.question || undefined,
    });

    return (await this.repository.getInvestigationById(investigation.id)) || investigation;
  }

  private async executeInvestigationAgent(
    investigationId: string,
    context: any
  ): Promise<any> {
    try {
      await this.repository.updateInvestigationStatus(
        investigationId,
        InvestigationStatus.RUNNING,
        { startedAt: new Date() }
      );

      await auditService.log(AuditEventType.INVESTIGATION_STARTED, {
        tenderId: context.tenderId,
        bidderId: context.bidderId,
        submissionId: context.bidSubmissionId,
        metadata: { investigationId },
      });

      const { result, toolCallLogs, agentVersion, modelProvider, modelName } =
        await this.agent.runInvestigation(context);

      const updated = await this.repository.updateInvestigationResult(
        investigationId,
        result,
        toolCallLogs,
        { agentVersion, modelProvider, modelName }
      );

      const eventType = result.requiresHumanReview
        ? AuditEventType.INVESTIGATION_REQUIRES_HUMAN
        : AuditEventType.INVESTIGATION_COMPLETED;

      await auditService.log(eventType, {
        tenderId: context.tenderId,
        bidderId: context.bidderId,
        submissionId: context.bidSubmissionId,
        metadata: {
          investigationId,
          requiresHumanReview: result.requiresHumanReview,
          uncertainty: result.uncertainty,
          confidence: result.confidence,
        },
      });

      return updated;
    } catch (err: any) {
      console.error(`Investigation failed for ${investigationId}:`, err);

      await this.repository.updateInvestigationStatus(
        investigationId,
        InvestigationStatus.FAILED,
        { error: err.message, completedAt: new Date() }
      );

      await auditService.log(AuditEventType.INVESTIGATION_FAILED, {
        tenderId: context.tenderId,
        bidderId: context.bidderId,
        submissionId: context.bidSubmissionId,
        metadata: { investigationId, error: err.message },
      });
    }
  }

  async getInvestigationById(id: string) {
    const inv = await this.repository.getInvestigationById(id);
    if (!inv) {
      throw new Error(`ComplianceInvestigation with ID ${id} not found.`);
    }

    // Attach evaluation details if available
    let evalItem = await evaluationRepository.findEvaluationById(inv.evaluationId);
    return {
      ...inv,
      evaluation: evalItem || { id: inv.evaluationId, result: 'REVIEW' },
    };
  }

  async getInvestigationsForEvaluation(evaluationId: string) {
    return this.repository.getInvestigationsByEvaluationId(evaluationId);
  }

  async retryInvestigation(investigationId: string, requesterId?: string) {
    const inv = await this.getInvestigationById(investigationId);

    return this.startInvestigation({
      evaluationId: inv.evaluationId,
      triggerType: inv.triggerType,
      severity: inv.severity,
      question: inv.question || undefined,
      requesterId,
    });
  }

  async submitHumanReview(dto: HumanReviewDTO) {
    const inv = await this.getInvestigationById(dto.investigationId);

    const updated = await this.repository.submitHumanReview(dto.investigationId, {
      decision: dto.decision,
      reason: dto.reason,
      reviewedById: dto.reviewerId || 'procurement_officer',
    });

    await auditService.log(AuditEventType.INVESTIGATION_REVIEWED, {
      tenderId: inv.tenderId,
      bidderId: inv.bidderId,
      submissionId: inv.bidSubmissionId,
      actor: dto.reviewerId || 'procurement_officer',
      metadata: {
        investigationId: inv.id,
        decision: dto.decision,
        reason: dto.reason,
      },
    });

    return updated;
  }
}

export const investigationService = new InvestigationService();
