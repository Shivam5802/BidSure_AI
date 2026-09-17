import { z } from 'zod';

export const RequirementCategorySchema = z.enum([
  'ELIGIBILITY',
  'FINANCIAL',
  'TECHNICAL',
  'STATUTORY',
  'POLICY',
  'TENDER_SPECIFIC',
]);

export type RequirementCategory = z.infer<typeof RequirementCategorySchema>;

export const MandatoryStatusSchema = z.enum(['YES', 'NO', 'UNKNOWN']);
export type MandatoryStatus = z.infer<typeof MandatoryStatusSchema>;

export const RuleTypeSchema = z.enum([
  'NUMERIC',
  'DATE',
  'BOOLEAN',
  'TEXT_MATCH',
  'ENTITY_MATCH',
  'PERCENTAGE',
  'COUNT',
  'COMPOUND',
]);
export type RuleType = z.infer<typeof RuleTypeSchema>;

export const SourceReferenceSchema = z.object({
  documentId: z.string(),
  pageNumber: z.number().int().positive(),
  evidenceBlockId: z.string().optional(),
});
export type SourceReference = z.infer<typeof SourceReferenceSchema>;

export const RuleCandidateSchema = z.object({
  type: RuleTypeSchema,
  parameters: z.record(z.unknown()),
});
export type RuleCandidate = z.infer<typeof RuleCandidateSchema>;

export const ExtractedRequirementSchema = z.object({
  temporaryId: z.string().default(() => `req_${Math.random().toString(36).substring(2, 9)}`),
  clauseReference: z.string().nullable().default(null),
  requirementText: z.string().min(1),
  normalizedRequirementText: z.string().min(1),
  category: RequirementCategorySchema.default('TENDER_SPECIFIC'),
  mandatory: MandatoryStatusSchema.default('YES'),
  condition: z.string().nullable().default(null),
  evidenceRequired: z.array(z.string()).default([]),
  verificationSource: z.string().nullable().default(null),
  ruleCandidate: RuleCandidateSchema.nullable().default(null),
  confidence: z.number().min(0).max(1.0).default(0.9),
  explanation: z.string().default('Extracted from tender text.'),
  ambiguityFlag: z.boolean().default(false),
  ambiguityReason: z.string().nullable().default(null),
  sourceReferences: z.array(SourceReferenceSchema).min(1),
});

export type ExtractedRequirement = z.infer<typeof ExtractedRequirementSchema>;

export const ExtractionResultSchema = z.object({
  requirements: z.array(ExtractedRequirementSchema),
  warnings: z.array(z.string()).default([]),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

export interface RequirementChunk {
  documentId: string;
  documentName: string;
  pageNumber: number;
  evidenceBlockId?: string;
  clauseHint?: string;
  text: string;
}

export interface RequirementExtractionContext {
  tenderId: string;
  tenderTitle: string;
  referenceNumber: string;
  chunks: RequirementChunk[];
}

export interface LLMProvider {
  name: string;
  extractRequirements(context: RequirementExtractionContext): Promise<ExtractionResult>;
}
