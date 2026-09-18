'use client';

import React, { useState } from 'react';
import { UploadCloud, Cpu, Link2, FileCheck, UserCheck, Award, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const steps = [
    {
      num: '01',
      title: 'Tender',
      subtitle: 'Upload RFP & configurations',
      icon: UploadCloud,
      detail: 'Upload RFP documents, bid conditions, turnover requirements, and technical specifications directly from GeM.',
      meta: 'GeM Bid Integration',
    },
    {
      num: '02',
      title: 'AI Blueprint',
      subtitle: 'Extract key facts & requirements',
      icon: Cpu,
      detail: 'Intelligent extraction structures eligibility clauses, EMD exemption rules, and bidder submission schedules into verifiable criteria.',
      meta: 'Document Structuring',
    },
    {
      num: '03',
      title: 'Evidence',
      subtitle: 'Link findings to source documents',
      icon: Link2,
      detail: 'Every extracted claim is pinned to exact page and paragraph citations in audited statements, UDIN certificates, and OEM letters.',
      meta: 'Page-Level Grounding',
    },
    {
      num: '04',
      title: 'Rules',
      subtitle: 'Deterministic compliance evaluation',
      icon: FileCheck,
      detail: 'Hardcoded deterministic rules evaluate criteria mathematically against GFR 2017 standards, generating Pass, Fail, or Review flags.',
      meta: 'Zero Hallucination Rules',
    },
    {
      num: '05',
      title: 'Officer Review',
      subtitle: 'Review evidence and findings',
      icon: UserCheck,
      detail: 'The procurement officer inspects discrepancies, reviews audit traces, and confirms or adjusts findings with official notes.',
      meta: 'Human Oversight Mandatory',
    },
    {
      num: '06',
      title: 'Decision',
      subtitle: 'Final qualification & award',
      icon: Award,
      detail: 'The designated officer issues qualification reports and audit dossiers ready for CAG, CVC, and procurement file archives.',
      meta: 'Tamper-Evident Dossier',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-white border-b border-[#D9E3EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#1464B4] uppercase tracking-wider">
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B4C] tracking-tight font-serif">
            From Tender to Verified Decision
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#52677A] leading-relaxed">
            A structured, AI-assisted, rule-driven process — with the final call always in the hands of the procurement officer.
          </p>
        </div>

        {/* Horizontal Timeline (Desktop) / Vertical (Mobile) */}
        <div className="relative">
          {/* Connecting Line behind steps on Desktop */}
          <div className="hidden lg:block absolute top-10 left-[6%] right-[6%] h-0.5 bg-[#D9E3EC] -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = selectedStep === idx;
              return (
                <button
                  key={step.num}
                  onClick={() => setSelectedStep(idx)}
                  className={`flex flex-col text-left p-4 rounded-xl transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#F3F8FC] border-[#1464B4] shadow-md ring-1 ring-[#1464B4]/20'
                      : 'bg-white border-[#D9E3EC] hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Step Number Circle */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#1464B4] text-white'
                          : 'bg-[#F3F8FC] text-[#082B4C] border border-[#D9E3EC]'
                      }`}
                    >
                      {step.num}
                    </span>
                    <Icon
                      className={`h-5 w-5 ${
                        isSelected ? 'text-[#1464B4]' : 'text-[#52677A]'
                      }`}
                    />
                  </div>

                  <h3 className="text-sm font-bold text-[#082B4C] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#52677A] leading-relaxed">
                    {step.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Selected Step Deep Dive Card */}
        <div className="mt-8 bg-[#F3F8FC] rounded-2xl p-6 border border-[#D9E3EC] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1464B4] text-white font-bold">
                {steps[selectedStep].num}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#082B4C]">
                    Stage {steps[selectedStep].num}: {steps[selectedStep].title} — {steps[selectedStep].subtitle}
                  </h4>
                  <span className="text-[11px] font-semibold text-[#1464B4] bg-white border border-[#D9E3EC] px-2 py-0.5 rounded-full">
                    {steps[selectedStep].meta}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#52677A] mt-1 max-w-3xl">
                  {steps[selectedStep].detail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <button
                disabled={selectedStep === 0}
                onClick={() => setSelectedStep((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-md border border-[#D9E3EC] text-xs font-semibold text-[#17324D] hover:bg-white disabled:opacity-40 transition"
              >
                Previous Step
              </button>
              <button
                disabled={selectedStep === steps.length - 1}
                onClick={() => setSelectedStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1464B4] text-white text-xs font-semibold hover:bg-[#082B4C] disabled:opacity-40 transition"
              >
                <span>Next Step</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
