import { PrismaClient, AuditEventType } from '@prisma/client';

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

const prisma = new PrismaClient();

export class AuditService {

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
    const safeMetadata = options.metadata ? { ...options.metadata } : null;
    if (safeMetadata && 'content' in safeMetadata) {
      delete safeMetadata.content;
    }

    const entry: Omit<AuditLogEntry, 'id' | 'createdAt'> = {
      tenderId: options.tenderId ?? null,
      documentId: options.documentId ?? null,
      bidderId: options.bidderId ?? null,
      submissionId: options.submissionId ?? null,
      bidDocumentId: options.bidDocumentId ?? null,
      event,
      actor: options.actor ?? 'SYSTEM',
      metadata: safeMetadata,
    };

    if (process.env.DATABASE_URL) {
      try {
        const persisted = await prisma.auditLog.create({
          data: {
            tenderId: entry.tenderId ?? undefined,
            documentId: entry.documentId ?? undefined,
            bidderId: entry.bidderId ?? undefined,
            submissionId: entry.submissionId ?? undefined,
            bidDocumentId: entry.bidDocumentId ?? undefined,
            event: entry.event,
            actor: entry.actor,
            metadata: (entry.metadata as any) ?? undefined,
          },
        });
        this.logs.push({ ...persisted, metadata: persisted.metadata as Record<string, unknown> | null });
        return persisted as AuditLogEntry;
      } catch (err) {
        console.error('[AuditService] DB write failed, falling back to in-memory:', err);
      }
    }

    const inMemEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...entry,
      createdAt: new Date(),
    };
    this.logs.push(inMemEntry);
    return inMemEntry;
  }

  public logs: AuditLogEntry[] = [];

  async loadFromDatabase(limit = 500): Promise<void> {
    if (!process.env.DATABASE_URL) return;
    try {
      const rows = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      this.logs = rows.map((r) => ({
        ...r,
        metadata: r.metadata as Record<string, unknown> | null,
      }));
    } catch (err) {
      console.error('[AuditService] Failed to load logs from database:', err);
    }
  }

  async getLogsForTender(tenderId: string): Promise<AuditLogEntry[]> {
    if (process.env.DATABASE_URL) {
      try {
        const rows = await prisma.auditLog.findMany({
          where: { tenderId },
          orderBy: { createdAt: 'desc' },
        });
        return rows as AuditLogEntry[];
      } catch {}
    }
    return this.logs.filter((log) => log.tenderId === tenderId);
  }

  async getLogsForDocument(documentId: string): Promise<AuditLogEntry[]> {
    if (process.env.DATABASE_URL) {
      try {
        const rows = await prisma.auditLog.findMany({
          where: { OR: [{ documentId }, { bidDocumentId: documentId }] },
          orderBy: { createdAt: 'desc' },
        });
        return rows as AuditLogEntry[];
      } catch {}
    }
    return this.logs.filter(
      (log) => log.documentId === documentId || log.bidDocumentId === documentId
    );
  }
}

export const auditService = new AuditService();
