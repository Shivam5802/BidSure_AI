'use client';

import React from 'react';
import {
  FileCheck2,
  Sparkles,
  Lock,
  AlertTriangle,
  Layers,
  CheckCircle2,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { BlueprintData, ComplianceBlueprint } from '../types';

interface BlueprintHeaderProps {
  tenderTitle: string;
  referenceNumber: string;
  blueprintData: BlueprintData | null;
  versions: ComplianceBlueprint[];
  isExtracting: boolean;
  onExtract: () => void;
  onLock: () => void;
  onSelectVersion: (version: number) => void;
}

export const BlueprintHeader: React.FC<BlueprintHeaderProps> = ({
  tenderTitle,
  referenceNumber,
  blueprintData,
  versions,
  isExtracting,
  onExtract,
  onLock,
  onSelectVersion,
}) => {
  const bp = blueprintData?.blueprint;
  const summary = blueprintData?.summary;

  const isLocked = bp?.status === 'LOCKED';

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-6 text-white shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {referenceNumber}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                bp?.status === 'LOCKED'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : bp?.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : bp?.status === 'UNDER_REVIEW'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}
            >
              Blueprint Status: {bp?.status || 'NO_BLUEPRINT'}
            </span>
          </div>

          <h1 className="text-2xl font-bold mt-2 text-slate-100 tracking-tight">
            {tenderTitle}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Machine-Readable Tender Compliance Blueprint with Source Provenance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Version Selector */}
          {versions.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Version:</span>
              <select
                value={bp?.version || 1}
                onChange={(e) => onSelectVersion(Number(e.target.value))}
                className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.version} className="bg-slate-800 text-slate-200">
                    v{v.version} ({v.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Extract Requirements Button */}
          <button
            onClick={onExtract}
            disabled={isExtracting || isLocked}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
            {isExtracting ? 'Extracting AI Requirements...' : 'Extract Requirements'}
          </button>

          {/* Lock Blueprint Button */}
          {bp && !isLocked && (
            <button
              onClick={onLock}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-sm font-semibold rounded-lg shadow transition"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              Lock Blueprint
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics Bar */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">Total Requirements</div>
            <div className="text-xl font-bold text-slate-100 mt-1">{summary.total}</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">Financial</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{summary.financial}</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">Technical</div>
            <div className="text-xl font-bold text-cyan-400 mt-1">{summary.technical}</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">Statutory</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">{summary.statutory}</div>
          </div>

          <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-800/40">
            <div className="text-amber-400 text-xs font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Review Required
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">{summary.reviewRequired}</div>
          </div>

          <div className="bg-rose-950/30 p-3 rounded-lg border border-rose-800/40">
            <div className="text-rose-400 text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Conflicts
            </div>
            <div className="text-xl font-bold text-rose-300 mt-1">{summary.conflicts}</div>
          </div>

          <div className="bg-purple-950/30 p-3 rounded-lg border border-purple-800/40">
            <div className="text-purple-400 text-xs font-medium flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" /> Duplicates
            </div>
            <div className="text-xl font-bold text-purple-300 mt-1">{summary.duplicates}</div>
          </div>
        </div>
      )}
    </div>
  );
};
