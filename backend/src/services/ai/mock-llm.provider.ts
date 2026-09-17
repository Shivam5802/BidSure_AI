import {
  LLMProvider,
  RequirementExtractionContext,
  ExtractionResult,
  ExtractedRequirement,
} from './llm-provider.interface.js';

export class MockLLMProvider implements LLMProvider {
  name = 'mock';

  async extractRequirements(
    context: RequirementExtractionContext
  ): Promise<ExtractionResult> {
    const requirements: ExtractedRequirement[] = [];
    const warnings: string[] = [];

    let count = 1;

    for (const chunk of context.chunks) {
      const text = chunk.text;
      const lower = text.toLowerCase();

      // Check for turnover requirement
      if (lower.includes('turnover') || lower.includes('annual turnover')) {
        const valueMatch = text.match(/inr\s*(\d+(?:\.\d+)?)\s*(crore|lakh|cr)/i) ||
          text.match(/₹\s*(\d+(?:\.\d+)?)\s*(crore|lakh|cr)/i) ||
          text.match(/(\d+(?:\.\d+)?)\s*(crore|lakh|cr)/i);
        
        let numVal = 100000000; // default 10 cr if matched
        if (valueMatch && valueMatch[1]) {
          const val = parseFloat(valueMatch[1]);
          const unit = (valueMatch[2] || '').toLowerCase();
          if (unit.includes('crore') || unit === 'cr') {
            numVal = val * 10000000;
          } else if (unit.includes('lakh')) {
            numVal = val * 100000;
          }
        }

        const clauseMatch = text.match(/(?:clause|sec|section|para)\s*([\d\.]+)/i);
        const clauseRef = clauseMatch ? clauseMatch[1] : null;

        requirements.push({
          temporaryId: `req_mock_${count++}`,
          clauseReference: clauseRef || '4.2',
          requirementText: text.trim(),
          normalizedRequirementText: `Average annual turnover requirement of minimum ${numVal} INR`,
          category: 'FINANCIAL',
          mandatory: lower.includes('shall') || lower.includes('must') ? 'YES' : 'NO',
          condition: lower.includes('startup') ? 'Relaxed for registered Startups' : null,
          evidenceRequired: ['Audited Balance Sheets for last 3 FYs', 'CA Certificate with UDIN'],
          verificationSource: 'Income Tax / MCA',
          ruleCandidate: {
            type: 'NUMERIC',
            parameters: {
              metric: 'average_annual_turnover',
              operator: '>=',
              value: numVal,
              currency: 'INR',
            },
          },
          confidence: 0.96,
          explanation: 'Identified mandatory financial requirement specifying minimum annual turnover.',
          ambiguityFlag: false,
          ambiguityReason: null,
          sourceReferences: [
            {
              documentId: chunk.documentId,
              pageNumber: chunk.pageNumber,
              evidenceBlockId: chunk.evidenceBlockId,
            },
          ],
        });
      }

      // Check for GST / Statutory requirement
      else if (lower.includes('gst') || lower.includes('statutory') || lower.includes('pan')) {
        const clauseMatch = text.match(/(?:clause|sec|section|para)\s*([\d\.]+)/i);
        const clauseRef = clauseMatch && clauseMatch[1] ? clauseMatch[1] : '4.3';
        requirements.push({
          temporaryId: `req_mock_${count++}`,
          clauseReference: clauseRef,
          requirementText: text.trim(),
          normalizedRequirementText: 'Must possess valid GST registration and PAN card',
          category: 'STATUTORY',
          mandatory: 'YES',
          condition: null,
          evidenceRequired: ['GST Registration Certificate', 'PAN Card Copy'],
          verificationSource: 'GSTN / Income Tax',
          ruleCandidate: {
            type: 'BOOLEAN',
            parameters: {
              flag: 'has_valid_gst_registration',
            },
          },
          confidence: 0.98,
          explanation: 'Identified mandatory statutory GST registration requirement.',
          ambiguityFlag: false,
          ambiguityReason: null,
          sourceReferences: [
            {
              documentId: chunk.documentId,
              pageNumber: chunk.pageNumber,
              evidenceBlockId: chunk.evidenceBlockId,
            },
          ],
        });
      }

      // Check for ambiguous experience requirement without quantitative number
      else if (
        (lower.includes('experience') || lower.includes('financial capacity')) &&
        !lower.match(/\d+\s*(years|yr|projects)/)
      ) {
        const clauseMatch = text.match(/(?:clause|sec|section|para)\s*([\d\.]+)/i);
        const clauseRef = clauseMatch && clauseMatch[1] ? clauseMatch[1] : '5.4';
        requirements.push({
          temporaryId: `req_mock_${count++}`,
          clauseReference: clauseRef,
          requirementText: text.trim(),
          normalizedRequirementText: 'Bidder must have adequate experience in similar projects',
          category: 'TECHNICAL',
          mandatory: lower.includes('should') || lower.includes('shall') ? 'YES' : 'UNKNOWN',
          condition: null,
          evidenceRequired: ['Past Work Orders', 'Completion Certificates'],
          verificationSource: null,
          ruleCandidate: null,
          confidence: 0.65,
          explanation: 'Ambiguous requirement: tender states "adequate experience" without defining exact numeric threshold.',
          ambiguityFlag: true,
          ambiguityReason: 'Missing quantifiable threshold for experience duration or count.',
          sourceReferences: [
            {
              documentId: chunk.documentId,
              pageNumber: chunk.pageNumber,
              evidenceBlockId: chunk.evidenceBlockId,
            },
          ],
        });
      }

      // General / Technical / Default fallback for generic chunks
      else if (text.trim().length > 20) {
        const clauseMatch = text.match(/(?:clause|sec|section|para)\s*([\d\.]+)/i);
        const clauseRef = clauseMatch && clauseMatch[1] ? clauseMatch[1] : null;
        requirements.push({
          temporaryId: `req_mock_${count++}`,
          clauseReference: clauseRef,
          requirementText: text.trim(),
          normalizedRequirementText: text.trim().substring(0, 150),
          category: lower.includes('experience') || lower.includes('technical') ? 'TECHNICAL' : 'TENDER_SPECIFIC',
          mandatory: lower.includes('shall') || lower.includes('must') ? 'YES' : 'NO',
          condition: null,
          evidenceRequired: ['Self-declaration / Compliance certificate'],
          verificationSource: null,
          ruleCandidate: {
            type: 'TEXT_MATCH',
            parameters: {
              keyword: 'compliance',
            },
          },
          confidence: 0.90,
          explanation: 'Extracted general tender requirement clause.',
          ambiguityFlag: false,
          ambiguityReason: null,
          sourceReferences: [
            {
              documentId: chunk.documentId,
              pageNumber: chunk.pageNumber,
              evidenceBlockId: chunk.evidenceBlockId,
            },
          ],
        });
      }
    }

    return {
      requirements,
      warnings,
    };
  }
}
