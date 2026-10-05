'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { toast } from '@/components/ui/Toast';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FolderLock,
  ArrowRight,
  RefreshCw,
  Loader2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComplianceIssue {
  id: string;
  issueType: string;
  fieldKey: string;
  affectedDocument?: string | null;
  detectedValue?: string | null;
  expectedValue?: string | null;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedAction: string;
  status: string;
}

export default function ComplianceCenterPage() {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBidderComplianceSummary();
      setSummary(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load compliance audit.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await api.getBidderComplianceSummary();
      setSummary(data);
      toast.success('Compliance integrity check re-evaluated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to re-evaluate compliance.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
          <p className="text-xs text-slate-500">Auditing corporate compliance & cross-document integrity...</p>
        </div>
      </div>
    );
  }

  const issues: ComplianceIssue[] = summary?.issues || [];
  const readiness = summary?.overallReadinessScore ?? 100;
  const criticalCount = summary?.criticalIssuesCount ?? 0;
  const highCount = summary?.highIssuesCount ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Compliance Center & Integrity Engine
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time cross-document inconsistency detection, statutory validity monitoring, and audit readiness for GeM tenders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs font-semibold"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#1464B4]" />
            )}
            Re-Run Pre-Check
          </Button>
          <Link href="/bidder/reports">
            <Button size="sm" className="rounded-xl bg-[#1464B4] text-white text-xs font-bold">
              View Audit Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Readiness Scorecard */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-4 md:pb-0 md:pr-6">
            <span className="text-xs font-semibold text-slate-500">Tender Pre-Qualification Score</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold tracking-tight ${
                readiness >= 80 ? 'text-emerald-600' : readiness >= 50 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {readiness}%
              </span>
              <span className="text-xs font-bold text-slate-500">
                {readiness >= 80 ? 'Audit Ready' : readiness >= 50 ? 'Action Needed' : 'At Risk'}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  readiness >= 80 ? 'bg-emerald-500' : readiness >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Total Mandatory Docs</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{summary?.totalRequiredDocuments || 6}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Verified & Vaulted</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{summary?.documentsVerified || 0}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Expired Docs</span>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{summary?.expiredDocuments || 0}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Critical Mismatches</span>
              <p className={`text-xl font-bold ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                {criticalCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inconsistency Detection Findings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1464B4]" />
            Detected Data Inconsistencies & Anomalies ({issues.length})
          </h2>
          <span className="text-xs text-slate-500">Rule-based cross-validation + AI evidence matching</span>
        </div>

        {issues.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Clean Compliance Record</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/90 max-w-lg mx-auto">
              No identifier conflicts, company name mismatches, or expired statutory certificates detected across your registration profile and vault documents.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((iss) => (
              <div
                key={iss.id}
                className={`rounded-2xl border p-5 shadow-xs transition ${
                  iss.severity === 'CRITICAL'
                    ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20'
                    : iss.severity === 'HIGH'
                    ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
                      iss.severity === 'CRITICAL'
                        ? 'bg-rose-500 text-white'
                        : iss.severity === 'HIGH'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                          iss.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                            : iss.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                        }`}>
                          {iss.severity} • {iss.issueType}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {iss.affectedDocument || iss.fieldKey}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {iss.reason}
                      </p>

                      {/* Evidence Comparison Table */}
                      {(iss.detectedValue || iss.expectedValue) && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-3 text-xs">
                          {iss.detectedValue && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                Detected Value / Finding:
                              </span>
                              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                {iss.detectedValue}
                              </p>
                            </div>
                          )}
                          {iss.expectedValue && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Expected Requirement:
                              </span>
                              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                {iss.expectedValue}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span>Suggested Action: {iss.suggestedAction}</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/bidder/registrations" className="shrink-0">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                      Resolve <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
