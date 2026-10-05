'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Lock,
  FileCheck,
  Users,
  Shield,
} from 'lucide-react';
import { superAdminApi, SystemConfigData } from '@/lib/api/superadmin.api';

export default function SuperAdminConfigPage() {
  const [config, setConfig] = useState<SystemConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getSystemConfig();
      setConfig(data);
    } catch (err: any) {
      console.error('Failed to load system config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      setIsSaving(true);
      const updated = await superAdminApi.updateSystemConfig(config);
      setConfig(updated);
      setActionSuccess('Global system configuration successfully committed.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Config update failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-cyan-400">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
        <span className="mt-3 text-xs font-mono tracking-widest text-slate-400">
          LOADING SYSTEM PARAMETERS...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white sm:text-2xl">
              GLOBAL CONFIGURATION &amp; FEATURE FLAGS
            </h1>
            <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800">
              CLUSTER HOT-CONFIG
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Tune runtime behaviors, AI inference quotas, compliance strictness, and infrastructure barriers in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConfig}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-mono font-semibold text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>REVERT / SYNC</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-200 font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {config && (
        <form onSubmit={handleSave} className="space-y-6 font-mono">
          {/* Section 1: Emergency & Security Controls */}
          <div className="rounded-2xl border border-slate-800 bg-[#070e1c] p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="h-4 w-4 text-rose-400" />
              EMERGENCY LOCKDOWN &amp; ACCESS CONTROL
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emergency Lockdown */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Emergency Maintenance Lockdown</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Locks out bidders, officers, and standard admins. Super Admins retain command.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.maintenanceMode}
                  onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </div>

              {/* Public Registration */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Public Contractor Registration</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Allow new vendors/bidders to register through the public portal.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.publicRegistration}
                  onChange={(e) => setConfig({ ...config, publicRegistration: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Maintenance Message */}
            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-bold">
                BROADCAST MAINTENANCE NOTIFICATION
              </label>
              <input
                type="text"
                value={config.maintenanceMessage}
                onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: AI Core Engine & Compliance Flags */}
          <div className="rounded-2xl border border-slate-800 bg-[#070e1c] p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              AI INFERENCE &amp; COMPLIANCE HEURISTICS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Auto-Scoring */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">AI Autonomous Bid Evaluation</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Automatically score bidder technical compliance using Gemini models.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.aiAutoScoring}
                  onChange={(e) => setConfig({ ...config, aiAutoScoring: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </div>

              {/* Strict GeM Compliance */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Strict GeM Mandate Enforcer</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Strictly block non-compliant bids violating CVC &amp; GFR guidelines.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.strictGemCompliance}
                  onChange={(e) => setConfig({ ...config, strictGemCompliance: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Doc Upload Size */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-bold">MAX TENDER FILE UPLOAD SIZE</label>
                  <span className="text-cyan-400 text-xs font-bold">{config.maxDocumentSizeMB} MB</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={config.maxDocumentSizeMB}
                  onChange={(e) => setConfig({ ...config, maxDocumentSizeMB: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* OCR Precision Mode */}
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5">OCR PRECISION PROFILE</label>
                <select
                  value={config.ocrPrecisionMode}
                  onChange={(e) => setConfig({ ...config, ocrPrecisionMode: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="HIGH_PRECISION_MULTILINGUAL">High-Precision Multilingual (English + 12 Indian Languages)</option>
                  <option value="STANDARD_FAST">Standard Fast (Latin text only)</option>
                  <option value="FORENSIC_DEEP_INSPECTION">Forensic Deep Inspection (Full DPI extraction)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'COMMITTING CONFIGURATION...' : 'COMMIT CHANGES TO CLUSTER'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
