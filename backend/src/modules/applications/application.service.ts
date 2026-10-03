import { applicationRepository } from './application.repository.js';
import { TenderApplicationData, ApplicationStatus, BidderCompanyProfile } from './application.types.js';
import { tenderRepository } from '../tenders/tender.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { auditService } from '../../services/audit/audit.service.js';
import { AuditEventType, SubmissionStatus } from '@prisma/client';
import { userRepository } from '../auth/user.repository.js';

export class ApplicationService {
  private sequence = 100;

  private generateApplicationNumber(tenderRef: string): string {
    this.sequence++;
    const year = new Date().getFullYear();
    const cleanRef = tenderRef.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase();
    return `APP-${cleanRef}-${year}-${String(this.sequence).padStart(4, '0')}`;
  }

  async applyToTender(
    tenderId: string,
    userId: string,
    companyDetails?: Partial<BidderCompanyProfile>
  ): Promise<TenderApplicationData> {
    // 1. Verify tender exists and is accepting applications
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      const err = new Error(`Tender ${tenderId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    // 1b. Enforce tender status verification (only PUBLISHED or READY tenders accept applications)
    if (tender.status !== 'PUBLISHED' && tender.status !== 'READY') {
      const err = new Error(
        `Cannot apply: Tender is currently in ${tender.status} status and is not accepting applications.`
      );
      (err as any).statusCode = 400;
      throw err;
    }

    // 2. Enforce closing date check
    if (new Date() >= new Date(tender.closingDate)) {
      const err = new Error('Tender is no longer accepting applications. The submission deadline has passed.');
      (err as any).statusCode = 400;
      throw err;
    }

    // 3. Verify user exists and has BIDDER role
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'BIDDER') {
      const err = new Error('Only registered bidders can apply to tenders.');
      (err as any).statusCode = 403;
      throw err;
    }

    // 4. Duplicate check
    const existing = await applicationRepository.findByTenderAndUser(tenderId, userId);
    if (existing) {
      const err = new Error('You have already applied to this tender.');
      (err as any).statusCode = 409;
      throw err;
    }

    // 5. Build company details (resolve user profile or supplied details)
    const storedProfile = await applicationRepository.getProfile(userId);
    const companyName = companyDetails?.companyName?.trim() || storedProfile?.companyName?.trim() || user.name?.trim();
    if (!companyName && !storedProfile) {
      const err = new Error('Bidder profile not found. Please complete your organization profile before applying.');
      (err as any).statusCode = 400;
      throw err;
    }

    const resolvedProfile: BidderCompanyProfile = {
      companyName: companyName || user.name || '',
      companyType: companyDetails?.companyType || storedProfile?.companyType || 'Private Limited',
      gstin: companyDetails?.gstin || storedProfile?.gstin || '',
      pan: companyDetails?.pan || storedProfile?.pan || '',
      registeredAddress: companyDetails?.registeredAddress || storedProfile?.registeredAddress || '',
      contactEmail: user.email,
      contactPhone: user.phone || companyDetails?.contactPhone || storedProfile?.contactPhone || '',
    };

    // Save profile for future pre-fills
    await applicationRepository.saveProfile(userId, resolvedProfile);

    // 6. Ensure Bidder record exists in bidderRepository for this tender
    const existingBidders = await bidderRepository.listBiddersByTender(tenderId);
    let bidder: any = existingBidders.find((b) => b.userId === userId);
    if (!bidder) {
      const bidderCode = `BID-${userId.substring(0, 6)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
      bidder = await bidderRepository.createBidder({
        tenderId,
        bidderCode,
        legalName: resolvedProfile.companyName,
        displayName: resolvedProfile.companyName,
        userId,
        gstin: resolvedProfile.gstin,
        pan: resolvedProfile.pan,
        companyType: resolvedProfile.companyType,
        registeredAddress: resolvedProfile.registeredAddress,
        phone: resolvedProfile.contactPhone,
      });
    }

    // 7. Ensure BidSubmission exists for evaluation linkage
    let sub = await bidderRepository.findActiveSubmissionByBidder(bidder.id);
    if (!sub) {
      sub = await bidderRepository.createSubmission({
        tenderId,
        bidderId: bidder.id,
        submissionReference: `SUB-${bidder.bidderCode}`,
      });
    }

    // 8. Create Application
    const appNumber = this.generateApplicationNumber(tender.referenceNumber);
    const application = await applicationRepository.createApplication({
      tenderId,
      bidderId: bidder.id,
      userId,
      applicationNumber: appNumber,
      companyDetails: resolvedProfile,
    });

    void auditService.log(AuditEventType.APPLICATION_CREATED, {
      tenderId,
      bidderId: bidder.id,
      actor: userId,
      metadata: {
        applicationId: application.id,
        applicationNumber: appNumber,
        companyName: resolvedProfile.companyName,
      },
    });

    return application;
  }

  async updateDraftApplication(
    applicationId: string,
    userId: string,
    data: { companyDetails?: Partial<BidderCompanyProfile> }
  ): Promise<TenderApplicationData> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      const err = new Error(`Application ${applicationId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    if (app.userId !== userId) {
      const err = new Error('Access denied: You can only update your own application.');
      (err as any).statusCode = 403;
      throw err;
    }

    if (app.status !== ApplicationStatus.DRAFT) {
      const err = new Error('Application draft is locked and cannot be edited after submission.');
      (err as any).statusCode = 400;
      throw err;
    }

    if (data.companyDetails) {
      app.companyDetails = {
        ...app.companyDetails,
        ...data.companyDetails,
      };
      app.updatedAt = new Date();
      await applicationRepository.saveProfile(userId, app.companyDetails);
    }

    return app;
  }

  async listBidderApplications(userId: string): Promise<TenderApplicationData[]> {
    return applicationRepository.listByUser(userId);
  }

  async getApplication(applicationId: string, userId: string, role: string): Promise<TenderApplicationData> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      const err = new Error(`Application ${applicationId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    // IDOR Protection: Bidders can only access their own application
    if (role === 'BIDDER' && app.userId !== userId) {
      const err = new Error('Access denied: You do not have permission to view this application.');
      (err as any).statusCode = 403;
      throw err;
    }

    return app;
  }

  async uploadDocument(
    applicationId: string,
    userId: string,
    data: {
      originalFilename: string;
      documentType: string;
      fileSize: number;
      mimeType: string;
      fileBuffer?: Buffer;
    }
  ): Promise<TenderApplicationData> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      const err = new Error(`Application ${applicationId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    if (app.userId !== userId) {
      const err = new Error('Access denied: You can only upload documents to your own application.');
      (err as any).statusCode = 403;
      throw err;
    }

    // Immutability rule: can only upload if DRAFT or CLARIFICATION_REQUIRED
    if (app.status !== ApplicationStatus.DRAFT && app.status !== ApplicationStatus.CLARIFICATION_REQUIRED) {
      const err = new Error('Cannot upload documents: Application has already been submitted and is locked.');
      (err as any).statusCode = 400;
      throw err;
    }

    const docId = `app_doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newDoc = {
      id: docId,
      originalFilename: data.originalFilename,
      documentType: data.documentType,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      status: 'UPLOADED',
      uploadedAt: new Date(),
    };

    const updatedApp = await applicationRepository.addDocument(applicationId, newDoc);

    // Link into Bidder submission pipeline if submission exists
    const submissions = await bidderRepository.listSubmissionsByBidder(app.bidderId);
    if (submissions.length > 0) {
      const sub = submissions[0]!;
      await bidderRepository.createBidDocument({
        bidSubmissionId: sub.id,
        originalFilename: data.originalFilename,
        storageKey: `bidders/${app.bidderId}/${docId}_${data.originalFilename}`,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        documentType: data.documentType as any,
      });
    }

    void auditService.log(AuditEventType.BID_DOCUMENT_UPLOADED, {
      tenderId: app.tenderId,
      bidderId: app.bidderId,
      actor: userId,
      metadata: {
        applicationId,
        documentId: docId,
        filename: data.originalFilename,
      },
    });

    return updatedApp;
  }

  async deleteDocument(applicationId: string, documentId: string, userId: string): Promise<TenderApplicationData> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      const err = new Error(`Application ${applicationId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    if (app.userId !== userId) {
      const err = new Error('Access denied: You can only delete documents from your own application.');
      (err as any).statusCode = 403;
      throw err;
    }

    if (app.status !== ApplicationStatus.DRAFT) {
      const err = new Error('Cannot delete documents after the bid has been submitted.');
      (err as any).statusCode = 400;
      throw err;
    }

    return applicationRepository.removeDocument(applicationId, documentId);
  }

  async submitApplication(applicationId: string, userId: string): Promise<TenderApplicationData> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      const err = new Error(`Application ${applicationId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    if (app.userId !== userId) {
      const err = new Error('Access denied: You can only submit your own application.');
      (err as any).statusCode = 403;
      throw err;
    }

    if (app.status !== ApplicationStatus.DRAFT && app.status !== ApplicationStatus.CLARIFICATION_REQUIRED) {
      const err = new Error('Application has already been submitted.');
      (err as any).statusCode = 400;
      throw err;
    }

    // Verify deadline
    const tender = await tenderRepository.findTenderById(app.tenderId);
    if (tender && new Date() >= new Date(tender.closingDate)) {
      const err = new Error('Submission rejected: The tender submission deadline has passed.');
      (err as any).statusCode = 400;
      throw err;
    }

    // Must have at least 1 document uploaded
    if (app.documents.length === 0) {
      const err = new Error('Please upload at least one required bid document before submitting.');
      (err as any).statusCode = 400;
      throw err;
    }

    const now = new Date();
    const updated = await applicationRepository.updateStatus(applicationId, ApplicationStatus.SUBMITTED, now);

    // Update Bidder Submission status to SUBMITTED in bidder pipeline
    const submissions = await bidderRepository.listSubmissionsByBidder(app.bidderId);
    if (submissions.length > 0) {
      submissions[0]!.status = SubmissionStatus.SUBMITTED;
      submissions[0]!.submittedAt = now;
    }

    void auditService.log(AuditEventType.APPLICATION_SUBMITTED, {
      tenderId: app.tenderId,
      bidderId: app.bidderId,
      actor: userId,
      metadata: {
        applicationId,
        applicationNumber: app.applicationNumber,
        submittedAt: now.toISOString(),
        documentCount: app.documents.length,
      },
    });

    return updated;
  }

  async listTenderApplications(tenderId: string): Promise<TenderApplicationData[]> {
    return applicationRepository.listByTender(tenderId);
  }

  async getBidderProfile(userId: string): Promise<BidderCompanyProfile> {
    const profile = await applicationRepository.getProfile(userId);
    if (profile) return profile;

    const user = await userRepository.findById(userId);
    return {
      companyName: user?.name || '',
      companyType: 'Private Limited',
      gstin: '',
      pan: '',
      registeredAddress: '',
      contactEmail: user?.email || '',
      contactPhone: user?.phone || '',
    };
  }

  async updateBidderProfile(userId: string, profile: BidderCompanyProfile): Promise<BidderCompanyProfile> {
    const saved = await applicationRepository.saveProfile(userId, profile);
    void auditService.log(AuditEventType.BIDDER_PROFILE_UPDATED, {
      actor: userId,
      metadata: {
        companyName: profile.companyName,
        gstin: profile.gstin,
      },
    });
    return saved;
  }

  async preCheckCompliance(applicationId: string, userId: string): Promise<{
    applicationId: string;
    totalChecks: number;
    complianceScore: number;
    overallStatus: 'PASS' | 'WARNING' | 'NEEDS_ATTENTION';
    checks: Array<{
      category: string;
      requirement: string;
      mandatory: boolean;
      status: 'SATISFIED' | 'WARNING' | 'MISSING';
      feedback: string;
      matchedDocument?: string;
    }>;
    summary: {
      totalRequirements: number;
      satisfiedCount: number;
      warningCount: number;
      missingCount: number;
    };
  }> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      const err = new Error(`Application ${applicationId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    if (app.userId !== userId) {
      const err = new Error('Access denied: You can only check your own application.');
      (err as any).statusCode = 403;
      throw err;
    }

    const checks: Array<{
      category: string;
      requirement: string;
      mandatory: boolean;
      status: 'SATISFIED' | 'WARNING' | 'MISSING';
      feedback: string;
      matchedDocument?: string;
    }> = [];

    const details = app.companyDetails || {};
    const docs = app.documents || [];

    // 1. Organization Legal Entity Check
    if (details.companyName && details.companyName.trim().length >= 2) {
      checks.push({
        category: 'ORGANIZATION',
        requirement: 'Valid Commercial Entity Name',
        mandatory: true,
        status: 'SATISFIED',
        feedback: `Registered as: ${details.companyName} (${details.companyType || 'Commercial Entity'}).`,
      });
    } else {
      checks.push({
        category: 'ORGANIZATION',
        requirement: 'Valid Commercial Entity Name',
        mandatory: true,
        status: 'MISSING',
        feedback: 'Company legal name is missing or incomplete.',
      });
    }

    // 2. PAN Check
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (details.pan && panRegex.test(details.pan.trim().toUpperCase())) {
      checks.push({
        category: 'STATUTORY_TAX',
        requirement: 'Permanent Account Number (PAN) Validation',
        mandatory: true,
        status: 'SATISFIED',
        feedback: `Valid PAN checksum format: ${details.pan.trim().toUpperCase()}.`,
      });
    } else {
      checks.push({
        category: 'STATUTORY_TAX',
        requirement: 'Permanent Account Number (PAN) Validation',
        mandatory: true,
        status: details.pan ? 'WARNING' : 'MISSING',
        feedback: details.pan ? 'PAN format is invalid (expected 5 letters, 4 digits, 1 letter).' : 'PAN number is not specified in profile.',
      });
    }

    // 3. GSTIN Check
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (details.gstin && gstinRegex.test(details.gstin.trim().toUpperCase())) {
      checks.push({
        category: 'STATUTORY_TAX',
        requirement: 'GSTIN Registration Verification',
        mandatory: true,
        status: 'SATISFIED',
        feedback: `Valid GSTIN structure verified: ${details.gstin.trim().toUpperCase()}.`,
      });
    } else {
      checks.push({
        category: 'STATUTORY_TAX',
        requirement: 'GSTIN Registration Verification',
        mandatory: true,
        status: details.gstin ? 'WARNING' : 'MISSING',
        feedback: details.gstin ? 'GSTIN structure does not conform to GSTN checksum standards.' : 'GSTIN is missing.',
      });
    }

    // 4. Technical Proposal Document
    const techDoc = docs.find((d) => d.documentType === 'TECHNICAL_PROPOSAL' || d.originalFilename.toLowerCase().includes('technical'));
    if (techDoc) {
      checks.push({
        category: 'TECHNICAL',
        requirement: 'Technical Proposal Dossier',
        mandatory: true,
        status: 'SATISFIED',
        feedback: `Uploaded document: ${techDoc.originalFilename} (${Math.round(techDoc.fileSize / 1024)} KB).`,
        matchedDocument: techDoc.originalFilename,
      });
    } else {
      checks.push({
        category: 'TECHNICAL',
        requirement: 'Technical Proposal Dossier',
        mandatory: true,
        status: 'MISSING',
        feedback: 'No Technical Proposal document uploaded. This is mandatory for qualification.',
      });
    }

    // 5. Financial Audit & Turnover Statement
    const finDoc = docs.find(
      (d) =>
        d.documentType === 'FINANCIAL_AUDIT_REPORT' ||
        d.documentType === 'ANNUAL_BALANCE_SHEET' ||
        d.originalFilename.toLowerCase().includes('audit') ||
        d.originalFilename.toLowerCase().includes('financial')
    );
    if (finDoc) {
      checks.push({
        category: 'FINANCIAL',
        requirement: 'Audited Financial Statements & Turnover',
        mandatory: true,
        status: 'SATISFIED',
        feedback: `Uploaded document: ${finDoc.originalFilename}.`,
        matchedDocument: finDoc.originalFilename,
      });
    } else {
      checks.push({
        category: 'FINANCIAL',
        requirement: 'Audited Financial Statements & Turnover',
        mandatory: true,
        status: 'MISSING',
        feedback: 'Audited financial statements for the past 3 fiscal years must be attached.',
      });
    }

    // 6. Non-Blacklisting / Statutory Declarations
    const declDoc = docs.find(
      (d) =>
        d.documentType === 'GST_DECLARATION' ||
        d.documentType === 'HSE_SAFETY_MANUAL' ||
        d.documentType === 'EXPERIENCE_CERTIFICATE' ||
        d.documentType === 'OTHER_SUPPORTING'
    );
    if (declDoc) {
      checks.push({
        category: 'STATUTORY',
        requirement: 'Supporting Affidavits & Statutory Clearances',
        mandatory: false,
        status: 'SATISFIED',
        feedback: `Uploaded: ${declDoc.originalFilename}.`,
        matchedDocument: declDoc.originalFilename,
      });
    } else {
      checks.push({
        category: 'STATUTORY',
        requirement: 'Supporting Affidavits & Statutory Clearances',
        mandatory: false,
        status: 'WARNING',
        feedback: 'No additional affidavits or certificates uploaded. Additional documents may be requested during review.',
      });
    }

    const satisfiedCount = checks.filter((c) => c.status === 'SATISFIED').length;
    const warningCount = checks.filter((c) => c.status === 'WARNING').length;
    const missingCount = checks.filter((c) => c.status === 'MISSING').length;
    const complianceScore = Math.round((satisfiedCount / checks.length) * 100);

    return {
      applicationId,
      totalChecks: checks.length,
      complianceScore,
      overallStatus: missingCount === 0 && warningCount === 0 ? 'PASS' : missingCount === 0 ? 'WARNING' : 'NEEDS_ATTENTION',
      checks,
      summary: {
        totalRequirements: checks.length,
        satisfiedCount,
        warningCount,
        missingCount,
      },
    };
  }
}

export const applicationService = new ApplicationService();
