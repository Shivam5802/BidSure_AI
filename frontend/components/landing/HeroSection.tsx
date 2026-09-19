'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-white pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden border-b border-[#D9E3EC]">
      {/* Background subtle watermark grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082B4C06_1px,transparent_1px),linear-gradient(to_bottom,#082B4C06_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Blended Rashtrapati Bhavan architecture seamlessly merging into the background */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[62%] pointer-events-none select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/parliament_hero_bg.png"
            alt="Government of India Parliament Building & Rashtrapati Bhavan"
            fill
            className="object-cover object-bottom lg:object-right-bottom"
            priority
          />
          {/* Seamless multi-directional gradient masks so there is NO square image or hard borders */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 via-25% md:via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent via-20% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent via-15% to-transparent" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8 items-center min-h-[440px] lg:min-h-[480px]">
          
          {/* ========================================================================= */}
          {/* Left Column: Authoritative Government Portal Copy */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-2 pb-6 lg:py-6">
            {/* Government Subtitle Tag */}
            <div className="inline-flex items-center gap-2 rounded-md bg-[#F3F8FC] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#123B63] border border-[#D9E3EC] mb-4 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#1464B4]" />
              GOVERNMENT E-MARKETPLACE (GeM)
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#082B4C] tracking-tight leading-[1.16] font-serif">
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
                <button className="inline-flex items-center gap-3 rounded-full bg-[#1464B4] hover:bg-[#082B4C] active:bg-[#123B63] text-white font-semibold px-7 py-3.5 text-sm shadow-md shadow-blue-900/15 transition-all hover:scale-[1.01] group">
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
          {/* Right Column: Top Motto & Natural Visual Area (Matching Reference) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between items-end h-full min-h-[220px] lg:min-h-[440px]">
            {/* Top-Right Official Motto Block (clean text on open sky as in reference image) */}
            <div className="text-right pt-2 pr-1 select-none">
              <p className="text-base sm:text-lg font-serif italic font-medium text-[#123B63] leading-tight">
                Transparent Procurement
              </p>
              <p className="text-base sm:text-lg font-serif italic font-medium text-[#082B4C] leading-tight mt-1">
                Stronger Governance
              </p>
              <p className="text-base sm:text-lg font-serif italic font-bold text-[#1464B4] leading-tight mt-1">
                A Developed India
              </p>
              {/* Indian National Tricolor Accent Line */}
              <div className="mt-2.5 ml-auto flex h-1.5 w-28 rounded-full overflow-hidden shadow-xs border border-slate-200/70" role="img" aria-label="Indian Tricolor accent">
                <div className="w-1/3 bg-[#FF9933]" title="Saffron" />
                <div className="w-1/3 bg-white" title="White" />
                <div className="w-1/3 bg-[#138808]" title="Green" />
              </div>
            </div>

            {/* Visual breathing space allowing the blended architecture to be clearly visible */}
            <div className="w-full" />
          </div>

        </div>
      </div>
    </section>
  );
}
