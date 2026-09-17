import { z } from 'zod';

export const TenderReportsParamsSchema = z.object({
  tenderId: z.string().min(1, 'Tender ID is required'),
});

export const ReportIdParamsSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
});

export const TenderBidderReportsParamsSchema = z.object({
  tenderId: z.string().min(1, 'Tender ID is required'),
  bidderId: z.string().min(1, 'Bidder ID is required'),
});

export const CreateReportRequestSchema = z.object({
  reportType: z.enum(['TENDER_COMPLIANCE', 'BIDDER_COMPLIANCE']).optional(),
  bidderId: z.string().optional(),
  forceNew: z.boolean().optional(),
});
