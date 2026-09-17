import React from 'react';
import { ReportInvestigationItem } from '@/types/reports';
import { Bot, Sparkles, CheckCircle2, UserCheck, HelpCircle } from 'lucide-react';

interface InvestigationsSectionProps {
  investigations: ReportInvestigationItem[];
}

export const ReportInvestigationsSection: React.FC<InvestigationsSectionProps> = ({ investigations }) => {
  if (investigations.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            AI Investigation Records ({investigations.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated compliance investigation findings and human review decisions.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> AI-Assisted
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investigations.map((inv) => (
          <div
            key={inv.id}
            className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 text-xs space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                Trigger: {inv.triggerType}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                Status: {inv.status}
              </span>
            </div>

            {inv.question && (
              <div className="font-semibold text-slate-900 dark:text-white">
                Q: {inv.question}
              </div>
            )}

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Finding:</strong> {inv.finding || inv.summary || 'Investigation completed.'}
            </p>

            {inv.recommendation && (
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 text-[11px] text-slate-600 dark:text-slate-400">
                <strong>AI Recommendation:</strong> {inv.recommendation}
              </div>
            )}

            <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Model: {inv.modelProvider}/{inv.modelName}</span>
              {inv.reviewedBy && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  <UserCheck className="w-3 h-3" /> Reviewed by {inv.reviewedBy}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
