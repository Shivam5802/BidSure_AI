'use client';

import React from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  Edit3,
  Play,
  FileCode,
  ShieldAlert,
  Info,
  Layers,
} from 'lucide-react';
import { ComplianceRule } from '../types';

interface RuleDetailProps {
  rule: ComplianceRule | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onOpenSimulator: (rule: ComplianceRule) => void;
}

export const RuleDetail: React.FC<RuleDetailProps> = ({
  rule,
  onApprove,
  onReject,
  onOpenSimulator,
}) => {
  if (!rule) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-900/40">
        <Cpu className="w-12 h-12 text-slate-600 mb-3" />
        <p className="text-sm font-medium">Select a rule from the list to inspect</p>
        <p className="text-xs text-slate-600 mt-1">
          Review declarative JSON definitions, approve rules, or simulate deterministic evaluation.
        </p>
      </div>
    );
  }

  const isApproved = rule.status === 'APPROVED';

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-900/60 text-slate-100">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400">{rule.ruleCode}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Version v{rule.version}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : rule.status === 'REVIEW'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {rule.status}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-2">{rule.name}</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenSimulator(rule)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Open Rule Simulator
          </button>

          {!isApproved && (
            <button
              onClick={() => onApprove(rule.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Rule
            </button>
          )}

          {rule.status !== 'REJECTED' && (
            <button
              onClick={() => onReject(rule.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold rounded-lg transition"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>
          )}
        </div>
      </div>

      {/* Description & Review Warning */}
      {rule.description && (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-200">Rule Notes / Description:</span> {rule.description}
        </div>
      )}

      {rule.status === 'REVIEW' && (
        <div className="p-4 bg-amber-950/50 border border-amber-800/60 rounded-xl text-amber-200 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            ⚠ <strong>Procurement Officer Review Required:</strong> This rule candidate requires officer inspection or parameter confirmation before it can be used for evaluation.
          </span>
        </div>
      )}

      {/* Declarative Schema JSON Display */}
      <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Declarative JSON Rule Definition
            </span>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
            {rule.ruleType}
          </span>
        </div>

        <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
          {JSON.stringify(rule.definition, null, 2)}
        </pre>
      </div>

      {/* Rule Audit Info */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-2 text-xs text-slate-400 font-mono">
        <div className="flex justify-between">
          <span>Created At:</span> <span>{new Date(rule.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Created By:</span> <span>{rule.createdBy || 'AI Extraction Pipeline'}</span>
        </div>
        {rule.approvedBy && (
          <div className="flex justify-between text-emerald-400">
            <span>Approved By:</span> <span>{rule.approvedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
};
