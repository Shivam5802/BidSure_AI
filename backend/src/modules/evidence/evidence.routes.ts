import { FastifyInstance } from 'fastify';
import { evidenceController } from './evidence.controller.js';

export async function evidenceRoutes(fastify: FastifyInstance) {
  // Trigger extraction job
  fastify.post(
    '/bid-documents/:documentId/extract-evidence',
    evidenceController.triggerExtraction.bind(evidenceController)
  );

  // List evidence for document & add manual evidence
  fastify.get(
    '/bid-documents/:documentId/evidence',
    evidenceController.getEvidenceForDocument.bind(evidenceController)
  );
  fastify.post(
    '/bid-documents/:documentId/evidence',
    evidenceController.addManualEvidence.bind(evidenceController)
  );

  // Single evidence item actions
  fastify.get(
    '/evidence/:evidenceId',
    evidenceController.getEvidenceById.bind(evidenceController)
  );
  fastify.patch(
    '/evidence/:evidenceId',
    evidenceController.updateEvidenceByHuman.bind(evidenceController)
  );
  fastify.post(
    '/evidence/:evidenceId/verify',
    evidenceController.verifyEvidenceFact.bind(evidenceController)
  );
  fastify.post(
    '/evidence/:evidenceId/reject',
    evidenceController.rejectEvidenceFact.bind(evidenceController)
  );
}
