import React from 'react';
import { Badge } from '@/components/ui/badge';
import { VerificationRequestStatus, VerificationResultStatus } from '@/types/verification';
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, XCircle, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status: VerificationRequestStatus | VerificationResultStatus | string;
  providerMode?: string;
  showDemoTag?: boolean;
  size?: 'sm' | 'md';
}

export function VerificationBadge({
  status,
  providerMode = 'MOCK',
  showDemoTag = true,
  size = 'md',
}: VerificationBadgeProps) {
  const upperStatus = (status || 'QUEUED').toUpperCase();

  let variant: 'success' | 'warning' | 'error' | 'neutral' | 'default' = 'neutral';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let label = upperStatus;

  switch (upperStatus) {
    case 'MATCH':
      variant = 'success';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'MATCH';
      break;
    case 'MISMATCH':
      variant = 'error';
      icon = <XCircle className="w-3.5 h-3.5 text-red-600" />;
      label = 'MISMATCH';
      break;
    case 'REVIEW_REQUIRED':
      variant = 'warning';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      label = 'REVIEW REQUIRED';
      break;
    case 'UNAVAILABLE':
      variant = 'warning';
      icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      label = 'UNAVAILABLE';
      break;
    case 'NOT_FOUND':
      variant = 'error';
      icon = <XCircle className="w-3.5 h-3.5 text-red-600" />;
      label = 'NOT FOUND';
      break;
    case 'RUNNING':
      variant = 'default';
      icon = <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />;
      label = 'RUNNING';
      break;
    case 'QUEUED':
      variant = 'neutral';
      icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
      label = 'QUEUED';
      break;
    case 'ERROR':
      variant = 'error';
      icon = <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      label = 'ERROR';
      break;
    default:
      variant = 'neutral';
      break;
  }

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <Badge variant={variant} className={size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}>
        {icon}
        <span>{label}</span>
      </Badge>

      {showDemoTag && providerMode === 'MOCK' && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          DEMO / MOCK VERIFICATION
        </span>
      )}
    </div>
  );
}
