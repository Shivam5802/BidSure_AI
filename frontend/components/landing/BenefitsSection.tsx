import React from 'react';
import { Clock, SearchCheck, FileSearch, Eye, ShieldAlert } from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: 'Faster Evaluation',
      description: 'Reduce manual effort and save valuable time in scrutiny.',
      badge: '5x Efficiency',
    },
    {
      icon: SearchCheck,
      title: 'Detect Inconsistencies',
      description: 'Find cross-document contradictions and anomalies with precision.',
      badge: 'Cross-Verification',
    },
    {
      icon: FileSearch,
      title: 'Evidence-Based',
      description: 'Every finding is traceable to source documents with page-level citations.',
      badge: 'Zero Hallucination',
    },
    {
      icon: Eye,
      title: 'Complete Transparency',
      description: 'Generate detailed reports for audit, vigilance and administrative review.',
      badge: 'Audit Ready',
    },
    {
      icon: ShieldAlert,
      title: 'Secure & Scalable',
      description: 'Built for government workflows with enterprise-grade security standards.',
      badge: 'GovCloud Compliant',
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-[#F3F8FC] border-b border-[#D9E3EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-start text-left mb-12">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1464B4] uppercase tracking-wider">
              WHY BIDSURE
            </span>
            <div className="h-0.5 w-12 bg-[#1464B4] rounded-full" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B4C] tracking-tight font-serif mt-2">
            Key Benefits
          </h2>
          <p className="text-[#52677A] text-sm sm:text-base max-w-2xl mt-2">
            Engineered to empower procurement authorities with institutional rigor, speed, and uncompromising accuracy.
          </p>
        </div>

        {/* 5 Equal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-[#D9E3EC] shadow-xs hover:border-[#1464B4] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Icon Circle */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F8FC] text-[#1464B4] group-hover:bg-[#1464B4] group-hover:text-white transition-colors mb-4 border border-[#D9E3EC]">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#082B4C] mb-2 leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-[#52677A] leading-relaxed font-normal">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#1464B4] bg-blue-50 px-2 py-0.5 rounded">
                    {benefit.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
