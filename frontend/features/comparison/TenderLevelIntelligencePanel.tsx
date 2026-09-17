import React from 'react';
import { ComparisonMatrixResponse, SelectedBidderSummary } from '@/types/comparison';
import { Layers, ShieldAlert, AlertTriangle, FileText, CheckCircle2, HelpCircle, Info } from 'lucide-react';

interface IntelligencePanelProps {
  intelligence: ComparisonMatrixResponse['tenderIntelligence'];
  selectedBidders: SelectedBidderSummary[];
}

export const TenderLevelIntelligencePanel: React.FC<IntelligencePanelProps> = ({
  intelligence,
  selectedBidders,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Tender-Level Intelligence Insights */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Tender-Level Requirement Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregated requirement distribution & variation metrics across selected bidders.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {intelligence.totalRequirementsEvaluated} Requirements Evaluated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Differing Outcomes
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {intelligence.differingOutcomeCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Requirements vary across bidders</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Attention Req.
            </div>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-200">
              {intelligence.unresolvedIssueRequirementCount}
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
              Contain FAIL / REVIEW / NE
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60">
            <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Evidence Conflicts
            </div>
            <div className="text-xl font-bold text-rose-900 dark:text-rose-200">
              {intelligence.evidenceConflictRequirementCount}
            </div>
            <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">
              Unresolved evidence conflicts
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
            <div className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">
              Selected Bidders
            </div>
            <div className="text-xl font-bold text-indigo-900 dark:text-indigo-200">
              {selectedBidders.length}
            </div>
            <div className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-0.5">
              Active in comparison
            </div>
          </div>
        </div>

        {intelligence.highestUnresolvedRequirement && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Highest Officer Attention Case:{' '}
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {intelligence.highestUnresolvedRequirement.requirementCode}
                </span>{' '}
                — {intelligence.highestUnresolvedRequirement.requirementText}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold shrink-0">
              {intelligence.highestUnresolvedRequirement.unresolvedCount} Unresolved
            </span>
          </div>
        )}
      </div>

      {/* Evidence Coverage Matrix Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Evidence Coverage Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Comparison of submitted document evidence completeness.
          </p>

          <div className="space-y-2.5 text-xs">
            {selectedBidders.map((b) => (
              <div key={b.bidderId} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="truncate max-w-[160px] text-slate-800 dark:text-slate-200">
                    {b.displayName || b.legalName}
                  </span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {b.evidenceCoverage.coveragePercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${b.evidenceCoverage.coveragePercentage}%` }}
                    title={`Covered: ${b.evidenceCoverage.covered}`}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${Math.min(100 - b.evidenceCoverage.coveragePercentage, 15)}%` }}
                    title={`Partial/Review: ${b.evidenceCoverage.partial}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Neutral Disclaimer */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300">Important Note:</strong> Evidence
          coverage does not equal compliance. A bidder can have complete evidence and still fail
          specific tender requirements.
        </div>
      </div>
    </div>
  );
};
