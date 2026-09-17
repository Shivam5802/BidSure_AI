export type EvaluationStatus =
  | 'PASS'
  | 'FAIL'
  | 'REVIEW'
  | 'NOT_EVALUABLE';

export type ApplicabilityStatus =
  | 'APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'UNKNOWN';

export type EvaluationRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export interface CalculationTrace {
  operation?: string;
  inputs?: Array<{
    evidenceId?: string;
    fieldKey?: string;
    rawValue?: any;
    normalizedValue?: any;
    unit?: string;
  }>;
  calculatedValue?: any;
  operator?: string;
  threshold?: any;
  unit?: string;
  formula?: string;
  comparisonResult?: boolean;
}

export interface ComplianceEvaluation {
  id: string;
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  requirementId: string;
  ruleId: string;
  ruleVersion: number;
  result: EvaluationStatus;
  applicability: ApplicabilityStatus;
  reasonCode: string;
  summary: string;
  explanation: string;
  calculationTrace: CalculationTrace | null;
  inputSnapshot: any;
  outputSnapshot: any;
  evidenceSnapshot: any;
  engineVersion: string;
  schemaVersion: string;
  evaluatedAt: string;
  evaluatedBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationRunSummary {
  runId: string;
  tenderId: string;
  bidderId: string;
  status: EvaluationRunStatus;
  totalRequirements: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  notEvaluableCount: number;
  notApplicableCount: number;
  evaluations: ComplianceEvaluation[];
}
