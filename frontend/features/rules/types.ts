export type RuleStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'DISABLED';

export type RuleType =
  | 'NUMERIC'
  | 'DATE'
  | 'BOOLEAN'
  | 'TEXT_MATCH'
  | 'ENTITY_MATCH'
  | 'PERCENTAGE'
  | 'COUNT'
  | 'COMPOUND'
  | 'CONDITIONAL'
  | 'INFORMATIONAL';

export type EvaluationStatus = 'PASS' | 'FAIL' | 'NOT_EVALUABLE' | 'REVIEW';

export interface ComplianceRule {
  id: string;
  blueprintId: string;
  requirementId: string;
  ruleCode: string;
  name: string;
  description: string | null;
  ruleType: RuleType;
  definition: Record<string, any>;
  status: RuleStatus;
  version: number;
  createdBy?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
}

export interface RuleEvaluationResult {
  status: EvaluationStatus;
  reason: string;
  ruleId?: string;
  ruleVersion?: number;
  requirementId?: string;
  engineVersion: string;
  evaluatedAt: string;
  inputs?: {
    actual: unknown;
    required: unknown;
    metricOrField?: string;
  };
  nestedResults?: RuleEvaluationResult[];
}

export interface RuleCoverageStatistics {
  totalRequirements: number;
  totalRules: number;
  approvedRules: number;
  reviewRules: number;
  draftRules: number;
  disabledRules: number;
  byType: Record<string, number>;
}

export interface RuleFilterState {
  status: string;
  ruleType: string;
  search: string;
}
