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
      companyName: companyName || 'Registered Bidder Enterprise',
      companyType: companyDetails?.companyType || storedProfile?.companyType || 'Private Limited',
      gstin: companyDetails?.gstin || storedProfile?.gstin || '33AABCL1234F1Z5',
      pan: companyDetails?.pan || storedProfile?.pan || 'AABCL1234F',
      registeredAddress: companyDetails?.registeredAddress || storedProfile?.registeredAddress || 'Registered Office, India',
      contactEmail: user.email,
      contactPhone: user.phone || companyDetails?.contactPhone || storedProfile?.contactPhone || '+91 98765 00000',
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
      companyName: user?.name || 'Company Profile',
      companyType: 'Private Limited',
      gstin: '33AABCL1234F1Z5',
      pan: 'AABCL1234F',
      registeredAddress: 'Registered Office Address',
      contactEmail: user?.email || '',
      contactPhone: user?.phone || '+91 98765 00000',
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
}

export const applicationService = new ApplicationService();
