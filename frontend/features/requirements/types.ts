export type RequirementCategory =
  | 'ELIGIBILITY'
  | 'FINANCIAL'
  | 'TECHNICAL'
  | 'STATUTORY'
  | 'POLICY'
  | 'TENDER_SPECIFIC';

export type RequirementStatus = 'DRAFT' | 'REVIEW' | 'CONFLICT' | 'APPROVED' | 'REJECTED';

export type BlueprintStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'LOCKED';

export type MandatoryStatus = 'YES' | 'NO' | 'UNKNOWN';

export type RuleType =
  | 'NUMERIC'
  | 'DATE'
  | 'BOOLEAN'
  | 'TEXT_MATCH'
  | 'ENTITY_MATCH'
  | 'PERCENTAGE'
  | 'COUNT'
  | 'COMPOUND';

export interface SourceReference {
  id?: string;
  documentId: string;
  pageNumber: number;
  evidenceBlockId?: string;
}

export interface RuleCandidate {
  type: RuleType;
  parameters: Record<string, any>;
}

export interface TenderRequirement {
  id: string;
  blueprintId: string;
  requirementCode: string;
  clauseReference: string | null;
  requirementText: string;
  normalizedRequirementText: string;
  category: RequirementCategory;
  mandatory: MandatoryStatus;
  condition: string | null;
  evidenceRequired: string[];
  verificationSource: string | null;
  ruleType: RuleType | null;
  ruleParameters: Record<string, any> | null;
  extractionConfidence: number;
  status: RequirementStatus;
  ambiguityFlag: boolean;
  ambiguityReason: string | null;
  conflictFlag: boolean;
  conflictReason: string | null;
  duplicateFlag: boolean;
  duplicateOfRequirementId: string | null;
  aiExplanation: string;
  sourcePageIds: string[];
  sourceEvidenceBlockIds: string[];
  sourceReferences: SourceReference[];
  createdAt: string;
  updatedAt: string;
}

export interface BlueprintSummary {
  total: number;
  financial: number;
  technical: number;
  statutory: number;
  eligibility: number;
  policy: number;
  tenderSpecific: number;
  reviewRequired: number;
  conflicts: number;
  duplicates: number;
  approved: number;
}

export interface ComplianceBlueprint {
  id: string;
  tenderId: string;
  version: number;
  status: BlueprintStatus;
  createdBy?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  approvedAt?: string | null;
}

export interface BlueprintData {
  blueprint: ComplianceBlueprint;
  summary: BlueprintSummary;
  requirements: TenderRequirement[];
}

export interface RequirementFilterState {
  category: string;
  status: string;
  ambiguity: boolean;
  conflict: boolean;
  duplicate: boolean;
  search: string;
}
