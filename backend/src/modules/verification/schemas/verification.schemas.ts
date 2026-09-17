import { z } from 'zod';
import { VerificationType } from '@prisma/client';

export const createVerificationRequestSchema = z.object({
  tenderId: z.string().uuid({ message: 'Valid Tender ID is required' }),
  bidSubmissionId: z.string().uuid({ message: 'Valid Bid Submission ID is required' }),
  requirementId: z.string().uuid().optional(),
  evidenceId: z.string().uuid().optional(),
  verificationType: z.nativeEnum(VerificationType, {
    errorMap: () => ({ message: 'Invalid verification type' }),
  }),
  providerCode: z.string().optional().default('MOCK_GOVERNMENT_VERIFICATION'),
  requestedIdentifier: z
    .string()
    .min(1, { message: 'Requested identifier cannot be empty' })
    .max(100, { message: 'Identifier too long' }),
  requestedFields: z.array(z.string()).optional(),
});

export const verifyEvidenceSchema = z.object({
  tenderId: z.string().uuid(),
  bidderId: z.string().uuid(),
  verificationType: z.nativeEnum(VerificationType).optional(),
  providerCode: z.string().optional().default('MOCK_GOVERNMENT_VERIFICATION'),
});

export const retryVerificationSchema = z.object({
  providerCode: z.string().optional(),
});

export const verificationListQuerySchema = z.object({
  verificationType: z.nativeEnum(VerificationType).optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateVerificationRequestInput = z.infer<typeof createVerificationRequestSchema>;
export type VerifyEvidenceInput = z.infer<typeof verifyEvidenceSchema>;
export type RetryVerificationInput = z.infer<typeof retryVerificationSchema>;
export type VerificationListQuery = z.infer<typeof verificationListQuerySchema>;
