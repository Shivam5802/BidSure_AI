import { z } from 'zod';
import { ConflictStatus } from '@prisma/client';

export const DetectConflictsParamsSchema = z.object({
  bidderId: z.string().uuid().or(z.string()),
});

export const DetectConflictsQuerySchema = z.object({
  tenderId: z.string().optional(),
});

export const GetConflictParamsSchema = z.object({
  conflictId: z.string().uuid().or(z.string()),
});

export const UpdateConflictStatusSchema = z.object({
  status: z.nativeEnum(ConflictStatus),
  resolution: z.string().optional(),
  resolutionReason: z.string().optional(),
  reviewerId: z.string().optional(),
});

export const StartConflictInvestigationSchema = z.object({
  requesterId: z.string().optional(),
});
