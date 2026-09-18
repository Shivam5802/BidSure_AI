import React from 'react';
import { UserCheck, ShieldCheck, Lock, FileSearch, Scale, FileKey2, ArrowRight } from 'lucide-react';

export function GovernanceSection() {
  const pillars = [
    {
      title: 'Human-in-the-Loop Decisions',
      desc: 'AI and rules act as analytical aides; only authorized government officers hold the authority to approve, disqualify, or award tenders.',
      icon: UserCheck,
    },
    {
      title: 'Tamper-Evident Audit Trail',
      desc: 'Every document read, rule triggered, and officer action is stamped with immutable timestamps and SHA-256 cryptographic digests.',
      icon: ShieldCheck,
    },
    {
      title: 'Role-Based Access Control',
      desc: 'Granular segregation of duties among Bid Creators, Evaluators, Financial Officers, and Independent Vigilance Observers.',
      icon: Lock,
    },
    {
      title: 'Evidence-Backed Findings',
      desc: 'Zero unsubstantiated claims. Every compliance flag links directly to source document pages, clauses, and certified certificates.',
      icon: FileSearch,
    },
    {
      title: 'Deterministic Compliance Rules',
      desc: 'Explicit evaluation criteria aligned with GFR 2017 Rules 144, 149, and GeM manual rules, preventing subjective bias.',
      icon: Scale,
    },
    {
      title: 'Secure Document Handling',
      desc: 'In-country encrypted storage adhering to Ministry of Electronics & IT (MeitY) guidelines and CERT-In security standards.',
      icon: FileKey2,
    },
  ];

  return (
    <section id="governance" className="py-20 lg:py-28 bg-[#082B4C] text-white relative overflow-hidden border-b border-[#123B63]">
      
      {/* Background subtle institutional geometric lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              INSTITUTIONAL GOVERNANCE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-white">
            Built for Accountability.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Public procurement requires unwavering integrity. BidSure enforces institutional oversight at every stage, upholding transparency for citizens, vendors, and audit oversight.
          </p>
        </div>

        {/* Central Core Principle Banner: AI Assists → Rules Verify → Officer Decides */}
        <div className="max-w-4xl mx-auto mb-16 bg-[#123B63]/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-400/30 shadow-2xl">
          <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-300 mb-5">
            The Fundamental Operating Standard of BidSure
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Step 1 */}
            <div className="bg-[#082B4C] rounded-xl p-5 border border-blue-400/20 text-center shadow-md">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Step 1</span>
              <h3 className="text-lg font-bold text-white mt-1">AI Assists</h3>
              <p className="text-xs text-slate-300 mt-2">
                Extracts facts, parses clauses, and indexes complex bidder filings without hallucination.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#082B4C] rounded-xl p-5 border border-blue-400/20 text-center shadow-md">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Step 2</span>
              <h3 className="text-lg font-bold text-white mt-1">Rules Verify</h3>
              <p className="text-xs text-slate-300 mt-2">
                Deterministic engines evaluate extracted facts strictly against GFR 2017 & tender specifications.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-[#1464B4] to-[#082B4C] rounded-xl p-5 border border-amber-300/40 text-center shadow-xl">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Final Authority</span>
              <h3 className="text-lg font-bold text-white mt-1">Officer Decides</h3>
              <p className="text-xs text-slate-100 mt-2 font-medium">
                The procurement officer scrutinizes evidence, confirms compliance, and exercises sole decision-making authority.
              </p>
            </div>

          </div>
        </div>

        {/* 6 Governance Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#123B63]/40 p-6 border border-blue-400/20 hover:border-blue-400/50 hover:bg-[#123B63]/70 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-amber-300 mb-4 border border-white/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 font-serif">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
