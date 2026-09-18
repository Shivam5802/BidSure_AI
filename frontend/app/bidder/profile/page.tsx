'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api/client';
import {
  Building2,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('Private Limited');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getBidderProfile();
        if (isMounted && data) {
          setCompanyName(data.companyName || '');
          setCompanyType(data.companyType || 'Private Limited');
          setGstin(data.gstin || '');
          setPan(data.pan || '');
          setRegisteredAddress(data.registeredAddress || '');
          setContactPhone(data.contactPhone || '');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load profile.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);
      await api.updateBidderProfile({
        companyName,
        companyType,
        gstin: gstin.toUpperCase(),
        pan: pan.toUpperCase(),
        registeredAddress,
        contactPhone,
      });
      setSuccessMsg('Organization profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading contractor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Bidder Organization Profile
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your verified enterprise credentials and authorized signatory details
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Signatory Account Info */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Authorized Portal Account
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Signatory</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Login Email</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">System Role</span>
              <span className="rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-bold">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Legal Entity Details */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Enterprise Legal Registration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Legal Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Entity Constitution
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Private Limited">Private Limited Company</option>
                <option value="Public Limited">Public Limited Company</option>
                <option value="Partnership / LLP">Partnership / LLP</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Joint Venture">Joint Venture / Consortium</option>
                <option value="PSU / Government Entity">PSU / Government Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                GSTIN Identification
              </label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs uppercase font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                maxLength={10}
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs uppercase font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Registered Corporate Office Address
              </label>
              <textarea
                rows={2}
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Save Profile Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
