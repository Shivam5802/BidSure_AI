import React from 'react';
import Image from 'next/image';

export function ImpactMetricsSection() {
  const metrics = [
    {
      value: '100%',
      label: 'Compliance with GeM & GFR 2017',
    },
    {
      value: 'Faster',
      label: 'Tender Evaluation Process',
    },
    {
      value: 'Higher',
      label: 'Transparency & Accountability',
    },
    {
      value: 'Greater',
      label: 'Public Value & Reduced Risk',
    },
  ];

  return (
    <section id="trust" className="py-14 bg-white border-b border-[#D9E3EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Dark Navy Card with Parliament Backdrop & Tricolor Accent */}
          <div className="lg:col-span-4 relative rounded-2xl bg-[#082B4C] p-8 text-white flex flex-col justify-between overflow-hidden shadow-lg border border-[#123B63]">
            
            {/* Parliament Architecture Backdrop Image */}
            <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-luminosity">
              <Image
                src="/images/parliament_hero_bg.png"
                alt="Government of India Headquarters Background"
                fill
                className="object-cover object-center"
              />
            </div>

            {/* Gradient Overlay for high text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#082B4C] via-[#082B4C]/80 to-transparent" />

            <div className="relative z-10 space-y-4 my-auto">
              <h3 className="text-2xl sm:text-3xl font-bold font-serif leading-snug">
                Trusted by Government for Better Procurement
              </h3>
              
              {/* National Tricolor Accent Bar */}
              <div className="flex h-1.5 w-24 rounded-full overflow-hidden shadow-sm" role="img" aria-label="Indian Tricolor accent">
                <div className="w-1/3 bg-[#FF9933]" />
                <div className="w-1/3 bg-white" />
                <div className="w-1/3 bg-[#138808]" />
              </div>
            </div>
          </div>

          {/* Right 4 Metric Columns */}
          <div className="lg:col-span-8 bg-[#F3F8FC] rounded-2xl p-6 sm:p-8 border border-[#D9E3EC] flex items-center shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full text-left divide-y sm:divide-y-0 sm:divide-x divide-[#D9E3EC]">
              {metrics.map((m, idx) => (
                <div key={idx} className="pt-3 sm:pt-0 sm:px-4 space-y-1">
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#1464B4] font-serif tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-xs text-[#17324D] font-semibold leading-snug">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
