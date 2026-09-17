import { AuditEventType } from '@prisma/client';

export interface AuditLogEntry {
  id: string;
  tenderId?: string | null;
  documentId?: string | null;
  bidderId?: string | null;
  submissionId?: string | null;
  bidDocumentId?: string | null;
  event: AuditEventType;
  actor: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export class AuditService {
  private logs: AuditLogEntry[] = [];

  async log(
    event: AuditEventType,
    options: {
      tenderId?: string | null;
      documentId?: string | null;
      bidderId?: string | null;
      submissionId?: string | null;
      bidDocumentId?: string | null;
      actor?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      tenderId: options.tenderId ?? null,
      documentId: options.documentId ?? null,
      bidderId: options.bidderId ?? null,
      submissionId: options.submissionId ?? null,
      bidDocumentId: options.bidDocumentId ?? null,
      event,
      actor: options.actor ?? 'procurement_officer',
      metadata: options.metadata ? { ...options.metadata } : null,
      createdAt: new Date(),
    };

    // Sanitize metadata to never persist raw document buffers or excessive text
    if (entry.metadata && 'content' in entry.metadata) {
      delete entry.metadata.content;
    }

    this.logs.push(entry);
    return entry;
  }

  async getLogsForTender(tenderId: string): Promise<AuditLogEntry[]> {
    return this.logs.filter((log) => log.tenderId === tenderId);
  }

  async getLogsForDocument(documentId: string): Promise<AuditLogEntry[]> {
    return this.logs.filter((log) => log.documentId === documentId || log.bidDocumentId === documentId);
  }
}

export const auditService = new AuditService();
