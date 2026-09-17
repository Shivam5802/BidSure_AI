import React from 'react';
import { FileText, Calculator, AlertTriangle, Bot, Users, Shield, BookOpen, Layers, SlidersHorizontal, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface QuickNavToolbarProps {
  tenderId: string;
}

export const QuickNavToolbar: React.FC<QuickNavToolbarProps> = ({ tenderId }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 flex-wrap text-xs">
      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-wider">
        Quick Navigation:
      </span>

      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/tenders/${tenderId}/documents`}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          Tender Documents
        </Link>

        <Link
          href={`/tenders/${tenderId}/requirements`}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          Requirements Blueprint
        </Link>

        <Link
          href={`/tenders/${tenderId}/rules`}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-500" />
          Compliance Rules
        </Link>

        <Link
          href={`/tenders/${tenderId}/workspace`}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          Command Center
        </Link>

        <Link
          href={`/tenders/${tenderId}/comparison`}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
          Bidder Comparison
        </Link>

        <Link
          href={`/tenders/${tenderId}/reports`}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5 text-rose-500" />
          Audit Reports
        </Link>

        <Link
          href={`/tenders/${tenderId}/intelligence`}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-700 dark:text-indigo-300 transition flex items-center gap-1.5 shadow-2xs"
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          Intelligence & Impact
        </Link>
      </div>
    </div>
  );
};
