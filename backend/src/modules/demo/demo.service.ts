import { CANONICAL_DEMO_DATA } from './canonicalDemoData.js';
import { tenderRepository } from '../tenders/tender.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { ruleRepository } from '../rules/rule.repository.js';
import { evidenceRepository } from '../evidence/evidence.repository.js';
import { mappingRepository } from '../mappings/mapping.repository.js';
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
  RuleStatus,
  RuleType,
  EvaluationStatus,
  EvidenceStatus,
  MappingStatus,
  MappingType,
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
    // 1c. Ensure Compliance Blueprint & Requirements exist in requirementRepository
    let blueprint = await requirementRepository.getLatestBlueprint(actualTenderId);
    let blueprintId = blueprint?.id;
    if (!blueprint) {
      const createdBp = await requirementRepository.createBlueprint({
        tenderId: actualTenderId,
        version: 1,
        status: BlueprintStatus.APPROVED,
      });
      blueprintId = createdBp.id;

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
          blueprintId: blueprintId!,
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
      blueprint = await requirementRepository.getLatestBlueprint(actualTenderId);
    }

    // 1d. Ensure APPROVED Rules exist in ruleRepository for every requirement
    const createdRules = new Map<string, any>();
    for (const req of (blueprint?.requirements || [])) {
      const existingRules = await ruleRepository.listRulesByRequirement(req.id);
      let approvedRule = existingRules.find((r) => r.status === RuleStatus.APPROVED);
      if (!approvedRule) {
        approvedRule = await ruleRepository.createRule({
          blueprintId: blueprint!.id,
          requirementId: req.id,
          ruleCode: `RULE-${req.requirementCode}`,
          name: `Compliance Rule for ${req.clauseReference || req.requirementCode}`,
          description: `Deterministic compliance evaluation rule for clause ${req.requirementCode}`,
          ruleType: req.requirementCode === 'FIN-01' ? RuleType.NUMERIC : RuleType.BOOLEAN,
          definition: req.requirementCode === 'FIN-01'
            ? {
                type: 'NUMERIC',
                metric: 'turnover',
                operator: '>=',
                value: 500000000,
                unit: 'INR',
                aggregation: 'AVERAGE',
              }
            : {
                type: 'BOOLEAN',
                field: 'verified',
                operator: 'IS_TRUE',
              },
          status: RuleStatus.APPROVED,
          version: 1,
        });
      }
      createdRules.set(req.id, approvedRule);
    }

    // 2. Ensure Bidders, Submissions, Evidence & Mappings exist
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
      const docsList: any[] = [];
      for (const d of b.documents) {
        let doc: any = existingBidDocs.find((ed) => ed.originalFilename === d.fileName);
        if (!doc) {
          doc = await bidderRepository.createBidDocument({
            bidSubmissionId: sub.id,
            originalFilename: d.fileName,
            storageKey: `bidders/${bidder.id}/${d.fileName}`,
            mimeType: 'application/pdf',
            fileSize: 1024 * 1024 * 2,
            fileHash: `hash_${d.id}`,
            documentType: BidDocumentType.TECHNICAL_COMPLIANCE_DOCUMENT,
          });
          await bidderRepository.updateBidDocumentProgress(doc.id, {
            status: DocumentProcessingStatus.COMPLETED,
            progress: 100,
            currentStage: 'COMPLETED',
            pageCount: d.pages,
            completed: true,
          });
        }
        docsList.push(doc);
      }

      const primaryDoc = docsList[0];
      const isBhel = bidder.bidderCode.includes('002') || b.bidderCode.includes('002') || bidder.id.includes('bhel');
      const isLt = bidder.bidderCode.includes('001') || b.bidderCode.includes('001') || bidder.id.includes('lt');
      const isRil = bidder.bidderCode.includes('003') || b.bidderCode.includes('003') || bidder.id.includes('reliance');

      // Ensure Evidence and Mappings exist for every requirement
      for (const req of (blueprint?.requirements || [])) {
        const code = req.requirementCode;
        const existingMappings = await mappingRepository.listMappingsByRequirement(req.id, bidder.id, false);
        if (existingMappings.length === 0 && primaryDoc) {
          let fieldKey = 'verified';
          let rawValue = 'valid';
          let normalizedValue: any = true;
          let unit: string | null = null;
          let evStatus: EvidenceStatus = EvidenceStatus.VERIFIED_BY_HUMAN;
          let mapStatus: MappingStatus = MappingStatus.CONFIRMED;

          if (code === 'FIN-01') {
            fieldKey = 'turnover';
            unit = 'INR';
            if (isBhel) {
              rawValue = '44.10 Cr';
              normalizedValue = 441000000;
            } else if (isLt) {
              rawValue = '184.20 Cr';
              normalizedValue = 1842000000;
            } else {
              rawValue = '92.40 Cr';
              normalizedValue = 924000000;
            }
          } else if (code === 'EXP-04' && isBhel) {
            evStatus = EvidenceStatus.REVIEW_REQUIRED;
            mapStatus = MappingStatus.REVIEW_REQUIRED;
          } else if (code === 'EXP-03' && isLt) {
            evStatus = EvidenceStatus.REVIEW_REQUIRED;
            mapStatus = MappingStatus.REVIEW_REQUIRED;
          } else if (code === 'FIN-02' && isRil) {
            evStatus = EvidenceStatus.REVIEW_REQUIRED;
            mapStatus = MappingStatus.REVIEW_REQUIRED;
          } else if (code === 'TECH-01' && isRil) {
            rawValue = 'invalid';
            normalizedValue = false;
          } else if (code === 'LEG-03' && isRil) {
            continue;
          }

          const ev = await evidenceRepository.createEvidenceItem({
            bidDocumentId: primaryDoc.id,
            fieldKey,
            fieldLabel: `${code} Evidence Verification`,
            rawValue,
            normalizedValue,
            unit,
            sourceText: `${code} clause compliance evidence extracted from ${primaryDoc.originalFilename}`,
            pageNumber: 1,
            confidence: 0.98,
            status: evStatus,
          });

          await mappingRepository.createMapping({
            tenderRequirementId: req.id,
            bidderId: bidder.id,
            bidSubmissionId: sub.id,
            evidenceId: ev.id,
            mappingType: MappingType.DIRECT,
            status: mapStatus,
            confidence: 0.96,
            reason: `Deterministic compliance evidence mapping for ${code}`,
          });
        }
      }

      // Seed / update realistic evaluations into evaluationRepository for this bidder
      for (const req of (blueprint?.requirements || [])) {
        const code = req.requirementCode;
        const rule = createdRules.get(req.id);
        const ruleId = rule?.id || `rule_${req.id}`;

        let result: EvaluationStatus = EvaluationStatus.PASS;
        let reasonCode = 'CRITERIA_MET';
        let summary = `Requirement ${code} is fully satisfied and compliant with tender specifications.`;
        let explanation = `Deterministic evaluation verified clause ${code} from bidder evidence.`;

        if (code === 'FIN-01') {
          if (isBhel) {
            result = EvaluationStatus.FAIL;
            reasonCode = 'CRITERIA_FAILED';
            summary = 'Audited financial balance sheet proves 3-year average turnover is INR 44.10 Cr, which fails the mandatory requirement of INR 50.00 Cr.';
            explanation = 'Mandatory threshold of INR 50.00 Cr was not met (Audited average: INR 44.10 Cr). Contradiction detected with self-declaration of INR 62.50 Cr.';
          } else if (isLt) {
            result = EvaluationStatus.PASS;
            reasonCode = 'CRITERIA_MET';
            summary = 'Average turnover of INR 184.20 Cr exceeds mandatory threshold of INR 50.00 Cr.';
            explanation = 'Audited accounts demonstrate strong financial turnover exceeding requirements.';
          }
        } else if (code === 'EXP-04' && isBhel) {
          result = EvaluationStatus.REVIEW;
          reasonCode = 'MANUAL_REVIEW_REQUIRED';
          summary = 'Pending sub-contractor technical credentials verification by procurement committee.';
          explanation = 'Evidence submitted includes consortium subcontractor experience requiring committee endorsement.';
        } else if (code === 'EXP-03' && isLt) {
          result = EvaluationStatus.REVIEW;
          reasonCode = 'MANUAL_REVIEW_REQUIRED';
          summary = 'Client completion certificate pending final endorsement stamp.';
          explanation = 'Past project certificate requires verification with issuing authority.';
        } else if (code === 'FIN-02' && isRil) {
          result = EvaluationStatus.REVIEW;
          reasonCode = 'MANUAL_REVIEW_REQUIRED';
          summary = 'Bank sanction letter specifies credit limit with conditional drawdown clauses pending contract execution.';
          explanation = 'Officer verification required for conditional credit drawdown stipulations.';
        } else if (code === 'TECH-01' && isRil) {
          result = EvaluationStatus.FAIL;
          reasonCode = 'CRITERIA_FAILED';
          summary = 'ISO 9001 quality certificate expired on 31-Dec-2024 and does not meet tender validity period.';
          explanation = 'Accreditation validity expired prior to tender closing date.';
        } else if (code === 'LEG-03' && isRil) {
          result = EvaluationStatus.NOT_EVALUABLE;
          reasonCode = 'MISSING_EVIDENCE';
          summary = 'No Make in India Local Content Declaration detected in submitted bid packet.';
          explanation = 'Required statutory self-declaration form was missing from submission.';
        }

        await evaluationRepository.createEvaluation({
          tenderId: actualTenderId,
          bidderId: bidder.id,
          bidSubmissionId: sub.id,
          requirementId: req.id,
          ruleId,
          ruleVersion: 1,
          result,
          reasonCode,
          summary,
          explanation,
          evaluatedBy: 'DeterministicComplianceEngine',
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
        contextSnapshot: { tenderId: actualTenderId, bidderId },
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
