import { z } from 'zod';
import { BidDocumentType } from '@prisma/client';

export const CreateBidderSchema = z.object({
  bidderCode: z.string().min(2, 'Bidder code must be at least 2 characters').max(50),
  legalName: z.string().min(2, 'Legal name must be at least 2 characters').max(200),
  displayName: z.string().max(200).optional(),
});

export const UpdateClassificationSchema = z.object({
  documentType: z.nativeEnum(BidDocumentType),
  reason: z.string().optional(),
  reviewedBy: z.string().default('Procurement Officer'),
});

export const BidderParamsSchema = z.object({
  tenderId: z.string().uuid().or(z.string().min(1)),
  bidderId: z.string().uuid().or(z.string().min(1)).optional(),
});

export const SubmissionParamsSchema = z.object({
  submissionId: z.string().uuid().or(z.string().min(1)),
});

export const DocumentParamsSchema = z.object({
  documentId: z.string().uuid().or(z.string().min(1)),
});
