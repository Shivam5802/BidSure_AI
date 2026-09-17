import { z } from 'zod';

export const TenderIdParamSchema = z.object({
  tenderId: z.string().uuid().or(z.string().min(1)),
});

export const RequirementIdParamSchema = z.object({
  tenderId: z.string().optional(),
  requirementId: z.string().min(1),
});

export const RequirementFilterQuerySchema = z.object({
  category: z
    .enum(['ELIGIBILITY', 'FINANCIAL', 'TECHNICAL', 'STATUTORY', 'POLICY', 'TENDER_SPECIFIC'])
    .optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'CONFLICT', 'APPROVED', 'REJECTED']).optional(),
  ambiguity: z.coerce.boolean().optional(),
  conflict: z.coerce.boolean().optional(),
  duplicate: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const UpdateRequirementBodySchema = z.object({
  clauseReference: z.string().nullable().optional(),
  requirementText: z.string().min(1).optional(),
  category: z
    .enum(['ELIGIBILITY', 'FINANCIAL', 'TECHNICAL', 'STATUTORY', 'POLICY', 'TENDER_SPECIFIC'])
    .optional(),
  mandatory: z.enum(['YES', 'NO', 'UNKNOWN']).optional(),
  condition: z.string().nullable().optional(),
  evidenceRequired: z.array(z.string()).optional(),
  verificationSource: z.string().nullable().optional(),
  ruleType: z
    .enum([
      'NUMERIC',
      'DATE',
      'BOOLEAN',
      'TEXT_MATCH',
      'ENTITY_MATCH',
      'PERCENTAGE',
      'COUNT',
      'COMPOUND',
    ])
    .nullable()
    .optional(),
  ruleParameters: z.record(z.unknown()).optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'CONFLICT', 'APPROVED', 'REJECTED']).optional(),
});
