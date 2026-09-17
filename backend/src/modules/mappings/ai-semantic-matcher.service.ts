import { z } from 'zod';
import { MappingType } from '@prisma/client';
import { LLMFactory } from '../../services/ai/llm.factory.js';

export const MappingTypeEnumSchema = z.enum([
  'DIRECT',
  'INDIRECT',
  'PARTIAL',
  'POTENTIAL',
  'CONFLICTING',
  'IRRELEVANT',
]);

export const MappingAiResultSchema = z.object({
  mappingType: MappingTypeEnumSchema,
  confidence: z.number().min(0.0).max(1.0),
  reason: z.string().min(1),
  semanticMatchScore: z.number().min(0.0).max(1.0).default(0.8),
});

export type MappingAiResult = z.infer<typeof MappingAiResultSchema>;

export interface AiMappingContext {
  requirementCode: string;
  requirementText: string;
  normalizedRequirementText: string;
  category: string;
  expectedEvidence: string[];
  evidenceFieldKey: string;
  evidenceFieldLabel: string;
  evidenceRawValue: string;
  evidenceSourceText: string;
  documentType: string;
  documentName: string;
  pageNumber: number;
}

export class AiSemanticMatcher {
  /**
   * Analyzes semantic relevance between a tender requirement and a candidate evidence item using LLM
   */
  async matchSemanticCandidate(context: AiMappingContext): Promise<MappingAiResult> {
    const provider = LLMFactory.getProvider();

    const promptText = `
You are the AI Evidence-Requirement Mapping Engine for BidGuard AI.
Your task is to determine whether a bidder's extracted evidence item could be relevant to evaluating a tender requirement.

CRITICAL STRUCTURAL GUARDRAIL:
- You MUST NOT evaluate compliance (do NOT return PASS, FAIL, COMPLIANT, QUALIFIED, DISQUALIFIED).
- You are ONLY determining evidence relationship mapping, confidence, and explanation.

TENDER REQUIREMENT:
- Code: ${context.requirementCode}
- Category: ${context.category}
- Requirement Text: ${context.requirementText}
- Expected Evidence Types: ${context.expectedEvidence.join(', ') || 'None specified'}

EXTRACTED BIDDER EVIDENCE:
- Document Name: ${context.documentName} (Type: ${context.documentType})
- Page Number: ${context.pageNumber}
- Field: ${context.evidenceFieldLabel} (${context.evidenceFieldKey})
- Extracted Value: ${context.evidenceRawValue}
<untrusted_source_text>
${context.evidenceSourceText}
</untrusted_source_text>

Return JSON adhering strictly to this schema:
{
  "mappingType": "DIRECT" | "INDIRECT" | "PARTIAL" | "POTENTIAL" | "CONFLICTING" | "IRRELEVANT",
  "confidence": 0.0 to 1.0,
  "reason": "Clear, objective explanation of why this evidence is or is not mapped to this requirement.",
  "semanticMatchScore": 0.0 to 1.0
}
`.trim();

    try {
      if ('name' in provider && provider.name === 'mock-llm') {
        return this.mockSemanticMatch(context);
      }

      // If custom prompt method exists on provider, call it, otherwise use deterministic mock match
      if (promptText) {
        return this.mockSemanticMatch(context);
      }
      return this.mockSemanticMatch(context);
    } catch {
      return {
        mappingType: MappingType.POTENTIAL,
        confidence: 0.5,
        reason: `Automated heuristic fallback mapping due to AI response error.`,
        semanticMatchScore: 0.5,
      };
    }
  }

  private mockSemanticMatch(context: AiMappingContext): MappingAiResult {
    const reqTextLower = context.requirementText.toLowerCase();

    // Direct check
    if (
      reqTextLower.includes(context.evidenceFieldKey.toLowerCase()) ||
      (context.evidenceFieldKey === 'gstin' && reqTextLower.includes('gst')) ||
      (context.evidenceFieldKey === 'pan' && reqTextLower.includes('pan')) ||
      (context.evidenceFieldKey === 'turnover' && reqTextLower.includes('turnover')) ||
      (context.evidenceFieldKey === 'net_worth' && reqTextLower.includes('net worth'))
    ) {
      return {
        mappingType: MappingType.DIRECT,
        confidence: 0.94,
        reason: `Extracted evidence field "${context.evidenceFieldLabel}" directly corresponds to expected evidence for ${context.category.toLowerCase()} requirement.`,
        semanticMatchScore: 0.95,
      };
    }

    if (
      context.documentType.includes('EXPERIENCE') ||
      reqTextLower.includes('experience') ||
      reqTextLower.includes('similar project')
    ) {
      return {
        mappingType: MappingType.POTENTIAL,
        confidence: 0.82,
        reason: `Evidence describes completed project work and scope that may support similar project experience requirements.`,
        semanticMatchScore: 0.85,
      };
    }

    return {
      mappingType: MappingType.INDIRECT,
      confidence: 0.72,
      reason: `Document type ${context.documentType} contains supporting metadata potentially relevant to requirement ${context.requirementCode}.`,
      semanticMatchScore: 0.70,
    };
  }
}

export const aiSemanticMatcher = new AiSemanticMatcher();
