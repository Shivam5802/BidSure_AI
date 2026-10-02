import React from 'react';
import { Mail, Phone, MapPin, FileCheck, HelpCircle, MessageSquare } from 'lucide-react';

export function ContactSection() {
  return (
    <section id="contact" className="py-16 lg:py-20 bg-white dark:bg-[#0F172A] border-b border-[#D9E3EC] dark:border-slate-800 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div id="support" className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#1464B4] dark:text-sky-400 uppercase tracking-wider">
              OFFICIAL SUPPORT & ENQUIRIES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B4C] dark:text-white tracking-tight font-serif">
            Procurement Helpdesk & Institutional Enquiries
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#52677A] dark:text-slate-300">
            Dedicated technical support for central ministries, state procurement directorates, and public sector undertakings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Card 1: Official Helpdesk */}
          <div className="bg-[#F3F8FC] dark:bg-[#162238] rounded-2xl p-6 border border-[#D9E3EC] dark:border-slate-700/80 shadow-xs dark:shadow-md dark:shadow-black/20 hover:border-[#1464B4] dark:hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1464B4] dark:bg-[#1E2F4D] text-white dark:text-sky-400 border border-transparent dark:border-blue-500/30 mb-4">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#082B4C] dark:text-white mb-1">
                Procurement Helpdesk
              </h3>
              <p className="text-xs text-[#52677A] dark:text-slate-300 leading-relaxed mb-4">
                Queries regarding tender ingestion, rule customization, and evaluation matrix exports.
              </p>
            </div>
            <div className="pt-3 border-t border-[#D9E3EC] dark:border-slate-700 text-xs font-medium text-[#1464B4] dark:text-[#38BDF8]">
              <span>support@bidsure.gov-tech.in</span>
            </div>
          </div>

          {/* Card 2: Vigilance & Audit Support */}
          <div className="bg-[#F3F8FC] dark:bg-[#162238] rounded-2xl p-6 border border-[#D9E3EC] dark:border-slate-700/80 shadow-xs dark:shadow-md dark:shadow-black/20 hover:border-[#1464B4] dark:hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1464B4] dark:bg-[#1E2F4D] text-white dark:text-sky-400 border border-transparent dark:border-blue-500/30 mb-4">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#082B4C] dark:text-white mb-1">
                Audit & Vigilance Dossier
              </h3>
              <p className="text-xs text-[#52677A] dark:text-slate-300 leading-relaxed mb-4">
                Request cryptographically certified audit exports and historical rule verification logs.
              </p>
            </div>
            <div className="pt-3 border-t border-[#D9E3EC] dark:border-slate-700 text-xs font-medium text-[#1464B4] dark:text-[#38BDF8]">
              <span>audit-compliance@bidsure.gov-tech.in</span>
            </div>
          </div>

          {/* Card 3: GeM Onboarding & Integration */}
          <div className="bg-[#F3F8FC] dark:bg-[#162238] rounded-2xl p-6 border border-[#D9E3EC] dark:border-slate-700/80 shadow-xs dark:shadow-md dark:shadow-black/20 hover:border-[#1464B4] dark:hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1464B4] dark:bg-[#1E2F4D] text-white dark:text-sky-400 border border-transparent dark:border-blue-500/30 mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#082B4C] dark:text-white mb-1">
                Departmental Onboarding
              </h3>
              <p className="text-xs text-[#52677A] dark:text-slate-300 leading-relaxed mb-4">
                Request hands-on demonstration and integration assistance for your procurement cell.
              </p>
            </div>
            <div className="pt-3 border-t border-[#D9E3EC] dark:border-slate-700 text-xs font-medium text-[#1464B4] dark:text-[#38BDF8]">
              <span>onboarding@bidsure.gov-tech.in</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
