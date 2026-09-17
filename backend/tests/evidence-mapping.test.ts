import { describe, it, expect, beforeEach } from 'vitest';
import { BidDocumentType, RequirementCategory, MappingType, MappingStatus } from '@prisma/client';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { bidderRepository } from '../src/modules/bidders/bidder.repository.js';
import { evidenceRepository } from '../src/modules/evidence/evidence.repository.js';
import { mappingRepository } from '../src/modules/mappings/mapping.repository.js';
import { mappingService } from '../src/modules/mappings/mapping.service.js';
import { mappingCandidateGenerator } from '../src/modules/mappings/mapping-candidate-generator.service.js';
import { mappingCoverageService, RequirementCoverageState } from '../src/modules/mappings/mapping-coverage.service.js';

describe('Feature 1F — Evidence ↔ Requirement Mapping', () => {
  let tenderId: string;
  let blueprintId: string;
  let reqFinancial: any;
  let reqGst: any;
  let reqExperience: any;
  let bidderId: string;
  let submissionId: string;
  let docCa: any;
  let docGst: any;
  let evTurnover1: any;
  let evTurnover2: any;
  let evGstin: any;

  beforeEach(async () => {
    await tenderRepository.clear();
    await requirementRepository.clear();
    await evidenceRepository.clear();
    await mappingRepository.clear();

    // Setup Tender
    const tender = await tenderRepository.createTender({
      title: 'CPCL Expansion Tender',
      referenceNumber: 'TND-2026-F1F',
      organization: 'CPCL Energy Ltd',
      closingDate: new Date(Date.now() + 864000000),
    });
    tenderId = tender.id;

    // Setup Requirements Blueprint
    const bp = await requirementRepository.createBlueprint({
      tenderId,
      version: 1,
      status: 'APPROVED',
    });
    blueprintId = bp.id;

    reqFinancial = await requirementRepository.createRequirement({
      blueprintId,
      requirementCode: 'REQ-FIN-001',
      requirementText: 'Minimum average annual turnover of Rs 10 Crore in past 3 financial years.',
      normalizedRequirementText: 'turnover >= 100000000 INR',
      category: RequirementCategory.FINANCIAL,
      evidenceRequired: ['CA Certificate', 'Financial Statement'],
      aiExplanation: 'Financial turnover requirement',
    });

    reqGst = await requirementRepository.createRequirement({
      blueprintId,
      requirementCode: 'REQ-STAT-001',
      requirementText: 'Valid GST Registration Certificate mandatory.',
      normalizedRequirementText: 'gstin registration valid',
      category: RequirementCategory.STATUTORY,
      evidenceRequired: ['GST Certificate'],
      aiExplanation: 'GST registration requirement',
    });

    reqExperience = await requirementRepository.createRequirement({
      blueprintId,
      requirementCode: 'REQ-TECH-001',
      requirementText: 'Minimum 5 years of relevant experience in petroleum infrastructure projects.',
      normalizedRequirementText: 'experience_years >= 5',
      category: RequirementCategory.TECHNICAL,
      evidenceRequired: ['Experience Certificate', 'Work Order'],
      aiExplanation: 'Technical experience requirement',
    });

    // Setup Bidder and Submission
    const bidder = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BDR-ABC',
      legalName: 'ABC Infrastructure Pvt Ltd',
    });
    bidderId = bidder.id;

    const sub = await bidderRepository.createSubmission({
      tenderId,
      bidderId,
      submissionReference: 'SUB-ABC-001',
    });
    submissionId = sub.id;

    // Setup Bid Documents
    docCa = await bidderRepository.createBidDocument({
      bidSubmissionId: submissionId,
      originalFilename: 'Audited_CA_Certificate.pdf',
      storageKey: 'docs/ca.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048500,
      documentType: BidDocumentType.CA_CERTIFICATE,
    });

    docGst = await bidderRepository.createBidDocument({
      bidSubmissionId: submissionId,
      originalFilename: 'GST_Registration_Certificate.pdf',
      storageKey: 'docs/gst.pdf',
      mimeType: 'application/pdf',
      fileSize: 1048500,
      documentType: BidDocumentType.GST_CERTIFICATE,
    });

    // Setup Extracted Evidence
    evTurnover1 = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docCa.id,
      fieldKey: 'turnover',
      fieldLabel: 'Annual Turnover FY 2023-24',
      rawValue: '110000000',
      sourceText: 'Certified turnover for FY 23-24 is Rs 11 Crore.',
      pageNumber: 2,
    });

    evTurnover2 = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docCa.id,
      fieldKey: 'turnover',
      fieldLabel: 'Annual Turnover FY 2024-25',
      rawValue: '130000000',
      sourceText: 'Certified turnover for FY 24-25 is Rs 13 Crore.',
      pageNumber: 3,
    });

    evGstin = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docGst.id,
      fieldKey: 'gstin',
      fieldLabel: 'GST Identification Number (GSTIN)',
      rawValue: '07AAAAA0000A1Z5',
      sourceText: 'GSTIN: 07AAAAA0000A1Z5 registered under GST Act.',
      pageNumber: 1,
    });
  });

  it('should generate candidates using deterministic signals without N x M LLM blowup', () => {
    const candidates = mappingCandidateGenerator.generateCandidates(
      [reqFinancial, reqGst, reqExperience],
      [
        { ...evTurnover1, documentType: docCa.documentType },
        { ...evTurnover2, documentType: docCa.documentType },
        { ...evGstin, documentType: docGst.documentType },
      ] as any
    );

    expect(candidates.length).toBeGreaterThan(0);
    const turnoverCandidate = candidates.find((c) => c.evidence.id === evTurnover1.id && c.requirement.id === reqFinancial.id);
    expect(turnoverCandidate).toBeDefined();
    expect(turnoverCandidate?.isDirectMatch).toBe(true);
    expect(turnoverCandidate?.candidateScore).toBeGreaterThan(0.7);
  });

  it('should evaluate DIRECT mapping type for exact field compatibility', async () => {
    const result = await mappingService.generateMappingsForBidder(bidderId);
    expect(result.generatedCount).toBeGreaterThan(0);

    const gstMapping = result.mappings.find((m) => m.tenderRequirementId === reqGst.id && m.evidenceId === evGstin.id);
    expect(gstMapping).toBeDefined();
    expect(gstMapping?.mappingType).toBe(MappingType.DIRECT);
    expect(gstMapping?.confidence).toBeGreaterThanOrEqual(0.85);
    expect(gstMapping?.reason).toContain('directly corresponds');
  });

  it('should allow multiple evidence items to map to 1 requirement', async () => {
    const result = await mappingService.generateMappingsForBidder(bidderId);
    const finMappings = result.mappings.filter((m) => m.tenderRequirementId === reqFinancial.id);

    expect(finMappings.length).toBe(2);
    const mappedEvIds = finMappings.map((m) => m.evidenceId);
    expect(mappedEvIds).toContain(evTurnover1.id);
    expect(mappedEvIds).toContain(evTurnover2.id);
  });

  it('should calculate requirement evidence coverage status correctly without making compliance conclusions', async () => {
    const result = await mappingService.generateMappingsForBidder(bidderId);
    const summary = result.summary;

    expect(summary.totalRequirements).toBe(3);
    const gstSummary = summary.requirementSummaries.find((s) => s.requirementId === reqGst.id);
    expect(gstSummary?.coverageState).toBe(RequirementCoverageState.COVERED);
    expect(gstSummary?.explanation).toContain('COVERED indicates evidence availability');

    const expSummary = summary.requirementSummaries.find((s) => s.requirementId === reqExperience.id);
    expect(expSummary?.coverageState).toBe(RequirementCoverageState.NO_EVIDENCE);
    expect(expSummary?.missingExpectedEvidence).toContain('Experience Certificate');
  });

  it('should detect conflicting evidence items and mark mapping state CONFLICTING with REVIEW_REQUIRED status', async () => {
    // Create conflicting legal entity name evidence items for statutory requirement
    const evName1 = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docGst.id,
      fieldKey: 'legal_name',
      fieldLabel: 'Legal Entity Name',
      rawValue: 'ABC Infrastructure Pvt Ltd',
      sourceText: 'Legal Name: ABC Infrastructure Pvt Ltd',
    });

    const evName2 = await evidenceRepository.createEvidenceItem({
      bidDocumentId: docCa.id,
      fieldKey: 'legal_name',
      fieldLabel: 'Legal Entity Name',
      rawValue: 'ABC Infra Limited',
      sourceText: 'Entity Name: ABC Infra Limited',
    });

    const result = await mappingService.generateMappingsForBidder(bidderId);
    const conflictMappings = result.mappings.filter((m) => m.mappingType === MappingType.CONFLICTING);

    expect(conflictMappings.length).toBeGreaterThan(0);
    expect(conflictMappings[0]?.status).toBe(MappingStatus.REVIEW_REQUIRED);
    expect(conflictMappings[0]?.reason).toContain('Conflicting evidence values');
  });

  it('should support human review confirmation and rejection with required reason', async () => {
    const result = await mappingService.generateMappingsForBidder(bidderId);
    const targetMapping = result.mappings[0]!;

    // Confirm
    const confirmed = await mappingService.confirmMapping(targetMapping.id, 'officer_sharma');
    expect(confirmed.status).toBe(MappingStatus.CONFIRMED);
    expect(confirmed.reviewedBy).toBe('officer_sharma');

    // Reject without reason must fail
    await expect(mappingService.rejectMapping(targetMapping.id, '', 'officer_sharma')).rejects.toThrow('reason is required');

    // Reject with reason
    const rejected = await mappingService.rejectMapping(targetMapping.id, 'Different corporate entity registered under this GSTIN.', 'officer_sharma');
    expect(rejected.status).toBe(MappingStatus.REJECTED);
    expect(rejected.reviewReason).toBe('Different corporate entity registered under this GSTIN.');
  });

  it('should support manual mapping creation by procurement officers with scope validation', async () => {
    const manual = await mappingService.createManualMapping({
      tenderRequirementId: reqExperience.id,
      evidenceId: evTurnover1.id,
      bidderId,
      mappingType: MappingType.INDIRECT,
      reason: 'Turnover certificate includes past experience notes on Page 2.',
      createdBy: 'officer_patel',
    });

    expect(manual).toBeDefined();
    expect(manual.mappingType).toBe(MappingType.INDIRECT);
    expect(manual.status).toBe(MappingStatus.CONFIRMED);
    expect(manual.source).toBe('MANUAL_OFFICER');

    // Cross-bidder security isolation check
    const otherBidder = await bidderRepository.createBidder({
      tenderId,
      bidderCode: 'BDR-XYZ',
      legalName: 'XYZ Builders Ltd',
    });
    await expect(
      mappingService.createManualMapping({
        tenderRequirementId: reqExperience.id,
        evidenceId: evTurnover1.id, // belongs to ABC, not XYZ
        bidderId: otherBidder.id,
        reason: 'Invalid cross-bidder test',
      })
    ).rejects.toThrow('Security Error');
  });

  it('should preserve version history when updating or re-generating mappings', async () => {
    const firstResult = await mappingService.generateMappingsForBidder(bidderId);
    const targetMapping = firstResult.mappings[0]!;

    const historyInitial = await mappingRepository.getMappingHistory(targetMapping.id);
    expect(historyInitial.length).toBe(1);
    expect(historyInitial[0]?.version).toBe(1);

    // Re-generate mappings
    const secondResult = await mappingService.generateMappingsForBidder(bidderId);
    const newActiveMapping = secondResult.mappings.find((m) => m.evidenceId === targetMapping.evidenceId && m.tenderRequirementId === targetMapping.tenderRequirementId);

    expect(newActiveMapping?.version).toBe(2);

    const historyAfter = await mappingRepository.getMappingHistory(newActiveMapping!.id);
    expect(historyAfter.length).toBe(2);
    expect(historyAfter[0]?.status).toBe(MappingStatus.SUPERSEDED);
    expect(historyAfter[1]?.status).not.toBe(MappingStatus.SUPERSEDED);
  });
});
