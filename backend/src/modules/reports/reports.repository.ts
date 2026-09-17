import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { ReportMetadata, ReportDataSnapshot, ReportType } from './reports.types.js';

export class ReportsRepository {
  private prisma: PrismaClient;
  private inMemoryReports = new Map<string, ReportDataSnapshot>();

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  clear() {
    this.inMemoryReports.clear();
  }

  calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  async saveReportSnapshot(snapshot: ReportDataSnapshot): Promise<ReportDataSnapshot> {
    this.inMemoryReports.set(snapshot.metadata.id, snapshot);

    try {
      // Create audit log event for report generation
      await this.prisma.auditLog.create({
        data: {
          tenderId: snapshot.tender.id,
          bidderId: snapshot.bidder?.id || null,
          event: 'DOCUMENT_PROCESSING_COMPLETED',
          actor: snapshot.metadata.generatedBy || 'procurement_officer',
          metadata: {
            reportId: snapshot.metadata.id,
            reportType: snapshot.metadata.reportType,
            reportVersion: snapshot.metadata.reportVersion,
            checksum: snapshot.metadata.reportChecksum,
            snapshotId: snapshot.metadata.snapshotId,
          },
        },
      });
    } catch {}

    return snapshot;
  }

  async getReportById(reportId: string): Promise<ReportDataSnapshot | null> {
    return this.inMemoryReports.get(reportId) || null;
  }

  async listReportsByTender(tenderId: string, bidderId?: string): Promise<ReportMetadata[]> {
    const reports = Array.from(this.inMemoryReports.values())
      .filter((r) => r.tender.id === tenderId && (!bidderId || r.bidder?.id === bidderId))
      .map((r) => r.metadata)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return reports;
  }

  async findExistingReportForSnapshot(
    tenderId: string,
    reportType: ReportType,
    checksum: string,
    bidderId?: string
  ): Promise<ReportDataSnapshot | null> {
    for (const r of this.inMemoryReports.values()) {
      if (
        r.tender.id === tenderId &&
        r.metadata.reportType === reportType &&
        (!bidderId || r.bidder?.id === bidderId) &&
        r.metadata.reportChecksum === checksum &&
        r.metadata.status === 'COMPLETED'
      ) {
        return r;
      }
    }
    return null;
  }

  async checkReportStaleStatus(snapshot: ReportDataSnapshot): Promise<boolean> {
    try {
      const latestAudit = await this.prisma.auditLog.findFirst({
        where: { tenderId: snapshot.tender.id },
        orderBy: { createdAt: 'desc' },
      });

      if (latestAudit && latestAudit.createdAt.getTime() > new Date(snapshot.metadata.generatedAt).getTime()) {
        return true;
      }
    } catch {}

    return false;
  }
}

const globalForReportsRepo = globalThis as unknown as { reportsRepository: ReportsRepository };
export const reportsRepository = globalForReportsRepo.reportsRepository || new ReportsRepository();
if (process.env.NODE_ENV !== 'production') globalForReportsRepo.reportsRepository = reportsRepository;
