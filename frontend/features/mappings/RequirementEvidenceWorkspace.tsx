import React, { useState } from 'react';
import { RequirementEvidenceMapping, MappingType } from '@/types';
import { CoverageBadge } from './CoverageBadge';
import { MappingExplanationCard } from './MappingExplanationCard';
import { Check, X, Plus, AlertCircle, FileText, ChevronRight, Hash, ArrowLeft } from 'lucide-react';

export interface WorkspaceRequirement {
  id: string;
  requirementCode: string;
  requirementText: string;
  category: string;
  evidenceRequired: string[];
  clauseReference?: string | null;
}

interface RequirementEvidenceWorkspaceProps {
  requirement: WorkspaceRequirement;
  mappings: RequirementEvidenceMapping[];
  onConfirm: (mappingId: string) => Promise<void>;
  onReject: (mappingId: string, reason: string) => Promise<void>;
  onManualMap?: () => void;
  onClose?: () => void;
}

export const RequirementEvidenceWorkspace: React.FC<RequirementEvidenceWorkspaceProps> = ({
  requirement,
  mappings,
  onConfirm,
  onReject,
  onManualMap,
  onClose,
}) => {
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(
    mappings.length > 0 ? mappings[0]?.id || null : null
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMapping = mappings.find((m) => m.id === selectedMappingId) || mappings[0];

  const handleConfirmClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsSubmitting(true);
      await onConfirm(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (id: string) => {
    if (!rejectReason.trim()) return;
    try {
      setIsSubmitting(true);
      await onReject(id, rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMappingTypeBadge = (type: MappingType) => {
    switch (type) {
      case 'DIRECT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">DIRECT</span>;
      case 'INDIRECT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">INDIRECT</span>;
      case 'PARTIAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30">PARTIAL</span>;
      case 'CONFLICTING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-500/30">CONFLICTING</span>;
      case 'POTENTIAL':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-400 border border-purple-500/30">POTENTIAL</span>;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[780px]">
      {/* Workspace Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {requirement.requirementCode}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{requirement.category}</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-0.5">Evidence ↔ Requirement Mapping Workspace</h3>
          </div>
        </div>
        {onManualMap && (
          <button
            onClick={onManualMap}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Manual Evidence Link
          </button>
        )}
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden divide-x divide-slate-800/80">
        
        {/* COLUMN 1: REQUIREMENT DETAILS (3 Cols) */}
        <div className="col-span-3 p-5 overflow-y-auto space-y-4 bg-slate-950/60">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Requirement</h4>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              {requirement.clauseReference && (
                <div className="text-[11px] font-mono text-cyan-400">Clause {requirement.clauseReference}</div>
              )}
              <p className="text-sm font-medium text-slate-100 leading-snug">{requirement.requirementText}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Expected Evidence Types</h4>
            <div className="space-y-1.5">
              {requirement.evidenceRequired && requirement.evidenceRequired.length > 0 ? (
                requirement.evidenceRequired.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-2 rounded-lg border border-slate-800/80 text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{ev}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No expected document specified</span>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: MAPPED EVIDENCE LIST (5 Cols) */}
        <div className="col-span-5 p-5 overflow-y-auto space-y-3 bg-slate-900/40">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mapped Bidder Evidence</h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {mappings.length} Candidates
            </span>
          </div>

          {mappings.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold">No candidate evidence mapped</p>
              <p className="text-xs text-slate-500">No document or extracted evidence item has been mapped to this requirement yet.</p>
            </div>
          ) : (
            mappings.map((m) => {
              const isSelected = selectedMapping?.id === m.id;
              const sourceCtx = m.matchingSignals?.sourceContext;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMappingId(m.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {getMappingTypeBadge(m.mappingType)}
                        <span className="font-mono text-xs text-slate-400">Confidence: {Math.round(m.confidence * 100)}%</span>
                      </div>
                      <h5 className="font-semibold text-slate-100 text-sm mt-1.5">
                        Field: <span className="font-mono text-cyan-300">{m.matchedField || 'Extracted Fact'}</span>
                      </h5>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />}
                  </div>

                  <div className="text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Doc: {sourceCtx?.documentName || 'Bid Document'}</span>
                      {sourceCtx?.pageNumber && <span>Page {sourceCtx.pageNumber}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-400">
                      Status: <span className="font-semibold text-slate-300">{m.status}</span>
                    </div>

                    {m.status !== 'CONFIRMED' && m.status !== 'REJECTED' && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isSubmitting}
                          onClick={(e) => handleConfirmClick(m.id, e)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                        >
                          <Check className="w-3 h-3" /> Confirm
                        </button>
                        <button
                          disabled={isSubmitting}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRejectingId(rejectingId === m.id ? null : m.id);
                          }}
                          className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 hover:bg-rose-900 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reject Reason Form Inline */}
                  {rejectingId === m.id && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[11px] text-rose-400 font-semibold block">Reason for Rejection *</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Specify reason for rejecting mapping (e.g. Invalid document context)..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRejectSubmit(m.id)}
                          disabled={!rejectReason.trim() || isSubmitting}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded disabled:opacity-50"
                        >
                          Submit Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* COLUMN 3: SOURCE PROVENANCE & WHY MAPPED EXPLANATION (4 Cols) */}
        <div className="col-span-4 p-5 overflow-y-auto bg-slate-950">
          {selectedMapping ? (
            <MappingExplanationCard mapping={selectedMapping} />
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a mapped evidence candidate on the left to view matching signals and provenance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
