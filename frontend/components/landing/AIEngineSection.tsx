import React from 'react';
import { ArrowDown, Cpu, FileCheck2, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export function AIEngineSection() {
  const inputDocs = [
    { title: 'Tender RFP', sub: 'Technical specifications & eligibility' },
    { title: 'Financial Statements', sub: 'Balance sheets & P&L filings' },
    { title: 'CA Certificate', sub: 'UDIN verified net worth & turnover' },
    { title: 'OEM Authorisation', sub: 'Manufacturer compliance declaration' },
  ];

  const outcomes = [
    { label: 'PASS', desc: 'Deterministic criteria fully met', color: 'bg-emerald-50 dark:bg-emerald-950/50 text-[#238B57] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
    { label: 'FAIL', desc: 'Non-compliant with mandatory rules', color: 'bg-rose-50 dark:bg-rose-950/50 text-[#B83232] dark:text-rose-400 border-rose-200 dark:border-rose-800', icon: XCircle },
    { label: 'REVIEW', desc: 'Discrepancy flagged for officer', color: 'bg-amber-50 dark:bg-amber-950/50 text-[#C98200] dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: AlertTriangle },
    { label: 'NOT EVALUABLE', desc: 'Missing document or corrupted file', color: 'bg-slate-100 dark:bg-slate-800 text-[#52677A] dark:text-slate-300 border-slate-300 dark:border-slate-700', icon: HelpCircle },
  ];

  return (
    <section id="ai-rules" className="py-16 lg:py-24 bg-[#F3F8FC] dark:bg-slate-900/50 border-b border-[#D9E3EC] dark:border-slate-800 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#1464B4] dark:text-blue-400 uppercase tracking-wider">
              ARCHITECTURAL INTEGRITY
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B4C] dark:text-white tracking-tight font-serif">
            AI + Deterministic Rules.<br className="hidden sm:inline" /> The Perfect Balance.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#52677A] dark:text-slate-300 leading-relaxed">
            Our AI extracts, structures and highlights key information. The deterministic rule engine evaluates it using approved procurement criteria — ensuring accuracy, explainability and traceability.
          </p>
        </div>

        {/* Visual Architecture Flow */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Level 1: Input Documents Grid */}
          <div>
            <div className="text-center text-xs font-bold text-[#52677A] dark:text-slate-400 uppercase tracking-wider mb-3">
              1. Unstructured Procurement Dossiers
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {inputDocs.map((doc, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-[#D9E3EC] dark:border-slate-800 shadow-xs text-center">
                  <p className="text-xs font-bold text-[#082B4C] dark:text-slate-100">{doc.title}</p>
                  <p className="text-[11px] text-[#52677A] dark:text-slate-400 mt-0.5">{doc.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transition Arrow */}
          <div className="flex justify-center text-[#1464B4] dark:text-blue-400">
            <ArrowDown className="h-5 w-5 animate-bounce" />
          </div>

          {/* Level 2: AI Extraction Stage */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-blue-200/80 dark:border-blue-900/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1464B4] dark:text-blue-400">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1464B4] dark:text-blue-400">
                  2. AI Parsing & Entity Extraction
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[#082B4C] dark:text-slate-100">
                  Transforms Unstructured PDFs into Verified Facts
                </h4>
                <p className="text-xs text-[#52677A] dark:text-slate-400">
                  Extracts dates, financial figures, clauses, and entity names with page coordinates.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                Evidence Structured
              </span>
            </div>
          </div>

          {/* Transition Arrow */}
          <div className="flex justify-center text-[#1464B4] dark:text-blue-400">
            <ArrowDown className="h-5 w-5" />
          </div>

          {/* Level 3: Deterministic Rule Engine */}
          <div className="bg-[#082B4C] dark:bg-[#06182c] text-white rounded-2xl p-5 border border-blue-900 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/30 text-amber-300 border border-blue-500/40">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  3. Deterministic Compliance Rule Engine
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Deterministic Logic Evaluates GFR 2017 Criteria
                </h4>
                <p className="text-xs text-slate-300">
                  Zero LLM decision-making. Explicit algorithmic verification ensures reproducible compliance checks.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
                Deterministic Guarantee
              </span>
            </div>
          </div>

          {/* Transition Arrow */}
          <div className="flex justify-center text-[#1464B4] dark:text-blue-400">
            <ArrowDown className="h-5 w-5" />
          </div>

          {/* Level 4: Status Outputs & Human Decision */}
          <div>
            <div className="text-center text-xs font-bold text-[#52677A] dark:text-slate-400 uppercase tracking-wider mb-3">
              4. Explainable Findings Delivered to Procurement Officer
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {outcomes.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`p-3.5 rounded-xl border ${item.color} flex flex-col items-center text-center shadow-xs`}>
                    <Icon className="h-5 w-5 mb-1.5" />
                    <span className="text-xs font-extrabold tracking-wide">{item.label}</span>
                    <span className="text-[10px] mt-1 opacity-90 leading-tight">{item.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Officer Decides Affirmation Box */}
            <div className="mt-4 p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-center">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                ⚖️ <strong>Institutional Safeguard:</strong> The procurement officer retains full authority to confirm, contest, or override findings before generating the award dossier.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
