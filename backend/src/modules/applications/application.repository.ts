import { PrismaClient } from '@prisma/client';
import { TenderApplicationData, ApplicationStatus, ApplicationDocument, BidderCompanyProfile } from './application.types.js';

const prisma = new PrismaClient();

function mapRow(row: any): TenderApplicationData {
  const rawDetails = (row.companyDetails || {}) as any;
  const docs: ApplicationDocument[] = (row.documents || rawDetails._documents || []) as ApplicationDocument[];
  const { _documents, ...companyProfile } = rawDetails;
  return {
    id: row.id,
    tenderId: row.tenderId,
    bidderId: row.bidderId,
    userId: row.userId,
    applicationNumber: row.applicationNumber,
    status: row.status as ApplicationStatus,
    companyDetails: companyProfile as BidderCompanyProfile,
    documents: docs,
    submittedAt: row.submittedAt ? new Date(row.submittedAt) : null,
    clarificationNotes: row.clarificationNotes ?? null,
    officerDecision: row.officerDecision ?? null,
    officerNotes: row.officerNotes ?? null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export class ApplicationRepository {
  private applications = new Map<string, TenderApplicationData>();
  private bidderProfiles = new Map<string, BidderCompanyProfile>();

  private get useDB(): boolean {
    return Boolean(process.env.DATABASE_URL);
  }

  async createApplication(data: {
    tenderId: string;
    bidderId: string;
    userId: string;
    applicationNumber: string;
    companyDetails: BidderCompanyProfile;
  }): Promise<TenderApplicationData> {
    if (this.useDB) {
      try {
        const row = await prisma.tenderApplication.create({
          data: {
            tenderId: data.tenderId,
            bidderId: data.bidderId,
            userId: data.userId,
            applicationNumber: data.applicationNumber,
            status: ApplicationStatus.DRAFT,
            companyDetails: { ...data.companyDetails, _documents: [] } as any,
          },
        });
        return mapRow(row);
      } catch (err: any) {
        if (err?.code === 'P2002') {
          throw new Error('You have already created an application for this tender.');
        }
        console.warn('[ApplicationRepository] DB create failed, falling back to in-memory:', err?.message || err);
      }
    }

    // In-memory fallback
    for (const app of this.applications.values()) {
      if (app.tenderId === data.tenderId && (app.bidderId === data.bidderId || app.userId === data.userId)) {
        throw new Error('You have already created an application for this tender.');
      }
    }
    const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newApp: TenderApplicationData = {
      id,
      tenderId: data.tenderId,
      bidderId: data.bidderId,
      userId: data.userId,
      applicationNumber: data.applicationNumber,
      status: ApplicationStatus.DRAFT,
      companyDetails: data.companyDetails,
      documents: [],
      submittedAt: null,
      clarificationNotes: null,
      officerDecision: null,
      officerNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.set(id, newApp);
    return newApp;
  }

  async findById(id: string): Promise<TenderApplicationData | null> {
    if (this.useDB) {
      try {
        const row = await prisma.tenderApplication.findUnique({ where: { id } });
        return row ? mapRow(row) : null;
      } catch {}
    }
    return this.applications.get(id) || null;
  }

  async findByTenderAndUser(tenderId: string, userId: string): Promise<TenderApplicationData | null> {
    if (this.useDB) {
      try {
        const row = await prisma.tenderApplication.findFirst({ where: { tenderId, userId } });
        return row ? mapRow(row) : null;
      } catch {}
    }
    for (const app of this.applications.values()) {
      if (app.tenderId === tenderId && app.userId === userId) return app;
    }
    return null;
  }

  async listByUser(userId: string): Promise<TenderApplicationData[]> {
    if (this.useDB) {
      try {
        const rows = await prisma.tenderApplication.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return rows.map(mapRow);
      } catch {}
    }
    return Array.from(this.applications.values())
      .filter((app) => app.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async listByTender(tenderId: string): Promise<TenderApplicationData[]> {
    if (this.useDB) {
      try {
        const rows = await prisma.tenderApplication.findMany({
          where: { tenderId },
          orderBy: { createdAt: 'desc' },
        });
        return rows.map(mapRow);
      } catch {}
    }
    return Array.from(this.applications.values())
      .filter((app) => app.tenderId === tenderId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async listAll(): Promise<TenderApplicationData[]> {
    if (this.useDB) {
      try {
        const rows = await prisma.tenderApplication.findMany({ orderBy: { createdAt: 'desc' } });
        return rows.map(mapRow);
      } catch {}
    }
    return Array.from(this.applications.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async addDocument(applicationId: string, doc: ApplicationDocument): Promise<TenderApplicationData> {
    const app = await this.findById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    const updatedDocs = [...app.documents, doc];

    if (this.useDB) {
      try {
        const currentDetails = (app.companyDetails || {}) as any;
        const row = await prisma.tenderApplication.update({
          where: { id: applicationId },
          data: {
            companyDetails: { ...currentDetails, _documents: updatedDocs } as any,
            updatedAt: new Date(),
          },
        });
        return mapRow(row);
      } catch {}
    }
    app.documents = updatedDocs;
    app.updatedAt = new Date();
    this.applications.set(applicationId, app);
    return app;
  }

  async removeDocument(applicationId: string, documentId: string): Promise<TenderApplicationData> {
    const app = await this.findById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    const updatedDocs = app.documents.filter((d) => d.id !== documentId);

    if (this.useDB) {
      try {
        const currentDetails = (app.companyDetails || {}) as any;
        const row = await prisma.tenderApplication.update({
          where: { id: applicationId },
          data: {
            companyDetails: { ...currentDetails, _documents: updatedDocs } as any,
            updatedAt: new Date(),
          },
        });
        return mapRow(row);
      } catch {}
    }
    app.documents = updatedDocs;
    app.updatedAt = new Date();
    this.applications.set(applicationId, app);
    return app;
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    submittedAt?: Date
  ): Promise<TenderApplicationData> {
    if (this.useDB) {
      try {
        const row = await prisma.tenderApplication.update({
          where: { id: applicationId },
          data: {
            status,
            ...(submittedAt !== undefined ? { submittedAt } : {}),
            updatedAt: new Date(),
          },
        });
        return mapRow(row);
      } catch {}
    }
    const app = this.applications.get(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);
    app.status = status;
    if (submittedAt !== undefined) app.submittedAt = submittedAt;
    app.updatedAt = new Date();
    this.applications.set(applicationId, app);
    return app;
  }

  async updateDecision(
    applicationId: string,
    decision: string,
    notes?: string
  ): Promise<TenderApplicationData> {
    const newStatus =
      decision === 'QUALIFIED'
        ? ApplicationStatus.QUALIFIED
        : decision === 'NOT_QUALIFIED' || decision === 'DISQUALIFIED'
        ? ApplicationStatus.NOT_QUALIFIED
        : undefined;

    if (this.useDB) {
      try {
        const row = await prisma.tenderApplication.update({
          where: { id: applicationId },
          data: {
            officerDecision: decision,
            ...(notes ? { officerNotes: notes } : {}),
            ...(newStatus ? { status: newStatus } : {}),
            updatedAt: new Date(),
          },
        });
        return mapRow(row);
      } catch {}
    }
    const app = this.applications.get(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);
    app.officerDecision = decision;
    if (notes) app.officerNotes = notes;
    if (newStatus) app.status = newStatus;
    app.updatedAt = new Date();
    this.applications.set(applicationId, app);
    return app;
  }

  // Bidder Company Profile — stored in TenderApplication.companyDetails (DB) or separate Map (fallback)
  async getProfile(userId: string): Promise<BidderCompanyProfile | null> {
    if (this.useDB) {
      try {
        const row = await prisma.tenderApplication.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { companyDetails: true },
        });
        if (!row?.companyDetails) return null;
        const { _documents, ...profile } = row.companyDetails as Record<string, unknown>;
        return profile as unknown as BidderCompanyProfile;
      } catch {}
    }
    return this.bidderProfiles.get(userId) || null;
  }

  async saveProfile(userId: string, profile: BidderCompanyProfile): Promise<BidderCompanyProfile> {
    // In-memory store (used at registration before an application is created)
    this.bidderProfiles.set(userId, profile);
    return profile;
  }

  async clear(): Promise<void> {
    this.applications.clear();
    this.bidderProfiles.clear();
  }
}

export const applicationRepository = new ApplicationRepository();
