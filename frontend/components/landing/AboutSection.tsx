import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cpu, FileCheck2, UserCheck, ArrowRight } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-16 lg:py-24 bg-white border-b border-[#D9E3EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mission, Vision, and Government Mandate */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1464B4] uppercase tracking-wider">
                ABOUT BIDSURE
              </span>
              <div className="h-0.5 w-12 bg-[#1464B4] rounded-full" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B4C] tracking-tight font-serif leading-snug">
              Smarter Procurement<br />for a Transparent Tomorrow
            </h2>

            <p className="text-[#52677A] text-sm sm:text-base leading-relaxed font-normal">
              BidSure is an AI-powered platform that helps government procurement officers analyze tenders, validate bidder documents, detect inconsistencies and make transparent, auditable decisions under GeM and GFR 2017.
            </p>

            <div className="pt-2">
              <a href="#how-it-works">
                <button className="inline-flex items-center gap-3 rounded-lg bg-[#1464B4] hover:bg-[#082B4C] text-white font-semibold px-6 py-3 text-sm shadow-md transition-all group">
                  <span>Know More</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
            </div>
          </div>

          {/* Right Column: Premium Institutional Card with 3 Pillars & National Emblem Watermark */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#F3F8FC] via-white to-[#F3F8FC] p-6 sm:p-8 border border-[#D9E3EC] shadow-sm overflow-hidden">
              
              {/* Subtle Ashoka Emblem Watermark (from uploaded reference) */}
              <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-64 h-80 select-none">
                <Image
                  src="/images/indian_emblem.png"
                  alt="Satyamev Jayate Indian National Emblem"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-6 relative z-10 max-w-lg">
                
                {/* Pillar 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1464B4] border border-blue-100">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#082B4C]">
                      AI-Assisted Analysis
                    </h4>
                    <p className="text-xs sm:text-sm text-[#52677A] mt-1 leading-relaxed">
                      Extracts key information and flags potential issues from complex documents.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1464B4] border border-blue-100">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#082B4C]">
                      Rule-Based Verification
                    </h4>
                    <p className="text-xs sm:text-sm text-[#52677A] mt-1 leading-relaxed">
                      Evaluates compliance using deterministic rules with evidence citations.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1464B4] border border-blue-100">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#082B4C]">
                      Human Oversight
                    </h4>
                    <p className="text-xs sm:text-sm text-[#52677A] mt-1 leading-relaxed">
                      Final decision always remains with the procurement officer.
                    </p>
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
