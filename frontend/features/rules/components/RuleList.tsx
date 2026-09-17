'use client';

import React from 'react';
import { Search, Filter, CheckCircle2, HelpCircle, AlertTriangle, Shield, Cpu } from 'lucide-react';
import { ComplianceRule, RuleFilterState } from '../types';

interface RuleListProps {
  rules: ComplianceRule[];
  selectedRuleId: string | null;
  filters: RuleFilterState;
  onFilterChange: (filters: RuleFilterState) => void;
  onSelectRule: (rule: ComplianceRule) => void;
}

export const RuleList: React.FC<RuleListProps> = ({
  rules,
  selectedRuleId,
  filters,
  onFilterChange,
  onSelectRule,
}) => {
  const typeBadgeColors: Record<string, string> = {
    NUMERIC: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    DATE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    BOOLEAN: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    PERCENTAGE: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    COUNT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    COMPOUND: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    CONDITIONAL: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    INFORMATIONAL: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border-r border-slate-800/80">
      {/* Filters Bar */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules, codes, metrics..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full bg-slate-800 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="bg-slate-800 text-slate-200 p-1.5 rounded-lg border border-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review Required</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={filters.ruleType}
            onChange={(e) => onFilterChange({ ...filters, ruleType: e.target.value })}
            className="bg-slate-800 text-slate-200 p-1.5 rounded-lg border border-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="NUMERIC">Numeric</option>
            <option value="DATE">Date</option>
            <option value="BOOLEAN">Boolean</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="COUNT">Count</option>
            <option value="COMPOUND">Compound</option>
            <option value="CONDITIONAL">Conditional</option>
          </select>
        </div>
      </div>

      {/* Rules List */}
      <div className="flex-1 overflow-y-auto">
        {rules.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No compliance rules match the selected filters.
          </div>
        ) : (
          rules.map((rule) => {
            const isSelected = selectedRuleId === rule.id;
            return (
              <div
                key={rule.id}
                onClick={() => onSelectRule(rule)}
                className={`p-4 border-b transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-slate-800/90 border-l-4 border-l-blue-500 border-b-slate-700'
                    : 'bg-slate-900/40 hover:bg-slate-800/40 border-b-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">{rule.ruleCode}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      rule.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : rule.status === 'REVIEW'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 mt-1.5 leading-snug line-clamp-1">
                  {rule.name}
                </h4>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      typeBadgeColors[rule.ruleType] || typeBadgeColors.INFORMATIONAL
                    }`}
                  >
                    {rule.ruleType}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">v{rule.version}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
