import { z } from 'zod';
import { EvidenceValueType } from '@prisma/client';

export const HumanCorrectionSchema = z.object({
  rawValue: z.string().min(1, 'Raw value is required'),
  normalizedValue: z.any().optional(),
  valueType: z.nativeEnum(EvidenceValueType).optional(),
  unit: z.string().optional(),
  reason: z.string().min(1, 'Reason for correction is required'),
  reviewer: z.string().default('Procurement Officer'),
});

export const VerifyFactSchema = z.object({
  reviewer: z.string().default('Procurement Officer'),
});

export const RejectFactSchema = z.object({
  reviewer: z.string().default('Procurement Officer'),
  reason: z.string().min(1, 'Rejection reason is required'),
});

export const AddManualEvidenceSchema = z.object({
  fieldKey: z.string().min(1, 'Field key is required'),
  rawValue: z.string().min(1, 'Raw value is required'),
  pageNumber: z.number().int().positive().default(1),
  sourceText: z.string().min(1, 'Source text grounding snippet is required'),
  reviewer: z.string().default('Procurement Officer'),
  reason: z.string().optional(),
});
