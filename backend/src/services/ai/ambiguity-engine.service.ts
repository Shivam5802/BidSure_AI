import { ExtractedRequirement } from './llm-provider.interface.js';

export class AmbiguityEngineService {
  /**
   * Evaluates extracted requirements for qualitative ambiguity, missing thresholds,
   * or unclear conditions. NEVER invents numeric thresholds.
   */
  evaluate(req: ExtractedRequirement): {
    ambiguityFlag: boolean;
    ambiguityReason: string | null;
    ruleCandidate: ExtractedRequirement['ruleCandidate'];
  } {
    const text = req.requirementText.toLowerCase();
    const qualitativeTerms = [
      'adequate',
      'substantial',
      'reasonable',
      'sufficient',
      'good track record',
      'reputed',
      'appropriate',
      'satisfactory',
      'relevant experience',
    ];

    const hasQualitativeTerm = qualitativeTerms.some((term) => text.includes(term));
    const hasNumericDigits = /\d+/.test(text);

    // Rule: Qualitative statement without explicit numeric numbers must be marked Ambiguous
    if (hasQualitativeTerm && !hasNumericDigits && req.category !== 'STATUTORY') {
      return {
        ambiguityFlag: true,
        ambiguityReason:
          'Requirement uses qualitative terms (e.g. "adequate", "substantial") without defining an explicit quantifiable threshold.',
        ruleCandidate: null, // Clear any AI hallucinated numeric candidate
      };
    }

    if (req.confidence < 0.75) {
      return {
        ambiguityFlag: true,
        ambiguityReason: req.ambiguityReason || 'Low extraction confidence from source text.',
        ruleCandidate: req.ruleCandidate,
      };
    }

    return {
      ambiguityFlag: req.ambiguityFlag,
      ambiguityReason: req.ambiguityReason,
      ruleCandidate: req.ruleCandidate,
    };
  }
}

export const ambiguityEngineService = new AmbiguityEngineService();
