import { z } from 'zod';
import { MappingType, MappingStatus } from '@prisma/client';

export const MappingTypeSchema = z.nativeEnum(MappingType);
export const MappingStatusSchema = z.nativeEnum(MappingStatus);

export const ConfirmMappingSchema = z.object({
  reviewer: z.string().optional().default('procurement_officer'),
});

export const RejectMappingSchema = z.object({
  reason: z.string().min(1, 'Reason is required when rejecting a mapping'),
  reviewer: z.string().optional().default('procurement_officer'),
});

export const UpdateMappingSchema = z.object({
  mappingType: MappingTypeSchema.optional(),
  status: MappingStatusSchema.optional(),
  reason: z.string().optional(),
  reviewReason: z.string().optional(),
});

export const ManualMappingSchema = z.object({
  tenderRequirementId: z.string().uuid().or(z.string().min(1)),
  evidenceId: z.string().uuid().or(z.string().min(1)),
  bidderId: z.string().uuid().or(z.string().min(1)),
  mappingType: MappingTypeSchema.optional().default(MappingType.DIRECT),
  reason: z.string().min(1, 'Reason is required for manual mapping'),
  createdBy: z.string().optional().default('procurement_officer'),
});
