import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 lg:py-24 bg-[#082B4C] text-white relative overflow-hidden">
      {/* Subtle institutional geometric patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#1464B415_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/80 px-4 py-1.5 text-xs font-semibold text-blue-200 border border-blue-800/80 mb-6">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>GFR 2017 & GeM Aligned Workflow</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-white max-w-3xl mx-auto leading-tight">
          Transform Public Procurement with Evidence, Intelligence & Accountability.
        </h2>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Bring structured AI assistance, deterministic compliance verification and transparent auditability into your procurement workflow.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <button className="inline-flex items-center gap-3 rounded-full bg-[#1464B4] hover:bg-white hover:text-[#082B4C] active:bg-blue-600 text-white font-bold px-8 py-4 text-sm shadow-xl transition-all duration-200 group">
              <span>Start New Tender</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <a href="#how-it-works">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-600 hover:border-slate-400 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 text-sm backdrop-blur-sm transition-all">
              <span>Explore BidSure</span>
            </button>
          </a>
        </div>

        {/* Reassurance text */}
        <p className="mt-6 text-xs text-slate-400">
          Strict role isolation • Officer final approval • In-country data sovereignty
        </p>

      </div>
    </section>
  );
}
