'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  FileCheck2,
  Scale,
  BrainCircuit,
  SearchCheck,
  AlertTriangle,
  AlertCircle,
  History,
  ArrowRight,
  CheckCircle2,
  FileText,
  Workflow,
  Sparkles,
  Play,
  Link2,
  ShieldCheck,
  Building2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { tenderApi } from '@/features/tenders/api';
import { api } from '@/lib/api/client';
import { Tender } from '@/features/tenders/types';
import { HealthCheckData } from '@/types';

export default function LandingPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [health, setHealth] = useState<HealthCheckData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        const [tenderList, healthRes] = await Promise.allSettled([
          tenderApi.listTenders(),
          api.checkHealth(),
        ]);
        if (isMounted) {
          if (tenderList.status === 'fulfilled') {
            setTenders(tenderList.value);
          }
          if (healthRes.status === 'fulfilled') {
            setHealth(healthRes.value);
          }
        }
      } catch {}
    }
    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeTender = tenders[0];
  const activeTenderId = activeTender?.id || 'tnd_1789567202603_77g22a';
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-20 lg:pb-28 bg-gradient-to-b from-white via-blue-50/20 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          {/* Ambient Glows */}
          <div className="absolute top-10 right-10 -z-10 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-indigo-300/10 blur-[100px] pointer-events-none" />

          {/* Bottom Left Curved Wave Swoosh */}
          <div className="absolute -bottom-28 -left-20 -z-10 w-96 h-96 pointer-events-none opacity-90">
            <svg
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full transform -rotate-12"
            >
              <path
                d="M-50 450 C 60 320, 180 340, 240 260 C 300 180, 260 80, 420 50 L 420 450 Z"
                fill="url(#wave-gradient)"
              />
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="60%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Left Column: Copy & Actions */}
              <div className="flex flex-col items-start text-left lg:col-span-6 z-10">
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 mb-6 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Smarter Procurement. Stronger Decisions.</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.12]">
                  AI-Powered Bid <br />
                  Compliance{' '}
                  <span className="text-blue-600 dark:text-blue-400">Intelligence</span>
                </h1>

                {/* Subtitle Description */}
                <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  Turn complex tender documents into evidence-backed, explainable compliance decisions.
                  Built for public procurement officers who demand verifiable audit trails.
                </p>

                {/* Action CTA Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
                  <Link href="/dashboard">
                    <button className="group inline-flex items-center gap-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium pl-2.5 pr-6 py-2.5 text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                      </span>
                      <span>Start New Tender</span>
                    </button>
                  </Link>

                  <a href="#how-it-works">
                    <button className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium px-6 py-3.5 text-sm shadow-xs transition-all hover:scale-[1.02]">
                      <Play className="h-3.5 w-3.5 fill-slate-800 dark:fill-slate-200 text-slate-800 dark:text-slate-200 ml-0.5" />
                      <span>Watch How It Works</span>
                    </button>
                  </a>
                </div>

                {/* 3 Key Principles Feature Badges */}
                <div className="mt-12 flex flex-wrap items-center gap-6 text-slate-800 dark:text-slate-200">
                  {/* Feature 1 */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/50">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Cites Page & Line
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        for Every Finding
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/50">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Cross-Bidder
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Contradiction Discovery
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/50">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        100% Officer-Controlled
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Final Determinations
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Layered Isometric UI Mockup */}
              <div className="relative lg:col-span-6 flex items-center justify-center pt-8 lg:pt-0">
                {/* Visual Canvas */}
                <div className="relative w-full max-w-[580px]">
                  {/* Background Layer 1: Left Tilted Document ("Tender Docc") */}
                  <div className="absolute -left-6 -top-6 w-[230px] rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800 p-4 shadow-xl -rotate-12 transform-gpu transition-all duration-300 hover:-rotate-8 pointer-events-none opacity-85 z-0">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Tender Docc
                      </span>
                      <div className="h-1.5 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2 w-full rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-2 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-2 w-5/6 rounded bg-amber-100 dark:bg-amber-950/60" />
                      <div className="h-2 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>

                  {/* Background Layer 2: Right Tilted Matrix ("Comparative Analysis") */}
                  <div className="absolute -right-4 -top-3 w-[260px] rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800 p-4 shadow-xl rotate-12 transform-gpu transition-all duration-300 hover:rotate-6 pointer-events-none opacity-85 z-0">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Comparative Analysis
                      </span>
                      <div className="h-1.5 w-8 rounded-full bg-blue-200 dark:bg-blue-800" />
                    </div>
                    <div className="space-y-2 text-[9px]">
                      <div className="grid grid-cols-4 gap-1 items-center py-1 border-b border-slate-50 dark:border-slate-800">
                        <div className="h-1.5 rounded bg-slate-200 dark:bg-slate-700 col-span-1" />
                        <span className="h-2.5 rounded bg-emerald-100 text-emerald-700 px-1 flex items-center justify-center font-medium">
                          OK
                        </span>
                        <span className="h-2.5 rounded bg-amber-100 text-amber-700 px-1 flex items-center justify-center font-medium">
                          DEV
                        </span>
                        <span className="h-2.5 rounded bg-emerald-100 text-emerald-700 px-1 flex items-center justify-center font-medium">
                          OK
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 items-center py-1 border-b border-slate-50 dark:border-slate-800">
                        <div className="h-1.5 rounded bg-slate-200 dark:bg-slate-700 col-span-1" />
                        <span className="h-2.5 rounded bg-emerald-100 text-emerald-700 px-1 flex items-center justify-center font-medium">
                          OK
                        </span>
                        <span className="h-2.5 rounded bg-red-100 text-red-700 px-1 flex items-center justify-center font-medium">
                          FAIL
                        </span>
                        <span className="h-2.5 rounded bg-emerald-100 text-emerald-700 px-1 flex items-center justify-center font-medium">
                          OK
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 items-center py-1">
                        <div className="h-1.5 rounded bg-slate-200 dark:bg-slate-700 col-span-1" />
                        <span className="h-2.5 rounded bg-emerald-100 text-emerald-700 px-1 flex items-center justify-center font-medium">
                          OK
                        </span>
                        <span className="h-2.5 rounded bg-emerald-100 text-emerald-700 px-1 flex items-center justify-center font-medium">
                          OK
                        </span>
                        <span className="h-2.5 rounded bg-blue-100 text-blue-700 px-1 flex items-center justify-center font-medium">
                          REV
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Foreground Layer: Main BidGuard AI Dashboard Window */}
                  <div className="relative z-10 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
                    {/* Top Window Header */}
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white shadow-xs">
                        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white" strokeWidth="2">
                          <path
                            d="M12 2.5C7.5 4.5 3.5 3.5 3.5 3.5C3.5 13.5 7.5 19.5 12 21.5C16.5 19.5 20.5 13.5 20.5 3.5C20.5 3.5 16.5 4.5 12 2.5Z"
                            fill="currentColor"
                            fillOpacity="0.2"
                            stroke="currentColor"
                          />
                          <path d="M12 7L13.2 10.8L17 12L13.2 13.2L12 17L10.8 13.2L7 12L10.8 10.8L12 7Z" fill="white" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                        BidGuard <span className="text-blue-600 dark:text-blue-400">AI</span>
                      </span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                      </div>
                    </div>

                    {/* 3-Column Workspace Interior */}
                    <div className="grid grid-cols-12 gap-3 text-left">
                      {/* Left Navigation Tabs */}
                      <div className="col-span-3 space-y-1.5 border-r border-slate-100 dark:border-slate-800 pr-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-2 py-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">Tender Analysis</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="truncate">Compliance Check</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="truncate">Contradictions</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                          <History className="h-3 w-3" />
                          <span className="truncate">Audit Trail</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                          <Workflow className="h-3 w-3" />
                          <span className="truncate">Reports</span>
                        </div>
                      </div>

                      {/* Center Document Viewer & Callout */}
                      <div className="col-span-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            Tender Document
                          </span>
                          <span className="text-[9px] text-slate-400">Page 18 / 142</span>
                        </div>

                        {/* Document Mock Paper */}
                        <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 space-y-2">
                          <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
                          <div className="h-1.5 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                          {/* Yellow Highlight Clause */}
                          <div className="rounded bg-amber-100/90 dark:bg-amber-950/70 px-1 py-0.5 border-l-2 border-amber-500">
                            <div className="h-1.5 w-full rounded bg-amber-300/80 dark:bg-amber-700" />
                          </div>
                          <div className="h-1.5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                          {/* Red Highlight Clause */}
                          <div className="rounded bg-red-100/90 dark:bg-red-950/70 px-1 py-0.5 border-l-2 border-red-500">
                            <div className="h-1.5 w-5/6 rounded bg-red-300/80 dark:bg-red-700" />
                          </div>
                          <div className="h-1.5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>

                        {/* Speech Bubble / Evidence Callout */}
                        <div className="relative rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/50 p-2.5 shadow-sm">
                          <div className="flex items-start gap-1.5">
                            <span className="text-base font-serif text-blue-600 dark:text-blue-400 leading-none">
                              “
                            </span>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-snug">
                                Clause 4.2 conflicts with Clause 7.1 across two bidders.
                              </p>
                              <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span>View evidence</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Findings Pane */}
                      <div className="col-span-4 space-y-2 border-l border-slate-100 dark:border-slate-800 pl-2">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">
                          Findings
                        </span>

                        {/* Finding 1: Yellow Warning */}
                        <div className="rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30 p-2 flex items-start gap-2">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white mt-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              Non-compliant Clause
                            </p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">
                              Page 12 · Section 4.2
                            </p>
                          </div>
                        </div>

                        {/* Finding 2: Red Contradiction */}
                        <div className="rounded-lg border border-red-200/80 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/30 p-2 flex items-start gap-2">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-600 text-white mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              Contradiction Found
                            </p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">
                              Page 18 · Section 7.1
                            </p>
                          </div>
                        </div>

                        {/* Finding 3: Green Compliant */}
                        <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-2 flex items-start gap-2">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white mt-0.5">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              Compliant
                            </p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">
                              Page 22 · Section 9.3
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3D Pedestal with Glowing Blue Shield & "Verified" Badge */}
                  <div className="absolute -bottom-8 -right-8 z-30 flex flex-col items-center">
                    {/* Floating "Verified ✓" Badge */}
                    <div className="mb-2 self-end mr-4 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-md border border-slate-100 dark:border-slate-700 animate-bounce [animation-duration:3s]">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Verified</span>
                    </div>

                    {/* Pedestal Container */}
                    <div className="relative flex items-center justify-center">
                      {/* Orbital Ring Glow */}
                      <div className="absolute -inset-4 rounded-full border border-blue-400/40 blur-[1px] animate-pulse [animation-duration:4s]" />
                      <div className="absolute h-16 w-32 rounded-[50%] bg-blue-500/20 blur-xl" />

                      {/* 3D Shield */}
                      <div className="relative z-10 flex h-20 w-20 items-center justify-center drop-shadow-[0_12px_24px_rgba(37,99,235,0.4)] transition-transform hover:scale-105 duration-300">
                        {/* 3D Glossy Blue Shield Graphic */}
                        <svg viewBox="0 0 100 110" className="h-20 w-20" fill="none">
                          <defs>
                            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#60a5fa" />
                              <stop offset="40%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#1e3a8a" />
                            </linearGradient>
                            <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#93c5fd" />
                              <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>

                          {/* Outer Shield with lighting */}
                          <path
                            d="M50 10 C 25 22 10 18 10 18 C 10 70 30 95 50 105 C 70 95 90 70 90 18 C 90 18 75 22 50 10 Z"
                            fill="url(#shieldGrad)"
                            stroke="url(#shieldBorder)"
                            strokeWidth="3.5"
                          />

                          {/* Inner Shield Bevel / Sheen */}
                          <path
                            d="M50 16 C 30 26 18 22 18 22 C 18 66 34 88 50 97 C 50 16 50 16 50 16 Z"
                            fill="white"
                            fillOpacity="0.18"
                          />

                          {/* Radiant White 4-Point Star in Center */}
                          <path
                            d="M50 35 L 53.5 47.5 L 66 51 L 53.5 54.5 L 50 67 L 46.5 54.5 L 34 51 L 46.5 47.5 Z"
                            fill="white"
                            filter="url(#glow)"
                          />
                        </svg>
                      </div>

                      {/* Pedestal Base Platform */}
                      <div className="absolute -bottom-5 h-8 w-36 rounded-[50%] bg-gradient-to-b from-blue-100 via-slate-200 to-blue-200/80 dark:from-slate-700 dark:via-slate-850 dark:to-slate-900 border border-blue-300/60 dark:border-slate-600 shadow-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats & Trust Banner */}
            <div className="mt-16 sm:mt-20 w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm p-5 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800">
                {/* Stat 1: Trusted By */}
                <div className="flex items-center gap-3 pt-2 md:pt-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/70 dark:border-blue-900/40">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Trusted by
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Government Institutions
                    </p>
                  </div>
                </div>

                {/* Stat 2: Active Tenders */}
                <div className="pt-2 md:pt-0 md:pl-6">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {tenders.length > 0 ? `${tenders.length} Active` : '100%'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tenders.length > 0 ? 'Tenders Configured' : 'Audit Ready'}
                  </p>
                </div>

                {/* Stat 3: Faster Verification */}
                <div className="pt-4 md:pt-0 md:pl-6">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {health ? 'API Online' : 'Faster'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {health ? 'Deterministic Engine Active' : 'Compliance Verification'}
                  </p>
                </div>

                {/* Stat 4: More Accurate */}
                <div className="pt-4 md:pt-0 md:pl-6">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    More Accurate
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    100% Citation Grounded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section
          id="how-it-works"
          className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="neutral" className="mb-3 px-3 py-1 text-xs">
                Operational Pipeline
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                How BidGuard AI Works
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                A deterministic, verifiable progression from unstructured tender notices to officer intelligence.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-6 text-center hover:border-blue-300 dark:hover:border-blue-800 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-lg mb-4 shadow-xs">
                  01
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Tender Ingestion
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upload RFP, BoQ, and Corrigenda with high-precision layout preservation and OCR parsing.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-6 text-center hover:border-blue-300 dark:hover:border-blue-800 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-lg mb-4 shadow-xs">
                  02
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Requirements
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI extracts mandatory criteria, technical specs, financial thresholds, and certifications.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-6 text-center hover:border-blue-300 dark:hover:border-blue-800 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-lg mb-4 shadow-xs">
                  03
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Evidence Mapping
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bidder submissions are matched against required clauses with snippet-level anchors.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col items-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-6 text-center hover:border-blue-300 dark:hover:border-blue-800 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-lg mb-4 shadow-xs">
                  04
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Rule Verification
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Automated checks detect missing documents, expired certificates, and cross-clause discrepancies.
                </p>
              </div>

              {/* Step 5 */}
              <div className="relative flex flex-col items-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-6 text-center hover:border-emerald-300 dark:hover:border-emerald-800 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-lg mb-4 shadow-xs">
                  05
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Compliance Intel
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Officer receives explainable dossiers, contradiction alerts, and audit recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES SECTION */}
        <section
          id="capabilities"
          className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="neutral" className="mb-3 px-3 py-1 text-xs">
                System Architecture
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Core Capabilities
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                Engineered for strict accountability, regulatory compliance, and rapid evaluation.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mb-3 shadow-xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle>Tender Intelligence</CardTitle>
                  <CardDescription>
                    Automated parsing of multi-hundred-page RFP documents, extraction of BoQ parameters, and clause breakdown.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                  Includes Corrigenda change tracking and clause hierarchy construction.
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mb-3 shadow-xs">
                    <SearchCheck className="h-5 w-5" />
                  </div>
                  <CardTitle>Evidence Verification</CardTitle>
                  <CardDescription>
                    Bidder claims are paired with exact text, table, or stamp evidence extracted from submitted technical bids.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                  Every compliance status points directly to page, paragraph, and line references.
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-3 shadow-xs">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <CardTitle>Compliance Rules</CardTitle>
                  <CardDescription>
                    Deterministic evaluation engine executes mandatory GeM General Financial Rules (GFR) and tender-specific constraints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                  Rules evaluate turnover thresholds, EMD exemptions, and OEM authorizations.
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 mb-3 shadow-xs">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <CardTitle>Contradiction Detection</CardTitle>
                  <CardDescription>
                    Surfaces discrepancies within a single bidder's packet or across competing bids (e.g. conflicting dates, altered certificates).
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                  Flags high-risk anomalies for immediate officer investigation.
                </CardContent>
              </Card>

              {/* Card 5 */}
              <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 mb-3 shadow-xs">
                    <Scale className="h-5 w-5" />
                  </div>
                  <CardTitle>Explainable AI</CardTitle>
                  <CardDescription>
                    No black-box answers. Natural language rationales accompany every recommendation, detailing exact reasoning and citations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                  Auditable and defendable during post-procurement inquiries.
                </CardContent>
              </Card>

              {/* Card 6 */}
              <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mb-3 shadow-xs">
                    <History className="h-5 w-5" />
                  </div>
                  <CardTitle>Audit Trail</CardTitle>
                  <CardDescription>
                    Tamper-evident chronological record of all document accesses, rule executions, officer reviews, and override comments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                  Exportable formal evaluation report ready for committee submission.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* GOVERNANCE & TRUST SECTION */}
        <section id="trust" className="bg-slate-100/70 dark:bg-slate-900 py-20 text-slate-900 dark:text-white relative overflow-hidden border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-slate-700 bg-emerald-50 dark:bg-slate-800/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-xs">
                <Shield className="h-4 w-4" />
                Fundamental Governance Principle
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
                AI assists. Rules verify. Officer decides.
              </h2>

              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                BidGuard AI is strictly engineered as a decision-support and audit intelligence system.
                The platform will <strong className="text-slate-900 dark:text-white font-semibold">NEVER</strong> autonomously
                make a final qualification or disqualification decision.
              </p>

              <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 backdrop-blur-md p-6 sm:p-8 text-left shadow-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                  Procurement Officer Primacy
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  In accordance with public procurement guidelines and GeM operational protocols,
                  every AI finding is presented with direct source snippets. The designated
                  Procurement Officer retains sole constitutional and administrative authority to
                  accept, reject, or request clarification on any bid item.
                </p>
              </div>

              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href="/dashboard">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]">
                    <span>Access Officer Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
