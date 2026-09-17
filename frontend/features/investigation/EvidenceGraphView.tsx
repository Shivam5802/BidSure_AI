import React from 'react';
import {
  FileText,
  Calculator,
  AlertTriangle,
  Bot,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface EvidenceGraphViewProps {
  requirementCode?: string;
  ruleCode?: string;
  evaluationResult?: string;
  evidenceItems?: Array<{ documentName?: string; pageNumber?: number; rawValue?: any }>;
  contradictions?: Array<{ documentA: string; documentB: string; valueA: any; valueB: any }>;
  officerDecision?: string | null;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({
  requirementCode = 'REQ-FIN-001',
  ruleCode = 'RULE-FIN-001',
  evaluationResult = 'REVIEW',
  evidenceItems = [],
  contradictions = [],
  officerDecision,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Evidence Provenance & Compliance Flow Graph
        </h3>
        <span className="text-[11px] font-mono text-slate-500">Relational Visualization</span>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        {/* Step 1: Requirement */}
        <div className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <FileText className="w-4 h-4" />
            Requirement
          </div>
          <p className="font-mono text-xs font-bold text-white">{requirementCode}</p>
          <span className="text-[11px] text-slate-500 block">Tender Requirement</span>
        </div>

        <div className="hidden lg:flex items-center justify-center text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </div>

        {/* Step 2: Approved Rule */}
        <div className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Calculator className="w-4 h-4" />
            Approved Rule
          </div>
          <p className="font-mono text-xs font-bold text-white">{ruleCode}</p>
          <span className="text-[11px] text-emerald-400 font-semibold block">APPROVED State</span>
        </div>

        <div className="hidden lg:flex items-center justify-center text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </div>

        {/* Step 3: Evaluation & Evidence */}
        <div className="flex-1 p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Evaluation Result
          </div>
          <p className="font-mono text-xs font-bold text-amber-300 uppercase">{evaluationResult}</p>
          <span className="text-[11px] text-slate-400 block">
            {contradictions.length > 0 ? `${contradictions.length} Conflict(s)` : `${evidenceItems.length} Evidence Mapped`}
          </span>
        </div>

        <div className="hidden lg:flex items-center justify-center text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </div>

        {/* Step 4: AI Investigation Agent */}
        <div className="flex-1 p-4 rounded-xl bg-indigo-950/70 border border-indigo-500/40 space-y-2 shadow-lg shadow-indigo-950/50">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Bot className="w-4 h-4 text-indigo-400" />
            AI Agent
          </div>
          <p className="font-mono text-xs font-bold text-indigo-200">Investigate Case</p>
          <span className="text-[11px] text-slate-400 block">Advisory Decision Support</span>
        </div>

        <div className="hidden lg:flex items-center justify-center text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </div>

        {/* Step 5: Officer Review */}
        <div className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <UserCheck className="w-4 h-4" />
            Officer Action
          </div>
          <p className="font-mono text-xs font-bold text-slate-200">
            {officerDecision || 'Pending Officer Action'}
          </p>
          <span className="text-[11px] text-slate-500 block">Sole Decision Maker</span>
        </div>
      </div>
    </div>
  );
};
