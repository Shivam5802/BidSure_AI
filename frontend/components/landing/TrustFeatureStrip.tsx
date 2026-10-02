import React from 'react';
import { Shield, Brain, FileText, Building2 } from 'lucide-react';

export function TrustFeatureStrip() {
  const features = [
    {
      index: '01',
      title: 'Secure & Compliant',
      subtitle: 'GeM | GFR 2017',
      icon: Shield,
    },
    {
      index: '02',
      title: 'AI + Rule Engine',
      subtitle: 'Evidence Backed',
      icon: Brain,
    },
    {
      index: '03',
      title: 'Complete Audit Trail',
      subtitle: '100% Traceability',
      icon: FileText,
    },
    {
      index: '04',
      title: 'For Government',
      subtitle: 'Better Decisions, Greater Impact',
      icon: Building2,
    },
  ];

  return (
    <section className="bg-white dark:bg-[#0F172A] py-8 border-b border-[#D9E3EC] dark:border-slate-800 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.index}
                className="flex items-center gap-4 rounded-xl border border-[#D9E3EC] dark:border-slate-700/80 bg-white dark:bg-[#162238] p-4.5 shadow-xs dark:shadow-md dark:shadow-black/20 hover:border-[#1464B4] dark:hover:border-blue-400 dark:hover:bg-[#1C2C47] hover:shadow-md transition-all group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F3F8FC] dark:bg-[#1E2F4D] text-[#1464B4] dark:text-sky-400 dark:border dark:border-slate-600/70 group-hover:bg-[#1464B4] group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#52677A] dark:text-sky-400 tracking-wider uppercase">
                      {item.index}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#082B4C] dark:text-white leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#52677A] dark:text-slate-300 font-medium">
                    {item.subtitle}
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
