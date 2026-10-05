'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative bg-white dark:bg-[#0A0F1D] pt-4 pb-12 lg:pt-6 lg:pb-16 overflow-hidden border-b border-[#D9E3EC] dark:border-slate-800 transition-colors duration-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082B4C06_1px,transparent_1px),linear-gradient(to_bottom,#082B4C06_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[62%] pointer-events-none select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/parliament_hero_bg.png"
            alt="Government of India Parliament Building & Rashtrapati Bhavan"
            fill
            className="object-cover object-right-bottom opacity-100 dark:opacity-40 transition-opacity duration-200"
            priority
            sizes="(max-width: 1024px) 100vw, 62vw"
          />

          {/* Left blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 via-25% to-transparent dark:from-[#0A0F1D] dark:via-[#0A0F1D]/75 dark:via-25% dark:to-transparent" />

          {/* Bottom blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent via-20% to-transparent dark:from-[#0A0F1D] dark:via-transparent dark:via-20% dark:to-transparent" />

          {/* Top blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent via-15% to-transparent dark:from-[#0A0F1D]/70 dark:via-transparent dark:via-15% dark:to-transparent" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8 items-center min-h-[440px] lg:min-h-[480px]">

          {/* ========================================================================= */}
          {/* Left Column: Authoritative Government Portal Copy */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-0 pb-6 lg:py-2">
            {/* AI Active status pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-slate-900/90 px-3 py-1.5 text-xs border border-slate-200/90 dark:border-slate-800 mb-4 shadow-xs backdrop-blur-md">
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
                <style>{`
                  @keyframes bs-blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.08)}}
                  @keyframes bs-pupil-l{0%,20%{transform:translateX(0)}25%,50%{transform:translateX(-2px)}55%,80%{transform:translateX(2px)}85%,100%{transform:translateX(0)}}
                  @keyframes bs-pupil-r{0%,20%{transform:translateX(0)}25%,50%{transform:translateX(-2px)}55%,80%{transform:translateX(2px)}85%,100%{transform:translateX(0)}}
                  .bs-eye{transform-origin:center;animation:bs-blink 3s ease-in-out infinite}
                  .bs-p-l{transform-origin:8px 7px;animation:bs-pupil-l 4s ease-in-out infinite}
                  .bs-p-r{transform-origin:20px 7px;animation:bs-pupil-r 4s ease-in-out infinite}
                `}</style>
                <g className="bs-eye" style={{ transformOrigin: '8px 7px' }}>
                  <ellipse cx="8" cy="7" rx="6" ry="5" fill="white" stroke="#1a6aef" strokeWidth="1" />
                </g>
                <ellipse cx="8" cy="7" rx="2.5" ry="2.5" fill="#1a6aef" className="bs-p-l" />
                <g className="bs-eye" style={{ transformOrigin: '20px 7px' }}>
                  <ellipse cx="20" cy="7" rx="6" ry="5" fill="white" stroke="#1a6aef" strokeWidth="1" />
                </g>
                <ellipse cx="20" cy="7" rx="2.5" ry="2.5" fill="#1a6aef" className="bs-p-r" />
              </svg>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wide leading-none whitespace-nowrap">
                GOVERNMENT E-MARKETPLACE (GEM)
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-black tracking-tight leading-snug font-serif flex flex-col gap-1 sm:gap-1.5">
              <span className="notranslate block leading-[1.2]" translate="no">
                <span className="text-[#0A2E5C] dark:text-white">{t('hero.titleBrandBid', 'BidSure')}</span>
              </span>
              <span className="text-[#1464B4] dark:text-[#38BDF8] block leading-[1.2] text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px]">{t('hero.titleAccent', 'AI Powered Compliance for GeM')}</span>
              <span className="text-[#082B4C] dark:text-white block leading-[1.2] text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px]">{t('hero.titleEnd', '& Intelligence Platform')}</span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-5 text-base sm:text-lg text-[#52677A] dark:text-slate-200 leading-relaxed max-w-xl font-normal">
              {t('hero.description', 'For transparent, efficient and trustworthy public procurement under')} <span className="notranslate" translate="no">GeM</span> {t('hero.descriptionAnd', 'and')} <span className="notranslate" translate="no">General Financial Rules (GFR) 2017</span>.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login">
                <button className="inline-flex items-center gap-3 rounded-full bg-[#1464B4] hover:bg-[#082B4C] dark:hover:bg-blue-600 active:bg-[#123B63] text-white font-semibold px-7 py-3.5 text-sm shadow-md shadow-blue-900/15 dark:shadow-blue-950/40 transition-all hover:scale-[1.01] group">
                  <span>{t('auth.getStarted', 'Get Started')}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <a href="#about">
                <button className="inline-flex items-center justify-center rounded-full border border-[#D9E3EC] dark:border-slate-600 hover:border-[#1464B4] dark:hover:border-blue-400 bg-white dark:bg-[#162238] hover:bg-[#F3F8FC] dark:hover:bg-[#1C2C47] text-[#17324D] dark:text-slate-100 font-semibold px-7 py-3.5 text-sm shadow-xs transition-all">
                  <span>{t('hero.learnMore', 'Learn More')}</span>
                </button>
              </a>
            </div>

            {/* Subtle Trust Line */}
            <div className="mt-8 pt-6 border-t border-[#D9E3EC]/70 dark:border-slate-800 w-full flex items-center gap-2 text-xs text-[#52677A] dark:text-slate-400 font-medium">
              <ShieldCheck className="h-4 w-4 text-[#238B57] dark:text-emerald-400 shrink-0" />
              <span>{t('hero.trustPillars', 'AI-Assisted • Evidence-Backed • Officer-Controlled')}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Right Column: Top Motto & Natural Visual Area (Matching Reference) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between items-end h-full min-h-[220px] lg:min-h-[440px]">
            {/* Top-Right Official Motto Block (clean text on open sky as in reference image) */}
            <div className="text-right pt-2 pr-1 select-none">
              <p className="text-base sm:text-lg font-serif italic font-medium text-[#123B63] dark:text-blue-300 leading-tight">
                Transparent Procurement
              </p>
              <p className="text-base sm:text-lg font-serif italic font-medium text-[#082B4C] dark:text-white leading-tight mt-1">
                Stronger Governance
              </p>
              <p className="text-base sm:text-lg font-serif italic font-bold text-[#1464B4] dark:text-[#38BDF8] leading-tight mt-1">
                A Developed India
              </p>
              {/* Indian National Tricolor Accent Line */}
              <div className="mt-2.5 ml-auto flex h-1.5 w-28 rounded-full overflow-hidden shadow-xs border border-slate-200/70 dark:border-slate-700" role="img" aria-label="Indian Tricolor accent">
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
