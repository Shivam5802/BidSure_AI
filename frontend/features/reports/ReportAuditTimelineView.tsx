import React, { useState } from 'react';
import { ReportAuditTimelineItem } from '@/types/reports';
import { Clock, User, FileText, Search, ShieldCheck } from 'lucide-react';

interface AuditTimelineProps {
  timeline: ReportAuditTimelineItem[];
}

export const ReportAuditTimelineView: React.FC<AuditTimelineProps> = ({ timeline }) => {
  const [filter, setFilter] = useState('');

  const filtered = timeline.filter((item) => {
    const q = filter.toLowerCase();
    return (
      item.event.toLowerCase().includes(q) ||
      item.actor.toLowerCase().includes(q) ||
      (item.metadata?.summary && item.metadata.summary.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Chronological Audit Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable log of document processing, rule evaluation, and officer review events.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter events or actor..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500">No matching audit events found.</p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="relative group">
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 ring-2 ring-indigo-100 dark:ring-indigo-950" />
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white">
                  <span>{item.event}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Actor: <strong className="text-indigo-600 dark:text-indigo-400">{item.actor}</strong>
                </div>
                {item.metadata?.summary && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.metadata.summary}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
