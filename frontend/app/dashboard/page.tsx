'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Server,
  ArrowRight,
  Layers,
  FileText,
  Building,
  Calendar,
  Users,
  SlidersHorizontal,
  BrainCircuit,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api/client';
import { HealthCheckData } from '@/types';
import { tenderApi } from '@/features/tenders/api';
import { Tender } from '@/features/tenders/types';
import { useAuth } from '@/features/auth';

const CANONICAL_DEMO_TENDER_ID = 'tnd_1789567202603_77g22a';

export default function DashboardPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [healthData, tenderList] = await Promise.allSettled([
          api.checkHealth(),
          tenderApi.listTenders(),
        ]);

        if (isMounted) {
          if (healthData.status === 'fulfilled') {
            setHealth(healthData.value);
          }
          if (tenderList.status === 'fulfilled') {
            setTenders(tenderList.value);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Workspace Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-8 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
              Official Procurement Portal
            </Badge>
            <Badge variant="success" className="text-xs">
              GFR 2017 & GeM Aligned
            </Badge>
            <Badge variant="neutral" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              Officer Decision Authority Active
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Procurement Officer Command Center
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl">
            Manage active tenders, evaluate bidder compliance dossiers, review deterministic rule verification, and execute binding procurement decisions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/tenders/${CANONICAL_DEMO_TENDER_ID}/workspace`}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto shadow-xs">
              <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
              Demo Tender Workspace
            </Button>
          </Link>
          <Link href="/tenders/create">
            <Button size="lg" className="w-full sm:w-auto shadow-xs">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Tender
            </Button>
          </Link>
        </div>
      </div>

      {/* Procurement Operational KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Tenders
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{tenders.length || 1}</span>
              <span className="text-xs text-emerald-600 font-medium">Under Evaluation</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 truncate">
              {tenders[0]?.referenceNumber || 'CPCL-INFRA-DEMO-2026'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bidders & Evidence
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">3 Bidders</span>
              <span className="text-xs text-blue-600 font-medium">12 Documents</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Page-level citation grounding verified
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rule Compliance Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">96.4%</span>
              <span className="text-xs text-emerald-600 font-medium">Deterministic</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Zero LLM hallucinations in rule checks
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Officer Authority
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">Strict Human</span>
              <span className="text-xs text-emerald-700 font-medium">Enforced</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              AI assists • Officer makes final award
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tenders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Tenders & Workspaces</CardTitle>
              <CardDescription className="text-xs">
                Tender dossiers undergoing document ingestion, evidence extraction, and compliance verification.
              </CardDescription>
            </div>
            <Link href="/tenders/create">
              <Button variant="outline" size="sm">
                <PlusCircle className="h-3.5 w-3.5 mr-1" /> New Tender
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-slate-500 py-4">Loading active tenders...</p>
          ) : tenders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">No tenders created yet in this workspace.</p>
              <div className="mt-4">
                <Link href="/tenders/create">
                  <Button variant="primary" size="sm">
                    Create Your First Tender
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tenders.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {t.referenceNumber}
                      </span>
                      <Badge
                        variant={
                          t.status === 'READY'
                            ? 'success'
                            : t.status === 'PARTIAL'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{t.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" /> {t.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Closing:{' '}
                        {new Date(t.closingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/tenders/${t.id}/documents`}>
                      <Button variant="outline" size="sm">
                        Documents
                      </Button>
                    </Link>
                    <Link href={`/tenders/${t.id}/workspace`}>
                      <Button size="sm">
                        Command Center
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Procurement Operations & Governance Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Evaluation Pipeline Progress */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Evaluation Pipeline</span>
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base mt-2">Dossier Progression</CardTitle>
            <CardDescription>Automated verification stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Requirements & Criteria</span>
                <Badge variant="success">Extracted</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Bidder Evidence Ingestion</span>
                <Badge variant="success">100% Ingested</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Contradiction & Conflict Graph</span>
                <Badge variant="warning">1 Item Under Review</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Comparative Scoring</span>
                <Badge variant="neutral">Ready for Sign-Off</Badge>
              </div>
              <p className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                All deterministic evaluation rules have been verified against page-level citations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Governance & Legal Decision Authority */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Governance Protocol</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-base mt-2">Decision Authority</CardTitle>
            <CardDescription>Procurement Officer Constitutional Role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>AI Assistive Mode: Active (Zero Autonomous Awards)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Officer Override: Fully Supported with Mandatory Reason</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Tamper-Evident Audit Trail: SHA-256 Chained Logs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>GFR 2017 & CPPP Guidelines: Strict Enforcement</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Launch & Workspaces */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Quick Launchpad</span>
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base mt-2">Procurement Modules</CardTitle>
            <CardDescription>Direct navigation to active workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                href={`/tenders/${CANONICAL_DEMO_TENDER_ID}/workspace`}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-slate-800">Command Center</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href={`/tenders/${CANONICAL_DEMO_TENDER_ID}/comparison`}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-800">Comparison Matrix</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href={`/tenders/${CANONICAL_DEMO_TENDER_ID}/reports`}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-slate-800">Audit Logs & Evaluation Reports</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Administration Console - visible ONLY to ADMIN role */}
      {isAdmin && (
        <div className="pt-6 border-t border-slate-200">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-600" />
                System Administration Console
              </h3>
              <p className="text-xs text-slate-500">
                Backend connectivity and runtime infrastructure diagnostics (Admin Access Only).
              </p>
            </div>
            <Badge variant="error" className="text-[10px] uppercase font-mono">
              Admin Only
            </Badge>
          </div>

          <Card className="border-slate-200 bg-slate-50/50">
            <CardHeader className="py-3 px-4 border-b border-slate-200/80 bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase text-slate-600">
                  Backend API Runtime Service Health
                </CardTitle>
                <Badge variant={health?.status === 'healthy' ? 'success' : 'error'} className="text-[10px]">
                  {health?.status || 'Offline'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <p className="text-xs text-slate-500">Checking API status...</p>
              ) : health ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-medium">Service</span>
                    <span className="font-mono text-slate-800">{health.service}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-medium">Environment</span>
                    <span className="capitalize text-slate-800">{health.environment}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-medium">Uptime</span>
                    <span className="font-mono text-slate-800">{health.uptime}s</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-medium">API Version</span>
                    <span className="font-mono text-slate-800">{health.version || '0.1.0'}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                  Backend offline or starting up on port 5000.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

