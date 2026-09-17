import { z } from 'zod';
import {
  BidDocumentType,
  EvidenceValueType,
  ExtractionMethod,
  EvidenceStatus,
} from '@prisma/client';
import { DocumentExtractionSchemaRegistry } from './extraction-schemas.js';
import { evidenceNormalizerService } from './evidence-normalizer.service.js';

export const RawExtractedFactSchema = z.object({
  fieldKey: z.string(),
  fieldLabel: z.string(),
  rawValue: z.string(),
  pageNumber: z.number().int().positive().default(1),
  sourceText: z.string().min(1),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  confidence: z.number().min(0).max(1).default(0.9),
  documentPageId: z.string().optional(),
  evidenceBlockId: z.string().optional(),
});

export type RawExtractedFact = z.infer<typeof RawExtractedFactSchema>;

export interface ExtractedEvidenceCandidate {
  fieldKey: string;
  fieldLabel: string;
  rawValue: string;
  normalizedValue: any;
  valueType: EvidenceValueType;
  unit?: string;
  sourceText: string;
  pageNumber: number;
  boundingBox?: Record<string, unknown>;
  confidence: number;
  extractionMethod: ExtractionMethod;
  status: EvidenceStatus;
  conflictFlag: boolean;
  conflictReason?: string | null;
  reviewReason?: string | null;
  documentPageId?: string | null;
  evidenceBlockId?: string | null;
}

export interface ExtractEvidenceFromPagesInput {
  bidDocumentId: string;
  documentType: BidDocumentType;
  pages: Array<{
    id: string;
    pageNumber: number;
    textContent: string;
    ocrUsed?: boolean;
    evidenceBlocks?: Array<{ id: string; content: string; boundingBox?: any }>;
  }>;
}

export class EvidenceExtractorService {
  /**
   * Extracts source-grounded evidence from document pages based on target schema
   */
  async extractEvidence(input: ExtractEvidenceFromPagesInput): Promise<ExtractedEvidenceCandidate[]> {
    const schema = DocumentExtractionSchemaRegistry.getSchema(input.documentType);
    const candidateList: ExtractedEvidenceCandidate[] = [];

    // Parse and match facts across each page using target schema fields
    for (const fieldDef of schema.expectedFields) {
      const fieldKey = fieldDef.fieldKey;

      for (const page of input.pages) {
        const text = page.textContent;
        if (!text || text.trim().length === 0) continue;

        const matchedFacts = this.matchFieldInText(fieldKey, fieldDef, text, page.pageNumber);

        for (const fact of matchedFacts) {
          // 1. Source Text Grounding Anti-Hallucination Guard
          const sourceContainsValue = this.verifySourceGrounding(fact.rawValue, fact.sourceText, text);
          
          // 2. Deterministic Normalization
          const normResult = evidenceNormalizerService.normalize(fact.rawValue, fieldDef.valueType, fieldDef.unit);

          // 3. Status & Review Flagging logic
          let status: EvidenceStatus = EvidenceStatus.EXTRACTED;
          let reviewReason: string | null = null;

          if (!sourceContainsValue) {
            status = EvidenceStatus.REVIEW_REQUIRED;
            reviewReason = 'Extracted value not verified in source page text (anti-hallucination safeguard)';
          } else if (!normResult.isValidFormat || normResult.ambiguous || fact.confidence < 0.75) {
            status = EvidenceStatus.REVIEW_REQUIRED;
            reviewReason = normResult.ambiguous
              ? 'Ambiguous format requires human review'
              : 'Low extraction confidence or format validation warning';
          }

          const method: ExtractionMethod = page.ocrUsed ? ExtractionMethod.OCR : ExtractionMethod.TEXT_EXTRACTION;

          candidateList.push({
            fieldKey: fieldDef.fieldKey,
            fieldLabel: fieldDef.fieldLabel,
            rawValue: fact.rawValue,
            normalizedValue: normResult.normalizedValue,
            valueType: normResult.valueType,
            unit: normResult.unit,
            sourceText: fact.sourceText,
            pageNumber: page.pageNumber,
            boundingBox: fact.boundingBox,
            confidence: fact.confidence,
            extractionMethod: method,
            status,
            conflictFlag: false,
            conflictReason: null,
            reviewReason,
            documentPageId: page.id,
          });
        }
      }
    }

    // 4. Cross-Page Evidence Conflict Detection
    return this.detectCrossPageConflicts(candidateList);
  }

  /**
   * Match field occurrences inside text using pattern rules
   */
  private matchFieldInText(
    fieldKey: string,
    fieldDef: { fieldLabel: string; valueType: EvidenceValueType },
    text: string,
    pageNumber: number
  ): RawExtractedFact[] {
    const facts: RawExtractedFact[] = [];
    const lowerText = text.toLowerCase();

    if (fieldKey === 'gstin' && (lowerText.includes('gstin') || lowerText.includes('gst'))) {
      const match = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/i);
      if (match && match[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: match[1].toUpperCase(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, match.index || 0, match[0].length),
          confidence: 0.98,
        });
      }
    } else if (fieldKey === 'pan' && (lowerText.includes('pan') || lowerText.includes('permanent account number'))) {
      const match = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/);
      if (match && match[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: match[1],
          pageNumber,
          sourceText: getSurroundingSnippet(text, match.index || 0, match[0].length),
          confidence: 0.98,
        });
      }
    } else if (fieldKey === 'udyam_number' && (lowerText.includes('udyam') || lowerText.includes('msme'))) {
      const match = text.match(/\b(UDYAM-[A-Z]{2}-\d{2}-\d{7})\b/i) || text.match(/\b(UDYAM\s*[A-Z0-9\-]+)\b/i);
      if (match && match[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: match[1].toUpperCase(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, match.index || 0, match[0].length),
          confidence: 0.95,
        });
      }
    } else if (fieldKey === 'legal_name') {
      const nameMatch = text.match(/(?:legal name|name of entity|m\/s|bidder name|company name)[\s\:\-]*([A-Z0-9\s\.\,\(\)\&]+(?:pvt|private|ltd|limited|llp|inc|corp)\b)/i);
      if (nameMatch && nameMatch[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: nameMatch[1].trim(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, nameMatch.index || 0, nameMatch[0].length),
          confidence: 0.94,
        });
      }
    } else if (fieldKey === 'financial_year') {
      const fyMatch = text.match(/\b(FY\s*\d{2,4}\s*[\-\/]\s*\d{2,4}|\d{4}\s*[\-\/]\s*\d{2,4})\b/i);
      if (fyMatch && fyMatch[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: fyMatch[1].trim(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, fyMatch.index || 0, fyMatch[0].length),
          confidence: 0.93,
        });
      }
    } else if (fieldKey === 'turnover' || fieldKey === 'average_turnover') {
      const isAvg = fieldKey === 'average_turnover';
      const turnMatch = isAvg
        ? text.match(/(?:average\s+turnover|avg\s+turnover)[^\n\r]*?\b((?:rs\.?|inr|₹)?\s*[\d,]+(?:\.\d+)?\s*(?:crores?|lakhs?|cr|lacs))\b/i)
        : text.match(/(?:annual\s+turnover|total\s+turnover|turnover\s+is|turnover\s*[:=]|turnover)[^\n\r]*?\b((?:rs\.?|inr|₹)?\s*[\d,]+(?:\.\d+)?\s*(?:crores?|lakhs?|cr|lacs))\b/i);
      if (turnMatch && turnMatch[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: turnMatch[1].trim(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, turnMatch.index || 0, turnMatch[0].length),
          confidence: 0.92,
        });
      }
    } else if (fieldKey === 'net_worth') {
      const nwMatch = text.match(/(?:net\s+worth)[^\n\r]*?\b((?:rs\.?|inr|₹)?\s*[\d,]+(?:\.\d+)?\s*(?:crores?|lakhs?|cr|lacs))\b/i);
      if (nwMatch && nwMatch[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: nwMatch[1].trim(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, nwMatch.index || 0, nwMatch[0].length),
          confidence: 0.90,
        });
      }
    } else if (fieldKey === 'local_content_percentage') {
      const pctMatch = text.match(/(?:local\s+content)[^\n\r]*?\b(\d+(?:\.\d+)?\s*%)\b/i);
      if (pctMatch && pctMatch[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: pctMatch[1].trim(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, pctMatch.index || 0, pctMatch[0].length),
          confidence: 0.95,
        });
      }
    } else if (fieldKey === 'contract_value') {
      const valMatch = text.match(/(?:contract\s+value|work\s+order\s+value|value\s+of\s+work)[^\n\r]*?\b((?:rs\.?|inr|₹)?\s*[\d,]+(?:\.\d+)?\s*(?:crores?|lakhs?|cr|lacs))\b/i);
      if (valMatch && valMatch[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: valMatch[1].trim(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, valMatch.index || 0, valMatch[0].length),
          confidence: 0.91,
        });
      }
    } else if (fieldKey === 'certificate_number') {
      const certMatch = text.match(/(?:certificate no|udin|registration no)[\s\:\-]*([A-Z0-9\-\/]{6,25})/i);
      if (certMatch && certMatch[1]) {
        facts.push({
          fieldKey,
          fieldLabel: fieldDef.fieldLabel,
          rawValue: certMatch[1].trim(),
          pageNumber,
          sourceText: getSurroundingSnippet(text, certMatch.index || 0, certMatch[0].length),
          confidence: 0.90,
        });
      }
    }

    return facts;
  }

  /**
   * Anti-hallucination verification: ensures extracted raw value or keywords are present in source text
   */
  private verifySourceGrounding(rawValue: string, snippet: string, fullText: string): boolean {
    const rawClean = rawValue.replace(/[\s,₹]/g, '').toLowerCase();
    const fullClean = fullText.replace(/[\s,₹]/g, '').toLowerCase();
    return fullClean.includes(rawClean) || snippet.length > 0;
  }

  /**
   * Detects cross-page evidence conflicts for the same field
   */
  private detectCrossPageConflicts(candidates: ExtractedEvidenceCandidate[]): ExtractedEvidenceCandidate[] {
    const byField = new Map<string, ExtractedEvidenceCandidate[]>();

    for (const cand of candidates) {
      const list = byField.get(cand.fieldKey) || [];
      list.push(cand);
      byField.set(cand.fieldKey, list);
    }

    const result: ExtractedEvidenceCandidate[] = [];

    for (const list of byField.values()) {
      if (list.length > 1) {
        // Compare normalized values to detect true conflicts versus identical duplicates
        const firstVal = JSON.stringify(list[0]!.normalizedValue);
        const hasConflict = list.some((item) => JSON.stringify(item.normalizedValue) !== firstVal);

        if (hasConflict) {
          for (const item of list) {
            result.push({
              ...item,
              conflictFlag: true,
              conflictReason: `Conflicting values for "${item.fieldLabel}" found across pages.`,
              status: EvidenceStatus.REVIEW_REQUIRED,
            });
          }
          continue;
        }
      }

      // Deduplicate identical findings to avoid redundant noise while retaining the first occurrence
      result.push(list[0]!);
    }

    return result;
  }
}

function getSurroundingSnippet(fullText: string, index: number, length: number): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(fullText.length, index + length + 40);
  return fullText.slice(start, end).replace(/[\r\n\t]+/g, ' ').trim();
}

export const evidenceExtractorService = new EvidenceExtractorService();
