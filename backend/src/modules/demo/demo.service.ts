import { CANONICAL_DEMO_DATA } from './canonicalDemoData.js';
import { tenderRepository } from '../tenders/tender.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { evaluationRepository } from '../evaluations/evaluation.repository.js';
import { conflictRepository } from '../conflicts/conflict.repository.js';
import { intelligenceRepository } from '../intelligence/intelligence.repository.js';
import {
  BlueprintStatus,
  DocumentProcessingStatus,
  SubmissionStatus,
  MandatoryStatus,
  RequirementStatus,
  RequirementCategory,
  BidDocumentType,
  ConflictType,
  ConflictSeverity,
  ConflictStatus,
} from '@prisma/client';

export class DemoService {
  /**
   * Seed or re-seed the canonical demo dataset
   */
  async seedCanonicalDemo(): Promise<{
    tenderId: string;
    referenceNumber: string;
    requirementsCount: number;
    biddersCount: number;
    evaluationsCount: number;
    conflictsCount: number;
    verificationsCount: number;
  }> {
    const data = CANONICAL_DEMO_DATA;

    // 1. Ensure Tender exists in tenderRepository
    let tender =
      (await tenderRepository.findTenderById(data.id)) ||
      (await tenderRepository.findTenderByReferenceNumber(data.referenceNumber));

    if (!tender) {
      tender = await tenderRepository.createTender({
        id: data.id,
        title: data.title,
        referenceNumber: data.referenceNumber,
        organization: data.organization,
        closingDate: new Date(Date.now() + 14 * 86400000), // 14 days in future
        description: data.description,
      });
    }

    const actualTenderId = tender.id;

    // 1b. Ensure Tender Documents exist in tenderRepository
    const existingDocs = await tenderRepository.listDocumentsByTender(actualTenderId);
    if (existingDocs.length === 0) {
      const doc1 = await tenderRepository.createDocument({
        tenderId: actualTenderId,
        originalFilename: 'CPCL_Refinery_EPC_Tender_Specifications_Vol_1.pdf',
        storageKey: `tenders/${actualTenderId}/specs_vol1.pdf`,
        mimeType: 'application/pdf',
        fileSize: 4528190,
        fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        pageCount: 84,
      });
      await tenderRepository.updateDocumentProgress(doc1.id, {
        status: DocumentProcessingStatus.COMPLETED,
        progress: 100,
        currentStage: 'COMPLETED',
        completed: true,
      });

      const doc2 = await tenderRepository.createDocument({
        tenderId: actualTenderId,
        originalFilename: 'CPCL_Refinery_EPC_Technical_Requirements_Vol_2.pdf',
        storageKey: `tenders/${actualTenderId}/technical_vol2.pdf`,
        mimeType: 'application/pdf',
        fileSize: 2891040,
        fileHash: 'f4c1d55309fd2d250baca5d9007gc03538bf52f5750c045db506002c8963c966',
        pageCount: 56,
      });
      await tenderRepository.updateDocumentProgress(doc2.id, {
        status: DocumentProcessingStatus.COMPLETED,
        progress: 100,
        currentStage: 'COMPLETED',
        completed: true,
      });
    }

    // 1c. Ensure Compliance Blueprint & Requirements exist in requirementRepository
    let blueprint = await requirementRepository.getLatestBlueprint(actualTenderId);
    if (!blueprint) {
      blueprint = await requirementRepository.createBlueprint({
        tenderId: actualTenderId,
        version: 1,
        status: BlueprintStatus.APPROVED,
      });

      const mapCategory = (cat: string): RequirementCategory => {
        switch (cat) {
          case 'FINANCIAL': return RequirementCategory.FINANCIAL;
          case 'TECHNICAL': return RequirementCategory.TECHNICAL;
          case 'LEGAL': return RequirementCategory.STATUTORY;
          case 'EXPERIENCE': return RequirementCategory.ELIGIBILITY;
          case 'ADMINISTRATIVE': return RequirementCategory.POLICY;
          default: return RequirementCategory.TENDER_SPECIFIC;
        }
      };

      for (const r of data.requirements) {
        await requirementRepository.createRequirement({
          blueprintId: blueprint.id,
          requirementCode: r.code,
          clauseReference: r.code,
          requirementText: r.description,
          normalizedRequirementText: r.description.toLowerCase(),
          category: mapCategory(r.category),
          mandatory: r.isMandatory ? MandatoryStatus.YES : MandatoryStatus.NO,
          aiExplanation: `Deterministic compliance extraction for clause ${r.code}`,
          status: RequirementStatus.APPROVED,
        });
      }
    }

    // 2. Ensure Bidders & Submissions exist
    for (const b of data.bidders) {
      let bidder =
        (await bidderRepository.findBidderById(b.id)) ||
        (await bidderRepository.findBidderByCode(actualTenderId, b.bidderCode));
      if (!bidder) {
        bidder = await bidderRepository.createBidder({
          tenderId: actualTenderId,
          bidderCode: b.bidderCode,
          legalName: b.legalName,
          displayName: b.displayName,
        });
      }

      let sub = await bidderRepository.findActiveSubmissionByBidder(bidder.id);
      if (!sub) {
        sub = await bidderRepository.createSubmission({
          tenderId: actualTenderId,
          bidderId: bidder.id,
          submissionReference: b.submissionRef,
        });
        await bidderRepository.updateSubmissionStatus(sub.id, SubmissionStatus.SUBMITTED);
      }

      const existingBidDocs = await bidderRepository.listBidDocumentsBySubmission(sub.id);
      for (const d of b.documents) {
        const docExists = existingBidDocs.some((ed) => ed.originalFilename === d.fileName);
        if (!docExists) {
          const doc = await bidderRepository.createBidDocument({
            bidSubmissionId: sub.id,
            originalFilename: d.fileName,
            storageKey: `bidders/${bidder.id}/${d.fileName}`,
            mimeType: 'application/pdf',
            fileSize: 1024 * 1024 * 2,
            fileHash: `hash_${d.id}`,
            documentType: BidDocumentType.TECHNICAL_PROPOSAL,
          });
          await bidderRepository.updateBidDocumentProgress(doc.id, {
            status: DocumentProcessingStatus.COMPLETED,
            progress: 100,
            currentStage: 'COMPLETED',
            pageCount: d.pages,
            completed: true,
          });
        }
      }
    }

    // 2b. Ensure Evaluations & Conflicts are seeded in evaluationRepository & conflictRepository
    const existingEvals = await evaluationRepository.listEvaluationsByTender(actualTenderId);
    if (existingEvals.length === 0) {
      for (const e of data.evaluations) {
        const bidder = (await bidderRepository.findBidderByCode(actualTenderId, e.bidderId)) ||
                       (await bidderRepository.findBidderById(e.bidderId));
        const bidderId = bidder ? bidder.id : e.bidderId;
        const sub = bidder ? await bidderRepository.findActiveSubmissionByBidder(bidder.id) : null;
        const submissionId = sub ? sub.id : `sub_${bidderId}`;

        await evaluationRepository.createEvaluation({
          tenderId: actualTenderId,
          bidderId,
          bidSubmissionId: submissionId,
          requirementId: e.requirementId,
          ruleId: `rule_${e.requirementId}`,
          result: e.status as any,
          reasonCode: e.status === 'PASS' ? 'CRITERIA_MET' : e.status === 'FAIL' ? 'CRITERIA_FAILED' : 'MANUAL_REVIEW_REQUIRED',
          summary: e.summary,
          explanation: e.summary,
        });
      }
    }

    for (const c of data.conflicts) {
      const bidder = (await bidderRepository.findBidderByCode(actualTenderId, c.bidderId)) ||
                     (await bidderRepository.findBidderById(c.bidderId));
      const bidderId = bidder ? bidder.id : c.bidderId;
      const sub = bidder ? await bidderRepository.findActiveSubmissionByBidder(bidder.id) : null;
      const submissionId = sub ? sub.id : `sub_${bidderId}`;

      await conflictRepository.saveConflict({
        tenderId: actualTenderId,
        bidderId,
        bidSubmissionId: submissionId,
        conflictType: ConflictType.NUMERIC_VALUE_CONFLICT,
        severity: c.severity === 'CRITICAL' ? ConflictSeverity.CRITICAL : ConflictSeverity.HIGH,
        status: ConflictStatus.DETECTED,
        fieldKey: 'turnover',
        description: c.description,
        fingerprint: `fp_${c.id}`,
        confidence: 0.95,
        detectedBy: 'DeterministicConflictDetector',
        detectorVersion: '1.0.0',
        requiresInvestigation: true,
        items: [],
      });
    }

    // 3. Seed Intelligence Repository In-Memory Store
    const reqs = data.requirements.map((r) => ({
      id: r.id,
      tenderId: actualTenderId,
      code: r.code,
      title: r.title,
      category: r.category,
      isMandatory: r.isMandatory,
      description: r.description,
      sourceReferences: [{ document: 'Tender_Specs.pdf', page: 1 }],
      rules: [
        {
          id: `rule_${r.id}`,
          ruleCode: `RULE_${r.code}`,
          status: 'ACTIVE',
          isApproved: true,
          version: 1,
        },
      ],
    }));

    const evaluations = data.evaluations.map((e, idx) => ({
      id: `eval_${actualTenderId}_${idx + 1}`,
      tenderId: actualTenderId,
      bidderId: e.bidderId,
      requirementId: e.requirementId,
      result: e.status,
      status: e.status,
      complianceScore: e.status === 'PASS' ? 1.0 : e.status === 'REVIEW' ? 0.5 : 0.0,
      ruleId: `rule_${e.requirementId}`,
      ruleCode: e.ruleCode,
      summary: e.summary,
      evidenceFactIds: e.evidenceFactIds,
      rule: { id: `rule_${e.requirementId}`, ruleCode: e.ruleCode, version: 1 },
      requirement: {
        id: e.requirementId,
        requirementCode: e.ruleCode,
        mandatory: 'YES',
        category: 'FINANCIAL',
      },
      bidder: {
        id: e.bidderId,
        bidderCode: e.bidderId,
        legalName: 'Canonical Bidder',
      },
      evidenceSnapshot: [{ page: e.sourcePage, doc: e.sourceDocument }],
      evaluatedBy: 'SYSTEM',
      evidenceFacts: e.evidenceFactIds.map((fid) => ({
        id: fid,
        documentId: `doc_${e.bidderId}`,
        pageNumber: e.sourcePage,
        rawText: e.summary,
        sourceText: e.summary,
      })),
      createdAt: new Date(),
    }));

    const conflicts = data.conflicts.map((c) => ({
      id: c.id,
      tenderId: actualTenderId,
      bidderId: c.bidderId,
      requirementId: c.requirementId,
      conflictType: 'FACT_DISCREPANCY',
      title: c.title,
      description: c.description,
      severity: c.severity,
      status: 'DETECTED',
      sourceFacts: c.sourceFacts,
      createdAt: new Date(),
    }));

    const verifications = data.verifications.map((v) => ({
      id: v.id,
      tenderId: actualTenderId,
      bidderId: v.bidderId,
      identifierType: v.identifierType,
      claimedValue: v.claimedValue,
      verifiedValue: v.verifiedValue,
      matchStatus: v.matchStatus,
      providerMode: 'MOCK',
      providerName: v.providerName,
      status: v.matchStatus === 'MATCH' ? 'MATCH' : 'MISMATCH',
      createdAt: new Date(),
    }));

    const investigations = data.investigations.map((i) => ({
      id: i.id,
      tenderId: actualTenderId,
      bidderId: i.bidderId,
      requirementId: i.requirementId,
      title: i.title,
      hypothesis: i.hypothesis,
      status: 'REQUIRES_HUMAN',
      officerDecision: i.officerDecision,
      createdAt: new Date(),
    }));

    intelligenceRepository.seedInMemory(data.id, {
      tender: {
        id: data.id,
        title: data.title,
        referenceNumber: data.referenceNumber,
        organization: data.organization,
        closingDate: new Date(Date.now() + 14 * 86400000),
        status: data.status,
        createdAt: new Date(),
      },
      requirements: reqs,
      bidders: data.bidders.map((b) => ({
        id: b.id,
        tenderId: data.id,
        bidderCode: b.bidderCode,
        legalName: b.legalName,
        displayName: b.displayName,
      })),
      evaluations,
      conflicts,
      verifications,
      investigations,
      evidence: evaluations.flatMap((e) => e.evidenceFacts),
    });

    if (actualTenderId !== data.id) {
      intelligenceRepository.seedInMemory(actualTenderId, {
        tender: {
          id: actualTenderId,
          title: data.title,
          referenceNumber: data.referenceNumber,
          organization: data.organization,
          closingDate: new Date(Date.now() + 14 * 86400000),
          status: data.status,
          createdAt: new Date(),
        },
        requirements: reqs,
        bidders: data.bidders.map((b) => ({
          id: b.id,
          tenderId: actualTenderId,
          bidderCode: b.bidderCode,
          legalName: b.legalName,
          displayName: b.displayName,
        })),
        evaluations,
        conflicts,
        verifications,
        investigations,
        evidence: evaluations.flatMap((e) => e.evidenceFacts),
      });
    }

    return {
      tenderId: actualTenderId,
      referenceNumber: data.referenceNumber,
      requirementsCount: reqs.length,
      biddersCount: data.bidders.length,
      evaluationsCount: evaluations.length,
      conflictsCount: conflicts.length,
      verificationsCount: verifications.length,
    };
  }

  /**
   * Validate canonical demo state completeness
   */
  async validateDemoState(): Promise<{
    isComplete: boolean;
    missingComponents: string[];
    summary: Record<string, number>;
  }> {
    const data = CANONICAL_DEMO_DATA;
    const header = await intelligenceRepository.getTenderHeader(data.id);
    const missing: string[] = [];

    if (!header) missing.push('TenderHeader');

    const reqs = await intelligenceRepository.getTenderRequirements(data.id);
    if (reqs.length < 20) missing.push(`Requirements (found ${reqs.length}, expected >= 20)`);

    const bidders = await intelligenceRepository.getBiddersForTender(data.id);
    if (bidders.length < 3) missing.push(`Bidders (found ${bidders.length}, expected >= 3)`);

    const evals = await intelligenceRepository.getEvaluationsForTender(data.id);
    if (evals.length === 0) missing.push('Evaluations');

    const conflicts = await intelligenceRepository.getConflictsForTender(data.id);
    if (conflicts.length === 0) missing.push('Conflicts');

    const verifs = await intelligenceRepository.getVerificationsForTender(data.id);
    if (verifs.length === 0) missing.push('Verifications');

    return {
      isComplete: missing.length === 0,
      missingComponents: missing,
      summary: {
        requirements: reqs.length,
        bidders: bidders.length,
        evaluations: evals.length,
        conflicts: conflicts.length,
        verifications: verifs.length,
      },
    };
  }
}

export const demoService = new DemoService();
