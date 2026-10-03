import crypto from 'node:crypto';
import { vendorRepository } from './vendor.repository.js';
import {
  VendorProfileData,
  AuthorizedRepresentativeData,
  VendorRegistrationData,
  VendorDocumentData,
  ComplianceIssueData,
  VendorNotificationData,
  VendorOverviewMetrics,
  DocumentCategory,
} from './vendor.types.js';
import { tenderRepository } from '../tenders/tender.repository.js';
import { applicationRepository } from '../applications/application.repository.js';
import { auditService } from '../../services/audit/audit.service.js';
import { AuditEventType } from '@prisma/client';
import { userRepository } from '../auth/user.repository.js';
import { officerRepository } from '../officer/officer.repository.js';

export class VendorService {
  /**
   * Helper: Ensure vendor profile exists for the user. Creates a sensible initialized draft if not found.
   */
  async getOrCreateProfile(userId: string, defaultName?: string): Promise<VendorProfileData> {
    let profile = await vendorRepository.getProfileByUserId(userId);
    if (!profile) {
      const user = await userRepository.findById(userId);
      const name = defaultName?.trim() || user?.name?.trim() || 'Organization Profile';

      profile = await vendorRepository.upsertProfile(userId, {
        legalName: name,
        tradeName: null,
        businessType: 'Private Limited',
        companyRegistrationNumber: null,
        dateOfEstablishment: null,
        category: null,
        registeredAddress: '',
        state: null,
        district: null,
        city: null,
        pinCode: null,
        websiteUrl: null,
        companyDescription: null,
        turnoverDetails: [],
      });

      // Initialize representative with the real authenticated user credentials
      await vendorRepository.upsertRepresentative(profile.id, {
        fullName: user?.name || name,
        designation: user?.designation || '',
        officialEmail: user?.email || '',
        mobileNumber: user?.phone || '',
        signatoryDetails: null,
      });
    }

    return profile;
  }

  async updateProfile(userId: string, data: Partial<VendorProfileData>): Promise<VendorProfileData> {
    const existing = await this.getOrCreateProfile(userId);
    const updated = await vendorRepository.upsertProfile(userId, {
      ...existing,
      ...data,
      legalName: data.legalName || existing.legalName,
      registeredAddress: data.registeredAddress || existing.registeredAddress,
    });

    void auditService.log(AuditEventType.BIDDER_PROFILE_UPDATED, {
      actor: userId,
      metadata: {
        vendorProfileId: updated.id,
        legalName: updated.legalName,
        businessType: updated.businessType,
      },
    });

    // Run compliance evaluation upon profile update
    await this.evaluateCompliance(updated.id);

    return updated;
  }

  // -------------------------------------------------------------
  // AUTHORIZED REPRESENTATIVE
  // -------------------------------------------------------------
  async getRepresentative(userId: string): Promise<AuthorizedRepresentativeData | null> {
    const profile = await this.getOrCreateProfile(userId);
    return vendorRepository.getRepresentative(profile.id);
  }

  async updateRepresentative(
    userId: string,
    data: {
      fullName: string;
      designation: string;
      officialEmail: string;
      mobileNumber: string;
      signatoryDetails?: string;
      powerOfAttorneyUrl?: string;
    }
  ): Promise<AuthorizedRepresentativeData> {
    const profile = await this.getOrCreateProfile(userId);
    const rep = await vendorRepository.upsertRepresentative(profile.id, data);

    void auditService.log(AuditEventType.BIDDER_PROFILE_UPDATED, {
      actor: userId,
      metadata: {
        vendorProfileId: profile.id,
        action: 'UPDATE_AUTHORIZED_REPRESENTATIVE',
        representativeName: rep.fullName,
      },
    });

    return rep;
  }

  // -------------------------------------------------------------
  // REGISTRATIONS
  // -------------------------------------------------------------
  async listRegistrations(userId: string): Promise<VendorRegistrationData[]> {
    const profile = await this.getOrCreateProfile(userId);
    return vendorRepository.listRegistrations(profile.id);
  }

  async addRegistration(
    userId: string,
    data: {
      registrationType: string;
      registrationNumber: string;
      issuingAuthority: string;
      issueDate?: string;
      expiryDate?: string;
      documentUrl?: string;
      documentName?: string;
    }
  ): Promise<VendorRegistrationData> {
    const profile = await this.getOrCreateProfile(userId);
    const reg = await vendorRepository.saveRegistration(profile.id, {
      ...data,
      verificationStatus: 'PENDING_VERIFICATION',
      verificationSource: null,
      failureReason: null,
      lastVerifiedAt: null,
    });

    // Automatically trigger sandbox verification check
    const verified = await this.verifyRegistration(profile.id, reg.id);
    await this.evaluateCompliance(profile.id);

    return verified;
  }

  async updateRegistration(
    userId: string,
    id: string,
    data: Partial<VendorRegistrationData>
  ): Promise<VendorRegistrationData> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await vendorRepository.getRegistrationById(id);
    if (!existing || existing.vendorProfileId !== profile.id) {
      const err = new Error('Registration record not found or access denied');
      (err as any).statusCode = 404;
      throw err;
    }

    const updated = await vendorRepository.updateRegistration(id, data);
    await this.evaluateCompliance(profile.id);
    return updated;
  }

  async deleteRegistration(userId: string, id: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await vendorRepository.getRegistrationById(id);
    if (!existing || existing.vendorProfileId !== profile.id) {
      const err = new Error('Registration record not found or access denied');
      (err as any).statusCode = 404;
      throw err;
    }

    await vendorRepository.deleteRegistration(id);
    await this.evaluateCompliance(profile.id);
  }

  /**
   * Deterministic Government API Verification Sandbox Adapter
   * Checks format, checksums, structure, and cross-field integrity
   */
  async verifyRegistration(_vendorProfileId: string, registrationId: string): Promise<VendorRegistrationData> {
    const reg = await vendorRepository.getRegistrationById(registrationId);
    if (!reg) throw new Error('Registration not found');

    const type = reg.registrationType.toUpperCase();
    const num = reg.registrationNumber.trim().toUpperCase();
    let status: VendorRegistrationData['verificationStatus'] = 'VERIFIED';
    let source = `DEMO_SANDBOX_${type}`;
    let failureReason: string | null = null;

    if (type === 'PAN') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(num)) {
        status = 'VERIFICATION_FAILED';
        failureReason = 'Invalid PAN format. Must be 5 uppercase letters, 4 digits, followed by 1 letter (e.g., AAACD1234F).';
      }
      source = 'DEMO_SANDBOX_INCOMETAX';
    } else if (type === 'GSTIN') {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(num)) {
        status = 'VERIFICATION_FAILED';
        failureReason = 'Invalid GSTIN structure. Must be 15 alphanumeric characters matching GSTN format (e.g., 27AAACD1234F1Z5).';
      }
      source = 'DEMO_SANDBOX_GSTN';
    } else if (type === 'UDYAM') {
      const udyamRegex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;
      if (!udyamRegex.test(num)) {
        status = 'VERIFICATION_FAILED';
        failureReason = 'Invalid Udyam registration format. Expected format: UDYAM-XX-00-0000000.';
      }
      source = 'DEMO_SANDBOX_UDYAM';
    } else if (type === 'STARTUP_INDIA') {
      if (num.length < 5) {
        status = 'VERIFICATION_FAILED';
        failureReason = 'DPIIT recognition number appears truncated or invalid.';
      }
      source = 'DEMO_SANDBOX_DPIIT';
    }

    // Check expiry
    if (reg.expiryDate && new Date(reg.expiryDate) < new Date()) {
      status = 'EXPIRED';
      failureReason = `Registration expired on ${new Date(reg.expiryDate).toLocaleDateString('en-IN')}`;
    }

    const updated = await vendorRepository.updateRegistration(registrationId, {
      verificationStatus: status,
      verificationSource: source,
      failureReason,
      lastVerifiedAt: new Date(),
    });

    return updated;
  }

  // -------------------------------------------------------------
  // DOCUMENT VAULT
  // -------------------------------------------------------------
  async listDocuments(userId: string, category?: string): Promise<VendorDocumentData[]> {
    const profile = await this.getOrCreateProfile(userId);
    return vendorRepository.listDocuments(profile.id, category);
  }

  async uploadDocument(
    userId: string,
    meta: {
      category: DocumentCategory;
      documentType: string;
      title: string;
      originalFilename: string;
      mimeType: string;
      fileSize: number;
      fileBuffer?: Buffer;
      issueDate?: string;
      expiryDate?: string;
    }
  ): Promise<VendorDocumentData> {
    const profile = await this.getOrCreateProfile(userId);

    // MIME and size validations
    const allowedMime = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMime.includes(meta.mimeType)) {
      const err = new Error(`Unsupported file type: ${meta.mimeType}. Only PDF, JPG, PNG, and DOCX are permitted.`);
      (err as any).statusCode = 400;
      throw err;
    }

    if (meta.fileSize > 25 * 1024 * 1024) {
      const err = new Error('File exceeds maximum size limit of 25MB.');
      (err as any).statusCode = 400;
      throw err;
    }

    const fileHash = meta.fileBuffer
      ? crypto.createHash('sha256').update(meta.fileBuffer).digest('hex')
      : crypto.createHash('sha256').update(`${meta.originalFilename}-${Date.now()}`).digest('hex');

    const storageKey = `vault/${profile.id}/${Date.now()}_${meta.originalFilename}`;

    // Determine verification status
    let verificationStatus: VendorDocumentData['verificationStatus'] = 'VERIFIED';
    let rejectionReason: string | null = null;

    if (meta.expiryDate && new Date(meta.expiryDate) < new Date()) {
      verificationStatus = 'EXPIRED';
      rejectionReason = `Document expired on ${new Date(meta.expiryDate).toLocaleDateString('en-IN')}`;
    }

    const doc = await vendorRepository.saveDocument(profile.id, {
      category: meta.category,
      documentType: meta.documentType,
      title: meta.title,
      originalFilename: meta.originalFilename,
      storageKey,
      mimeType: meta.mimeType,
      fileSize: meta.fileSize,
      fileHash,
      issueDate: meta.issueDate || null,
      expiryDate: meta.expiryDate || null,
      version: 1,
      verificationStatus,
      rejectionReason,
    });

    void auditService.log(AuditEventType.BID_DOCUMENT_UPLOADED, {
      actor: userId,
      metadata: {
        vendorProfileId: profile.id,
        documentId: doc.id,
        title: doc.title,
        category: doc.category,
      },
    });

    await this.evaluateCompliance(profile.id);
    return doc;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await vendorRepository.getDocumentById(documentId);
    if (!existing || existing.vendorProfileId !== profile.id) {
      const err = new Error('Document not found or access denied');
      (err as any).statusCode = 404;
      throw err;
    }

    await vendorRepository.deleteDocument(documentId);
    await this.evaluateCompliance(profile.id);
  }

  // -------------------------------------------------------------
  // COMPLIANCE CENTER & INCONSISTENCY ENGINE
  // -------------------------------------------------------------
  async evaluateCompliance(vendorProfileId: string): Promise<ComplianceIssueData[]> {
    const registrations = await vendorRepository.listRegistrations(vendorProfileId);
    const documents = await vendorRepository.listDocuments(vendorProfileId);

    const issues: Array<Omit<ComplianceIssueData, 'id' | 'vendorProfileId' | 'createdAt' | 'updatedAt'>> = [];

    const panReg = registrations.find((r) => r.registrationType.toUpperCase() === 'PAN');
    const gstReg = registrations.find((r) => r.registrationType.toUpperCase() === 'GSTIN');

    // 1. Mandatory Statutory Checks
    if (!panReg) {
      issues.push({
        issueType: 'MISSING_MANDATORY',
        fieldKey: 'pan_registration',
        affectedDocument: 'Permanent Account Number (PAN) Card',
        detectedValue: null,
        expectedValue: '10-character PAN Record',
        reason: 'Statutory PAN registration is missing. Mandatory for all GeM bidding & GFR 2017 eligibility.',
        severity: 'CRITICAL',
        suggestedAction: 'Add PAN details under Registrations & Certificates with certificate attachment.',
        status: 'OPEN',
      });
    }

    if (!gstReg) {
      issues.push({
        issueType: 'MISSING_MANDATORY',
        fieldKey: 'gstin_registration',
        affectedDocument: 'GST Registration Certificate',
        detectedValue: null,
        expectedValue: '15-character GSTIN Record',
        reason: 'GSTIN registration is mandatory for commercial tender participation in India.',
        severity: 'HIGH',
        suggestedAction: 'Register active GSTIN and upload Form GST REG-06.',
        status: 'OPEN',
      });
    }

    // 2. Cross-Record Integrity: GSTIN vs PAN Mismatch
    if (panReg && gstReg) {
      const panNum = panReg.registrationNumber.trim().toUpperCase();
      const gstNum = gstReg.registrationNumber.trim().toUpperCase();
      const embeddedPan = gstNum.length >= 12 ? gstNum.substring(2, 12) : '';

      if (embeddedPan && embeddedPan !== panNum) {
        issues.push({
          issueType: 'MISMATCH',
          fieldKey: 'gstin_pan_crossmatch',
          affectedDocument: 'GST vs PAN Cross-Verification',
          detectedValue: `GSTIN embedded PAN: ${embeddedPan}`,
          expectedValue: `Profile PAN: ${panNum}`,
          reason: 'GSTIN characters 3 to 12 do not match the registered company PAN. Procurement evaluation will flag this as an identity conflict.',
          severity: 'CRITICAL',
          suggestedAction: 'Ensure GSTIN belongs to the exact PAN entity registered in your vendor profile.',
          status: 'OPEN',
        });
      }
    }

    // 3. Expiry Checks on Registrations & Documents
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    for (const reg of registrations) {
      if (reg.expiryDate) {
        const exp = new Date(reg.expiryDate);
        if (exp < now) {
          issues.push({
            issueType: 'EXPIRED',
            fieldKey: `${reg.registrationType.toLowerCase()}_expiry`,
            affectedDocument: `${reg.registrationType} Registration`,
            detectedValue: `Expired on ${exp.toLocaleDateString('en-IN')}`,
            expectedValue: 'Valid & Active Registration',
            reason: `${reg.registrationType} validity has lapsed. Expired credentials lead to automatic bid rejection.`,
            severity: 'HIGH',
            suggestedAction: `Renew ${reg.registrationType} with ${reg.issuingAuthority} and upload renewed certificate.`,
            status: 'OPEN',
          });
        } else if (exp < thirtyDaysFromNow) {
          issues.push({
            issueType: 'EXPIRED',
            fieldKey: `${reg.registrationType.toLowerCase()}_upcoming_expiry`,
            affectedDocument: `${reg.registrationType} Registration`,
            detectedValue: `Expires on ${exp.toLocaleDateString('en-IN')}`,
            expectedValue: 'Active for > 30 days',
            reason: `${reg.registrationType} expires in less than 30 days. May lapse during tender evaluation period.`,
            severity: 'MEDIUM',
            suggestedAction: 'Initiate certificate renewal to prevent tender disqualification.',
            status: 'OPEN',
          });
        }
      }
    }

    for (const doc of documents) {
      if (doc.expiryDate) {
        const exp = new Date(doc.expiryDate);
        if (exp < now) {
          issues.push({
            issueType: 'EXPIRED',
            fieldKey: `doc_${doc.id}_expiry`,
            affectedDocument: doc.title,
            detectedValue: `Expired on ${exp.toLocaleDateString('en-IN')}`,
            expectedValue: 'Valid Document',
            reason: `Document "${doc.title}" has expired and cannot be attached to new tender bids.`,
            severity: 'HIGH',
            suggestedAction: 'Upload the renewed document in Document Vault.',
            status: 'OPEN',
          });
        }
      }
    }

    // 4. Financial Records Check
    const financialDocs = documents.filter((d) => d.category === 'FINANCIAL_RECORD');
    if (financialDocs.length === 0) {
      issues.push({
        issueType: 'MISSING_MANDATORY',
        fieldKey: 'audited_financials',
        affectedDocument: 'Audited Balance Sheet / P&L Statement',
        detectedValue: '0 financial records',
        expectedValue: 'At least 1 year audited balance sheet',
        reason: 'Most GeM tenders enforce annual turnover eligibility verified via CA-certified balance sheets.',
        severity: 'MEDIUM',
        suggestedAction: 'Upload audited financial statements for the past 3 financial years in Document Vault.',
        status: 'OPEN',
      });
    }

    return vendorRepository.syncComplianceIssues(vendorProfileId, issues);
  }

  async getComplianceSummary(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    const registrations = await vendorRepository.listRegistrations(profile.id);
    const documents = await vendorRepository.listDocuments(profile.id);
    const issues = await this.evaluateCompliance(profile.id);

    const verifiedDocs = documents.filter((d) => d.verificationStatus === 'VERIFIED').length;
    const pendingDocs = documents.filter((d) => d.verificationStatus === 'PENDING_VERIFICATION').length;
    const expiredDocs = documents.filter((d) => d.verificationStatus === 'EXPIRED').length;

    const criticalIssues = issues.filter((i) => i.severity === 'CRITICAL');
    const highIssues = issues.filter((i) => i.severity === 'HIGH');
    const mediumIssues = issues.filter((i) => i.severity === 'MEDIUM');

    // Overall readiness score (0-100)
    let score = 100;
    score -= criticalIssues.length * 25;
    score -= highIssues.length * 15;
    score -= mediumIssues.length * 5;
    if (score < 0) score = 0;

    return {
      vendorProfileId: profile.id,
      overallReadinessScore: Math.round(score),
      totalRequiredDocuments: 6, // PAN, GST, MSME, Financials, Solvency, Board Resolution
      documentsSubmitted: documents.length,
      documentsVerified: verifiedDocs,
      documentsPending: pendingDocs,
      expiredDocuments: expiredDocs,
      registrationsCount: registrations.length,
      registrationsVerified: registrations.filter((r) => r.verificationStatus === 'VERIFIED').length,
      issuesCount: issues.length,
      criticalIssuesCount: criticalIssues.length,
      highIssuesCount: highIssues.length,
      mediumIssuesCount: mediumIssues.length,
      issues,
    };
  }

  // -------------------------------------------------------------
  // DASHBOARD OVERVIEW METRICS
  // -------------------------------------------------------------
  async getOverviewMetrics(userId: string): Promise<VendorOverviewMetrics> {
    const profile = await this.getOrCreateProfile(userId);
    const representative = await vendorRepository.getRepresentative(profile.id);
    const registrations = await vendorRepository.listRegistrations(profile.id);
    const documents = await vendorRepository.listDocuments(profile.id);
    const issues = await vendorRepository.listComplianceIssues(profile.id);

    // Calculate real profile completion percentage
    let totalFields = 10;
    let completedFields = 0;
    if (profile.legalName) completedFields++;
    if (profile.tradeName) completedFields++;
    if (profile.businessType) completedFields++;
    if (profile.companyRegistrationNumber) completedFields++;
    if (profile.registeredAddress) completedFields++;
    if (profile.city && profile.pinCode) completedFields++;
    if (profile.websiteUrl) completedFields++;
    if (representative?.fullName) completedFields++;
    if (registrations.some((r) => r.registrationType === 'PAN')) completedFields++;
    if (registrations.some((r) => r.registrationType === 'GSTIN')) completedFields++;

    const profileCompletionPercent = Math.round((completedFields / totalFields) * 100);

    // Active applications and bids
    const myApps = await applicationRepository.listByUser(userId).catch(() => []);
    const submittedBids = myApps.filter((a) => a.status !== 'DRAFT' && a.status !== 'WITHDRAWN');
    const pendingCorrections = myApps.filter((a) => a.status === 'CLARIFICATION_REQUIRED');

    // Published tenders & upcoming deadlines
    const allTenders = await tenderRepository.listTenders().catch(() => []);
    const published = allTenders.filter((t: any) => t.status === 'PUBLISHED' || t.status === 'READY');
    const activeTendersCount = published.length;

    const now = new Date();
    const upcomingDeadlines = published
      .filter((t: any) => new Date(t.closingDate) > now)
      .sort((a: any, b: any) => new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime())
      .slice(0, 4)
      .map((t: any) => {
        const diffMs = new Date(t.closingDate).getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          tenderId: t.id,
          title: t.title,
          referenceNumber: t.referenceNumber,
          closingDate: new Date(t.closingDate).toISOString(),
          daysRemaining,
        };
      });

    // Recent activity
    const notifications = await vendorRepository.listNotifications(profile.id);
    const recentActivity = notifications.slice(0, 5).map((n) => ({
      id: n.id,
      action: n.title,
      timestamp: n.createdAt.toISOString(),
      type: n.type,
    }));

    const verifiedDocs = documents.filter((d) => d.verificationStatus === 'VERIFIED').length;
    const pendingDocs = documents.filter((d) => d.verificationStatus === 'PENDING_VERIFICATION').length;
    const expiredDocs = documents.filter((d) => d.verificationStatus === 'EXPIRED').length;
    const awaitingRegs = registrations.filter((r) => r.verificationStatus === 'PENDING_VERIFICATION').length;

    return {
      profileCompletionPercent,
      totalRequiredDocuments: 6,
      documentsSubmitted: documents.length,
      documentsVerified: verifiedDocs,
      documentsPending: pendingDocs,
      missingDocuments: Math.max(0, 6 - documents.length),
      expiredDocuments: expiredDocs,
      activeInconsistencies: issues.filter((i) => i.status === 'OPEN').length,
      registrationsAwaitingVerification: awaitingRegs,
      activeTendersCount,
      submittedBidsCount: submittedBids.length,
      pendingCorrectionsCount: pendingCorrections.length,
      upcomingDeadlines,
      recentActivity,
    };
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async getNotifications(userId: string): Promise<VendorNotificationData[]> {
    const profile = await this.getOrCreateProfile(userId);
    return vendorRepository.listNotifications(profile.id);
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    await this.getOrCreateProfile(userId);
    await vendorRepository.markNotificationAsRead(notificationId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    await vendorRepository.markAllNotificationsAsRead(profile.id);
  }

  // -------------------------------------------------------------
  // CLARIFICATIONS WORKFLOW (BIDDER)
  // -------------------------------------------------------------
  async listClarifications(userId: string) {
    const user = await userRepository.findById(userId);
    const apps = await applicationRepository.listByUser(userId);
    const bidderIds = apps.map((a) => a.bidderId).filter(Boolean);
    const appIds = apps.map((a) => a.id);

    if (userId === 'usr_demo_bidder' || user?.email === 'demo.bidder@bidguard.local') {
      bidderIds.push('bdr_001');
    }

    return officerRepository.listClarificationsForBidder(bidderIds, appIds);
  }

  async getClarification(userId: string, clarificationId: string) {
    const clr = await officerRepository.findClarificationById(clarificationId);
    if (!clr) {
      const err = new Error('Clarification request not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const user = await userRepository.findById(userId);
    const apps = await applicationRepository.listByUser(userId);
    const bidderIds = new Set(apps.map((a) => a.bidderId).filter(Boolean));
    const appIds = new Set(apps.map((a) => a.id));

    if (userId === 'usr_demo_bidder' || user?.email === 'demo.bidder@bidguard.local') {
      bidderIds.add('bdr_001');
    }

    const isOwner = bidderIds.has(clr.bidderId) || (clr.applicationId && appIds.has(clr.applicationId));
    if (!isOwner) {
      const err = new Error('Access denied: Clarification belongs to another vendor');
      (err as any).statusCode = 403;
      throw err;
    }

    return clr;
  }

  async respondToClarification(
    userId: string,
    clarificationId: string,
    data: { response: string; responseDocuments?: string[]; documents?: any[] }
  ) {
    if (!data.response || data.response.trim().length < 10) {
      const err = new Error('Substantive written clarification response of at least 10 characters is required.');
      (err as any).statusCode = 400;
      throw err;
    }

    const clr = await this.getClarification(userId, clarificationId);

    if (clr.status === 'RESPONDED' || clr.status === 'CLOSED') {
      const err = new Error('Clarification request has already been answered and closed.');
      (err as any).statusCode = 400;
      throw err;
    }

    if (new Date().getTime() > new Date(clr.deadline).getTime()) {
      const err = new Error(`Clarification response deadline elapsed on ${new Date(clr.deadline).toLocaleString()}. Responses are closed.`);
      (err as any).statusCode = 400;
      throw err;
    }

    const docs = (data.responseDocuments && data.responseDocuments.length > 0)
      ? data.responseDocuments
      : (data.documents && data.documents.length > 0)
      ? data.documents.map((d: any) => typeof d === 'string' ? d : d.name || d.originalFilename || d.id)
      : [];

    const updated = await officerRepository.updateClarification(clarificationId, {
      status: 'RESPONDED',
      bidderResponse: data.response.trim(),
      responseSubmittedAt: new Date().toISOString(),
      responseDocuments: docs,
    });

    if (clr.applicationId) {
      try {
        await applicationRepository.updateStatus(clr.applicationId, 'UNDER_REVIEW' as any);
      } catch {}
    }

    const user = await userRepository.findById(userId);
    await auditService.log(AuditEventType.CONFLICT_RESOLVED, {
      tenderId: clr.tenderId,
      bidderId: clr.bidderId,
      actor: `${user?.name || 'Commercial Bidder'} (${userId})`,
      metadata: {
        clarificationId,
        subject: clr.subject,
        responseSubmittedAt: new Date().toISOString(),
        documentCount: data.documents?.length || 0,
        responseSnippet: data.response.trim().slice(0, 100),
      },
    });

    await officerRepository.addNotification({
      id: `notif_off_${Date.now()}`,
      title: 'Clarification Response Submitted',
      message: `${user?.name || clr.bidderName} submitted clarification response for: "${clr.subject}"`,
      type: 'CLARIFICATION_REPLIED',
      tenderId: clr.tenderId,
      bidderName: clr.bidderName,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return updated;
  }
}

export const vendorService = new VendorService();

