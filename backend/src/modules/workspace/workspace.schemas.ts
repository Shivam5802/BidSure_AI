import { z } from 'zod';
import { RequirementCategory, EvaluationStatus } from '@prisma/client';

export const GetWorkspaceParamsSchema = z.object({
  tenderId: z.string().uuid().or(z.string()),
});

export const MatrixQuerySchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  search: z.string().optional(),
  bidderId: z.string().optional(),
  result: z.nativeEnum(EvaluationStatus).optional(),
  category: z.nativeEnum(RequirementCategory).optional(),
  priority: z.string().optional(),
});

export const ActionsQuerySchema = z.object({
  priority: z.string().optional(),
  bidderId: z.string().optional(),
  type: z.string().optional(),
});

export const WhyQuerySchema = z.object({
  requirementId: z.string(),
  bidderId: z.string(),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1),
});
