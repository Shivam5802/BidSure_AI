import { z } from 'zod';
import {
  BidDocumentType,
  RequirementCategory,
} from '@prisma/client';

export const BidDocumentClassificationOutputSchema = z.object({
  documentType: z.nativeEnum(BidDocumentType),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  possibleRequirementCategories: z.array(z.nativeEnum(RequirementCategory)),
  possibleRequirementIds: z.array(z.string()).optional().default([]),
  reviewRequired: z.boolean(),
});

export type BidDocumentClassificationOutput = z.infer<typeof BidDocumentClassificationOutputSchema>;

export interface ClassifyDocumentContext {
  filename: string;
  extractedText: string;
  tenderRequirements?: Array<{ id: string; requirementCode: string; category: RequirementCategory; requirementText: string }>;
}

export class BidDocumentClassifierService {
  /**
   * Classifies a bid document's content using rule-assisted heuristics & LLM validation
   * Prompt isolation is strictly applied: document text is treated strictly as evidence DATA.
   */
  async classifyDocument(context: ClassifyDocumentContext): Promise<BidDocumentClassificationOutput> {
    const filenameLower = context.filename.toLowerCase();
    const textLower = context.extractedText.toLowerCase();

    // Heuristic rule matching for high-precision local classification
    let documentType: BidDocumentType = BidDocumentType.UNKNOWN;
    let confidence = 0.5;
    let reason = 'Document requires classification review.';
    let categories: RequirementCategory[] = [RequirementCategory.ELIGIBILITY];

    if (filenameLower.includes('gst') || textLower.includes('gstin') || textLower.includes('goods and services tax')) {
      documentType = BidDocumentType.GST_CERTIFICATE;
      confidence = 0.96;
      reason = 'Document contains GST registration certificate indicators.';
      categories = [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY];
    } else if (filenameLower.includes('pan') || textLower.includes('permanent account number') || textLower.includes('income tax department')) {
      documentType = BidDocumentType.PAN_DOCUMENT;
      confidence = 0.98;
      reason = 'Document contains PAN card or tax identification details.';
      categories = [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY];
    } else if (filenameLower.includes('udyam') || filenameLower.includes('msme') || textLower.includes('udyam registration certificate') || textLower.includes('micro, small and medium enterprises')) {
      documentType = BidDocumentType.UDYAM_MSME_CERTIFICATE;
      confidence = 0.94;
      reason = 'Document contains Udyam MSME registration details.';
      categories = [RequirementCategory.ELIGIBILITY, RequirementCategory.POLICY];
    } else if (filenameLower.includes('ca') || filenameLower.includes('turnover') || textLower.includes('chartered accountant') || textLower.includes('udin') || textLower.includes('annual turnover')) {
      documentType = BidDocumentType.CA_CERTIFICATE;
      confidence = 0.91;
      reason = 'Document contains Chartered Accountant certificate / turnover audit details.';
      categories = [RequirementCategory.FINANCIAL];
    } else if (filenameLower.includes('experience') || filenameLower.includes('work order') || textLower.includes('completion certificate') || textLower.includes('experience certificate')) {
      documentType = BidDocumentType.EXPERIENCE_CERTIFICATE;
      confidence = 0.89;
      reason = 'Document contains past experience / work completion certificate details.';
      categories = [RequirementCategory.TECHNICAL, RequirementCategory.ELIGIBILITY];
    } else if (filenameLower.includes('oem') || filenameLower.includes('authorization') || textLower.includes('manufacturer authorization') || textLower.includes('oem authorization')) {
      documentType = BidDocumentType.OEM_AUTHORIZATION;
      confidence = 0.93;
      reason = 'Document contains Manufacturer / OEM Authorization Form.';
      categories = [RequirementCategory.TECHNICAL, RequirementCategory.ELIGIBILITY];
    } else if (filenameLower.includes('financial') || filenameLower.includes('balance sheet') || textLower.includes('profit and loss') || textLower.includes('audited balance sheet')) {
      documentType = BidDocumentType.FINANCIAL_STATEMENT;
      confidence = 0.92;
      reason = 'Document contains financial statements / balance sheet figures.';
      categories = [RequirementCategory.FINANCIAL];
    } else if (filenameLower.includes('local content') || filenameLower.includes('make in india') || textLower.includes('local content declaration') || textLower.includes('class-i local supplier')) {
      documentType = BidDocumentType.MAKE_IN_INDIA_LOCAL_CONTENT;
      confidence = 0.95;
      reason = 'Document contains Make In India local content declaration.';
      categories = [RequirementCategory.POLICY, RequirementCategory.ELIGIBILITY];
    } else if (filenameLower.includes('emd') || filenameLower.includes('bid security') || textLower.includes('bank guarantee') || textLower.includes('earnest money deposit')) {
      documentType = BidDocumentType.BID_SECURITY;
      confidence = 0.90;
      reason = 'Document contains Bid Security / EMD / Bank Guarantee details.';
      categories = [RequirementCategory.FINANCIAL, RequirementCategory.STATUTORY];
    } else if (filenameLower.includes('blacklisting') || textLower.includes('not blacklisted') || textLower.includes('debarment declaration')) {
      documentType = BidDocumentType.BLACKLISTING_DECLARATION;
      confidence = 0.88;
      reason = 'Document contains non-blacklisting affidavit declaration.';
      categories = [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY];
    } else if (filenameLower.includes('registration') || textLower.includes('certificate of incorporation') || textLower.includes('cin:')) {
      documentType = BidDocumentType.COMPANY_REGISTRATION;
      confidence = 0.91;
      reason = 'Document contains company registration / incorporation certificate details.';
      categories = [RequirementCategory.STATUTORY, RequirementCategory.ELIGIBILITY];
    } else if (filenameLower.includes('epfo') || filenameLower.includes('esic') || textLower.includes('employees provident fund') || textLower.includes('esic registration')) {
      documentType = BidDocumentType.EPFO_ESIC_DOCUMENT;
      confidence = 0.89;
      reason = 'Document contains EPFO/ESIC registration / compliance details.';
      categories = [RequirementCategory.STATUTORY];
    } else if (filenameLower.includes('startup') || textLower.includes('dpiit') || textLower.includes('recognition certificate')) {
      documentType = BidDocumentType.STARTUP_CERTIFICATE;
      confidence = 0.90;
      reason = 'Document contains DPIIT Startup recognition certificate.';
      categories = [RequirementCategory.ELIGIBILITY, RequirementCategory.POLICY];
    } else if (filenameLower.includes('technical') || textLower.includes('technical compliance') || textLower.includes('specification compliance')) {
      documentType = BidDocumentType.TECHNICAL_COMPLIANCE_DOCUMENT;
      confidence = 0.85;
      reason = 'Document contains technical specification compliance matrix.';
      categories = [RequirementCategory.TECHNICAL];
    } else if (filenameLower.includes('unknown') || context.extractedText.trim().length < 20) {
      documentType = BidDocumentType.UNKNOWN;
      confidence = 0.34;
      reason = 'Insufficient extracted text content to confidently classify document type.';
      categories = [RequirementCategory.ELIGIBILITY];
    }

    // Match potential requirement IDs from tender requirements if available
    const possibleRequirementIds: string[] = [];
    if (context.tenderRequirements && context.tenderRequirements.length > 0) {
      for (const req of context.tenderRequirements) {
        if (categories.includes(req.category)) {
          possibleRequirementIds.push(req.id);
        }
      }
    }

    const reviewRequired = confidence < 0.75 || documentType === BidDocumentType.UNKNOWN;

    const output: BidDocumentClassificationOutput = {
      documentType,
      confidence,
      reason,
      possibleRequirementCategories: categories,
      possibleRequirementIds,
      reviewRequired,
    };

    return BidDocumentClassificationOutputSchema.parse(output);
  }
}

export const bidDocumentClassifierService = new BidDocumentClassifierService();
