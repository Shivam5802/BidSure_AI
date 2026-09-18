'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, FileText, CheckCircle2, ChevronRight, Lock, Award } from 'lucide-react';

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<'flow' | 'preview'>('flow');

  return (
    <section className="relative bg-white pt-8 pb-16 lg:pt-12 lg:pb-20 overflow-hidden border-b border-[#D9E3EC]">
      {/* Background subtle watermark grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082B4C08_1px,transparent_1px),linear-gradient(to_bottom,#082B4C08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* ========================================================================= */}
          {/* Left Column: Authoritative Government Portal Copy */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Government Subtitle Tag */}
            <div className="inline-flex items-center gap-2 rounded-md bg-[#F3F8FC] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#123B63] border border-[#D9E3EC] mb-4">
              <span className="h-2 w-2 rounded-full bg-[#1464B4]" />
              GOVERNMENT E-MARKETPLACE (GeM)
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#082B4C] tracking-tight leading-[1.18] font-serif">
              BidSure<br />
              <span className="text-[#1464B4]">AI-Powered Bid Compliance</span><br />
              & Intelligence Platform
            </h1>

            {/* Supporting Text */}
            <p className="mt-5 text-base sm:text-lg text-[#52677A] leading-relaxed max-w-xl font-normal">
              For transparent, efficient and trustworthy public procurement under GeM and General Financial Rules (GFR) 2017.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login">
                <button className="inline-flex items-center gap-3 rounded-full bg-[#1464B4] hover:bg-[#082B4C] active:bg-[#123B63] text-white font-semibold px-7 py-3.5 text-sm shadow-md shadow-blue-900/20 transition-all hover:scale-[1.01] group">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <a href="#about">
                <button className="inline-flex items-center justify-center rounded-full border border-[#D9E3EC] hover:border-[#1464B4] bg-white hover:bg-[#F3F8FC] text-[#17324D] font-semibold px-7 py-3.5 text-sm shadow-xs transition-all">
                  <span>Learn More</span>
                </button>
              </a>
            </div>

            {/* Subtle Trust Line */}
            <div className="mt-8 pt-6 border-t border-[#D9E3EC]/70 w-full flex items-center gap-2 text-xs text-[#52677A] font-medium">
              <ShieldCheck className="h-4 w-4 text-[#238B57] shrink-0" />
              <span>AI-Assisted • Evidence-Backed • Officer-Controlled</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Right Column: Institutional Government Visual Composition */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-[#D9E3EC] bg-[#082B4C]">
              
              {/* Architecture Silhouette / Rashtrapati Bhavan Backdrop */}
              <div className="relative h-[360px] sm:h-[420px] w-full">
                <Image
                  src="/images/parliament_hero_bg.png"
                  alt="Government of India Ministry of Finance & Parliament Building"
                  fill
                  className="object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105"
                  priority
                />
                {/* Gradient Overlay for high institutional contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#082B4C] via-[#082B4C]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#082B4C]/50 via-transparent to-[#082B4C]/30" />
              </div>

              {/* Top-Right Official Motto Block (matches reference image) */}
              <div className="absolute top-5 right-5 max-w-xs text-right bg-[#082B4C]/85 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 shadow-lg">
                <p className="text-xs sm:text-sm font-serif italic font-medium text-white leading-tight">
                  Transparent Procurement
                </p>
                <p className="text-xs sm:text-sm font-serif italic font-medium text-slate-200 leading-tight mt-0.5">
                  Stronger Governance
                </p>
                <p className="text-xs sm:text-sm font-serif italic font-bold text-amber-300 leading-tight mt-0.5">
                  A Developed India
                </p>
                {/* Indian National Tricolor Accent Line */}
                <div className="mt-2 ml-auto flex h-1.5 w-24 rounded-full overflow-hidden shadow-xs" role="img" aria-label="Indian Tricolor accent">
                  <div className="w-1/3 bg-[#FF9933]" title="Saffron" />
                  <div className="w-1/3 bg-white" title="White" />
                  <div className="w-1/3 bg-[#138808]" title="Green" />
                </div>
              </div>

              {/* Bottom Floating Process Card Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-[#D9E3EC] shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-[#082B4C]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-[#238B57] animate-pulse" />
                    <span>Evidence-Linked Pipeline</span>
                  </div>
                  <span className="text-[11px] text-[#52677A] font-normal">GFR Rule 144 & 149</span>
                </div>

                {/* Micro Pipeline Indicator: Tender → Documents → Evidence → Rules → Verified Findings */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[11px]">
                  <div className="bg-[#F3F8FC] border border-[#D9E3EC] rounded p-1.5">
                    <p className="font-bold text-[#082B4C]">Tender</p>
                    <p className="text-[9px] text-[#52677A] truncate">RFP Terms</p>
                  </div>
                  <div className="bg-[#F3F8FC] border border-[#D9E3EC] rounded p-1.5">
                    <p className="font-bold text-[#082B4C]">Docs</p>
                    <p className="text-[9px] text-[#52677A] truncate">Bidder CA</p>
                  </div>
                  <div className="bg-[#F3F8FC] border border-[#D9E3EC] rounded p-1.5">
                    <p className="font-bold text-[#1464B4]">Evidence</p>
                    <p className="text-[9px] text-[#52677A] truncate">Page Citations</p>
                  </div>
                  <div className="bg-[#F3F8FC] border border-[#D9E3EC] rounded p-1.5">
                    <p className="font-bold text-[#082B4C]">Rules</p>
                    <p className="text-[9px] text-[#52677A] truncate">Deterministic</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5">
                    <p className="font-bold text-[#238B57]">Verified</p>
                    <p className="text-[9px] text-emerald-700 truncate">Officer Decides</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
