'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  HelpCircle,
  Copy,
  Cpu,
  FileCheck,
  ShieldCheck,
  Building2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { TenderRequirement } from '../types';

interface RequirementDetailProps {
  requirement: TenderRequirement | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (req: TenderRequirement) => void;
}

export const RequirementDetail: React.FC<RequirementDetailProps> = ({
  requirement: req,
  onApprove,
  onReject,
  onEdit,
}) => {
  if (!req) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-900/40">
        <FileCheck className="w-12 h-12 text-slate-600 mb-3" />
        <p className="text-base font-medium">Select a requirement from the navigator list</p>
        <p className="text-xs text-slate-600 mt-1">
          Inspect extracted clauses, rule candidates, provenance, and resolve conflicts.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-900/60 text-slate-100">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-blue-400">{req.requirementCode}</span>
            {req.clauseReference && (
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Clause {req.clauseReference}
              </span>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Category: {req.category}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-2">Tender Requirement Detail</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(req)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onReject(req.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold rounded-lg transition"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Reject
          </button>
          <button
            onClick={() => onApprove(req.id)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Requirement
          </button>
        </div>
      </div>

      {/* Warning Banners */}
      {req.conflictFlag && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-300">⚠ Potential Clause Conflict Detected</h4>
            <p className="text-xs mt-1 text-rose-200/90 leading-relaxed">{req.conflictReason}</p>
            <p className="text-[11px] font-semibold text-rose-400 mt-2">
              Note: The AI platform will not autonomously decide which clause is legally binding. Procurement officer resolution required.
            </p>
          </div>
        </div>
      )}

      {req.ambiguityFlag && (
        <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-200 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-300">⚠ Ambiguous Requirement / Missing Threshold</h4>
            <p className="text-xs mt-1 text-amber-200/90 leading-relaxed">{req.ambiguityReason}</p>
          </div>
        </div>
      )}

      {req.duplicateFlag && (
        <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-800/60 text-purple-200 flex items-start gap-3">
          <Copy className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-purple-300">↔ Duplicate Requirement Detected</h4>
            <p className="text-xs mt-1 text-purple-200/90 leading-relaxed">
              This requirement repeats another clause in the tender document. ID: {req.duplicateOfRequirementId || 'Primary Clause'}.
            </p>
          </div>
        </div>
      )}

      {/* Requirement Text Block */}
      <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Exact Extracted Clause Text
        </div>
        <p className="text-sm text-slate-100 leading-relaxed font-serif bg-slate-900/80 p-4 rounded-lg border border-slate-800 font-normal">
          &ldquo;{req.requirementText}&rdquo;
        </p>

        {req.normalizedRequirementText && (
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Normalized Representation
            </div>
            <p className="text-xs text-blue-300 font-mono mt-1 bg-slate-900/40 p-2 rounded border border-slate-800">
              {req.normalizedRequirementText}
            </p>
          </div>
        )}
      </div>

      {/* Key Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mandatory Status */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Mandatory Requirement</div>
          <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-xs ${
                req.mandatory === 'YES'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : req.mandatory === 'NO'
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {req.mandatory === 'YES' ? 'MANDATORY (SHALL / MUST)' : req.mandatory === 'NO' ? 'OPTIONAL / DESIRABLE' : 'UNKNOWN / AMBIGUOUS'}
            </span>
          </div>
        </div>

        {/* Verification Source */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Verification Source
          </div>
          <div className="text-sm font-semibold text-indigo-300 mt-1">
            {req.verificationSource || 'Not explicitly specified'}
          </div>
        </div>
      </div>

      {/* Conditional Logic Callout if present */}
      {req.condition && (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> Conditional Exception / Logic
          </div>
          <p className="text-xs text-cyan-200 mt-1 font-mono">{req.condition}</p>
        </div>
      )}

      {/* Required Evidence List */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Required Bidder Evidence
        </div>
        {req.evidenceRequired.length > 0 ? (
          <ul className="space-y-1 pl-2">
            {req.evidenceRequired.map((ev, idx) => (
              <li key={idx} className="text-xs text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {ev}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No specific evidence document explicitly requested.</p>
        )}
      </div>

      {/* Rule Candidate Card */}
      <div className="bg-slate-800/80 p-5 rounded-xl border border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Executable Rule Candidate (For Future Engine)
            </span>
          </div>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
            Rule Candidate
          </span>
        </div>

        {req.ruleType && req.ruleParameters ? (
          <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Rule Type:</span>
              <span className="font-bold text-amber-400">{req.ruleType}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-slate-400 mb-1">Parameters:</div>
              <pre className="text-emerald-300 bg-slate-950 p-2 rounded overflow-x-auto">
                {JSON.stringify(req.ruleParameters, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-400/90 italic">
            No quantitative rule candidate generated (Qualitative or Ambiguous clause).
          </p>
        )}
      </div>

      {/* Extraction Confidence & AI Explanation */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Extraction Confidence</span>
          <span className="text-xs font-bold font-mono text-emerald-400">
            {Math.round(req.extractionConfidence * 100)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(req.extractionConfidence * 100)}%` }}
          />
        </div>

        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            AI Explanation & Provenance Grounding
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/40 p-3 rounded border border-slate-800">
            {req.aiExplanation}
          </p>
        </div>
      </div>
    </div>
  );
};
