import { FastifyInstance } from 'fastify';
import { reportsController } from './reports.controller.js';

export async function reportRoutes(fastify: FastifyInstance) {
  fastify.post('/tenders/:tenderId/reports', reportsController.generateTenderReport);
  fastify.post('/tenders/:tenderId/bidders/:bidderId/reports', reportsController.generateBidderReport);
  fastify.get('/tenders/:tenderId/reports', reportsController.listReports);
  fastify.get('/reports/:reportId', reportsController.getReport);
  fastify.get('/reports/:reportId/status', reportsController.getReportStatus);
  fastify.get('/reports/:reportId/download', reportsController.downloadReportPDF);
  fastify.get('/reports/:reportId/audit', reportsController.getReportAuditTimeline);
}
