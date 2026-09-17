import { TenderRequirement, ExtractedEvidence, BidDocumentType, RequirementCategory } from '@prisma/client';
import { FIELD_REGISTRY } from '../../services/evidence/field-registry.js';

export interface CandidatePair {
  requirement: TenderRequirement;
  evidence: ExtractedEvidence;
  bidDocumentType: BidDocumentType;
  signals: {
    documentTypeMatch: number;
    fieldMatch: number;
    categoryMatch: number;
    expectedEvidenceMatch: number;
    keywordMatch: number;
  };
  candidateScore: number;
  isDirectMatch: boolean;
  matchedField: string | null;
}

// Document Type to Category compatibility mapping
const DOCUMENT_CATEGORY_MAP: Record<BidDocumentType, RequirementCategory[]> = {
  FINANCIAL_STATEMENT: [RequirementCategory.FINANCIAL, RequirementCategory.ELIGIBILITY],
  CA_CERTIFICATE: [RequirementCategory.FINANCIAL, RequirementCategory.ELIGIBILITY],
  GST_CERTIFICATE: [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY],
  PAN_DOCUMENT: [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY],
  UDYAM_MSME_CERTIFICATE: [RequirementCategory.STATUTORY, RequirementCategory.POLICY, RequirementCategory.ELIGIBILITY],
  STARTUP_CERTIFICATE: [RequirementCategory.POLICY, RequirementCategory.ELIGIBILITY],
  NSIC_CERTIFICATE: [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY],
  EPFO_ESIC_DOCUMENT: [RequirementCategory.STATUTORY],
  EXPERIENCE_CERTIFICATE: [RequirementCategory.TECHNICAL, RequirementCategory.ELIGIBILITY],
  OEM_AUTHORIZATION: [RequirementCategory.TECHNICAL, RequirementCategory.TENDER_SPECIFIC],
  MAKE_IN_INDIA_LOCAL_CONTENT: [RequirementCategory.POLICY, RequirementCategory.TENDER_SPECIFIC],
  BID_SECURITY: [RequirementCategory.FINANCIAL, RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY],
  TECHNICAL_COMPLIANCE_DOCUMENT: [RequirementCategory.TECHNICAL, RequirementCategory.TENDER_SPECIFIC],
  BLACKLISTING_DECLARATION: [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY],
  DECLARATION_AFFIDAVIT: [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY],
  COMPANY_REGISTRATION: [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY],
  OTHER: [RequirementCategory.TENDER_SPECIFIC, RequirementCategory.TECHNICAL, RequirementCategory.FINANCIAL, RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY, RequirementCategory.POLICY],
  UNKNOWN: [RequirementCategory.TENDER_SPECIFIC, RequirementCategory.TECHNICAL, RequirementCategory.FINANCIAL, RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY, RequirementCategory.POLICY],
};

// Expected Field Synonyms / Mapping
const FIELD_SYNONYMS: Record<string, string[]> = {
  gstin: ['gstin', 'gst', 'gst_number', 'gst_registration'],
  pan: ['pan', 'pan_card', 'pan_number', 'income_tax_pan'],
  udyam_number: ['udyam_number', 'udyam', 'msme', 'msme_number', 'udyog_aadhaar'],
  turnover: ['turnover', 'annual_turnover', 'sales', 'revenue', 'average_turnover'],
  average_turnover: ['average_turnover', 'turnover', 'annual_turnover', 'avg_turnover'],
  net_worth: ['net_worth', 'networth', 'capital'],
  contract_value: ['contract_value', 'project_value', 'work_order_value', 'amount'],
  project_name: ['project_name', 'scope_of_work', 'work_name'],
  client_name: ['client_name', 'procuring_entity', 'organization'],
  local_content_percentage: ['local_content_percentage', 'local_content', 'domestic_content'],
  oem_name: ['oem_name', 'manufacturer_name', 'oem'],
  bid_security_amount: ['bid_security_amount', 'emd', 'emd_amount', 'bid_security'],
  epfo_number: ['epfo_number', 'epf', 'pf_number'],
  esic_number: ['esic_number', 'esi', 'esic_number'],
  legal_name: ['legal_name', 'company_name', 'bidder_name', 'entity_name'],
};

export class MappingCandidateGenerator {
  /**
   * Generates candidate requirement <-> evidence pairs with heuristic candidate filtering
   */
  generateCandidates(
    requirements: TenderRequirement[],
    evidenceItems: (ExtractedEvidence & { documentType: BidDocumentType })[]
  ): CandidatePair[] {
    const candidates: CandidatePair[] = [];

    for (const req of requirements) {
      for (const ev of evidenceItems) {
        const candidate = this.evaluateCandidatePair(req, ev, ev.documentType);
        // Only include candidate if minimum relevance threshold (0.25) is reached
        if (candidate.candidateScore >= 0.25) {
          candidates.push(candidate);
        }
      }
    }

    return candidates.sort((a, b) => b.candidateScore - a.candidateScore);
  }

  /**
   * Evaluates deterministic matching signals between a requirement and an evidence item
   */
  evaluateCandidatePair(
    req: TenderRequirement,
    ev: ExtractedEvidence,
    docType: BidDocumentType
  ): CandidatePair {
    let docMatch = 0.0;
    let fieldMatch = 0.0;
    let categoryMatch = 0.0;
    let expectedEvMatch = 0.0;
    let kwMatch = 0.0;
    let matchedFieldKey: string | null = null;

    // 1. Document Type Match
    const allowedCategories = DOCUMENT_CATEGORY_MAP[docType] || [];
    if (allowedCategories.includes(req.category)) {
      docMatch = 0.8;
    }
    const def = FIELD_REGISTRY[ev.fieldKey];
    if (def && def.allowedDocumentTypes.includes(docType)) {
      docMatch = Math.max(docMatch, 0.9);
    }

    // 2. Field Match & Compatibility
    const reqTextLower = `${req.requirementText} ${req.normalizedRequirementText} ${req.ruleParameters ? JSON.stringify(req.ruleParameters) : ''}`.toLowerCase();
    
    // Direct field match
    if (reqTextLower.includes(ev.fieldKey.toLowerCase())) {
      fieldMatch = 1.0;
      matchedFieldKey = ev.fieldKey;
    } else {
      // Check synonyms
      const synonyms = FIELD_SYNONYMS[ev.fieldKey] || [];
      for (const syn of synonyms) {
        if (reqTextLower.includes(syn)) {
          fieldMatch = 0.85;
          matchedFieldKey = ev.fieldKey;
          break;
        }
      }
    }

    // 3. Category Match
    if (allowedCategories.includes(req.category)) {
      categoryMatch = 1.0;
    } else if (req.category === RequirementCategory.TENDER_SPECIFIC) {
      categoryMatch = 0.5;
    }

    // 4. Expected Evidence Match (from Feature 1B requirement.evidenceRequired array)
    if (req.evidenceRequired && req.evidenceRequired.length > 0) {
      const evLabelLower = (ev.fieldLabel || ev.fieldKey).toLowerCase();
      const docTypeLower = docType.toLowerCase().replace(/_/g, ' ');
      for (const reqEv of req.evidenceRequired) {
        const reqEvLower = reqEv.toLowerCase();
        if (evLabelLower.includes(reqEvLower) || reqEvLower.includes(evLabelLower) || docTypeLower.includes(reqEvLower)) {
          expectedEvMatch = 1.0;
          break;
        }
      }
    }

    // 5. Keyword Overlap Match
    kwMatch = this.computeKeywordMatch(req.requirementText, ev.fieldLabel, ev.sourceText);

    // Compute composite candidate relevance score:
    // Weights: Doc Type (25%), Field Match (35%), Category Match (10%), Expected Ev Match (15%), Keyword (15%)
    const candidateScore = Number(
      (docMatch * 0.25 + fieldMatch * 0.35 + categoryMatch * 0.10 + expectedEvMatch * 0.15 + kwMatch * 0.15).toFixed(3)
    );

    // Unambiguous direct match criteria: Exact field key match + high doc match
    const isDirectMatch = fieldMatch === 1.0 && (docMatch >= 0.8 || expectedEvMatch >= 0.8);

    return {
      requirement: req,
      evidence: ev,
      bidDocumentType: docType,
      signals: {
        documentTypeMatch: docMatch,
        fieldMatch,
        categoryMatch,
        expectedEvidenceMatch: expectedEvMatch,
        keywordMatch: kwMatch,
      },
      candidateScore,
      isDirectMatch,
      matchedField: matchedFieldKey,
    };
  }

  private computeKeywordMatch(reqText: string, evLabel: string, sourceText: string): number {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'to', 'for', 'in', 'of', 'with', 'must', 'be', 'shall']);
    const getWords = (t: string) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w));

    const reqWords = new Set(getWords(reqText));
    if (reqWords.size === 0) return 0;

    const evWords = getWords(`${evLabel} ${sourceText}`);
    let matches = 0;
    for (const w of evWords) {
      if (reqWords.has(w)) matches++;
    }

    return Math.min(1.0, Number((matches / Math.max(reqWords.size, 5)).toFixed(2)));
  }
}

export const mappingCandidateGenerator = new MappingCandidateGenerator();
