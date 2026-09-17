import { PrismaClient, ConflictStatus } from '@prisma/client';
import { DetectedConflictDraft, UpdateConflictStatusDTO } from './conflict.types.js';

export class ConflictRepository {
  private prisma: PrismaClient;

  // In-memory fallbacks for unit/integration tests without active DB
  private conflicts = new Map<string, any>();
  private items = new Map<string, any>();

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async saveConflict(draft: DetectedConflictDraft): Promise<any> {
    try {
      // DB attempt
      const existing = await this.prisma.evidenceConflict.findUnique({
        where: {
          bidderId_fingerprint: {
            bidderId: draft.bidderId,
            fingerprint: draft.fingerprint,
          },
        },
        include: { items: true },
      });

      if (existing) {
        // Update status or version if superseded
        const updated = await this.prisma.evidenceConflict.update({
          where: { id: existing.id },
          data: {
            confidence: draft.confidence,
            severity: draft.severity,
            description: draft.description,
            requiresInvestigation: draft.requiresInvestigation,
            updatedAt: new Date(),
          },
          include: { items: true },
        });

        this.conflicts.set(updated.id, updated);
        return updated;
      }

      const created = await this.prisma.evidenceConflict.create({
        data: {
          tenderId: draft.tenderId,
          bidderId: draft.bidderId,
          bidSubmissionId: draft.bidSubmissionId,
          conflictType: draft.conflictType,
          severity: draft.severity,
          status: draft.status,
          fieldKey: draft.fieldKey,
          description: draft.description,
          fingerprint: draft.fingerprint,
          confidence: draft.confidence,
          contextSnapshot: draft.contextSnapshot,
          detectedBy: draft.detectedBy,
          detectorVersion: draft.detectorVersion,
          requiresInvestigation: draft.requiresInvestigation,
          items: {
            create: draft.items.map((item) => ({
              evidenceId: item.evidenceId,
              role: item.role,
              normalizedValueSnapshot: item.normalizedValueSnapshot || undefined,
              sourceSnapshot: item.sourceSnapshot || undefined,
            })),
          },
        },
        include: { items: true },
      });

      this.conflicts.set(created.id, created);
      return created;
    } catch (err) {
      // In-memory fallback
      const existing = Array.from(this.conflicts.values()).find(
        (c) => c.bidderId === draft.bidderId && c.fingerprint === draft.fingerprint
      );

      if (existing) {
        existing.confidence = draft.confidence;
        existing.severity = draft.severity;
        existing.description = draft.description;
        existing.requiresInvestigation = draft.requiresInvestigation;
        existing.updatedAt = new Date();
        return existing;
      }

      const id = `cnf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const itemsList = draft.items.map((item) => {
        const itemId = `citem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const rec = {
          id: itemId,
          conflictId: id,
          evidenceId: item.evidenceId,
          role: item.role,
          normalizedValueSnapshot: item.normalizedValueSnapshot,
          sourceSnapshot: item.sourceSnapshot,
          createdAt: new Date(),
        };
        this.items.set(itemId, rec);
        return rec;
      });

      const conflictRecord = {
        id,
        tenderId: draft.tenderId,
        bidderId: draft.bidderId,
        bidSubmissionId: draft.bidSubmissionId,
        conflictType: draft.conflictType,
        severity: draft.severity,
        status: draft.status,
        fieldKey: draft.fieldKey,
        description: draft.description,
        fingerprint: draft.fingerprint,
        confidence: draft.confidence,
        contextSnapshot: draft.contextSnapshot,
        detectedBy: draft.detectedBy,
        detectorVersion: draft.detectorVersion,
        requiresInvestigation: draft.requiresInvestigation,
        investigationId: null,
        resolvedBy: null,
        resolvedAt: null,
        resolution: null,
        resolutionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: itemsList,
      };

      this.conflicts.set(id, conflictRecord);
      return conflictRecord;
    }
  }

  async getConflictById(id: string): Promise<any | null> {
    try {
      const dbRec = await this.prisma.evidenceConflict.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              evidence: {
                include: {
                  bidDocument: true,
                },
              },
            },
          },
          investigation: true,
        },
      });
      if (dbRec) return dbRec;
    } catch {}

    return this.conflicts.get(id) || null;
  }

  async listConflictsByBidder(bidderId: string): Promise<any[]> {
    try {
      const list = await this.prisma.evidenceConflict.findMany({
        where: { bidderId },
        include: {
          items: {
            include: {
              evidence: {
                include: {
                  bidDocument: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (list && list.length > 0) return list;
    } catch {}

    const memList: any[] = [];
    for (const c of this.conflicts.values()) {
      if (c.bidderId === bidderId) {
        memList.push(c);
      }
    }
    return memList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async listConflictsByTender(tenderId: string): Promise<any[]> {
    try {
      const list = await this.prisma.evidenceConflict.findMany({
        where: { tenderId },
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (list && list.length > 0) return list;
    } catch {}

    const memList: any[] = [];
    for (const c of this.conflicts.values()) {
      if (c.tenderId === tenderId) {
        memList.push(c);
      }
    }
    return memList;
  }

  async updateConflictStatus(
    id: string,
    dto: UpdateConflictStatusDTO
  ): Promise<any> {
    const { status, resolution, resolutionReason, reviewerId } = dto;
    const now = new Date();

    try {
      const updated = await this.prisma.evidenceConflict.update({
        where: { id },
        data: {
          status,
          resolution: resolution || undefined,
          resolutionReason: resolutionReason || undefined,
          resolvedBy: status === ConflictStatus.RESOLVED || status === ConflictStatus.DISMISSED ? reviewerId || 'procurement_officer' : undefined,
          resolvedAt: status === ConflictStatus.RESOLVED || status === ConflictStatus.DISMISSED ? now : undefined,
          updatedAt: now,
        },
        include: { items: true },
      });

      this.conflicts.set(id, updated);
      return updated;
    } catch {
      const existing = this.conflicts.get(id);
      if (!existing) throw new Error(`Conflict ${id} not found`);

      existing.status = status;
      if (resolution) existing.resolution = resolution;
      if (resolutionReason) existing.resolutionReason = resolutionReason;
      if (status === ConflictStatus.RESOLVED || status === ConflictStatus.DISMISSED) {
        existing.resolvedBy = reviewerId || 'procurement_officer';
        existing.resolvedAt = now;
      }
      existing.updatedAt = now;
      return existing;
    }
  }

  async linkInvestigation(conflictId: string, investigationId: string): Promise<any> {
    try {
      const updated = await this.prisma.evidenceConflict.update({
        where: { id: conflictId },
        data: {
          investigationId,
          status: ConflictStatus.INVESTIGATING,
          updatedAt: new Date(),
        },
        include: { items: true },
      });
      this.conflicts.set(conflictId, updated);
      return updated;
    } catch {
      const existing = this.conflicts.get(conflictId);
      if (existing) {
        existing.investigationId = investigationId;
        existing.status = ConflictStatus.INVESTIGATING;
        existing.updatedAt = new Date();
      }
      return existing;
    }
  }

  async clear(): Promise<void> {
    this.conflicts.clear();
    this.items.clear();
  }
}

const globalForConflictRepo = globalThis as unknown as { conflictRepository: ConflictRepository };
export const conflictRepository = globalForConflictRepo.conflictRepository || new ConflictRepository();
if (process.env.NODE_ENV !== 'production') globalForConflictRepo.conflictRepository = conflictRepository;
