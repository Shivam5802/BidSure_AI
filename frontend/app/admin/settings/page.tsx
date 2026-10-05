'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, PlatformSettings } from '@/lib/api/admin.api';
import {
  Lock,
  Building2,
  Mail,
  Phone,
  FileCheck,
  Shield,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to load platform settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      setFeedback({ type: 'success', text: 'Platform settings saved and audit-recorded successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-md">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Platform Settings & Policies</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure sovereign institutional branding, document payload thresholds, session TTLs, and feature flags
              </p>
            </div>
          </div>
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
          <button onClick={() => setFeedback(null)} className="font-bold underline hover:no-underline text-xs">Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Sovereign Institutional Branding */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#1464B4]" />
            Institutional Identity & Sovereign Branding
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Platform Display Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Governing Authority / Ministry</label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Support Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Official Helpdesk Helpline</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Payload & Security Thresholds */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            Security Policies & Payload Constraints
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Max Document Upload Size (MB)
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={settings.maxDocumentSizeMB}
                onChange={(e) => setSettings({ ...settings, maxDocumentSizeMB: parseInt(e.target.value, 10) || 50 })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Session Token TTL (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={48}
                value={settings.sessionTimeoutHours}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutHours: parseInt(e.target.value, 10) || 8 })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Audit Retention (Days - Statutory)
              </label>
              <input
                type="number"
                min={365}
                max={3650}
                value={settings.auditRetentionDays}
                onChange={(e) => setSettings({ ...settings, auditRetentionDays: parseInt(e.target.value, 10) || 2555 })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Feature Flags & Automation */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-purple-600" />
            Compliance Automation & Intelligence Feature Flags
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">AI Automated Evaluation Engine</span>
                <span className="text-[11px] text-slate-500">Automatically run Gemini OCR & rule scoring upon proposal submission.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.aiAutoEvaluation}
                onChange={(e) => setSettings({ ...settings, aiAutoEvaluation: e.target.checked })}
                className="h-4 w-4 text-[#1464B4] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Strict GSTN Validation Gateway</span>
                <span className="text-[11px] text-slate-500">Require exact PAN prefix matching and active return filing status.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.strictGstVerification}
                onChange={(e) => setSettings({ ...settings, strictGstVerification: e.target.checked })}
                className="h-4 w-4 text-[#1464B4] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Central Public Procurement Debarment Check</span>
                <span className="text-[11px] text-slate-500">Scan CPPP negative lists before permitting final bid qualification.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.debarmentAutoCheck}
                onChange={(e) => setSettings({ ...settings, debarmentAutoCheck: e.target.checked })}
                className="h-4 w-4 text-[#1464B4] rounded"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Sovereign Maintenance Lockdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Maintenance Mode Notice
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Maintenance Mode Switch</span>
                <span className="text-[11px] text-slate-500">Display sovereign maintenance banner to public bidders during upgrades.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-4 w-4 text-[#1464B4] rounded"
              />
            </label>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Public Maintenance Message</label>
              <textarea
                rows={2}
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold px-6 h-10 gap-1.5 shadow-xs"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Platform Policies</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
