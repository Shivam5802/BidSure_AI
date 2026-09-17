import React from 'react';
import { InvestigationStatus, InvestigationSeverity } from '@/types';
import {
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Slash,
  ShieldAlert,
} from 'lucide-react';

interface InvestigationStatusBadgeProps {
  status: InvestigationStatus;
  severity?: InvestigationSeverity;
  className?: string;
}

export const InvestigationStatusBadge: React.FC<InvestigationStatusBadgeProps> = ({
  status,
  severity,
  className = '',
}) => {
  const renderStatus = () => {
    switch (status) {
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            QUEUED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            RUNNING
          </span>
        );
      case 'REQUIRES_HUMAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            REQUIRES HUMAN REVIEW
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            FAILED
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-500 border border-slate-800">
            <Slash className="w-3.5 h-3.5 text-slate-500" />
            CANCELLED
          </span>
        );
    }
  };

  const renderSeverity = () => {
    if (!severity) return null;
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/40 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-400 border border-orange-500/40">
            HIGH SEVERITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/40">
            MEDIUM SEVERITY
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            LOW SEVERITY
          </span>
        );
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {renderStatus()}
      {renderSeverity()}
    </div>
  );
};
