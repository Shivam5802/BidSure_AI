'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { toast } from '@/components/ui/Toast';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Calendar,
  ExternalLink,
  RefreshCw,
  Trash2,
  FileBadge,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RegistrationRecord {
  id: string;
  registrationType: string;
  registrationNumber: string;
  issuingAuthority: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  verificationStatus: string;
  verificationSource?: string | null;
  failureReason?: string | null;
  lastVerifiedAt?: string | null;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Registration Form State
  const [regType, setRegType] = useState('PAN');
  const [regNumber, setRegNumber] = useState('');
  const [issuingAuth, setIssuingAuth] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBidderRegistrations();
      setRegistrations(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load registrations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim() || !issuingAuth.trim()) {
      toast.error('Registration number and issuing authority are required.');
      return;
    }
    try {
      setIsSaving(true);
      await api.addBidderRegistration({
        registrationType: regType,
        registrationNumber: regNumber.trim().toUpperCase(),
        issuingAuthority: issuingAuth.trim(),
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
      });
      toast.success(`${regType} registration added and verified via GeM Sandbox.`);
      setIsModalOpen(false);
      setRegNumber('');
      setIssuingAuth('');
      setIssueDate('');
      setExpiryDate('');
      await loadRegistrations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add registration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (id: string, type: string) => {
    try {
      setIsVerifying(id);
      const res = await api.verifyBidderRegistration(id);
      if (res.verificationStatus === 'VERIFIED') {
        toast.success(`${type} verified successfully via ${res.verificationSource || 'Govt Sandbox'}.`);
      } else {
        toast.warning(`${type} status: ${res.verificationStatus}. ${res.failureReason || ''}`);
      }
      await loadRegistrations();
    } catch (err: any) {
      toast.error(err.message || 'Verification check failed.');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm(`Are you sure you want to remove ${type} registration record?`)) return;
    try {
      await api.deleteBidderRegistration(id);
      toast.success(`${type} registration deleted.`);
      await loadRegistrations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete registration.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </span>
        );
      case 'VERIFICATION_FAILED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-0.5 text-[10px] font-bold">
            <AlertCircle className="h-3 w-3" /> Failed
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
            <Clock className="h-3 w-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 text-[10px] font-bold">
            <Clock className="h-3 w-3" /> Pending Check
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Registrations & Certifications
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Maintain verified government identifiers (PAN, GSTIN, Udyam MSME, NSIC, DPIIT) for tender eligibility.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Registration
        </Button>
      </div>

      {/* Advisory Banner */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-[#1464B4] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#1464B4] dark:text-blue-400">Deterministic Verification Sandbox:</span>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            All records are validated using official GeM GFR-2017 deterministic format rules and sandbox adapters (GSTN API, Income Tax PAN validator, and Udyam Portal). Live verification status and sources are transparently displayed.
          </p>
        </div>
      </div>

      {/* Registrations List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <FileBadge className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No Registrations Added</h3>
          <p className="mt-1 text-xs text-slate-500">Add statutory identification (PAN, GSTIN, Udyam) to unlock tender applications.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4 rounded-xl text-xs font-bold bg-[#1464B4]">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add PAN / GSTIN
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-100 text-[#1464B4] dark:bg-blue-950/60 dark:text-blue-400 font-bold px-2 py-0.5 text-xs font-mono">
                      {reg.registrationType}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {reg.registrationNumber}
                    </span>
                  </div>
                  {getStatusBadge(reg.verificationStatus)}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Authority:</span> {reg.issuingAuthority}
                  </p>
                  {reg.issueDate && (
                    <p className="text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Issued:</span>{' '}
                      {new Date(reg.issueDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                  {reg.expiryDate ? (
                    <p className="text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Expiry:</span>{' '}
                      {new Date(reg.expiryDate).toLocaleDateString('en-IN')}
                    </p>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Validity:</span> Permanent / Ongoing
                    </p>
                  )}
                  {reg.verificationSource && (
                    <p className="text-[11px] text-slate-400">
                      <span className="font-semibold">Source:</span> {reg.verificationSource}
                    </p>
                  )}
                  {reg.failureReason && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg mt-1 font-medium">
                      {reg.failureReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isVerifying === reg.id}
                  onClick={() => handleVerify(reg.id, reg.registrationType)}
                  className="rounded-lg text-xs font-semibold"
                >
                  {isVerifying === reg.id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1 text-[#1464B4]" />
                  )}
                  Re-Verify
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(reg.id, reg.registrationType)}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold p-1.5"
                  title="Remove registration"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Government Registration</h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Type
                </label>
                <select
                  value={regType}
                  onChange={(e) => {
                    const t = e.target.value;
                    setRegType(t);
                    if (t === 'PAN') setIssuingAuth('Income Tax Department, Govt of India');
                    if (t === 'GSTIN') setIssuingAuth('Goods and Services Tax Network (GSTN)');
                    if (t === 'UDYAM') setIssuingAuth('Ministry of MSME, Govt of India');
                    if (t === 'STARTUP_INDIA') setIssuingAuth('DPIIT, Ministry of Commerce');
                    if (t === 'NSIC') setIssuingAuth('National Small Industries Corporation');
                    if (t === 'EPFO_ESIC') setIssuingAuth('Employees Provident Fund Organisation');
                    if (t === 'OEM_AUTHORIZATION') setIssuingAuth('Original Equipment Manufacturer Principal');
                    if (t === 'MAKE_IN_INDIA') setIssuingAuth('Class-I / Class-II Local Content Attestation');
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                >
                  <option value="PAN">PAN (Income Tax Department)</option>
                  <option value="GSTIN">GSTIN (GST Network)</option>
                  <option value="UDYAM">Udyam / MSME Registration</option>
                  <option value="STARTUP_INDIA">Startup India Recognition (DPIIT)</option>
                  <option value="NSIC">NSIC Certificate</option>
                  <option value="OEM_AUTHORIZATION">OEM Dealership / Authorization</option>
                  <option value="EPFO_ESIC">EPFO / ESIC Registration</option>
                  <option value="MAKE_IN_INDIA">Make In India (Local Content Declaration)</option>
                  <option value="OTHER">Other Tender Specific Registration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration / Certificate Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder={regType === 'PAN' ? 'e.g. AAACD1234F' : regType === 'GSTIN' ? 'e.g. 27AAACD1234F1Z5' : 'Identifier Number'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing Authority <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={issuingAuth}
                  onChange={(e) => setIssuingAuth(e.target.value)}
                  placeholder="e.g. Income Tax Department"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date (if applicable)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSaving} className="rounded-xl bg-[#1464B4] text-xs font-bold">
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Verify & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
