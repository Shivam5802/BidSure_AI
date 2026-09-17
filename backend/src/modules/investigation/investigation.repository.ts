import {
  ComplianceInvestigation,
  InvestigationStatus,
  InvestigationTriggerType,
  InvestigationSeverity,
  HumanReviewDecision,
} from '@prisma/client';
import { InvestigationResult } from './investigation.types.js';

export class InvestigationRepository {
  private inMemoryInvestigations = new Map<string, ComplianceInvestigation>();

  clear() {
    this.inMemoryInvestigations.clear();
  }

  async createInvestigation(data: {
    tenderId: string;
    bidderId: string;
    bidSubmissionId: string;
    evaluationId: string;
    requirementId: string;
    ruleId?: string | null;
    triggerType?: InvestigationTriggerType;
    severity?: InvestigationSeverity;
    question?: string;
    createdById?: string;
  }): Promise<ComplianceInvestigation> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const record: ComplianceInvestigation = {
      id,
      tenderId: data.tenderId,
      bidderId: data.bidderId,
      bidSubmissionId: data.bidSubmissionId,
      evaluationId: data.evaluationId,
      requirementId: data.requirementId,
      ruleId: data.ruleId || null,
      triggerType: data.triggerType || InvestigationTriggerType.EVALUATION_REVIEW,
      status: InvestigationStatus.QUEUED,
      severity: data.severity || InvestigationSeverity.MEDIUM,
      question: data.question || null,
      summary: null,
      finding: null,
      recommendation: null,
      uncertainty: 'MEDIUM',
      confidence: 0.8,
      resultData: null,
      toolCallLogs: null,
      agentVersion: '1.0.0',
      modelProvider: 'gemini',
      modelName: 'gemini-2.5-flash',
      startedAt: null,
      completedAt: null,
      createdById: data.createdById || 'procurement_officer',
      reviewedById: null,
      reviewedAt: null,
      reviewDecision: null,
      reviewReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryInvestigations.set(id, record);
    return record;
  }

  async getInvestigationById(id: string): Promise<ComplianceInvestigation | null> {
    return this.inMemoryInvestigations.get(id) || null;
  }

  async getInvestigationsByEvaluationId(evaluationId: string): Promise<ComplianceInvestigation[]> {
    return Array.from(this.inMemoryInvestigations.values())
      .filter((inv) => inv.evaluationId === evaluationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getInvestigationsByTenderId(
    tenderId: string,
    status?: InvestigationStatus
  ): Promise<ComplianceInvestigation[]> {
    return Array.from(this.inMemoryInvestigations.values())
      .filter((inv) => inv.tenderId === tenderId && (!status || inv.status === status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateInvestigationStatus(
    id: string,
    status: InvestigationStatus,
    extra?: { startedAt?: Date; completedAt?: Date; error?: string }
  ): Promise<ComplianceInvestigation> {
    const existing = this.inMemoryInvestigations.get(id);
    if (!existing) {
      throw new Error(`ComplianceInvestigation ${id} not found.`);
    }

    const updated: ComplianceInvestigation = {
      ...existing,
      status,
      ...(extra?.startedAt ? { startedAt: extra.startedAt } : {}),
      ...(extra?.completedAt ? { completedAt: extra.completedAt } : {}),
      ...(extra?.error ? { summary: `Error: ${extra.error}` } : {}),
      updatedAt: new Date(),
    };

    this.inMemoryInvestigations.set(id, updated);
    return updated;
  }

  async updateInvestigationResult(
    id: string,
    result: InvestigationResult,
    toolCallLogs: any[],
    meta: { agentVersion: string; modelProvider: string; modelName: string }
  ): Promise<ComplianceInvestigation> {
    const existing = this.inMemoryInvestigations.get(id);
    if (!existing) {
      throw new Error(`ComplianceInvestigation ${id} not found.`);
    }

    const finalStatus = result.requiresHumanReview
      ? InvestigationStatus.REQUIRES_HUMAN
      : InvestigationStatus.COMPLETED;

    const updated: ComplianceInvestigation = {
      ...existing,
      status: finalStatus,
      summary: result.caseSummary,
      finding: result.finding,
      recommendation: result.recommendation,
      uncertainty: result.uncertainty,
      confidence: result.confidence,
      resultData: JSON.parse(JSON.stringify(result)),
      toolCallLogs: JSON.parse(JSON.stringify(toolCallLogs)),
      agentVersion: meta.agentVersion,
      modelProvider: meta.modelProvider,
      modelName: meta.modelName,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryInvestigations.set(id, updated);
    return updated;
  }

  async submitHumanReview(
    id: string,
    reviewData: {
      decision: HumanReviewDecision;
      reason: string;
      reviewedById?: string;
    }
  ): Promise<ComplianceInvestigation> {
    const existing = this.inMemoryInvestigations.get(id);
    if (!existing) {
      throw new Error(`ComplianceInvestigation ${id} not found.`);
    }

    const newStatus =
      reviewData.decision === HumanReviewDecision.MARK_RESOLVED ||
      reviewData.decision === HumanReviewDecision.ACCEPT_RECOMMENDATION
        ? InvestigationStatus.COMPLETED
        : InvestigationStatus.REQUIRES_HUMAN;

    const updated: ComplianceInvestigation = {
      ...existing,
      status: newStatus,
      reviewDecision: reviewData.decision,
      reviewReason: reviewData.reason,
      reviewedById: reviewData.reviewedById || 'procurement_officer',
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryInvestigations.set(id, updated);
    return updated;
  }
}

export const investigationRepository = new InvestigationRepository();
