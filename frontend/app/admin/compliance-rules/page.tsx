'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, StatutoryComplianceRule } from '@/lib/api/admin.api';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Sliders,
  ShieldCheck,
  Building2,
  FileCheck,
  RefreshCw,
  Loader2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminComplianceRulesPage() {
  const [rules, setRules] = useState<StatutoryComplianceRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<StatutoryComplianceRule | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editParameters, setEditParameters] = useState<string>('{}');
  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getComplianceRules();
      setRules(data);
    } catch (err: any) {
      console.error('Failed to load compliance rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenEdit = (rule: StatutoryComplianceRule) => {
    setSelectedRule(rule);
    setEditEnabled(rule.enabled);
    setEditParameters(JSON.stringify(rule.parameters, null, 2));
    setEditReason('');
    setEditModalOpen(true);
  };

  const handleSaveRule = async () => {
    if (!selectedRule) return;
    if (!editReason.trim() || editReason.trim().length < 5) {
      setFeedback({ type: 'error', text: 'An audit justification reason (minimum 5 characters) is required.' });
      return;
    }

    let parsedParams: Record<string, any> = {};
    try {
      parsedParams = JSON.parse(editParameters);
    } catch {
      setFeedback({ type: 'error', text: 'Invalid JSON formatted parameters.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await adminApi.updateComplianceRule(selectedRule.id, {
        enabled: editEnabled,
        parameters: parsedParams,
        reason: editReason,
      });
      setFeedback({ type: 'success', text: `Rule ${selectedRule.ruleCode} updated to Version ${selectedRule.version + 1}.` });
      setEditModalOpen(false);
      fetchRules();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update rule parameters.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Statutory Compliance Rules Engine</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure supported verification rule engines, statutory parameters, applicability boundaries & version history
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchRules}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl p-4 text-xs border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Sovereign Immutability Safeguard Banner */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <Info className="h-4 w-4 text-[#1464B4] dark:text-[#58A6FF] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#1464B4] dark:text-[#58A6FF]">GFR Non-Retroactivity Principle: </span>
          Updating a statutory rule configuration establishes a new version index and does NOT rewrite previous evaluation records. Tender bids evaluated under prior versions retain their authentic timestamped evidence and verdict.
        </div>
      </div>

      {/* Rules Cards Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1464B4]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                        {rule.ruleCode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">v{rule.version}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{rule.name}</h3>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      rule.enabled
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rule.description}
                </p>

                <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Applicability: </span>
                  {rule.applicability}
                </div>

                {/* Parameters Preview */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Parameters</span>
                  <pre className="mt-1 p-2 rounded-lg bg-slate-950 text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-24">
                    {JSON.stringify(rule.parameters, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {rule.changeHistory.length} audit revisions
                </span>

                <Button
                  size="sm"
                  onClick={() => handleOpenEdit(rule)}
                  className="rounded-lg bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold h-8"
                >
                  <Sliders className="h-3.5 w-3.5 mr-1" />
                  Configure Rule
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Rule Parameters Modal */}
      {editModalOpen && selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Configure {selectedRule.name}</h3>
                <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400">{selectedRule.ruleCode} (v{selectedRule.version})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(false)} className="rounded-lg h-7 w-7 p-0">✕</Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">Rule Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editEnabled}
                    onChange={(e) => setEditEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1464B4]" />
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Engine Parameters (JSON Schema)
                </label>
                <textarea
                  rows={5}
                  value={editParameters}
                  onChange={(e) => setEditParameters(e.target.value)}
                  className="w-full p-2.5 rounded-xl font-mono text-[11px] bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mandatory Audit Justification
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="State the sovereign statutory order or policy mandate for this change..."
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleSaveRule}
                className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Save New Version
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
