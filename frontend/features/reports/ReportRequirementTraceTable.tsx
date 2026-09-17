import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ReportRequirementAuditItem } from '@/types/reports';

interface TraceTableProps {
  requirements: ReportRequirementAuditItem[];
  tenderId: string;
}

export const ReportRequirementTraceTable: React.FC<TraceTableProps> = ({ requirements, tenderId }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = requirements.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.requirement.requirementCode.toLowerCase().includes(q) ||
      item.requirement.requirementText.toLowerCase().includes(q) ||
      (item.requirement.clauseReference && item.requirement.clauseReference.toLowerCase().includes(q));

    const matchCat = categoryFilter === 'ALL' || item.requirement.category === categoryFilter;
    const matchRes = resultFilter === 'ALL' || item.evaluation.result === resultFilter;

    return matchSearch && matchCat && matchRes;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden mb-6">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Requirement Compliance Audit Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete provenance chain: Tender Clause → Approved Rule → Evidence Source → Deterministic Evaluation.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Showing {filteredItems.length} of {requirements.length} Requirements
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, text or clause..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              <option value="ELIGIBILITY">Eligibility</option>
              <option value="FINANCIAL">Financial</option>
              <option value="TECHNICAL">Technical</option>
              <option value="STATUTORY">Statutory</option>
              <option value="POLICY">Policy</option>
              <option value="TENDER_SPECIFIC">Tender Specific</option>
            </select>
          </div>

          <div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              <option value="ALL">All Results</option>
              <option value="PASS">PASS Only</option>
              <option value="FAIL">FAIL Only</option>
              <option value="REVIEW">REVIEW Only</option>
              <option value="NOT_EVALUABLE">NOT_EVALUABLE Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requirement Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3.5 px-4">Code / Clause</th>
              <th className="py-3.5 px-4 min-w-[260px]">Tender Requirement</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Approved Rule</th>
              <th className="py-3.5 px-4 text-center">Result</th>
              <th className="py-3.5 px-4 text-center">Audit Trace</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  No matching requirements found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isExpanded = expandedId === item.requirement.id;

                return (
                  <React.Fragment key={item.requirement.id}>
                    <tr
                      onClick={() => toggleExpand(item.requirement.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        <div>{item.requirement.requirementCode}</div>
                        {item.requirement.clauseReference && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {item.requirement.clauseReference}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="line-clamp-2">{item.requirement.requirementText}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                          {item.requirement.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-[11px]">
                        {item.rule ? (
                          <div title={item.rule.name}>
                            <span className="font-semibold">{item.rule.ruleCode}</span> (v{item.rule.version})
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No rule</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">{renderBadge(item.evaluation.result)}</td>

                      <td className="py-3 px-4 text-center">
                        <button className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Audit Trace Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={6} className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Approved Rule & Evaluation Trace */}
                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-indigo-500" />
                                Why {item.evaluation.result}? (Deterministic Trace)
                              </div>
                              <p className="text-slate-600 dark:text-slate-300">
                                {item.whyExplanation.summary}
                              </p>

                              {item.whyExplanation.traceSteps.length > 0 && (
                                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                                  {item.whyExplanation.traceSteps.map((step, idx) => (
                                    <div key={idx} className="text-[11px] text-slate-500 dark:text-slate-400">
                                      • {step}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Submitted Evidence List */}
                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                Evidence Sources ({item.evidenceList.length})
                              </div>

                              {item.evidenceList.length === 0 ? (
                                <p className="text-amber-700 dark:text-amber-400 text-[11px]">
                                  No supporting evidence submitted or mapped for this requirement.
                                </p>
                              ) : (
                                item.evidenceList.map((ev) => (
                                  <div
                                    key={ev.id}
                                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] space-y-0.5"
                                  >
                                    <div className="flex items-center justify-between font-semibold">
                                      <span>{ev.fieldLabel}</span>
                                      <span className="font-mono text-slate-500 text-[10px]">
                                        Pg {ev.pageNumber}
                                      </span>
                                    </div>
                                    <div className="font-mono text-slate-800 dark:text-slate-200">
                                      "{ev.rawValue}" {ev.unit ? `(${ev.unit})` : ''}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Doc: {ev.documentName} | Conf: {Math.round(ev.confidence * 100)}%
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function renderBadge(result: string) {
  switch (result) {
    case 'PASS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS
        </span>
      );
    case 'FAIL':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[11px]">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAIL
        </span>
      );
    case 'REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> REVIEW
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> N/E
        </span>
      );
  }
}
