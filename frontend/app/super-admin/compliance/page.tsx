'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, StatutoryComplianceRule } from '@/lib/api/admin.api';
import {
  Terminal,
  Calculator,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  Info,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminCompliancePage() {
  const [rules, setRules] = useState<StatutoryComplianceRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<StatutoryComplianceRule | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editParameters, setEditParameters] = useState('{}');
  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getComplianceRules();
      setRules(data);
    } catch (err: any) {
      console.error('Failed to load rules:', err);
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
      setFeedback({ type: 'error', text: 'Audit justification reason (min 5 chars) is mandatory for root rule updates.' });
      return;
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(editParameters);
    } catch {
      setFeedback({ type: 'error', text: 'Invalid JSON parameters.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await adminApi.updateComplianceRule(selectedRule.id, {
        enabled: editEnabled,
        parameters: parsed,
        reason: editReason,
      });
      setFeedback({ type: 'success', text: `Rule ${selectedRule.ruleCode} incremented to v${selectedRule.version + 1}.` });
      setEditModalOpen(false);
      fetchRules();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Rule update failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
                  Global Compliance Engine Management
                </h1>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-800/80">
                  STATUTORY POLICIES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure supported compliance rule engines, statutory parameters, applicability boundaries & non-retroactive version logs
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchRules}
            className="rounded-xl border-slate-700 bg-slate-900/80 text-xs font-mono text-cyan-400 hover:bg-slate-800 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            REFRESH
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl p-4 text-xs font-mono border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {/* Rules Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center font-mono text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>LOADING STATUTORY ENGINE DEFINITIONS...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                        {rule.ruleCode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">v{rule.version}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mt-2">{rule.name}</h3>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      rule.enabled
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">{rule.description}</p>

                <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-[11px] text-slate-400 font-mono">
                  <span className="text-slate-300 font-bold">APPLICABILITY: </span>
                  {rule.applicability}
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Engine Parameters</span>
                  <pre className="mt-1 p-2 rounded-lg bg-black text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-24 border border-slate-900">
                    {JSON.stringify(rule.parameters, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[10px]">{rule.changeHistory.length} audit revisions</span>
                <Button
                  size="sm"
                  onClick={() => handleOpenEdit(rule)}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs border border-slate-800 font-mono"
                >
                  <Sliders className="h-3.5 w-3.5 mr-1" />
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs font-mono">
          <div className="w-full max-w-lg rounded-2xl bg-[#060c18] border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Configure {selectedRule.ruleCode}</h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-200">Rule Active</span>
                <input
                  type="checkbox"
                  checked={editEnabled}
                  onChange={(e) => setEditEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Parameters (JSON)</label>
                <textarea
                  rows={5}
                  value={editParameters}
                  onChange={(e) => setEditParameters(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-[11px] bg-black text-emerald-400 border border-slate-800 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mandatory Audit Justification</label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="State sovereign authority order for parameter modification..."
                  className="w-full p-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl border-slate-700 text-xs">
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleSaveRule}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold"
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
