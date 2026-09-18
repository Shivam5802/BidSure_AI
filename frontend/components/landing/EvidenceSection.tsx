'use client';

import React, { useState } from 'react';
import { FileText, ExternalLink, CheckCircle, AlertTriangle, ChevronRight, Eye, ShieldCheck } from 'lucide-react';

export function EvidenceSection() {
  const [selectedCitation, setSelectedCitation] = useState<'turnover' | 'ca'>('turnover');
  const [showInspector, setShowInspector] = useState(false);

  return (
    <section id="evidence" className="py-16 lg:py-24 bg-white border-b border-[#D9E3EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#1464B4] uppercase tracking-wider">
              EVIDENCE GROUNDING
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B4C] tracking-tight font-serif">
            Evidence-Backed Verification
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#52677A]">
            Every extracted finding and compliance check is anchored to exact source documents with verifiable page and paragraph citations.
          </p>
        </div>

        {/* Realistic Institutional Grounding Interactive Card */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-[#D9E3EC] bg-white shadow-sm overflow-hidden">
          
          {/* Card Top Header */}
          <div className="bg-[#082B4C] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-bold tracking-wide">
                Bidder Evaluation Case: M/s Bharat Infra Ltd
              </span>
            </div>
            <span className="text-xs font-medium text-slate-300 bg-white/10 px-2.5 py-1 rounded">
              Tender Ref: GEM/2026/B/894012
            </span>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            
            {/* Requirement Box */}
            <div className="bg-[#F3F8FC] p-4 rounded-xl border border-[#D9E3EC]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1464B4] uppercase tracking-wider">
                  Tender Requirement
                </span>
                <span className="text-xs font-semibold text-[#082B4C] bg-white px-2 py-0.5 rounded border border-[#D9E3EC]">
                  GFR Rule 173(v)
                </span>
              </div>
              <h3 className="text-base font-bold text-[#082B4C] mt-1">
                Minimum Annual Turnover: ₹50.00 Crores
              </h3>
              <p className="text-xs text-[#52677A] mt-1">
                Average annual turnover of the bidder during the last 3 financial years (FY 2022-23, 2023-24, 2024-25) must be certified by a practicing Chartered Accountant.
              </p>
            </div>

            {/* Citations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Evidence 1 */}
              <div
                onClick={() => { setSelectedCitation('turnover'); setShowInspector(true); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCitation === 'turnover'
                    ? 'border-[#1464B4] bg-blue-50/50 ring-1 ring-[#1464B4]/20 shadow-xs'
                    : 'border-[#D9E3EC] bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1464B4]" />
                    <span className="text-xs font-bold text-[#082B4C]">Evidence Document 1</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1464B4] bg-white border border-blue-200 px-2 py-0.5 rounded-full">
                    Page 12
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-[#17324D] mt-2">
                  Audited Financial Statement
                </h4>
                <p className="text-xs text-[#52677A] mt-1">
                  Schedule 14: Note on Revenue from Operations indicates average ₹54.20 Cr.
                </p>
                <div className="mt-3 text-xs font-semibold text-[#1464B4] flex items-center gap-1">
                  <span>Inspect Page 12 Citation</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Evidence 2 */}
              <div
                onClick={() => { setSelectedCitation('ca'); setShowInspector(true); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCitation === 'ca'
                    ? 'border-[#1464B4] bg-blue-50/50 ring-1 ring-[#1464B4]/20 shadow-xs'
                    : 'border-[#D9E3EC] bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1464B4]" />
                    <span className="text-xs font-bold text-[#082B4C]">Evidence Document 2</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1464B4] bg-white border border-blue-200 px-2 py-0.5 rounded-full">
                    Page 3
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-[#17324D] mt-2">
                  CA Certificate with UDIN
                </h4>
                <p className="text-xs text-[#52677A] mt-1">
                  UDIN: 24089721AAAA9812 mentions FY 2024-25 turnover as ₹51.80 Cr.
                </p>
                <div className="mt-3 text-xs font-semibold text-[#1464B4] flex items-center gap-1">
                  <span>Inspect Page 3 Citation</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>

            </div>

            {/* Finding Box */}
            <div className="bg-amber-50/70 border border-[#C98200]/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#C98200] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Finding: Document information requires officer review.
                  </h4>
                  <p className="text-xs text-amber-800/90 mt-0.5">
                    Variance of 4.4% noted between Schedule 14 (₹54.20 Cr) and UDIN Statement (₹51.80 Cr). Both exceed ₹50 Cr minimum.
                  </p>
                </div>
              </div>

              {/* Action Buttons requested in prompt */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowInspector(!showInspector)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Evidence</span>
                </button>
                <button
                  onClick={() => alert("Simulated: Opening original high-resolution PDF document.")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#D9E3EC] text-xs font-semibold text-[#17324D] hover:bg-slate-50 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Document</span>
                </button>
                <button
                  onClick={() => alert("Simulated: Officer review action dialog opened.")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1464B4] text-white text-xs font-semibold hover:bg-[#082B4C] transition"
                >
                  <span>Review Finding</span>
                </button>
              </div>
            </div>

            {/* Interactive Document Excerpt Viewer Modal/Drawer */}
            {showInspector && (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-700 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700 text-xs">
                  <span className="font-mono text-emerald-400">
                    PDF Viewer Excerpt — {selectedCitation === 'turnover' ? 'Audited Financial Statement.pdf (Page 12)' : 'CA_Certificate_UDIN.pdf (Page 3)'}
                  </span>
                  <button
                    onClick={() => setShowInspector(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded font-mono text-xs text-slate-300 leading-relaxed border-l-4 border-amber-400">
                  {selectedCitation === 'turnover' ? (
                    <>
                      <p className="text-slate-400">// Page 12, Schedule 14 - Operating Revenue</p>
                      <p className="text-amber-300 bg-amber-950/40 p-1 rounded mt-1 font-semibold">
                        &quot;Total turnover from IT & Infrastructure contracts for FY 2024-25 stood at INR 54,20,18,000 (Rupees Fifty Four Crores Twenty Lakhs Eighteen Thousand only).&quot;
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">BIDSURE HASH: #a8f09... VERIFIED AGAINST OCR RECOGNITION TENSOR</p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400">// Page 3, CA Certificate by M/s R.K. Associates (FRN 012948N)</p>
                      <p className="text-amber-300 bg-amber-950/40 p-1 rounded mt-1 font-semibold">
                        &quot;Certified that M/s Bharat Infra Ltd achieved Annual Turnover of INR 51.80 Cr in FY 2024-25 as per statutory tax audit returns.&quot;
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">UDIN VERIFIED VIA ICAI REPOSITORY: 24089721AAAA9812</p>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
