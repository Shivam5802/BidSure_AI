import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { vendorService } from './vendor.service.js';
import { DocumentCategory } from './vendor.types.js';

const ProfileUpdateSchema = z.object({
  legalName: z.string().min(2, 'Legal company name is required').optional(),
  tradeName: z.string().optional().nullable(),
  businessType: z.enum(['Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited', 'Other']).optional(),
  companyRegistrationNumber: z.string().optional().nullable(),
  dateOfEstablishment: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  registeredAddress: z.string().min(5, 'Address is required').optional(),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  pinCode: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('')),
  companyDescription: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  turnoverDetails: z.array(z.any()).optional().nullable(),
  // Compatibility fields with older profile forms
  companyName: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  contactPhone: z.string().optional(),
});

const RepresentativeSchema = z.object({
  fullName: z.string().min(2, 'Representative full name is required'),
  designation: z.string().min(2, 'Designation is required'),
  officialEmail: z.string().email('Valid official email required'),
  mobileNumber: z.string().min(10, 'Valid 10-digit mobile number required'),
  signatoryDetails: z.string().optional(),
  powerOfAttorneyUrl: z.string().optional(),
});

const RegistrationSchema = z.object({
  registrationType: z.string().min(2, 'Registration type required'),
  registrationNumber: z.string().min(2, 'Registration number required'),
  issuingAuthority: z.string().min(2, 'Issuing authority required'),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  documentUrl: z.string().optional().nullable(),
  documentName: z.string().optional().nullable(),
});

export class VendorController {
  // -------------------------------------------------------------
  // PROFILE
  // -------------------------------------------------------------
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const userName = (request.user as any)?.name;
    const profile = await vendorService.getOrCreateProfile(userId, userName);
    const representative = await vendorService.getRepresentative(userId);

    return reply.status(200).send({
      success: true,
      data: {
        ...profile,
        representative,
        // Compatibility aliases for legacy form inputs
        companyName: profile.legalName,
      },
    });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = ProfileUpdateSchema.parse(request.body || {});
    // Support companyName alias as legalName
    const payload = {
      ...body,
      legalName: body.legalName || body.companyName,
    };

    const updated = await vendorService.updateProfile(userId, payload);
    return reply.status(200).send({
      success: true,
      data: updated,
      message: 'Bidder company profile updated successfully.',
    });
  }

  // -------------------------------------------------------------
  // REPRESENTATIVE
  // -------------------------------------------------------------
  async getRepresentative(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const rep = await vendorService.getRepresentative(userId);
    return reply.status(200).send({
      success: true,
      data: rep,
    });
  }

  async updateRepresentative(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = RepresentativeSchema.parse(request.body || {});
    const updated = await vendorService.updateRepresentative(userId, body);
    return reply.status(200).send({
      success: true,
      data: updated,
      message: 'Authorized representative details updated successfully.',
    });
  }

  // -------------------------------------------------------------
  // REGISTRATIONS
  // -------------------------------------------------------------
  async listRegistrations(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const list = await vendorService.listRegistrations(userId);
    return reply.status(200).send({
      success: true,
      data: list,
    });
  }

  async addRegistration(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = RegistrationSchema.parse(request.body || {});
    const created = await vendorService.addRegistration(userId, body as any);
    return reply.status(201).send({
      success: true,
      data: created,
      message: 'Registration added and verification check performed.',
    });
  }

  async updateRegistration(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = (request.body as any) || {};
    const updated = await vendorService.updateRegistration(userId, id, body);
    return reply.status(200).send({
      success: true,
      data: updated,
      message: 'Registration record updated successfully.',
    });
  }

  async deleteRegistration(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    await vendorService.deleteRegistration(userId, id);
    return reply.status(200).send({
      success: true,
      message: 'Registration deleted successfully.',
    });
  }

  async verifyRegistration(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const profile = await vendorService.getOrCreateProfile(userId);
    const verified = await vendorService.verifyRegistration(profile.id, id);
    return reply.status(200).send({
      success: true,
      data: verified,
      message: `Registration verification executed via ${verified.verificationSource || 'DEMO_SANDBOX'}.`,
    });
  }

  // -------------------------------------------------------------
  // DOCUMENT VAULT
  // -------------------------------------------------------------
  async listDocuments(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { category } = request.query as { category?: string };
    const docs = await vendorService.listDocuments(userId, category);
    return reply.status(200).send({
      success: true,
      data: docs,
    });
  }

  async uploadDocument(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    let payload: {
      category: DocumentCategory;
      documentType: string;
      title: string;
      originalFilename: string;
      mimeType: string;
      fileSize: number;
      fileBuffer?: Buffer;
      issueDate?: string;
      expiryDate?: string;
    };

    if (request.isMultipart()) {
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ success: false, error: { code: 'FILE_MISSING', message: 'No file uploaded' } });
      }
      const buffer = await file.toBuffer();
      const fields: any = file.fields || {};
      payload = {
        category: (fields.category?.value || 'REGISTRATION') as DocumentCategory,
        documentType: fields.documentType?.value || 'STATUTORY_CERTIFICATE',
        title: fields.title?.value || file.filename,
        originalFilename: file.filename,
        mimeType: file.mimetype,
        fileSize: buffer.length,
        fileBuffer: buffer,
        issueDate: fields.issueDate?.value || undefined,
        expiryDate: fields.expiryDate?.value || undefined,
      };
    } else {
      const body: any = request.body || {};
      payload = {
        category: body.category || 'REGISTRATION',
        documentType: body.documentType || 'STATUTORY_CERTIFICATE',
        title: body.title || body.originalFilename || 'Document',
        originalFilename: body.originalFilename || 'document.pdf',
        mimeType: body.mimeType || 'application/pdf',
        fileSize: body.fileSize || 10240,
        issueDate: body.issueDate,
        expiryDate: body.expiryDate,
      };
    }

    const doc = await vendorService.uploadDocument(userId, payload);
    return reply.status(201).send({
      success: true,
      data: doc,
      message: 'Document vaulted successfully and verified against tender requirements.',
    });
  }

  async deleteDocument(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    await vendorService.deleteDocument(userId, id);
    return reply.status(200).send({
      success: true,
      message: 'Document deleted from vault.',
    });
  }

  // -------------------------------------------------------------
  // COMPLIANCE CENTER
  // -------------------------------------------------------------
  async getComplianceSummary(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const summary = await vendorService.getComplianceSummary(userId);
    return reply.status(200).send({
      success: true,
      data: summary,
    });
  }

  // -------------------------------------------------------------
  // OVERVIEW METRICS
  // -------------------------------------------------------------
  async getOverviewMetrics(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const metrics = await vendorService.getOverviewMetrics(userId);
    return reply.status(200).send({
      success: true,
      data: metrics,
    });
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async listNotifications(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const notifications = await vendorService.getNotifications(userId);
    return reply.status(200).send({
      success: true,
      data: notifications,
    });
  }

  async markNotificationRead(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    await vendorService.markNotificationAsRead(userId, id);
    return reply.status(200).send({
      success: true,
      message: 'Notification marked as read.',
    });
  }

  async markAllNotificationsRead(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    await vendorService.markAllNotificationsAsRead(userId);
    return reply.status(200).send({
      success: true,
      message: 'All notifications marked as read.',
    });
  }

  // -------------------------------------------------------------
  // CLARIFICATIONS
  // -------------------------------------------------------------
  async listClarifications(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const items = await vendorService.listClarifications(userId);
    return reply.status(200).send({
      success: true,
      data: items,
    });
  }

  async getClarification(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    try {
      const item = await vendorService.getClarification(userId, id);
      return reply.status(200).send({
        success: true,
        data: item,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 400).send({
        success: false,
        error: { message: err.message },
      });
    }
  }

  async respondToClarification(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const body = request.body as { response?: string; documents?: any[]; responseDocuments?: string[] };
    if (!body?.response || body.response.trim().length < 10) {
      return reply.status(400).send({
        success: false,
        error: { message: 'Substantive written clarification response of at least 10 characters is required.' },
      });
    }

    try {
      const updated = await vendorService.respondToClarification(userId, id, {
        response: body.response,
        responseDocuments: body.responseDocuments || body.documents || [],
      });
      return reply.status(200).send({
        success: true,
        data: updated,
        message: 'Clarification response submitted successfully.',
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 400).send({
        success: false,
        error: { message: err.message },
      });
    }
  }
}

export const vendorController = new VendorController();
