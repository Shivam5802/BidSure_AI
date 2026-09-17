import { z } from 'zod';
import {
  InvestigationTriggerType,
  InvestigationSeverity,
  HumanReviewDecision,
} from '@prisma/client';

export const StartInvestigationSchema = z.object({
  triggerType: z.nativeEnum(InvestigationTriggerType).optional(),
  severity: z.nativeEnum(InvestigationSeverity).optional(),
  question: z.string().optional(),
  requesterId: z.string().optional(),
});

export const SubmitHumanReviewSchema = z.object({
  decision: z.nativeEnum(HumanReviewDecision),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  reviewerId: z.string().optional(),
});
