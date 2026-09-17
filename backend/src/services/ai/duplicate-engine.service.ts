import { ExtractedRequirement } from './llm-provider.interface.js';

export interface DuplicateAnalysisResult {
  requirementIndex: number;
  duplicateFlag: boolean;
  duplicateOfIndex?: number;
  duplicateReason?: string;
}

export class DuplicateEngineService {
  /**
   * Detects duplicate requirements across different sections of a tender document.
   * Compares normalized requirement texts and rule parameters.
   */
  detectDuplicates(requirements: ExtractedRequirement[]): DuplicateAnalysisResult[] {
    const results: DuplicateAnalysisResult[] = requirements.map((_, idx) => ({
      requirementIndex: idx,
      duplicateFlag: false,
    }));

    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        const reqA = requirements[i]!;
        const reqB = requirements[j]!;

        const normA = reqA.normalizedRequirementText.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normB = reqB.normalizedRequirementText.toLowerCase().replace(/[^a-z0-9]/g, '');

        const isTextMatch = normA === normB || (normA.length > 20 && (normA.includes(normB) || normB.includes(normA)));

        if (isTextMatch && reqA.category === reqB.category) {
          results[j] = {
            requirementIndex: j,
            duplicateFlag: true,
            duplicateOfIndex: i,
            duplicateReason: `Potential duplicate of Clause ${reqA.clauseReference || reqA.temporaryId} on Page ${reqA.sourceReferences[0]?.pageNumber || '?'}.`,
          };
        }
      }
    }

    return results;
  }
}

export const duplicateEngineService = new DuplicateEngineService();
