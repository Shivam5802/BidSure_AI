'use client';

import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Layers } from 'lucide-react';
import { RuleCoverageStatistics } from '../types';

interface RuleCoverageCardProps {
  coverage: RuleCoverageStatistics | null;
}

export const RuleCoverageCard: React.FC<RuleCoverageCardProps> = ({ coverage }) => {
  if (!coverage) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-6 text-white shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Tender Compliance Rule Engine Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Declarative Rule Schema Validation & Deterministic Quad-State Engine (Version 1.0.0)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400">Rule Engine Version:</span>{' '}
            <span className="text-emerald-400 font-bold">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Coverage Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-800/80">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
          <div className="text-slate-400 text-xs font-medium">Total Requirements</div>
          <div className="text-xl font-bold text-slate-100 mt-1">{coverage.totalRequirements}</div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
          <div className="text-slate-400 text-xs font-medium">Executable Rules</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{coverage.totalRules}</div>
        </div>

        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-800/40">
          <div className="text-emerald-400 text-xs font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved Rules
          </div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{coverage.approvedRules}</div>
        </div>

        <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-800/40">
          <div className="text-amber-400 text-xs font-medium flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Review Required
          </div>
          <div className="text-xl font-bold text-amber-300 mt-1">{coverage.reviewRules}</div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
          <div className="text-slate-400 text-xs font-medium">Draft Rules</div>
          <div className="text-xl font-bold text-slate-300 mt-1">{coverage.draftRules}</div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
          <div className="text-slate-400 text-xs font-medium">Numeric / Date / Bool</div>
          <div className="text-xs font-mono text-cyan-300 mt-2">
            N:{coverage.byType['NUMERIC'] || 0} D:{coverage.byType['DATE'] || 0} B:{coverage.byType['BOOLEAN'] || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
