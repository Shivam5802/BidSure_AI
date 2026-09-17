import React from 'react';
import { ComplianceEvaluation } from '@/types';
import { EvaluationStatusBadge } from './EvaluationStatusBadge';
import {
  X,
  Calculator,
  FileText,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  History,
  AlertCircle,
  Code2,
  ExternalLink,
} from 'lucide-react';

interface EvaluationDetailDrawerProps {
  evaluation: ComplianceEvaluation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvaluationDetailDrawer: React.FC<EvaluationDetailDrawerProps> = ({
  evaluation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !evaluation) return null;

  const trace = evaluation.calculationTrace;
  const evidenceSnapshot = evaluation.evidenceSnapshot || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Calculation Audit Trace</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  v{evaluation.version}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Evaluation ID: {evaluation.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Summary Header */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Result Status:
                </span>
                <EvaluationStatusBadge
                  status={evaluation.result}
                  applicability={evaluation.applicability}
                />
              </div>
              <span className="text-xs font-mono text-slate-400">
                Reason Code: <strong className="text-slate-200">{evaluation.reasonCode}</strong>
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200">{evaluation.summary}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{evaluation.explanation}</p>
            </div>
          </div>

          {/* Engine Determinism Banner */}
          <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-200">100% Deterministic Engine Execution</span>
              <p className="text-slate-400 mt-0.5">
                Evaluated by <code className="text-indigo-300">{evaluation.engineVersion}</code> using Schema{' '}
                <code className="text-indigo-300">{evaluation.schemaVersion}</code> on{' '}
                {new Date(evaluation.evaluatedAt).toLocaleString()}. Zero non-deterministic AI decisions.
              </p>
            </div>
          </div>

          {/* Calculation Step & Trace */}
          {trace && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                Mathematical & Logical Trace
              </h3>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
                {/* Formula */}
                {trace.formula && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-medium">Evaluation Formula / Rule:</span>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                      {trace.formula}
                    </div>
                  </div>
                )}

                {/* Operation Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Operation Type
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {trace.operation || 'DIRECT_COMPARE'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Comparison Operator
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {trace.operator || 'N/A'} {trace.threshold !== undefined ? `(${trace.threshold})` : ''}
                    </span>
                  </div>
                </div>

                {/* Inputs Table */}
                {trace.inputs && trace.inputs.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-medium">Evaluated Inputs:</span>
                    <div className="overflow-x-auto rounded-lg border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Field Key</th>
                            <th className="p-2.5">Raw Value</th>
                            <th className="p-2.5">Normalized Value</th>
                            <th className="p-2.5">Unit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {trace.inputs.map((inp, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              <td className="p-2.5 text-slate-300 font-medium">{inp.fieldKey || 'value'}</td>
                              <td className="p-2.5 text-slate-400">{String(inp.rawValue ?? 'N/A')}</td>
                              <td className="p-2.5 text-emerald-400 font-semibold">
                                {String(inp.normalizedValue ?? 'N/A')}
                              </td>
                              <td className="p-2.5 text-slate-500">{inp.unit || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Computed Output vs Threshold */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs block">Calculated Output Value</span>
                    <span className="font-mono text-sm font-bold text-white">
                      {String(trace.calculatedValue ?? 'N/A')} {trace.unit || ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-xs block">Comparison Result</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        trace.comparisonResult ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {trace.comparisonResult === true
                        ? 'TRUE (Pass)'
                        : trace.comparisonResult === false
                        ? 'FALSE (Fail)'
                        : 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Snapshots */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Source-Grounded Evidence Snapshot ({evidenceSnapshot.length})
            </h3>

            {evidenceSnapshot.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                No mapped evidence snapshots recorded for this evaluation.
              </div>
            ) : (
              <div className="space-y-3">
                {evidenceSnapshot.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-cyan-300">
                        Evidence ID: {item.evidenceId?.slice(0, 8) || `Ev-#${idx + 1}`}
                      </span>
                      {item.pageNumbers && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Page {Array.isArray(item.pageNumbers) ? item.pageNumbers.join(', ') : item.pageNumbers}
                        </span>
                      )}
                    </div>
                    {item.extractedValue && (
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200">
                        {typeof item.extractedValue === 'object'
                          ? JSON.stringify(item.extractedValue)
                          : String(item.extractedValue)}
                      </div>
                    )}
                    {item.rawTextSnippet && (
                      <p className="text-slate-400 italic bg-slate-900/40 p-2 rounded border border-slate-800/40">
                        "{item.rawTextSnippet}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Evaluated By: {evaluation.evaluatedBy}</span>
              <span>Requirement Ref: {evaluation.requirementId?.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span>Rule Ref: {evaluation.ruleId?.slice(0, 8)} (v{evaluation.ruleVersion})</span>
              <span>Evaluated: {new Date(evaluation.evaluatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
