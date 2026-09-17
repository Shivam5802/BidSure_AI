import { z } from 'zod';
import {
  InvestigationStatus,
  InvestigationTriggerType,
  InvestigationSeverity,
  HumanReviewDecision,
} from '@prisma/client';

export {
  InvestigationStatus,
  InvestigationTriggerType,
  InvestigationSeverity,
  HumanReviewDecision,
};

export const EvidenceReferenceSchema = z.object({
  evidenceId: z.string().nullable().default(null),
  documentId: z.string().nullable().default(null),
  documentName: z.string().optional(),
  pageId: z.string().nullable().default(null),
  pageNumber: z.number().int().optional(),
  fieldKey: z.string().optional(),
  sourceText: z.string().optional(),
  rawValue: z.any().optional(),
  normalizedValue: z.any().optional(),
});
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;

export const ContradictionItemSchema = z.object({
  documentA: z.string(),
  documentB: z.string(),
  pageA: z.number().optional(),
  pageB: z.number().optional(),
  valueA: z.any(),
  valueB: z.any(),
  fieldKey: z.string(),
  description: z.string(),
});
export type ContradictionItem = z.infer<typeof ContradictionItemSchema>;

export const InvestigationResultSchema = z.object({
  caseSummary: z.string().min(1),
  issueType: z.nativeEnum(InvestigationTriggerType),
  finding: z.string().min(1),
  evidenceReviewed: z.array(EvidenceReferenceSchema).default([]),
  contradictions: z.array(ContradictionItemSchema).default([]),
  missingEvidence: z.array(z.string()).default([]),
  knownFacts: z.array(z.string()).default([]),
  unknownFacts: z.array(z.string()).default([]),
  reasoningSteps: z.array(z.string()).min(1),
  recommendation: z.string().min(1),
  recommendedHumanAction: z.string().min(1),
  uncertainty: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  confidence: z.number().min(0.0).max(1.0).default(0.8),
  requiresHumanReview: z.boolean().default(true),
  sourceReferences: z.array(EvidenceReferenceSchema).default([]),
});
export type InvestigationResult = z.infer<typeof InvestigationResultSchema>;

export interface InvestigationToolCallLog {
  toolName: string;
  targetEntityType: string;
  targetEntityId: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface StartInvestigationDTO {
  evaluationId: string;
  triggerType?: InvestigationTriggerType;
  severity?: InvestigationSeverity;
  question?: string;
  requesterId?: string;
}

export interface HumanReviewDTO {
  investigationId: string;
  decision: HumanReviewDecision;
  reason: string;
  reviewerId?: string;
}
