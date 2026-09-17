import { api } from './client';
import {
  ComplianceInvestigation,
  InvestigationTriggerType,
  InvestigationSeverity,
  HumanReviewDecision,
  EvidenceReference,
  ContradictionItem,
} from '@/types';

export const investigationApi = {
  startInvestigation: (
    evaluationId: string,
    data?: {
      triggerType?: InvestigationTriggerType;
      severity?: InvestigationSeverity;
      question?: string;
      requesterId?: string;
    }
  ) =>
    api.post<ComplianceInvestigation>(
      `api/evaluations/${evaluationId}/investigations`,
      data || {}
    ),

  getEvaluationInvestigations: (evaluationId: string) =>
    api.get<{
      evaluationId: string;
      count: number;
      investigations: ComplianceInvestigation[];
    }>(`api/evaluations/${evaluationId}/investigations`),

  getInvestigationDetail: (investigationId: string) =>
    api.get<ComplianceInvestigation>(`api/investigations/${investigationId}`),

  retryInvestigation: (investigationId: string, requesterId?: string) =>
    api.post<ComplianceInvestigation>(
      `api/investigations/${investigationId}/retry`,
      { requesterId }
    ),

  submitHumanReview: (
    investigationId: string,
    data: {
      decision: HumanReviewDecision;
      reason: string;
      reviewerId?: string;
    }
  ) =>
    api.post<ComplianceInvestigation>(
      `api/investigations/${investigationId}/review`,
      data
    ),

  getInvestigationEvidence: (investigationId: string) =>
    api.get<{
      investigationId: string;
      evidenceReviewed: EvidenceReference[];
      sourceReferences: EvidenceReference[];
      contradictions: ContradictionItem[];
    }>(`api/investigations/${investigationId}/evidence`),
};
