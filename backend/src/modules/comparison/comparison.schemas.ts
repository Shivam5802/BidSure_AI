import { z } from 'zod';

export const TenderComparisonParamsSchema = z.object({
  tenderId: z.string().min(1, 'Tender ID is required'),
});

export const RequirementComparisonParamsSchema = z.object({
  tenderId: z.string().min(1, 'Tender ID is required'),
  requirementId: z.string().min(1, 'Requirement ID is required'),
});

export const ComparisonSummaryQuerySchema = z.object({
  bidderIds: z.union([z.string(), z.array(z.string())]).optional(),
});

export const ComparisonMatrixQuerySchema = z.object({
  bidderIds: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().optional(),
  category: z
    .enum(['ELIGIBILITY', 'FINANCIAL', 'TECHNICAL', 'STATUTORY', 'POLICY', 'TENDER_SPECIFIC'])
    .optional(),
  result: z.enum(['PASS', 'FAIL', 'REVIEW', 'NOT_EVALUABLE']).optional(),
  differenceOnly: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => (val === true || val === 'true' ? true : false)),
  attentionOnly: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => (val === true || val === 'true' ? true : false)),
  page: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(String(val), 10)) : 1)),
  pageSize: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(String(val), 10))) : 25)),
});
