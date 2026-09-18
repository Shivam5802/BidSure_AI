import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { userRepository, hashPassword } from '../auth/user.repository.js';
import { auditService } from '../../services/audit/audit.service.js';
import { AuditEventType } from '@prisma/client';
import { tenderRepository } from '../tenders/tender.repository.js';

const CreateOfficerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid official email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).default('ACTIVE'),
});

const UpdateOfficerSchema = z.object({
  name: z.string().trim().min(2).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
});

export class OfficerController {
  async listOfficers(_request: FastifyRequest, reply: FastifyReply) {
    const officers = await userRepository.listOfficers();
    const allTenders = await tenderRepository.listTenders();

    const result = officers.map((off) => {
      const assignedTenders = allTenders.filter((t) => t.createdById === off.id);
      return {
        id: off.id,
        name: off.name,
        email: off.email,
        role: off.role,
        status: off.status,
        department: off.department || 'Procurement Directorate',
        designation: off.designation || 'Procurement Officer',
        phone: off.phone || '+91 98765 00000',
        createdAt: off.createdAt,
        updatedAt: off.updatedAt,
        lastLoginAt: off.lastLoginAt,
        assignedTendersCount: assignedTenders.length,
      };
    });

    return reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async getOfficer(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const officer = await userRepository.findById(id);

    if (!officer || officer.role !== 'PROCUREMENT_OFFICER') {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Procurement Officer not found' },
      });
    }

    const allTenders = await tenderRepository.listTenders();
    const assignedTenders = allTenders.filter((t) => t.createdById === officer.id);

    return reply.status(200).send({
      success: true,
      data: {
        id: officer.id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
        status: officer.status,
        department: officer.department || 'Procurement Directorate',
        designation: officer.designation || 'Procurement Officer',
        phone: officer.phone || '+91 98765 00000',
        createdAt: officer.createdAt,
        updatedAt: officer.updatedAt,
        lastLoginAt: officer.lastLoginAt,
        assignedTendersCount: assignedTenders.length,
      },
    });
  }

  async createOfficer(request: FastifyRequest, reply: FastifyReply) {
    const body = CreateOfficerSchema.parse(request.body || {});
    const normalizedEmail = body.email.trim().toLowerCase();

    // Check duplicate email
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists' },
      });
    }

    const passwordHash = hashPassword(body.password);
    const newOfficer = await userRepository.createUser({
      name: body.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'PROCUREMENT_OFFICER', // Explicitly enforced
      status: body.status,
      department: body.department?.trim() || 'Procurement Directorate',
      designation: body.designation?.trim() || 'Procurement Officer',
      phone: body.phone?.trim() || null,
    });

    void auditService.log(AuditEventType.OFFICER_CREATED, {
      actor: request.user?.sub || 'admin',
      metadata: {
        officerId: newOfficer.id,
        email: newOfficer.email,
        name: newOfficer.name,
        department: newOfficer.department,
      },
    });

    return reply.status(201).send({
      success: true,
      data: {
        id: newOfficer.id,
        name: newOfficer.name,
        email: newOfficer.email,
        role: newOfficer.role,
        status: newOfficer.status,
        department: newOfficer.department,
        designation: newOfficer.designation,
        phone: newOfficer.phone,
        createdAt: newOfficer.createdAt,
      },
    });
  }

  async updateOfficer(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = UpdateOfficerSchema.parse(request.body || {});

    const officer = await userRepository.findById(id);
    if (!officer || officer.role !== 'PROCUREMENT_OFFICER') {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Procurement Officer not found' },
      });
    }

    const updated = await userRepository.updateOfficerProfile(id, body);

    void auditService.log(AuditEventType.OFFICER_UPDATED, {
      actor: request.user?.sub || 'admin',
      metadata: {
        officerId: id,
        changes: body,
      },
    });

    return reply.status(200).send({
      success: true,
      data: updated,
    });
  }

  async activateOfficer(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const officer = await userRepository.findById(id);

    if (!officer || officer.role !== 'PROCUREMENT_OFFICER') {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Procurement Officer not found' },
      });
    }

    const updated = await userRepository.updateOfficerStatus(id, 'ACTIVE');

    void auditService.log(AuditEventType.OFFICER_ACTIVATED, {
      actor: request.user?.sub || 'admin',
      metadata: { officerId: id, email: officer.email },
    });

    return reply.status(200).send({
      success: true,
      data: updated,
      message: 'Officer account activated successfully',
    });
  }

  async deactivateOfficer(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const officer = await userRepository.findById(id);

    if (!officer || officer.role !== 'PROCUREMENT_OFFICER') {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Procurement Officer not found' },
      });
    }

    const updated = await userRepository.updateOfficerStatus(id, 'DISABLED');

    void auditService.log(AuditEventType.OFFICER_DEACTIVATED, {
      actor: request.user?.sub || 'admin',
      metadata: { officerId: id, email: officer.email },
    });

    return reply.status(200).send({
      success: true,
      data: updated,
      message: 'Officer account deactivated successfully',
    });
  }

  async getOfficerActivity(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const officer = await userRepository.findById(id);

    if (!officer || officer.role !== 'PROCUREMENT_OFFICER') {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Procurement Officer not found' },
      });
    }

    const allTenders = await tenderRepository.listTenders();
    const officerTenders = allTenders.filter((t) => t.createdById === officer.id);
    const tenderLogs = await Promise.all(
      officerTenders.map((t) => auditService.getLogsForTender(t.id))
    );
    const flatLogs = tenderLogs.flat();

    return reply.status(200).send({
      success: true,
      data: {
        officer: {
          id: officer.id,
          name: officer.name,
          email: officer.email,
          status: officer.status,
        },
        activityLogs: flatLogs.slice(0, 50),
      },
    });
  }
}

export const officerController = new OfficerController();
