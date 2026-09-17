import React from 'react';
import { RequirementEvidenceMapping } from '@/types';
import { Sparkles, FileText, Check, AlertCircle, Info, Hash } from 'lucide-react';

interface MappingExplanationCardProps {
  mapping: RequirementEvidenceMapping;
}

export const MappingExplanationCard: React.FC<MappingExplanationCardProps> = ({ mapping }) => {
  const confidencePct = Math.round(mapping.confidence * 100);
  
  let confBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
  let confLabel = 'LOW';
  if (confidencePct >= 85) {
    confBadgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    confLabel = 'HIGH';
  } else if (confidencePct >= 60) {
    confBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    confLabel = 'MEDIUM';
  }

  const signals = mapping.matchingSignals;
  const sourceContext = signals?.sourceContext;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 text-slate-200 text-sm shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h4 className="font-semibold text-slate-100 text-base">Why mapped?</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Confidence:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${confBadgeClass}`}>
            {confidencePct}% — {confLabel}
          </span>
        </div>
      </div>

      {/* Explanation Reason */}
      <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
        <p className="text-slate-300 leading-relaxed text-sm">{mapping.reason}</p>
      </div>

      {/* Matching Signals Breakdown */}
      {signals && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matching Signals</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Document Type:</span>
              <span className="font-mono text-cyan-400">
                {Math.round((signals.documentTypeMatch || 0) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Field Key Compatibility:</span>
              <span className="font-mono text-cyan-400">
                {Math.round((signals.fieldMatch || 0) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Category Overlap:</span>
              <span className="font-mono text-cyan-400">
                {Math.round((signals.categoryMatch || 0) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Semantic Relevance:</span>
              <span className="font-mono text-cyan-400">
                {Math.round((signals.semanticMatch || 0) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Source Provenance */}
      {sourceContext && (
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            Source Provenance
          </h5>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span>Document: {sourceContext.documentName || 'Bid Document'}</span>
              {sourceContext.pageNumber && (
                <span className="text-cyan-400 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Page {sourceContext.pageNumber}
                </span>
              )}
            </div>
            {sourceContext.sourceText && (
              <div className="mt-2 text-slate-400 italic bg-slate-900 p-2 rounded border border-slate-800/60 text-xs font-sans">
                "{sourceContext.sourceText}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit & Guardrail Footer */}
      <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>Mapping confirms evidence relevance only. Final compliance rule execution occurs in Feature 1G.</span>
      </div>
    </div>
  );
};
