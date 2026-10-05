'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  Key,
  Lock,
  LogOut,
  Clock,
  Terminal,
  Server,
  Fingerprint,
  AlertTriangle,
  BadgeCheck,
  Cpu,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userAgent, setUserAgent] = useState('');
  const [sessionTime, setSessionTime] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserAgent(window.navigator.userAgent);
      setSessionTime(new Date().toLocaleTimeString());
    }
  }, []);

  const handleLogout = async () => {
    if (confirm('Terminate root Super Admin session and exit the sovereign command deck?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Shield className="h-7 w-7 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">Root Super Administrator Profile</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                  CLEARANCE LEVEL 0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sovereign platform administrative authority, cryptographic key custody, and constitutional access controls
              </p>
            </div>
          </div>
          <div>
            <Button
              onClick={handleLogout}
              className="rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Terminate Sovereign Session
            </Button>
          </div>
        </div>

        {/* Protection Banner */}
        <div className="mt-5 rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-3.5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Immutable Root Governance: </span>
            This account holds highest-tier Super Administrator clearance. In accordance with system security specifications, the primary Super Admin account is cryptographically protected against remote suspension, deletion, or permission downgrade to avoid accidental platform lockout.
          </div>
        </div>
      </div>

      {/* Account Details & Cryptographic Custody */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity Dossier */}
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-cyan-400" />
              Administrative Identity Dossier
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
              AUTHENTICATED
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Account Full Name</div>
              <div className="text-sm font-bold text-white mt-0.5">{user?.name || 'Chief Platform Administrator'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Official Email Identity</div>
              <div className="text-cyan-300 mt-0.5">{user?.email || 'admin@bidsure.gov.in'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Role Authorization Level</div>
              <div className="text-purple-300 font-bold mt-0.5">SUPER_ADMIN (Full Sovereign RBAC)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Department / Division</div>
              <div className="text-slate-300 mt-0.5">{user?.department || 'SIH GeM Procurement Compliance Directorate'}</div>
            </div>
          </div>
        </div>

        {/* Cryptographic & Session Safeguards */}
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-purple-400" />
              Cryptographic Key & Session Custody
            </h2>
            <span className="text-[10px] font-mono text-cyan-300">ACTIVE TOKEN</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Audit Master Key Fingerprint</div>
              <div className="text-emerald-400 text-[11px] truncate mt-0.5">
                SHA256:7e9a2b84cf10d938b8120e3aa02c4f826d911b...
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Multi-Factor Security (MFA)</div>
              <div className="text-white mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Hardware Security Key / TOTP Enforced
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Session Verification</div>
              <div className="text-slate-300 mt-0.5">Session refreshed: {sessionTime || 'Active'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">Connecting Device User-Agent</div>
              <div className="text-slate-400 text-[10px] truncate mt-0.5">{userAgent || 'Secure Enterprise Browser'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
