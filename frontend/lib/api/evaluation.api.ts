import { api } from './client';
import {
  ComplianceEvaluation,
  EvaluationRunSummary,
  CalculationTrace,
} from '@/types';

export const evaluationApi = {
  runBidderEvaluation: (bidderId: string, evaluator = 'procurement_officer') =>
    api.post<EvaluationRunSummary>(`api/evaluations/bidder/${bidderId}/run`, { evaluator }),

  getBidderEvaluations: (bidderId: string) =>
    api.get<{ bidderId: string; summary: EvaluationRunSummary; evaluations: ComplianceEvaluation[] }>(
      `api/evaluations/bidder/${bidderId}`
    ),

  getEvaluationTrace: (evaluationId: string) =>
    api.get<{ evaluationId: string; trace: CalculationTrace | null; evaluation: ComplianceEvaluation }>(
      `api/evaluations/${evaluationId}/trace`
    ),

  getEvaluationHistory: (evaluationId: string) =>
    api.get<{ evaluationId: string; history: ComplianceEvaluation[] }>(
      `api/evaluations/${evaluationId}/history`
    ),

  runTenderAllBiddersEvaluation: (tenderId: string, evaluator = 'procurement_officer') =>
    api.post<{ tenderId: string; totalBidders: number; runs: EvaluationRunSummary[] }>(
      `api/evaluations/tenders/${tenderId}/run-all`,
      { evaluator }
    ),
};
