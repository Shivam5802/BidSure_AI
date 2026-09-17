'use client';

import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, HelpCircle, AlertTriangle, Cpu, RefreshCw } from 'lucide-react';
import { ComplianceRule, RuleEvaluationResult } from '../types';

interface RuleSimulatorModalProps {
  rule: ComplianceRule;
  onClose: () => void;
  onSimulate: (evidence: Record<string, unknown>) => Promise<RuleEvaluationResult>;
}

export const RuleSimulatorModal: React.FC<RuleSimulatorModalProps> = ({
  rule,
  onClose,
  onSimulate,
}) => {
  // Infer primary evidence field from rule definition
  const metricOrField =
    rule.definition?.metric ||
    rule.definition?.field ||
    rule.definition?.collection ||
    'average_annual_turnover';

  const [evidenceValue, setEvidenceValue] = useState<string>('120000000');
  const [secondaryValue, setSecondaryValue] = useState<string>('7');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RuleEvaluationResult | null>(null);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    try {
      let parsedVal: any = evidenceValue.trim();
      if (!isNaN(Number(parsedVal)) && parsedVal !== '') {
        parsedVal = Number(parsedVal);
      } else if (parsedVal === 'true') parsedVal = true;
      else if (parsedVal === 'false') parsedVal = false;

      const evidence: Record<string, unknown> = {
        [metricOrField]: parsedVal,
      };

      if (rule.ruleType === 'COMPOUND' || rule.ruleType === 'NUMERIC') {
        evidence['relevant_experience_years'] = Number(secondaryValue) || 7;
      }

      const res = await onSimulate(evidence);
      setResult(res);
    } catch {
      // Handled by parent or default error
    } finally {
      setIsRunning(false);
    }
  };

  const handleTestMissingEvidence = async () => {
    setIsRunning(true);
    try {
      const res = await onSimulate({});
      setResult(res);
    } catch {
      //
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span className="font-mono text-xs font-bold text-blue-400">
                Rule Simulator — {rule.ruleCode}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Deterministic Compliance Rule Execution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRunSimulation} className="p-6 space-y-5">
          <div className="p-3 bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs rounded-lg">
            <strong>Rule Target:</strong> &ldquo;{rule.name}&rdquo; ({rule.ruleType}). Enter synthetic bidder evidence below to test deterministic execution outputs.
          </div>

          {/* Primary Field Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Synthetic Evidence Value for Metric: <span className="font-mono text-blue-400">{metricOrField}</span>
            </label>
            <input
              type="text"
              value={evidenceValue}
              onChange={(e) => setEvidenceValue(e.target.value)}
              placeholder="e.g. 120000000 or ₹12 crore or true"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {rule.ruleType === 'COMPOUND' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Secondary Field: <span className="font-mono text-blue-400">relevant_experience_years</span>
              </label>
              <input
                type="text"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                placeholder="e.g. 7"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {isRunning ? 'Evaluating...' : 'Run Deterministic Evaluation'}
            </button>

            <button
              type="button"
              onClick={handleTestMissingEvidence}
              disabled={isRunning}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              Test Missing Evidence
            </button>
          </div>

          {/* Evaluation Result Output Card */}
          {result && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Deterministic Result:</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    result.status === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : result.status === 'FAIL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : result.status === 'NOT_EVALUABLE'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}
                >
                  {result.status === 'PASS' && <CheckCircle2 className="w-4 h-4" />}
                  {result.status === 'FAIL' && <XCircle className="w-4 h-4" />}
                  {result.status === 'NOT_EVALUABLE' && <HelpCircle className="w-4 h-4" />}
                  {result.status === 'REVIEW' && <AlertTriangle className="w-4 h-4" />}
                  {result.status}
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Explanation:</div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{result.reason}</p>

                {result.inputs && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div>Actual Value Evaluated: {JSON.stringify(result.inputs.actual)}</div>
                    <div>Required Target Value: {JSON.stringify(result.inputs.required)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
