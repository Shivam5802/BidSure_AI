import { FastifyInstance } from 'fastify';
import { tenderController } from './tender.controller.js';

export async function tenderRoutes(app: FastifyInstance): Promise<void> {
  // Published Tenders for Bidders & Public
  app.get('/tenders/published', tenderController.listPublishedTenders.bind(tenderController));
  app.get('/tenders/published/:tenderId', tenderController.getPublishedTender.bind(tenderController));

  // Tender Publication (Officer)
  app.post('/tenders/:tenderId/publish', tenderController.publishTender.bind(tenderController));

  // Tender CRUD
  app.post('/tenders', tenderController.createTender.bind(tenderController));
  app.get('/tenders', tenderController.listTenders.bind(tenderController));
  app.get('/tenders/:tenderId', tenderController.getTender.bind(tenderController));

  // Documents Upload & List
  app.post(
    '/tenders/:tenderId/documents',
    tenderController.uploadDocuments.bind(tenderController)
  );
  app.get(
    '/tenders/:tenderId/documents',
    tenderController.listDocuments.bind(tenderController)
  );

  // Document Processing Trigger (202 Accepted)
  app.post(
    '/tenders/:tenderId/documents/process',
    tenderController.startProcessing.bind(tenderController)
  );

  // Document Processing Status
  app.get(
    '/tenders/:tenderId/documents/:documentId/status',
    tenderController.getDocumentStatus.bind(tenderController)
  );

  // Document Detail with Pages
  app.get(
    '/tenders/:tenderId/documents/:documentId',
    tenderController.getDocument.bind(tenderController)
  );

  // Page Detail with Evidence Blocks
  app.get(
    '/tenders/:tenderId/documents/:documentId/pages/:pageNumber',
    tenderController.getDocumentPage.bind(tenderController)
  );

  // Retry Processing
  app.post(
    '/tenders/:tenderId/documents/:documentId/retry',
    tenderController.retryDocument.bind(tenderController)
  );
}
