import { ExtractedRequirement } from './llm-provider.interface.js';

export interface ConflictAnalysisResult {
  requirementIndex: number;
  conflictFlag: boolean;
  conflictReason: string | null;
  conflictingWithIndex?: number;
}

export class ConflictEngineService {
  /**
   * Detects tender-level contradictions across clauses (e.g. Page 17 says 10 Cr, Page 68 says 15 Cr).
   * Does NOT resolve the conflict legally — flags both for procurement officer review.
   */
  detectConflicts(requirements: ExtractedRequirement[]): ConflictAnalysisResult[] {
    const results: ConflictAnalysisResult[] = requirements.map((_, idx) => ({
      requirementIndex: idx,
      conflictFlag: false,
      conflictReason: null,
    }));

    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        const reqA = requirements[i]!;
        const reqB = requirements[j]!;

        // Conflicts occur when requirements are in the same category and refer to the same metric but have conflicting numeric values/parameters
        if (
          reqA.category === reqB.category &&
          reqA.ruleCandidate &&
          reqB.ruleCandidate &&
          reqA.ruleCandidate.type === reqB.ruleCandidate.type
        ) {
          const paramsA = reqA.ruleCandidate.parameters as any;
          const paramsB = reqB.ruleCandidate.parameters as any;

          if (
            paramsA.metric &&
            paramsB.metric &&
            paramsA.metric === paramsB.metric &&
            paramsA.value !== undefined &&
            paramsB.value !== undefined &&
            paramsA.value !== paramsB.value
          ) {
            const pageA = reqA.sourceReferences[0]?.pageNumber || '?';
            const pageB = reqB.sourceReferences[0]?.pageNumber || '?';

            const reasonA = `Potential conflict: Clause ${reqA.clauseReference || ''} (Page ${pageA}) specifies ${paramsA.value}, whereas Clause ${reqB.clauseReference || ''} (Page ${pageB}) specifies ${paramsB.value}.`;
            const reasonB = `Potential conflict: Clause ${reqB.clauseReference || ''} (Page ${pageB}) specifies ${paramsB.value}, whereas Clause ${reqA.clauseReference || ''} (Page ${pageA}) specifies ${paramsA.value}.`;

            results[i] = {
              requirementIndex: i,
              conflictFlag: true,
              conflictReason: reasonA,
              conflictingWithIndex: j,
            };

            results[j] = {
              requirementIndex: j,
              conflictFlag: true,
              conflictReason: reasonB,
              conflictingWithIndex: i,
            };
          }
        }
      }
    }

    return results;
  }
}

export const conflictEngineService = new ConflictEngineService();
