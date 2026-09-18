import { TenderApplicationData, ApplicationStatus, ApplicationDocument, BidderCompanyProfile } from './application.types.js';

export class ApplicationRepository {
  private applications = new Map<string, TenderApplicationData>();
  private bidderProfiles = new Map<string, BidderCompanyProfile>();

  async createApplication(data: {
    tenderId: string;
    bidderId: string;
    userId: string;
    applicationNumber: string;
    companyDetails: BidderCompanyProfile;
  }): Promise<TenderApplicationData> {
    // Duplicate check
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
    return this.applications.get(id) || null;
  }

  async findByTenderAndUser(tenderId: string, userId: string): Promise<TenderApplicationData | null> {
    for (const app of this.applications.values()) {
      if (app.tenderId === tenderId && app.userId === userId) {
        return app;
      }
    }
    return null;
  }

  async listByUser(userId: string): Promise<TenderApplicationData[]> {
    return Array.from(this.applications.values())
      .filter((app) => app.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async listByTender(tenderId: string): Promise<TenderApplicationData[]> {
    return Array.from(this.applications.values())
      .filter((app) => app.tenderId === tenderId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async addDocument(applicationId: string, doc: ApplicationDocument): Promise<TenderApplicationData> {
    const app = this.applications.get(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    app.documents.push(doc);
    app.updatedAt = new Date();
    this.applications.set(applicationId, app);
    return app;
  }

  async removeDocument(applicationId: string, documentId: string): Promise<TenderApplicationData> {
    const app = this.applications.get(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    app.documents = app.documents.filter((d) => d.id !== documentId);
    app.updatedAt = new Date();
    this.applications.set(applicationId, app);
    return app;
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    submittedAt?: Date
  ): Promise<TenderApplicationData> {
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
    const app = this.applications.get(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    app.officerDecision = decision;
    if (notes) app.officerNotes = notes;
    if (decision === 'QUALIFIED') {
      app.status = ApplicationStatus.QUALIFIED;
    } else if (decision === 'NOT_QUALIFIED' || decision === 'DISQUALIFIED') {
      app.status = ApplicationStatus.NOT_QUALIFIED;
    }
    app.updatedAt = new Date();
    this.applications.set(applicationId, app);
    return app;
  }

  // Bidder Profile Storage
  async getProfile(userId: string): Promise<BidderCompanyProfile | null> {
    return this.bidderProfiles.get(userId) || null;
  }

  async saveProfile(userId: string, profile: BidderCompanyProfile): Promise<BidderCompanyProfile> {
    this.bidderProfiles.set(userId, profile);
    return profile;
  }

  async clear(): Promise<void> {
    this.applications.clear();
    this.bidderProfiles.clear();
  }
}

export const applicationRepository = new ApplicationRepository();
