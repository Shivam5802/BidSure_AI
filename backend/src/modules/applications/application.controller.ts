import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { applicationService } from './application.service.js';

const ApplySchema = z.object({
  companyName: z.string().optional(),
  companyType: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  registeredAddress: z.string().optional(),
  contactPhone: z.string().optional(),
});

const ProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyType: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  registeredAddress: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

const UploadDocSchema = z.object({
  originalFilename: z.string().min(1, 'Filename required'),
  documentType: z.string().default('TECHNICAL_COMPLIANCE_DOCUMENT'),
  fileSize: z.number().default(1024),
  mimeType: z.string().default('application/pdf'),
});

export class ApplicationController {
  async applyToTender(request: FastifyRequest, reply: FastifyReply) {
    const { tenderId } = request.params as { tenderId: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = ApplySchema.parse(request.body || {});
    const application = await applicationService.applyToTender(tenderId, userId, body);

    return reply.status(201).send({
      success: true,
      data: application,
    });
  }

  async listMyApplications(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const list = await applicationService.listBidderApplications(userId);
    return reply.status(200).send({
      success: true,
      data: list,
    });
  }

  async getApplication(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub || '';
    const role = request.user?.role || '';

    const app = await applicationService.getApplication(id, userId, role);
    return reply.status(200).send({
      success: true,
      data: app,
    });
  }

  async uploadDocument(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = UploadDocSchema.parse(request.body || {});
    const updated = await applicationService.uploadDocument(id, userId, body);

    return reply.status(201).send({
      success: true,
      data: updated,
    });
  }

  async deleteDocument(request: FastifyRequest, reply: FastifyReply) {
    const { id, documentId } = request.params as { id: string; documentId: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const updated = await applicationService.deleteDocument(id, documentId, userId);
    return reply.status(200).send({
      success: true,
      data: updated,
    });
  }

  async submitApplication(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const submitted = await applicationService.submitApplication(id, userId);
    return reply.status(200).send({
      success: true,
      data: submitted,
      message: 'Bid application submitted successfully. Your submission is now recorded for officer evaluation.',
    });
  }

  async listTenderApplications(request: FastifyRequest, reply: FastifyReply) {
    const { tenderId } = request.params as { tenderId: string };
    const list = await applicationService.listTenderApplications(tenderId);
    return reply.status(200).send({
      success: true,
      data: list,
    });
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const profile = await applicationService.getBidderProfile(userId);
    return reply.status(200).send({
      success: true,
      data: profile,
    });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = ProfileSchema.parse(request.body || {});
    const updated = await applicationService.updateBidderProfile(userId, body);
    return reply.status(200).send({
      success: true,
      data: updated,
    });
  }
}

export const applicationController = new ApplicationController();
