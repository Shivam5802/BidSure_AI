'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth';
import {
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  Clock,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Administrator Credentials & Profile</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official institutional identification, role authorizations, and authenticated security session details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xl border border-slate-200 dark:border-slate-700">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{user?.name || 'Administrator'}</h2>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-[#1464B4] dark:text-[#58A6FF] px-2 py-0.5 text-[10px] font-bold">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>User ID: {user?.id}</span>
                <button
                  onClick={handleCopyId}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Data Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Department
            </span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              National Procurement Core Governance
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Sovereign Clearance
            </span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              Level-2 Administrative Authority
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Active Session Protocol
            </span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              Bearer JWT / HttpOnly Cookie
            </div>
          </div>
        </div>

        {/* Security & Credentials */}
        <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-4 text-xs space-y-2">
          <div className="font-bold text-[#1464B4] dark:text-[#58A6FF] flex items-center gap-1.5">
            <KeyRound className="h-4 w-4" />
            Security & Authentication Policy
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            Administrative passwords must adhere to sovereign criteria (scrypt salt-hashed, minimum 8 characters with alphanumeric and special characters). Administrative credentials are never displayed in plaintext or returned through REST APIs.
          </p>
        </div>
      </div>
    </div>
  );
}
