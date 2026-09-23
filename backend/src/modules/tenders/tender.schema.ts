import { z } from 'zod';

export const createTenderSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Tender title must be at least 3 characters')
    .max(255, 'Tender title cannot exceed 255 characters'),
  referenceNumber: z
    .string()
    .trim()
    .min(2, 'Reference number must be at least 2 characters')
    .max(100, 'Reference number cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\-_./]+$/, 'Reference number contains invalid characters'),
  organization: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(200, 'Organization name cannot exceed 200 characters'),
  closingDate: z
    .string()
    .datetime({ message: 'Closing date must be a valid ISO-8601 date string' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
  publishImmediately: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'READY', 'PROCESSING', 'CLOSED']).optional(),
  department: z.string().trim().max(200).optional(),
  estimatedValue: z.number().positive().optional(),
  category: z.string().trim().optional(),
});

export type CreateTenderDto = z.infer<typeof createTenderSchema>;

export const processDocumentsSchema = z.object({
  documentIds: z.array(z.string()).optional(),
});

export type ProcessDocumentsDto = z.infer<typeof processDocumentsSchema>;
