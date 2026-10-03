import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import {
  VendorProfileData,
  AuthorizedRepresentativeData,
  VendorRegistrationData,
  VendorDocumentData,
  ComplianceIssueData,
  VendorNotificationData,
} from './vendor.types.js';

const PERSISTED_VENDOR_FILE = path.resolve(process.cwd(), '.persisted_vendor_data.json');

interface PersistedVendorStore {
  profiles: VendorProfileData[];
  representatives: AuthorizedRepresentativeData[];
  registrations: VendorRegistrationData[];
  documents: VendorDocumentData[];
  complianceIssues: ComplianceIssueData[];
  notifications: VendorNotificationData[];
}

export class VendorRepository {
  private prisma: PrismaClient;
  private isPrismaHealthy = false;

  private inMemory: PersistedVendorStore = {
    profiles: [],
    representatives: [],
    registrations: [],
    documents: [],
    complianceIssues: [],
    notifications: [],
  };

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.loadPersistedData();
    this.initPrismaHealthCheck();
  }

  private async initPrismaHealthCheck(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.isPrismaHealthy = true;
    } catch {
      this.isPrismaHealthy = false;
    }
  }

  private loadPersistedData(): void {
    try {
      if (fs.existsSync(PERSISTED_VENDOR_FILE)) {
        const raw = fs.readFileSync(PERSISTED_VENDOR_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.inMemory = {
            profiles: (parsed.profiles || []).map((p: any) => ({
              ...p,
              createdAt: new Date(p.createdAt),
              updatedAt: new Date(p.updatedAt),
            })),
            representatives: (parsed.representatives || []).map((r: any) => ({
              ...r,
              createdAt: new Date(r.createdAt),
              updatedAt: new Date(r.updatedAt),
            })),
            registrations: (parsed.registrations || []).map((reg: any) => ({
              ...reg,
              lastVerifiedAt: reg.lastVerifiedAt ? new Date(reg.lastVerifiedAt) : null,
              createdAt: new Date(reg.createdAt),
              updatedAt: new Date(reg.updatedAt),
            })),
            documents: (parsed.documents || []).map((d: any) => ({
              ...d,
              uploadedAt: new Date(d.uploadedAt),
              updatedAt: new Date(d.updatedAt),
            })),
            complianceIssues: (parsed.complianceIssues || []).map((c: any) => ({
              ...c,
              createdAt: new Date(c.createdAt),
              updatedAt: new Date(c.updatedAt),
            })),
            notifications: (parsed.notifications || []).map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
            })),
          };
        }
      }
    } catch {
      // Fallback in-memory
    }
  }

  private savePersistedData(): void {
    try {
      fs.writeFileSync(PERSISTED_VENDOR_FILE, JSON.stringify(this.inMemory, null, 2), 'utf8');
    } catch {
      // Ignore write errors
    }
  }

  // -------------------------------------------------------------
  // VENDOR PROFILE
  // -------------------------------------------------------------
  async getProfileByUserId(userId: string): Promise<VendorProfileData | null> {
    if (this.isPrismaHealthy) {
      try {
        const found = await this.prisma.vendorProfile.findUnique({
          where: { userId },
        });
        if (found) return found as unknown as VendorProfileData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const match = this.inMemory.profiles.find((p) => p.userId === userId);
    return match || null;
  }

  async upsertProfile(
    userId: string,
    data: Partial<VendorProfileData> & { legalName: string; registeredAddress: string }
  ): Promise<VendorProfileData> {
    if (this.isPrismaHealthy) {
      try {
        const saved = await this.prisma.vendorProfile.upsert({
          where: { userId },
          create: {
            userId,
            legalName: data.legalName,
            tradeName: data.tradeName || null,
            businessType: data.businessType || 'Private Limited',
            companyRegistrationNumber: data.companyRegistrationNumber || null,
            dateOfEstablishment: data.dateOfEstablishment ? new Date(data.dateOfEstablishment) : null,
            category: data.category || null,
            registeredAddress: data.registeredAddress,
            state: data.state || null,
            district: data.district || null,
            city: data.city || null,
            pinCode: data.pinCode || null,
            websiteUrl: data.websiteUrl || null,
            companyDescription: data.companyDescription || null,
            logoUrl: data.logoUrl || null,
            turnoverDetails: (data.turnoverDetails as any) || null,
          },
          update: {
            legalName: data.legalName,
            tradeName: data.tradeName,
            businessType: data.businessType,
            companyRegistrationNumber: data.companyRegistrationNumber,
            dateOfEstablishment: data.dateOfEstablishment ? new Date(data.dateOfEstablishment) : null,
            category: data.category,
            registeredAddress: data.registeredAddress,
            state: data.state,
            district: data.district,
            city: data.city,
            pinCode: data.pinCode,
            websiteUrl: data.websiteUrl,
            companyDescription: data.companyDescription,
            logoUrl: data.logoUrl,
            turnoverDetails: (data.turnoverDetails as any) || undefined,
          },
        });
        return saved as unknown as VendorProfileData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const existingIdx = this.inMemory.profiles.findIndex((p) => p.userId === userId);
    const now = new Date();
    if (existingIdx >= 0) {
      const updated: VendorProfileData = {
        ...this.inMemory.profiles[existingIdx]!,
        ...data,
        updatedAt: now,
      };
      this.inMemory.profiles[existingIdx] = updated;
      this.savePersistedData();
      return updated;
    } else {
      const created: VendorProfileData = {
        id: `vp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        legalName: data.legalName,
        tradeName: data.tradeName || null,
        businessType: data.businessType || 'Private Limited',
        companyRegistrationNumber: data.companyRegistrationNumber || null,
        dateOfEstablishment: data.dateOfEstablishment || null,
        category: data.category || null,
        registeredAddress: data.registeredAddress || '',
        state: data.state || null,
        district: data.district || null,
        city: data.city || null,
        pinCode: data.pinCode || null,
        websiteUrl: data.websiteUrl || null,
        companyDescription: data.companyDescription || null,
        logoUrl: data.logoUrl || null,
        turnoverDetails: data.turnoverDetails || [],
        createdAt: now,
        updatedAt: now,
      };
      this.inMemory.profiles.push(created);
      this.savePersistedData();
      return created;
    }
  }

  // -------------------------------------------------------------
  // AUTHORIZED REPRESENTATIVE
  // -------------------------------------------------------------
  async getRepresentative(vendorProfileId: string): Promise<AuthorizedRepresentativeData | null> {
    if (this.isPrismaHealthy) {
      try {
        const found = await this.prisma.authorizedRepresentative.findUnique({
          where: { vendorProfileId },
        });
        if (found) return found as unknown as AuthorizedRepresentativeData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const match = this.inMemory.representatives.find((r) => r.vendorProfileId === vendorProfileId);
    return match || null;
  }

  async upsertRepresentative(
    vendorProfileId: string,
    data: Partial<AuthorizedRepresentativeData> & {
      fullName: string;
      designation: string;
      officialEmail: string;
      mobileNumber: string;
    }
  ): Promise<AuthorizedRepresentativeData> {
    if (this.isPrismaHealthy) {
      try {
        const saved = await this.prisma.authorizedRepresentative.upsert({
          where: { vendorProfileId },
          create: {
            vendorProfileId,
            fullName: data.fullName,
            designation: data.designation,
            officialEmail: data.officialEmail,
            mobileNumber: data.mobileNumber,
            signatoryDetails: data.signatoryDetails || null,
            powerOfAttorneyUrl: data.powerOfAttorneyUrl || null,
          },
          update: {
            fullName: data.fullName,
            designation: data.designation,
            officialEmail: data.officialEmail,
            mobileNumber: data.mobileNumber,
            signatoryDetails: data.signatoryDetails,
            powerOfAttorneyUrl: data.powerOfAttorneyUrl,
          },
        });
        return saved as unknown as AuthorizedRepresentativeData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const existingIdx = this.inMemory.representatives.findIndex((r) => r.vendorProfileId === vendorProfileId);
    const now = new Date();
    if (existingIdx >= 0) {
      const updated: AuthorizedRepresentativeData = {
        ...this.inMemory.representatives[existingIdx]!,
        ...data,
        updatedAt: now,
      };
      this.inMemory.representatives[existingIdx] = updated;
      this.savePersistedData();
      return updated;
    } else {
      const created: AuthorizedRepresentativeData = {
        id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        vendorProfileId,
        fullName: data.fullName,
        designation: data.designation,
        officialEmail: data.officialEmail,
        mobileNumber: data.mobileNumber,
        signatoryDetails: data.signatoryDetails || null,
        powerOfAttorneyUrl: data.powerOfAttorneyUrl || null,
        createdAt: now,
        updatedAt: now,
      };
      this.inMemory.representatives.push(created);
      this.savePersistedData();
      return created;
    }
  }

  // -------------------------------------------------------------
  // REGISTRATIONS & CERTIFICATIONS
  // -------------------------------------------------------------
  async listRegistrations(vendorProfileId: string): Promise<VendorRegistrationData[]> {
    if (this.isPrismaHealthy) {
      try {
        const list = await this.prisma.vendorRegistration.findMany({
          where: { vendorProfileId },
          orderBy: { createdAt: 'desc' },
        });
        return list as unknown as VendorRegistrationData[];
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    return this.inMemory.registrations.filter((r) => r.vendorProfileId === vendorProfileId);
  }

  async getRegistrationById(id: string): Promise<VendorRegistrationData | null> {
    if (this.isPrismaHealthy) {
      try {
        const found = await this.prisma.vendorRegistration.findUnique({
          where: { id },
        });
        if (found) return found as unknown as VendorRegistrationData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    return this.inMemory.registrations.find((r) => r.id === id) || null;
  }

  async saveRegistration(
    vendorProfileId: string,
    data: Omit<VendorRegistrationData, 'id' | 'vendorProfileId' | 'createdAt' | 'updatedAt'>
  ): Promise<VendorRegistrationData> {
    const now = new Date();
    if (this.isPrismaHealthy) {
      try {
        const created = await this.prisma.vendorRegistration.create({
          data: {
            vendorProfileId,
            registrationType: data.registrationType,
            registrationNumber: data.registrationNumber,
            issuingAuthority: data.issuingAuthority,
            issueDate: data.issueDate ? new Date(data.issueDate) : null,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            documentUrl: data.documentUrl || null,
            documentName: data.documentName || null,
            verificationStatus: data.verificationStatus || 'PENDING_VERIFICATION',
            verificationSource: data.verificationSource || null,
            failureReason: data.failureReason || null,
            lastVerifiedAt: data.lastVerifiedAt ? new Date(data.lastVerifiedAt) : null,
          },
        });
        return created as unknown as VendorRegistrationData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const created: VendorRegistrationData = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      vendorProfileId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.inMemory.registrations.push(created);
    this.savePersistedData();
    return created;
  }

  async updateRegistration(
    id: string,
    data: Partial<VendorRegistrationData>
  ): Promise<VendorRegistrationData> {
    const now = new Date();
    if (this.isPrismaHealthy) {
      try {
        const updated = await this.prisma.vendorRegistration.update({
          where: { id },
          data: {
            ...data,
            issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            lastVerifiedAt: data.lastVerifiedAt ? new Date(data.lastVerifiedAt) : undefined,
          },
        });
        return updated as unknown as VendorRegistrationData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const idx = this.inMemory.registrations.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Registration ${id} not found`);

    const updated = {
      ...this.inMemory.registrations[idx]!,
      ...data,
      updatedAt: now,
    };
    this.inMemory.registrations[idx] = updated;
    this.savePersistedData();
    return updated;
  }

  async deleteRegistration(id: string): Promise<void> {
    if (this.isPrismaHealthy) {
      try {
        await this.prisma.vendorRegistration.delete({ where: { id } });
        return;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    this.inMemory.registrations = this.inMemory.registrations.filter((r) => r.id !== id);
    this.savePersistedData();
  }

  // -------------------------------------------------------------
  // DOCUMENT VAULT
  // -------------------------------------------------------------
  async listDocuments(vendorProfileId: string, category?: string): Promise<VendorDocumentData[]> {
    if (this.isPrismaHealthy) {
      try {
        const whereClause: any = { vendorProfileId };
        if (category && category !== 'ALL') {
          whereClause.category = category;
        }
        const list = await this.prisma.vendorDocument.findMany({
          where: whereClause,
          orderBy: { uploadedAt: 'desc' },
        });
        return list as unknown as VendorDocumentData[];
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    return this.inMemory.documents.filter((d) => {
      const matchVendor = d.vendorProfileId === vendorProfileId;
      if (!matchVendor) return false;
      if (category && category !== 'ALL') return d.category === category;
      return true;
    });
  }

  async getDocumentById(id: string): Promise<VendorDocumentData | null> {
    if (this.isPrismaHealthy) {
      try {
        const found = await this.prisma.vendorDocument.findUnique({
          where: { id },
        });
        if (found) return found as unknown as VendorDocumentData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    return this.inMemory.documents.find((d) => d.id === id) || null;
  }

  async saveDocument(
    vendorProfileId: string,
    doc: Omit<VendorDocumentData, 'id' | 'vendorProfileId' | 'uploadedAt' | 'updatedAt'>
  ): Promise<VendorDocumentData> {
    const now = new Date();
    if (this.isPrismaHealthy) {
      try {
        const created = await this.prisma.vendorDocument.create({
          data: {
            vendorProfileId,
            category: doc.category,
            documentType: doc.documentType,
            title: doc.title,
            originalFilename: doc.originalFilename,
            storageKey: doc.storageKey,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            fileHash: doc.fileHash,
            issueDate: doc.issueDate ? new Date(doc.issueDate) : null,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
            version: doc.version || 1,
            verificationStatus: doc.verificationStatus || 'PENDING_VERIFICATION',
            rejectionReason: doc.rejectionReason || null,
          },
        });
        return created as unknown as VendorDocumentData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const created: VendorDocumentData = {
      id: `vdoc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      vendorProfileId,
      ...doc,
      uploadedAt: now,
      updatedAt: now,
    };
    this.inMemory.documents.push(created);
    this.savePersistedData();
    return created;
  }

  async deleteDocument(id: string): Promise<void> {
    if (this.isPrismaHealthy) {
      try {
        await this.prisma.vendorDocument.delete({ where: { id } });
        return;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    this.inMemory.documents = this.inMemory.documents.filter((d) => d.id !== id);
    this.savePersistedData();
  }

  // -------------------------------------------------------------
  // COMPLIANCE ISSUES
  // -------------------------------------------------------------
  async listComplianceIssues(vendorProfileId: string): Promise<ComplianceIssueData[]> {
    if (this.isPrismaHealthy) {
      try {
        const list = await this.prisma.vendorComplianceIssue.findMany({
          where: { vendorProfileId },
          orderBy: { createdAt: 'desc' },
        });
        return list as unknown as ComplianceIssueData[];
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    return this.inMemory.complianceIssues.filter((c) => c.vendorProfileId === vendorProfileId);
  }

  async syncComplianceIssues(vendorProfileId: string, issues: Array<Omit<ComplianceIssueData, 'id' | 'vendorProfileId' | 'createdAt' | 'updatedAt'>>): Promise<ComplianceIssueData[]> {
    const now = new Date();
    // Replace current issues with newly detected ones for this vendor
    this.inMemory.complianceIssues = this.inMemory.complianceIssues.filter((c) => c.vendorProfileId !== vendorProfileId);

    const createdList: ComplianceIssueData[] = issues.map((iss) => ({
      id: `iss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      vendorProfileId,
      ...iss,
      createdAt: now,
      updatedAt: now,
    }));

    this.inMemory.complianceIssues.push(...createdList);
    this.savePersistedData();
    return createdList;
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async listNotifications(vendorProfileId: string): Promise<VendorNotificationData[]> {
    if (this.isPrismaHealthy) {
      try {
        const list = await this.prisma.vendorNotification.findMany({
          where: { vendorProfileId },
          orderBy: { createdAt: 'desc' },
        });
        return list as unknown as VendorNotificationData[];
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    return this.inMemory.notifications
      .filter((n) => n.vendorProfileId === vendorProfileId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(
    vendorProfileId: string,
    data: Omit<VendorNotificationData, 'id' | 'vendorProfileId' | 'createdAt'>
  ): Promise<VendorNotificationData> {
    const now = new Date();
    if (this.isPrismaHealthy) {
      try {
        const created = await this.prisma.vendorNotification.create({
          data: {
            vendorProfileId,
            title: data.title,
            message: data.message,
            type: data.type,
            read: data.read ?? false,
            actionUrl: data.actionUrl || null,
          },
        });
        return created as unknown as VendorNotificationData;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const created: VendorNotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      vendorProfileId,
      ...data,
      createdAt: now,
    };
    this.inMemory.notifications.unshift(created);
    this.savePersistedData();
    return created;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    if (this.isPrismaHealthy) {
      try {
        await this.prisma.vendorNotification.update({
          where: { id },
          data: { read: true },
        });
        return;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    const notif = this.inMemory.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.savePersistedData();
    }
  }

  async markAllNotificationsAsRead(vendorProfileId: string): Promise<void> {
    if (this.isPrismaHealthy) {
      try {
        await this.prisma.vendorNotification.updateMany({
          where: { vendorProfileId, read: false },
          data: { read: true },
        });
        return;
      } catch {
        this.isPrismaHealthy = false;
      }
    }

    for (const n of this.inMemory.notifications) {
      if (n.vendorProfileId === vendorProfileId) {
        n.read = true;
      }
    }
    this.savePersistedData();
  }
}

export const vendorRepository = new VendorRepository();
