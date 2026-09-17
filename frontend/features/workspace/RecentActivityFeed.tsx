import React from 'react';
import { Clock, ShieldCheck, FileText, AlertTriangle, CheckCircle2, User } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: {
    id: string;
    event: string;
    actor: string;
    timestamp: string;
    metadata?: any;
  }[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs text-slate-500 text-center">
        No recent activity events recorded.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Event Activity Log</h3>
          <p className="text-[11px] text-slate-500">Real-time system & procurement officer actions</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((act) => {
          const time = new Date(act.timestamp).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{act.event}</span>
                  <span className="text-[10px] text-slate-400">{time}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Actor: <strong className="text-slate-700 dark:text-slate-300">{act.actor}</strong>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
