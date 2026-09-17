import { FastifyInstance } from 'fastify';
import { reportsController } from './reports.controller.js';

export async function reportRoutes(fastify: FastifyInstance) {
  // Generate tender compliance report
  fastify.post('/api/tenders/:tenderId/reports', reportsController.generateTenderReport);

  // Generate bidder specific compliance report
  fastify.post(
    '/api/tenders/:tenderId/bidders/:bidderId/reports',
    reportsController.generateBidderReport
  );

  // List reports & history for a tender
  fastify.get('/api/tenders/:tenderId/reports', reportsController.listReports);

  // Get report snapshot & content
  fastify.get('/api/reports/:reportId', reportsController.getReport);

  // Get report async status & completeness
  fastify.get('/api/reports/:reportId/status', reportsController.getReportStatus);

  // Download generated PDF compliance report
  fastify.get('/api/reports/:reportId/download', reportsController.downloadReportPDF);

  // Get audit timeline associated with report
  fastify.get('/api/reports/:reportId/audit', reportsController.getReportAuditTimeline);
}
