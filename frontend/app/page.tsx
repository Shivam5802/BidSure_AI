'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Brain,
  FileText,
  Building,
  Clock,
  Search,
  Eye,
  ShieldCheck,
  Cpu,
  FileCheck,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { tenderApi } from '@/features/tenders/api';
import { api } from '@/lib/api/client';
import { Tender } from '@/features/tenders/types';

export default function LandingPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        const tenderList = await tenderApi.listTenders();
        if (isMounted && tenderList) {
          setTenders(tenderList);
        }
      } catch {}
    }
    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div id="main-content" className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900 font-sans antialiased">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative bg-white pt-10 pb-16 lg:pt-14 lg:pb-20 overflow-hidden border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
              
              {/* Left Copy Column */}
              <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
                {/* Government Subtitle Tag */}
                <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-500 uppercase mb-3">
                  GOVERNMENT E-MARKETPLACE (GeM)
                </span>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f2942] tracking-tight leading-[1.15] font-serif">
                  BidSure<br />
                  <span className="text-[#1e40af]">AI-Powered Bid Compliance</span><br />
                  & Intelligence Platform
                </h1>

                {/* Description */}
                <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                  For transparent, efficient and trustworthy public procurement under GeM and GFR 2017.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/login">
                    <button className="inline-flex items-center gap-3 rounded-full bg-[#1e40af] hover:bg-[#1d4ed8] active:bg-[#1e3a8a] text-white font-semibold px-7 py-3.5 text-sm shadow-md shadow-blue-900/20 transition-all hover:scale-[1.01]">
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>

                  <a href="#about">
                    <button className="inline-flex items-center justify-center rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3.5 text-sm shadow-xs transition-all">
                      <span>Learn More</span>
                    </button>
                  </a>
                </div>
              </div>

              {/* Right Side Visual Hero Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 group">
                  {/* Parliament Image Background */}
                  <div className="relative h-[340px] sm:h-[400px] w-full">
                    <Image
                      src="/images/parliament_hero_bg.png"
                      alt="Government of India Parliament Building"
                      fill
                      className="object-cover object-center"
                      priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
                  </div>

                  {/* Top-Right Motto Text Overlay */}
                  <div className="absolute top-6 right-6 max-w-xs text-right bg-slate-950/60 backdrop-blur-md p-4 rounded-xl border border-white/20">
                    <p className="text-sm font-serif italic font-medium text-white leading-tight">
                      Transparent Procurement
                    </p>
                    <p className="text-sm font-serif italic font-medium text-white leading-tight mt-0.5">
                      Stronger Governance
                    </p>
                    <p className="text-sm font-serif italic font-bold text-amber-300 leading-tight mt-0.5">
                      A Developed India
                    </p>
                    {/* Tri-Color Accent Line */}
                    <div className="mt-2.5 ml-auto flex h-1.5 w-24 rounded-full overflow-hidden">
                      <div className="w-1/3 bg-[#FF9933]" />
                      <div className="w-1/3 bg-white" />
                      <div className="w-1/3 bg-[#138808]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 4 FEATURE PILLS ROW */}
            {/* ========================================================================= */}
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature Pill 1 */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-blue-200 hover:shadow-md transition">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1e40af]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Secure & Compliant</h4>
                  <p className="text-xs text-slate-500 font-medium">GeM | GFR 2017</p>
                </div>
              </div>

              {/* Feature Pill 2 */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-blue-200 hover:shadow-md transition">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1e40af]">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI + Rule Engine</h4>
                  <p className="text-xs text-slate-500 font-medium">Evidence Backed</p>
                </div>
              </div>

              {/* Feature Pill 3 */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-blue-200 hover:shadow-md transition">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1e40af]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Complete Audit Trail</h4>
                  <p className="text-xs text-slate-500 font-medium">100% Traceability</p>
                </div>
              </div>

              {/* Feature Pill 4 */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-blue-200 hover:shadow-md transition">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1e40af]">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">For Government</h4>
                  <p className="text-xs text-slate-500 font-medium">Better Decisions, Greater Impact</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. ABOUT BIDSURE SECTION */}
        {/* ========================================================================= */}
        <section id="about" className="py-16 lg:py-24 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Text & CTA */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1e40af] uppercase tracking-wider">
                    ABOUT BIDSURE
                  </span>
                  <div className="h-0.5 w-12 bg-blue-600 rounded-full" />
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f2942] tracking-tight font-serif leading-snug">
                  Smarter Procurement<br />for a Transparent Tomorrow
                </h2>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal pt-2">
                  BidSure is an AI-powered platform that helps government procurement officers analyze tenders, validate bidder documents, detect inconsistencies and make transparent, auditable decisions under GeM and GFR 2017.
                </p>

                <div className="pt-4">
                  <Link href="/login">
                    <button className="inline-flex items-center gap-3 rounded-lg bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold px-6 py-3 text-sm shadow-md transition">
                      <span>Know More</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Feature Items Card with Emblem Watermark */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-blue-50/40 p-6 sm:p-8 border border-blue-100 shadow-sm overflow-hidden">
                  
                  {/* Emblem Watermark graphic on right */}
                  <div className="absolute -right-4 -bottom-6 opacity-15 pointer-events-none w-56 h-72">
                    <Image
                      src="/images/indian_emblem.png"
                      alt="Indian Emblem Satyamev Jayate"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="space-y-6 relative z-10 max-w-lg">
                    {/* Item 1 */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1e40af]">
                        <Cpu className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">AI-Assisted Analysis</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                          Extracts key information and flags potential issues from complex documents.
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1e40af]">
                        <FileCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Rule-Based Verification</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                          Evaluates compliance using deterministic rules with 100% evidence citations.
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1e40af]">
                        <UserCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Human Oversight</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                          Final decision always rests with the procurement officer.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. WHY BIDSURE / KEY BENEFITS SECTION */}
        {/* ========================================================================= */}
        <section id="features" className="py-16 lg:py-24 bg-[#f8fafc] border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="flex flex-col items-start text-left mb-12">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1e40af] uppercase tracking-wider">
                  WHY BIDSURE
                </span>
                <div className="h-0.5 w-12 bg-blue-600 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f2942] tracking-tight font-serif mt-2">
                Key Benefits
              </h2>
            </div>

            {/* 5 Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              
              {/* Card 1: Faster Evaluation */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1e40af] mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Faster Evaluation</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal flex-1">
                  Reduce manual effort and save valuable time.
                </p>
              </div>

              {/* Card 2: Detect Inconsistencies */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1e40af] mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Detect Inconsistencies</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal flex-1">
                  Find cross-document contradictions and fraud with precision.
                </p>
              </div>

              {/* Card 3: Evidence-Based */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1e40af] mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Evidence-Based</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal flex-1">
                  Every decision is traceable to source documents with page-level citations.
                </p>
              </div>

              {/* Card 4: Complete Transparency */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1e40af] mb-4">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Complete Transparency</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal flex-1">
                  Generate detailed reports for CAG, CVC and tribunal appeals.
                </p>
              </div>

              {/* Card 5: Secure & Scalable */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1e40af] mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Secure & Scalable</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal flex-1">
                  Built for government with enterprise-grade security and compliance.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. IMPACT & TRUST METRICS BANNER */}
        {/* ========================================================================= */}
        <section id="trust" className="py-14 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Dark Blue Card with Parliament Backdrop */}
              <div className="lg:col-span-4 relative rounded-2xl bg-[#0b1b36] p-8 text-white flex flex-col justify-between overflow-hidden shadow-md">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <Image
                    src="/images/parliament_hero_bg.png"
                    alt="Parliament Background"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-bold font-serif leading-tight">
                    Trusted by Government for Better Procurement
                  </h3>
                  
                  {/* Tri-color Accent Bar */}
                  <div className="flex h-1.5 w-20 rounded-full overflow-hidden">
                    <div className="w-1/3 bg-[#FF9933]" />
                    <div className="w-1/3 bg-white" />
                    <div className="w-1/3 bg-[#138808]" />
                  </div>
                </div>
              </div>

              {/* Right 4 Metric Columns */}
              <div className="lg:col-span-8 bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/80 flex items-center">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  
                  {/* Metric 1 */}
                  <div className="pt-2 sm:pt-0 sm:px-4 space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-[#1e40af] font-serif">100%</p>
                    <p className="text-xs text-slate-600 font-semibold leading-snug">
                      Compliance with GeM & GFR 2017
                    </p>
                  </div>

                  {/* Metric 2 */}
                  <div className="pt-2 sm:pt-0 sm:px-4 space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-[#1e40af] font-serif">Faster</p>
                    <p className="text-xs text-slate-600 font-semibold leading-snug">
                      Tender Evaluation Process
                    </p>
                  </div>

                  {/* Metric 3 */}
                  <div className="pt-2 sm:pt-0 sm:px-4 space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-[#1e40af] font-serif">Higher</p>
                    <p className="text-xs text-slate-600 font-semibold leading-snug">
                      Transparency & Accountability
                    </p>
                  </div>

                  {/* Metric 4 */}
                  <div className="pt-2 sm:pt-0 sm:px-4 space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-[#1e40af] font-serif">Greater</p>
                    <p className="text-xs text-slate-600 font-semibold leading-snug">
                      Public Value & Reduced Risk
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
