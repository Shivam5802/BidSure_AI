import { FastifyReply, FastifyRequest } from 'fastify';
import { tenderService } from './tender.service.js';
import { createTenderSchema, processDocumentsSchema } from './tender.schema.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/response.js';
import { tenderRepository } from './tender.repository.js';

export class TenderController {
  async createTender(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const validated = createTenderSchema.parse(request.body);
    const closingDate = new Date(validated.closingDate);

    try {
      const tender = await tenderService.createTender({
        ...validated,
        closingDate,
      });
      reply.status(201).send(createSuccessResponse(tender));
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        reply.status(409).send(createErrorResponse('DUPLICATE_REFERENCE', err.message));
        return;
      }
      throw err;
    }
  }

  async listTenders(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const tenders = await tenderService.listTenders();
    reply.status(200).send(createSuccessResponse(tenders));
  }

  async getTender(
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { tenderId } = request.params;
    try {
      const result = await tenderService.getTender(tenderId);
      reply.status(200).send(createSuccessResponse(result));
    } catch (err: any) {
      reply.status(404).send(createErrorResponse('TENDER_NOT_FOUND', err.message));
    }
  }

  async uploadDocuments(
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { tenderId } = request.params;

    // Verify tender exists
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      reply.status(404).send(createErrorResponse('TENDER_NOT_FOUND', `Tender ${tenderId} not found`));
      return;
    }

    if (!request.isMultipart()) {
      reply.status(400).send(
        createErrorResponse('INVALID_CONTENT_TYPE', 'Request must be multipart/form-data')
      );
      return;
    }

    const uploadedDocuments = [];
    const parts = request.files();

    for await (const part of parts) {
      const buffer = await part.toBuffer();
      try {
        const doc = await tenderService.uploadDocument(
          tenderId,
          buffer,
          part.filename,
          part.mimetype
        );
        uploadedDocuments.push(doc);
      } catch (err: any) {
        if (err.code === 'DUPLICATE_DOCUMENT') {
          reply.status(409).send(
            createErrorResponse('DUPLICATE_DOCUMENT', err.message, err.details)
          );
          return;
        }
        if (err.name === 'PdfValidationError') {
          reply.status(400).send(createErrorResponse(err.code, err.message));
          return;
        }
        throw err;
      }
    }

    if (uploadedDocuments.length === 0) {
      reply.status(400).send(createErrorResponse('NO_FILES_UPLOADED', 'No PDF files were provided in request'));
      return;
    }

    reply.status(201).send(createSuccessResponse({ uploaded: uploadedDocuments }));
  }

  async listDocuments(
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { tenderId } = request.params;
    const documents = await tenderRepository.listDocumentsByTender(tenderId);
    reply.status(200).send(createSuccessResponse(documents));
  }

  async startProcessing(
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { tenderId } = request.params;
    const body = processDocumentsSchema.parse(request.body || {});

    try {
      const result = await tenderService.startProcessing(tenderId, body.documentIds);
      // HTTP 202 Accepted
      reply.status(202).send(createSuccessResponse(result));
    } catch (err: any) {
      reply.status(404).send(createErrorResponse('PROCESSING_ERROR', err.message));
    }
  }

  async getDocumentStatus(
    request: FastifyRequest<{ Params: { tenderId: string; documentId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { documentId } = request.params;
    try {
      const status = await tenderService.getDocumentStatus(documentId);
      reply.status(200).send(createSuccessResponse(status));
    } catch (err: any) {
      reply.status(404).send(createErrorResponse('DOCUMENT_NOT_FOUND', err.message));
    }
  }

  async getDocument(
    request: FastifyRequest<{ Params: { tenderId: string; documentId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { documentId } = request.params;
    try {
      const document = await tenderService.getDocument(documentId);
      reply.status(200).send(createSuccessResponse(document));
    } catch (err: any) {
      reply.status(404).send(createErrorResponse('DOCUMENT_NOT_FOUND', err.message));
    }
  }

  async getDocumentPage(
    request: FastifyRequest<{
      Params: { tenderId: string; documentId: string; pageNumber: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { documentId, pageNumber } = request.params;
    const pageNum = parseInt(pageNumber, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      reply.status(400).send(createErrorResponse('INVALID_PAGE', 'Page number must be a positive integer'));
      return;
    }

    try {
      const page = await tenderService.getDocumentPage(documentId, pageNum);
      reply.status(200).send(createSuccessResponse(page));
    } catch (err: any) {
      reply.status(404).send(createErrorResponse('PAGE_NOT_FOUND', err.message));
    }
  }

  async retryDocument(
    request: FastifyRequest<{ Params: { tenderId: string; documentId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { tenderId, documentId } = request.params;
    try {
      await tenderService.retryDocument(tenderId, documentId);
      reply.status(202).send(createSuccessResponse({ retrying: true, documentId }));
    } catch (err: any) {
      reply.status(404).send(createErrorResponse('RETRY_ERROR', err.message));
    }
  }

  async publishTender(
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { tenderId } = request.params;
    const officerId = request.user?.sub;
    try {
      const published = await tenderService.publishTender(tenderId, officerId);
      reply.status(200).send(createSuccessResponse(published));
    } catch (err: any) {
      const statusCode = err.statusCode || 400;
      reply.status(statusCode).send(createErrorResponse('PUBLISH_ERROR', err.message));
    }
  }

  async listPublishedTenders(
    request: FastifyRequest<{ Querystring: { query?: string; organization?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { query, organization } = request.query || {};
    const tenders = await tenderService.listPublishedTenders({ query, organization });
    reply.status(200).send(createSuccessResponse(tenders));
  }

  async getPublishedTender(
    request: FastifyRequest<{ Params: { tenderId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { tenderId } = request.params;
    try {
      const data = await tenderService.getPublishedTender(tenderId);
      reply.status(200).send(createSuccessResponse(data));
    } catch (err: any) {
      reply.status(404).send(createErrorResponse('TENDER_NOT_FOUND', err.message));
    }
  }
}

export const tenderController = new TenderController();
