'use client';

import React, { useState } from 'react';
import { Calculator, AlertCircle, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface DemoImpactCalculatorProps {
  defaultRequirementsCount?: number;
  defaultBidderCount?: number;
}

export const DemoImpactCalculator: React.FC<DemoImpactCalculatorProps> = ({
  defaultRequirementsCount = 35,
  defaultBidderCount = 4,
}) => {
  const [minutesPerRequirement, setMinutesPerRequirement] = useState<number>(15);
  const [requirementsCount, setRequirementsCount] = useState<number>(defaultRequirementsCount || 35);
  const [biddersCount, setBiddersCount] = useState<number>(defaultBidderCount || 4);

  // Manual calculation
  const totalEvaluations = requirementsCount * biddersCount;
  const manualTotalMinutes = totalEvaluations * minutesPerRequirement;
  const manualTotalHours = (manualTotalMinutes / 60).toFixed(1);

  // BidGuard assisted estimated processing time: ~8 to 12 minutes total prototype execution
  const bidguardEstimatedMinutes = Math.max(4, Math.round(requirementsCount * 0.25 + biddersCount * 0.5));

  const potentialHoursSaved = Math.max(0, (manualTotalMinutes - bidguardEstimatedMinutes) / 60).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Demo Impact & Efficiency Calculator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate potential time savings based on procurement volume and manual review baselines.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
          DEMO ESTIMATE
        </span>
      </div>

      {/* Critical Mandatory Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300">Methodology Notice: </span>
          <span>Illustrative estimate based on user-entered assumptions; not a measured government procurement result.</span>
        </div>
      </div>

      {/* Interactive Sliders & Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
            <span>Manual Review Mins / Req</span>
            <span className="text-indigo-600 dark:text-indigo-400">{minutesPerRequirement} mins</span>
          </label>
          <input
            type="range"
            min={5}
            max={45}
            step={5}
            value={minutesPerRequirement}
            onChange={(e) => setMinutesPerRequirement(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <span className="text-[10px] text-slate-400">Baseline time spent per clause cross-check</span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
            <span>Number of Requirements</span>
            <span className="text-indigo-600 dark:text-indigo-400">{requirementsCount} reqs</span>
          </label>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={requirementsCount}
            onChange={(e) => setRequirementsCount(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <span className="text-[10px] text-slate-400">Extracted criteria from tender</span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
            <span>Number of Bidders</span>
            <span className="text-indigo-600 dark:text-indigo-400">{biddersCount} bidders</span>
          </label>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={biddersCount}
            onChange={(e) => setBiddersCount(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <span className="text-[10px] text-slate-400">Submissions requiring evaluation</span>
        </div>
      </div>

      {/* Comparison Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1">
          <div className="text-[11px] uppercase font-bold text-slate-500">Estimated Manual Effort</div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
            ~{manualTotalHours} hrs
          </div>
          <div className="text-[11px] text-slate-400">
            {totalEvaluations} total clause-bidder evaluations
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1">
          <div className="text-[11px] uppercase font-bold text-indigo-700 dark:text-indigo-400">
            BidGuard Pipeline Runtime
          </div>
          <div className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-200">
            ~{bidguardEstimatedMinutes} mins
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
            Automated extraction & rule evaluation
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
          <div className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
            Projected Time Repurposed
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">
            ~{potentialHoursSaved} hrs
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Available for deep human oversight
          </div>
        </div>
      </div>

      {/* Official SIH Problem Statement Target Disclaimer */}
      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-900 dark:text-blue-200">
            Target stated in the SIH problem statement: 60%–80% reduction in verification effort.{' '}
          </span>
          <span className="text-blue-800 dark:text-blue-300">
            Visually distinct from prototype measurements; represents external program objectives for full-scale government deployment.
          </span>
        </div>
      </div>
    </div>
  );
};
