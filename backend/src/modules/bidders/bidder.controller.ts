import { FastifyRequest, FastifyReply } from 'fastify';
import { InMemoryStorageService } from '../../services/storage/storage.interface.js';
import { BidderService } from './bidder.service.js';
import { CreateBidderSchema, UpdateClassificationSchema } from './bidder.schema.js';

const storageService = new InMemoryStorageService();
const bidderService = new BidderService(storageService);

export class BidderController {
  async createBidder(request: FastifyRequest<{ Params: { tenderId: string } }>, reply: FastifyReply) {
    const { tenderId } = request.params;
    const body = CreateBidderSchema.parse(request.body);

    const result = await bidderService.createBidder({
      tenderId,
      bidderCode: body.bidderCode,
      legalName: body.legalName,
      displayName: body.displayName,
      createdById: (request as any).user?.id || 'procurement_officer',
    });

    return reply.status(201).send({
      success: true,
      message: 'Bidder created successfully.',
      data: result,
    });
  }

  async getBiddersByTender(request: FastifyRequest<{ Params: { tenderId: string } }>, reply: FastifyReply) {
    const { tenderId } = request.params;
    const bidders = await bidderService.getBiddersByTender(tenderId);

    return reply.send({
      success: true,
      data: bidders,
    });
  }

  async getBidderById(request: FastifyRequest<{ Params: { tenderId: string; bidderId: string } }>, reply: FastifyReply) {
    const { tenderId, bidderId } = request.params;
    const result = await bidderService.getBidderById(tenderId, bidderId);

    return reply.send({
      success: true,
      data: result,
    });
  }

  async getOrCreateSubmission(request: FastifyRequest<{ Params: { tenderId: string; bidderId: string } }>, reply: FastifyReply) {
    const { tenderId, bidderId } = request.params;
    const submission = await bidderService.getOrCreateActiveSubmission(tenderId, bidderId);

    return reply.send({
      success: true,
      data: submission,
    });
  }

  async uploadBidDocuments(request: FastifyRequest<{ Params: { submissionId: string } }>, reply: FastifyReply) {
    const { submissionId } = request.params;
    const files = await request.saveRequestFiles();

    if (!files || files.length === 0) {
      return reply.status(400).send({
        success: false,
        error: 'No files provided for upload.',
      });
    }

    // Retrieve submission details to get tenderId and bidderId
    const firstDoc = await bidderService.getSubmissionDocuments(submissionId);
    let tenderId = 'tnd_default';
    let bidderId = 'bdr_default';

    if (firstDoc && firstDoc.length > 0) {
      const parent = await bidderService.getBidDocument(firstDoc[0]!.id);
      if (parent.submission) {
        tenderId = parent.submission.tenderId;
        bidderId = parent.submission.bidderId;
      }
    }

    const results = [];
    for (const file of files) {
      const buffer = await file.toBuffer();
      try {
        const uploadResult = await bidderService.uploadBidDocument({
          tenderId,
          bidderId,
          submissionId,
          filename: file.filename,
          buffer,
          mimeType: file.mimetype,
          uploadedById: (request as any).user?.id || 'procurement_officer',
        });
        results.push(uploadResult);
      } catch (err: unknown) {
        results.push({
          filename: file.filename,
          isDuplicate: false,
          error: (err as Error).message || 'Upload failed',
        });
      }
    }

    return reply.status(201).send({
      success: true,
      message: `Processed ${files.length} document upload(s).`,
      data: results,
    });
  }

  async getSubmissionDocuments(request: FastifyRequest<{ Params: { submissionId: string } }>, reply: FastifyReply) {
    const { submissionId } = request.params;
    const documents = await bidderService.getSubmissionDocuments(submissionId);

    return reply.send({
      success: true,
      data: documents,
    });
  }

  async getBidDocument(request: FastifyRequest<{ Params: { documentId: string } }>, reply: FastifyReply) {
    const { documentId } = request.params;
    const result = await bidderService.getBidDocument(documentId);

    return reply.send({
      success: true,
      data: result,
    });
  }

  async updateClassification(request: FastifyRequest<{ Params: { documentId: string } }>, reply: FastifyReply) {
    const { documentId } = request.params;
    const body = UpdateClassificationSchema.parse(request.body);

    const updated = await bidderService.updateDocumentClassification(documentId, {
      documentType: body.documentType,
      reason: body.reason,
      reviewedBy: body.reviewedBy,
    });

    return reply.send({
      success: true,
      message: 'Document classification updated successfully by human reviewer.',
      data: updated,
    });
  }

  async retryProcessing(request: FastifyRequest<{ Params: { documentId: string } }>, reply: FastifyReply) {
    const { documentId } = request.params;
    const result = await bidderService.retryDocumentProcessing(documentId);

    return reply.send({
      success: true,
      data: result,
    });
  }
}

export const bidderController = new BidderController();
