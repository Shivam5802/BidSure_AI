import { z } from 'zod';

export const TenderIdParamSchema = z.object({
  tenderId: z.string().min(1),
});

export const RuleIdParamSchema = z.object({
  tenderId: z.string().optional(),
  ruleId: z.string().min(1),
});

export const RuleFilterQuerySchema = z.object({
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'REJECTED', 'DISABLED']).optional(),
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
      'CONDITIONAL',
      'INFORMATIONAL',
    ])
    .optional(),
  search: z.string().optional(),
});

export const UpdateRuleBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  definition: z.record(z.unknown()).optional(),
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
      'CONDITIONAL',
      'INFORMATIONAL',
    ])
    .optional(),
});

export const SimulateRuleBodySchema = z.object({
  evidence: z.record(z.unknown()),
});
