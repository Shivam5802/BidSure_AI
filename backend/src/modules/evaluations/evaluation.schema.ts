import { z } from 'zod';
import { EvaluationStatus, ApplicabilityStatus } from '@prisma/client';

export const EvaluationStatusSchema = z.nativeEnum(EvaluationStatus);
export const ApplicabilityStatusSchema = z.nativeEnum(ApplicabilityStatus);

export const RunEvaluationBodySchema = z.object({
  actor: z.string().optional().default('procurement_officer'),
});

export const RunSingleEvaluationBodySchema = z.object({
  tenderId: z.string().min(1),
  bidderId: z.string().min(1),
  submissionId: z.string().min(1),
  requirementId: z.string().min(1),
  actor: z.string().optional().default('procurement_officer'),
});
