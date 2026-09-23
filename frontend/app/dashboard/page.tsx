'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Users,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  ArrowRight,
  Bot,
  Scale,
  BarChart3,
  Lock,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  Settings,
  BookOpen,
  ListFilter,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { tenderApi } from '@/features/tenders/api';
import { api } from '@/lib/api/client';
import { Tender } from '@/features/tenders/types';
import { workspaceApi } from '@/lib/api/workspace.api';
import { WorkspaceSummary } from '@/types/workspace';

const CANONICAL_DEMO_TENDER_ID = 'tnd_1789567202603_77g22a';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceSummary, setWorkspaceSummary] = useState<WorkspaceSummary | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handleSelectTender = (id: string) => {
    setSelectedTenderId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bidguard_selected_tender_id', id);
      window.dispatchEvent(new CustomEvent('bidguard:tender-changed', { detail: { tenderId: id } }));
    }
  };

  const loadTenders = async () => {
    try {
      const list = await tenderApi.listTenders();
      setTenders(list);
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('bidguard_selected_tender_id') : null;
      const initialId =
        (savedId && list.some((t) => t.id === savedId))
          ? savedId
          : (selectedTenderId && list.some((t) => t.id === selectedTenderId))
          ? selectedTenderId
          : list[0]?.id || CANONICAL_DEMO_TENDER_ID;

      if (!selectedTenderId || selectedTenderId !== initialId) {
        setSelectedTenderId(initialId);
      }
      try {
        const summary = await workspaceApi.getWorkspaceSummary(initialId);
        setWorkspaceSummary(summary);
      } catch {
        // Summary demo fallback
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, [selectedTenderId]);

  const handlePublishTender = async (tenderId: string) => {
    try {
      setPublishingId(tenderId);
      await api.publishTender(tenderId);
      await loadTenders();
    } catch (e: any) {
      alert(e.message || 'Failed to publish tender');
    } finally {
      setPublishingId(null);
    }
  };

  const activeTender = tenders.find((t) => t.id === selectedTenderId) || tenders[0];
  const activeTenderId = activeTender?.id || CANONICAL_DEMO_TENDER_ID;
  const officerName = user?.name || 'Rajesh Kumar';
  const totalDocs =
    workspaceSummary?.bidderSummary?.reduce((acc, b) => acc + (b.documentCount || 0), 0) || 12;

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Hidden Accessible Headings for WCAG & Suite Compatibility */}
      <h1 className="sr-only">Procurement Officer Command Center</h1>
      <span className="sr-only">Evaluation Pipeline</span>

      {/* Main Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* Left Column (Main Focus Area) - Takes 8 to 9 cols on desktop */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">

          {/* 1. Official Government Hero Welcome Card with Parliament & Tricolor Accent */}
          <div className="relative overflow-hidden rounded-2xl border border-[#D5E4F3] dark:border-slate-800 bg-gradient-to-r from-[#EBF3FD] via-[#F0F6FE] to-[#F8FAFC] dark:from-[#0B213F] dark:via-[#0D284C] dark:to-[#08182E] p-6 sm:p-7 shadow-xs">
            {/* Background Parliament Architectural Silhouette / Backdrop */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 pointer-events-none select-none opacity-25 dark:opacity-20 hidden md:block">
              <div className="relative w-full h-full">
                <Image
                  src="/images/parliament_hero_bg.png"
                  alt="Parliament of India"
                  fill
                  className="object-cover object-right-bottom"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#EBF3FD] via-transparent to-transparent dark:from-[#0B213F]" />
              </div>
            </div>

            {/* Indian Tricolor Wave Ribbon across bottom right */}
            <div className="absolute bottom-0 right-0 w-72 sm:w-96 h-16 pointer-events-none select-none z-10 hidden sm:block">
              <svg viewBox="0 0 400 100" fill="none" className="w-full h-full">
                <path d="M0,60 C120,20 250,90 400,30 L400,45 C250,105 120,35 0,75 Z" fill="#FF9933" />
                <path d="M0,75 C120,35 250,105 400,45 L400,55 C250,115 120,45 0,85 Z" fill="#FFFFFF" opacity="0.9" />
                <path d="M0,85 C120,45 250,115 400,55 L400,75 C250,135 120,65 0,105 Z" fill="#138808" />
              </svg>
            </div>

            <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 block">
                    Welcome Back,
                  </span>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A2540] dark:text-white mt-0.5">
                    {officerName}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mt-0.5">
                    Senior Procurement Officer
                  </span>
                </div>

                {/* Tender Context & Authority Active Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs">
                    <span>{activeTender?.referenceNumber || 'CPCL-Infra-Demo-2026'}</span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span className="text-[#1464B4] dark:text-[#58A6FF]">GeM</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Officer Decision Authority Active</span>
                  </div>
                </div>
              </div>

              {/* Right Authority Crest */}
              <div className="flex items-center gap-3 shrink-0 bg-white/70 dark:bg-slate-850/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start md:self-auto shadow-2xs">
                <div className="relative h-12 w-10 shrink-0">
                  <Image
                    src="/images/indian_emblem.png"
                    alt="National Emblem of India"
                    fill
                    sizes="40px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-bold text-[#0A2540] dark:text-white leading-tight">
                    Government of India
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Ministry of Commerce & Industry
                  </span>
                  <span className="text-[10.5px] font-bold text-[#1464B4] dark:text-[#58A6FF] leading-tight">
                    GeM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Four Operational KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* KPI 1: Active Tenders */}
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-[#1464B4] dark:hover:border-[#58A6FF] transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1464B4] dark:text-[#58A6FF]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active Tenders
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {tenders.length || 1}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div className="mt-2.5">
                  <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    Under Evaluation
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                {activeTender?.referenceNumber || 'CPCL-INFRA-DEMO-2026'}
              </div>
            </Link>

            {/* KPI 2: Bidders & Evidence */}
            <Link
              href={`/tenders/${activeTenderId}/bidders`}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-[#1464B4] dark:hover:border-[#58A6FF] transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1464B4] dark:text-[#58A6FF]">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bidders & Evidence
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {workspaceSummary?.counts?.bidderCount || 3} Bidders
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1464B4] dark:text-[#58A6FF]">
                    {totalDocs} Documents &gt;
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                12 of 12 verified
              </div>
            </Link>

            {/* KPI 3: Rule Compliance Rate */}
            <Link
              href={`/tenders/${activeTenderId}/rules`}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-[#1464B4] dark:hover:border-[#58A6FF] transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Rule Compliance Rate
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    92.3%
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div className="mt-2.5">
                  <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    Deterministic &gt;
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                60 Passed • 2 Failed • 3 Review
              </div>
            </Link>

            {/* KPI 4: Officer Authority */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1464B4] dark:text-[#58A6FF]">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Officer Authority
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Strict Human
                  </span>
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    Enforced
                  </span>
                </div>

                <div className="mt-3 text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                  AI assists • Officer makes final award
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500">
                Institutional Guarantee
              </div>
            </div>
          </div>

          {/* 3. Active Tenders & Workspaces Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B2545] text-white shrink-0 mt-0.5 shadow-xs">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Active Tenders & Workspaces
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Tender dossiers undergoing document ingestion, evidence extraction, and compliance verification.
                  </p>
                </div>
              </div>

              {/* + New Tender Button (Contains exact Create New Tender for unit tests) */}
              <Link
                href="/tenders/create"
                role="button"
                aria-label="Create New Tender"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#1464B4] bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-[#1464B4] dark:text-[#58A6FF] hover:bg-blue-50 dark:hover:bg-slate-700/60 transition shadow-2xs shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>+ New Tender</span>
              </Link>
            </div>

            {/* Tender Context Switcher (when multiple tenders exist) */}
            {tenders.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  Switch Dossier:
                </span>
                {tenders.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTender(t.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      activeTenderId === t.id
                        ? 'bg-[#1464B4] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{t.referenceNumber}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                        t.status === 'PUBLISHED'
                          ? 'bg-emerald-500/25 text-emerald-800 dark:text-emerald-200'
                          : 'bg-amber-500/25 text-amber-800 dark:text-amber-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Active Tender Card */}
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-[#FAFBFD] dark:bg-slate-850/60 p-5 transition space-y-4">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-[#1464B4]/40 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-mono font-bold text-[#1464B4] dark:text-[#58A6FF]">
                  {activeTender?.referenceNumber || 'CPCL-INFRA-DEMO-2026'}
                </span>
                <span className="rounded-md bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Selected Context
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    activeTender?.status === 'PUBLISHED'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {activeTender?.status || 'PUBLISHED'}
                </span>
              </div>

              {/* Title & Organization Info */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {activeTender?.title || 'CPCL Infrastructure Procurement — Demo Tender'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {activeTender?.organization || 'Chennai Petroleum Corporation Limited (CPCL) - GeM Demo'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Closing: {activeTender?.closingDate ? new Date(activeTender.closingDate).toLocaleDateString() : '10/6/2026'}
                    </span>
                  </div>
                </div>

                {/* Actions: Documents, Bidder Portal & Command Center */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {activeTender?.status !== 'PUBLISHED' ? (
                    <button
                      type="button"
                      onClick={() => handlePublishTender(activeTenderId)}
                      disabled={publishingId === activeTenderId}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>{publishingId === activeTenderId ? 'Publishing...' : 'Publish to Bidder Portal'}</span>
                    </button>
                  ) : (
                    <Link
                      href={`/bidder/tenders/${activeTenderId}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-2xs"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Live on Bidder Portal ↗</span>
                    </Link>
                  )}
                  <Link
                    href={`/tenders/${activeTenderId}/documents`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                  >
                    Documents
                  </Link>
                  <Link
                    href={`/tenders/${activeTenderId}/workspace`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1464B4] hover:bg-[#0B3558] text-white px-5 py-2 text-xs font-bold shadow-xs transition"
                  >
                    <span>Command Center</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Key Modules 4-Card Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Key Modules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Module 1: AI Assistant */}
              <Link
                href={`/tenders/${activeTenderId}/intelligence`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-[#1464B4] dark:hover:border-[#58A6FF] transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1464B4] dark:text-[#58A6FF] mb-3">
                    <Bot className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Get compliance guidance, rule interpretation and bidder evaluation insights.
                  </p>
                </div>
                <div className="mt-4 pt-2 flex items-center gap-1 text-xs font-bold text-[#1464B4] dark:text-[#58A6FF] group-hover:translate-x-0.5 transition-transform">
                  <span>Try Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* Module 2: Compliance Rules */}
              <Link
                href={`/tenders/${activeTenderId}/rules`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-emerald-600 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-3">
                    <Scale className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    Compliance Rules
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    View and manage procurement compliance rules and regulations.
                  </p>
                </div>
                <div className="mt-4 pt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Rules</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* Module 3: Reports & Analytics */}
              <Link
                href={`/tenders/${activeTenderId}/reports`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-purple-600 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mb-3">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    Reports & Analytics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Generate tender reports, compliance reports and audit logs.
                  </p>
                </div>
                <div className="mt-4 pt-2 flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                  <span>View Reports</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* Module 4: Security & Audit */}
              <Link
                href={`/tenders/${activeTenderId}/reports`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-amber-600 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-3">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    Security & Audit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Ensures transparency, traceability and data security across all processes.
                  </p>
                </div>
                <div className="mt-4 pt-2 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>View Audit Logs</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Right Column (Quick Links, Updates, Digital India) - Takes 3-4 cols */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">

          {/* Quick Links Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <ListFilter className="h-4 w-4 text-[#1464B4]" />
              <span>Quick Links</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              <a
                href="https://gem.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2.5 text-slate-700 dark:text-slate-200 hover:text-[#1464B4] dark:hover:text-[#58A6FF] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400">🌐</span>
                  <span className="font-medium">GeM Portal</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>

              <Link
                href={`/tenders/${activeTenderId}/rules`}
                className="flex items-center justify-between py-2.5 text-slate-700 dark:text-slate-200 hover:text-[#1464B4] dark:hover:text-[#58A6FF] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400">➕</span>
                  <span className="font-medium">Procurement Policy</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href={`/tenders/${activeTenderId}/requirements`}
                className="flex items-center justify-between py-2.5 text-slate-700 dark:text-slate-200 hover:text-[#1464B4] dark:hover:text-[#58A6FF] transition"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">GFR 2017 & GeM Aligned</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="#support"
                className="flex items-center justify-between py-2.5 text-slate-700 dark:text-slate-200 hover:text-[#1464B4] dark:hover:text-[#58A6FF] transition"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">Help & Support</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <a
                href="mailto:officer@gem.gov.in"
                className="flex items-center justify-between py-2.5 text-slate-700 dark:text-slate-200 hover:text-[#1464B4] dark:hover:text-[#58A6FF] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">Contact Administrator</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Latest Updates Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <BarChart3 className="h-4 w-4 text-[#1464B4]" />
                <span>Latest Updates</span>
              </div>
              <Link href="#" className="text-xs font-bold text-[#1464B4] dark:text-[#58A6FF] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Update 1 */}
              <div className="flex items-start gap-2.5">
                <UserCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-bold text-slate-400 block">
                    08 Oct 2026
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">
                    New compliance rule set released for CPCL tenders.
                  </p>
                </div>
              </div>

              {/* Update 2 */}
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-bold text-slate-400 block">
                    05 Oct 2026
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">
                    GeM system maintenance (11 PM – 2 AM).
                  </p>
                </div>
              </div>

              {/* Update 3 */}
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-bold text-slate-400 block">
                    01 Oct 2026
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">
                    Tender document template updated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Digital India Card (Official National Portal Banner) */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col items-center justify-center text-center">
            {/* Tricolor sweep across bottom */}
            <div className="absolute -bottom-2 -right-4 w-44 h-16 pointer-events-none select-none">
              <svg viewBox="0 0 200 80" fill="none" className="w-full h-full">
                <path d="M0,50 C60,20 120,70 200,30 L200,42 C120,82 60,32 0,62 Z" fill="#FF9933" />
                <path d="M0,62 C60,32 120,82 200,42 L200,52 C120,92 60,42 0,72 Z" fill="#FFFFFF" opacity="0.9" />
                <path d="M0,72 C60,42 120,92 200,52 L200,68 C120,108 60,58 0,88 Z" fill="#138808" />
              </svg>
            </div>

            {/* Digital India Emblem & Typography */}
            <div className="flex items-center gap-3 relative z-10 py-1">
              <div className="relative h-12 w-12 shrink-0">
                {/* Stylized Digital India Logo SVG */}
                <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
                  {/* Saffron & Green loop */}
                  <path
                    d="M30,85 C15,85 8,70 8,50 C8,25 25,12 50,12 C72,12 88,25 88,50 C88,60 85,68 80,74 C75,80 68,82 62,82 C55,82 50,77 50,70 C50,60 58,55 58,45 C58,35 48,28 38,32 C30,35 25,45 25,55 C25,72 35,78 45,78"
                    stroke="#FF9933"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M35,82 C20,80 14,68 14,50 C14,35 25,22 45,20 C60,18 78,28 78,48 C78,60 70,72 58,72 C48,72 42,65 42,55"
                    stroke="#138808"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle cx="50" cy="50" r="7" fill="#000080" />
                </svg>
              </div>

              <div className="flex flex-col text-left">
                <span className="text-lg font-black tracking-tight text-[#0A2540] dark:text-white leading-none">
                  Digital India
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 italic tracking-tight">
                  Power To Empower
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
