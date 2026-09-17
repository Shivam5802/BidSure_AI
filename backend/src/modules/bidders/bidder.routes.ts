import { FastifyInstance } from 'fastify';
import { bidderController } from './bidder.controller.js';

export async function bidderRoutes(fastify: FastifyInstance) {
  // Tender Bidder Endpoints
  fastify.post('/tenders/:tenderId/bidders', bidderController.createBidder.bind(bidderController));
  fastify.get('/tenders/:tenderId/bidders', bidderController.getBiddersByTender.bind(bidderController));
  fastify.get('/tenders/:tenderId/bidders/:bidderId', bidderController.getBidderById.bind(bidderController));
  fastify.post('/tenders/:tenderId/bidders/:bidderId/submissions', bidderController.getOrCreateSubmission.bind(bidderController));
  fastify.get('/tenders/:tenderId/bidders/:bidderId/submissions', bidderController.getOrCreateSubmission.bind(bidderController));

  // Bid Submission Documents Endpoints
  fastify.post('/bid-submissions/:submissionId/documents', bidderController.uploadBidDocuments.bind(bidderController));
  fastify.get('/bid-submissions/:submissionId/documents', bidderController.getSubmissionDocuments.bind(bidderController));

  // Bid Document Endpoints
  fastify.get('/bid-documents/:documentId', bidderController.getBidDocument.bind(bidderController));
  fastify.post('/bid-documents/:documentId/retry', bidderController.retryProcessing.bind(bidderController));
  fastify.patch('/bid-documents/:documentId/classification', bidderController.updateClassification.bind(bidderController));
}
