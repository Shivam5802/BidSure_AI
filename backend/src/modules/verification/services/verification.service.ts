import { PrismaClient, AuditEventType, VerificationRequestStatus, VerificationResultStatus } from '@prisma/client';
import { VerificationRepository } from '../verification.repository.js';
import { VerificationAdapterRegistry } from '../adapters/verificationAdapter.registry.js';
import { VerificationCrossCheckService } from './verificationCrossCheck.service.js';
import {
  VerificationRequestOptions,
  VerificationExecutionRequest,
  VerificationErrorCode,
} from '../types/verification.types.js';

export class VerificationService {
  private repository: VerificationRepository;
  private registry: VerificationAdapterRegistry;
  private crossCheckService: VerificationCrossCheckService;

  constructor(private prisma: PrismaClient) {
    this.repository = new VerificationRepository(prisma);
    this.registry = VerificationAdapterRegistry.getInstance();
    this.crossCheckService = new VerificationCrossCheckService();
  }

  /**
   * Submit a new verification request
   */
  async createVerificationRequest(options: VerificationRequestOptions) {
    // 1. Resolve adapter
    const adapter = this.registry.resolveAdapter(options.verificationType, options.providerCode);

    // 2. Persist verification request in QUEUED state
    const request = await this.repository.createRequest({
      ...options,
      providerCode: adapter.providerCode,
    });

    // 3. Log audit event
    await this.prisma.auditLog.create({
      data: {
        tenderId: options.tenderId,
        bidderId: options.bidderId,
        submissionId: options.bidSubmissionId,
        event: AuditEventType.VERIFICATION_REQUESTED,
        actor: options.requestedById || 'procurement_officer',
        metadata: {
          verificationRequestId: request.id,
          verificationType: options.verificationType,
          providerCode: adapter.providerCode,
          providerMode: adapter.providerMode,
          requestedIdentifier: options.requestedIdentifier,
        },
      },
    });

    // 4. Execute synchronously or queue
    // In prototype, execute immediately to ensure smooth synchronous API flow
    await this.executeVerificationRequest(request.id);

    return this.repository.findRequestById(request.id);
  }

  /**
   * Convenience method to initiate verification directly from an extracted evidence item
   */
  async verifyFromEvidence(
    evidenceId: string,
    options: { tenderId: string; bidderId: string; requestedById?: string; providerCode?: string }
  ) {
    const evidence = await this.prisma.extractedEvidence.findUnique({
      where: { id: evidenceId },
      include: {
        bidDocument: {
          select: {
            bidSubmissionId: true,
          },
        },
      },
    });

    if (!evidence) {
      throw new Error(`${VerificationErrorCode.VERIFICATION_MISSING_EVIDENCE}: Evidence ${evidenceId} not found`);
    }

    const submissionId = evidence.bidDocument.bidSubmissionId;

    // Deduce verification type & identifier from evidence fieldKey & value
    const { verificationType, identifier } = this.deduceVerificationParameters(evidence.fieldKey, evidence.rawValue);

    return this.createVerificationRequest({
      tenderId: options.tenderId,
      bidderId: options.bidderId,
      bidSubmissionId: submissionId,
      evidenceId: evidence.id,
      verificationType,
      providerCode: options.providerCode || 'MOCK_GOVERNMENT_VERIFICATION',
      requestedIdentifier: identifier,
      requestedById: options.requestedById,
    });
  }

  /**
   * Execute verification process (Invoked by worker or directly)
   */
  async executeVerificationRequest(requestId: string) {
    const request = await this.repository.findRequestById(requestId);
    if (!request) {
      throw new Error(`Verification request ${requestId} not found`);
    }

    // Mark RUNNING
    await this.repository.updateRequestStatus(requestId, VerificationRequestStatus.RUNNING, new Date());

    await this.prisma.auditLog.create({
      data: {
        tenderId: request.tenderId,
        bidderId: request.bidderId,
        submissionId: request.bidSubmissionId,
        event: AuditEventType.VERIFICATION_STARTED,
        actor: request.requestedById || 'procurement_officer',
        metadata: {
          verificationRequestId: requestId,
          providerCode: request.providerCode,
        },
      },
    });

    try {
      // Resolve adapter
      const adapter = this.registry.resolveAdapter(request.verificationType, request.providerCode);

      const execRequest: VerificationExecutionRequest = {
        requestId: request.id,
        tenderId: request.tenderId,
        bidderId: request.bidderId,
        bidSubmissionId: request.bidSubmissionId,
        requirementId: request.requirementId || undefined,
        evidenceId: request.evidenceId || undefined,
        verificationType: request.verificationType,
        providerCode: request.providerCode,
        requestedIdentifier: request.requestedIdentifier,
        requestedById: request.requestedById || undefined,
      };

      // Call adapter
      const adapterResult = await adapter.verify(execRequest);

      // Collect evidence for cross-check
      let evidenceItems: { fieldKey: string; rawValue: string | null }[] = [];

      if (request.evidence) {
        evidenceItems.push({
          fieldKey: request.evidence.fieldKey,
          rawValue: request.evidence.rawValue,
        });
      } else {
        // Fetch evidence for bidder submission
        const bidderEvidence = await this.prisma.extractedEvidence.findMany({
          where: {
            bidDocument: {
              bidSubmissionId: request.bidSubmissionId,
            },
          },
          select: { fieldKey: true, rawValue: true },
        });
        evidenceItems = bidderEvidence;
      }

      // Run Cross-Check
      const crossChecks = this.crossCheckService.runCrossCheck(evidenceItems, adapterResult.normalizedResult);

      // Save Result & Comparisons
      const savedResult = await this.repository.saveResult(
        requestId,
        adapterResult,
        crossChecks,
        request.evidenceId || undefined
      );

      // Audit Log based on status
      const auditEvent =
        adapterResult.status === VerificationResultStatus.MISMATCH
          ? AuditEventType.VERIFICATION_MISMATCH_DETECTED
          : adapterResult.status === VerificationResultStatus.UNAVAILABLE
          ? AuditEventType.VERIFICATION_UNAVAILABLE
          : AuditEventType.VERIFICATION_COMPLETED;

      await this.prisma.auditLog.create({
        data: {
          tenderId: request.tenderId,
          bidderId: request.bidderId,
          submissionId: request.bidSubmissionId,
          event: auditEvent,
          actor: request.requestedById || 'procurement_officer',
          metadata: {
            verificationRequestId: requestId,
            resultId: savedResult.id,
            status: adapterResult.status,
            matchSummary: adapterResult.matchSummary,
            crossCheckCount: crossChecks.length,
          },
        },
      });

      // If mismatch, create a conflict record in Feature 1I conflict graph if applicable
      if (
        adapterResult.status === VerificationResultStatus.MISMATCH ||
        crossChecks.some((c) => c.comparisonStatus === 'MISMATCH')
      ) {
        await this.createEvidenceConflictIfMismatch(request, adapterResult, crossChecks);
      }

      return savedResult;
    } catch (error: any) {
      await this.repository.updateRequestStatus(requestId, VerificationRequestStatus.ERROR, undefined, new Date());

      await this.prisma.auditLog.create({
        data: {
          tenderId: request.tenderId,
          bidderId: request.bidderId,
          submissionId: request.bidSubmissionId,
          event: AuditEventType.VERIFICATION_FAILED,
          actor: request.requestedById || 'procurement_officer',
          metadata: {
            verificationRequestId: requestId,
            error: error.message || 'Verification execution failed',
          },
        },
      });

      throw error;
    }
  }

  /**
   * Retry an existing verification request if eligible
   */
  async retryVerification(requestId: string, requestedById?: string) {
    const request = await this.repository.findRequestById(requestId);
    if (!request) {
      throw new Error(`Verification request ${requestId} not found`);
    }

    if (
      ![
        VerificationRequestStatus.ERROR,
        VerificationRequestStatus.UNAVAILABLE,
        VerificationRequestStatus.CANCELLED,
      ].includes(request.status as any)
    ) {
      throw new Error(
        `Verification request ${requestId} with status ${request.status} is not eligible for retry. Only ERROR, UNAVAILABLE, or CANCELLED requests can be retried.`
      );
    }

    await this.prisma.auditLog.create({
      data: {
        tenderId: request.tenderId,
        bidderId: request.bidderId,
        submissionId: request.bidSubmissionId,
        event: AuditEventType.VERIFICATION_RETRIED,
        actor: requestedById || 'procurement_officer',
        metadata: {
          verificationRequestId: requestId,
          previousStatus: request.status,
        },
      },
    });

    return this.executeVerificationRequest(requestId);
  }

  async getVerificationDetails(requestId: string) {
    return this.repository.findRequestById(requestId);
  }

  async getBidderVerifications(bidderId: string, options?: { verificationType?: any; status?: any }) {
    return this.repository.findRequestsByBidder(bidderId, options);
  }

  async getTenderSummary(tenderId: string) {
    return this.repository.getTenderVerificationSummary(tenderId);
  }

  async getProviders() {
    return this.registry.getProviderMetadataList();
  }

  private deduceVerificationParameters(fieldKey: string, rawValue: string): { verificationType: any; identifier: string } {
    const fk = fieldKey.toLowerCase();
    let verificationType = 'GST';

    if (fk.includes('pan')) {
      verificationType = 'PAN';
    } else if (fk.includes('udyam') || fk.includes('msme')) {
      verificationType = 'UDYAM';
    } else if (fk.includes('startup')) {
      verificationType = 'STARTUP_INDIA';
    } else if (fk.includes('nsic')) {
      verificationType = 'NSIC';
    } else if (fk.includes('epfo') || fk.includes('esic')) {
      verificationType = 'EPFO_ESIC';
    } else if (fk.includes('mca') || fk.includes('cin')) {
      verificationType = 'MCA';
    } else if (fk.includes('blacklist') || fk.includes('debar')) {
      verificationType = 'BLACKLISTING';
    }

    return {
      verificationType,
      identifier: rawValue,
    };
  }

  private async createEvidenceConflictIfMismatch(request: any, adapterResult: any, crossChecks: any[]) {
    try {
      const fingerprint = `verification_conflict_${request.bidderId}_${request.verificationType}_${request.id.substring(0, 8)}`;

      // Check if conflict already exists
      const existing = await this.prisma.evidenceConflict.findUnique({
        where: { bidderId_fingerprint: { bidderId: request.bidderId, fingerprint } },
      });

      if (!existing) {
        const mismatchField = crossChecks.find((c) => c.comparisonStatus === 'MISMATCH') || crossChecks[0];
        const conflictType =
          mismatchField?.comparisonType === 'ENTITY_NAME_MATCH' ? 'ENTITY_NAME_CONFLICT' : 'IDENTIFIER_CONFLICT';

        await this.prisma.evidenceConflict.create({
          data: {
            tenderId: request.tenderId,
            bidderId: request.bidderId,
            bidSubmissionId: request.bidSubmissionId,
            conflictType,
            severity: 'HIGH',
            status: 'DETECTED',
            fieldKey: mismatchField?.fieldKey || request.verificationType,
            description: `External verification mismatch reported by ${adapterResult.providerName}: ${adapterResult.matchSummary}`,
            fingerprint,
            contextSnapshot: {
              verificationRequestId: request.id,
              requestedIdentifier: request.requestedIdentifier,
              providerCode: adapterResult.providerCode,
              crossChecks,
            },
            requiresInvestigation: true,
          },
        });
      }
    } catch (e) {
      // Non-blocking log
      console.warn('Failed to auto-create evidence conflict from verification mismatch:', e);
    }
  }
}
