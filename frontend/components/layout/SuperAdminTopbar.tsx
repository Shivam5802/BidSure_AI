'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  KeyRound,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Terminal,
  Activity,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/components/theme';
import { LanguageSelector } from '@/components/header/LanguageSelector';
import { superAdminApi } from '@/lib/api/superadmin.api';

export function SuperAdminTopbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [profileOpen, setProfileOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isTogglingLockdown, setIsTogglingLockdown] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [profileOpen]);

  // Fetch initial config for maintenance banner
  useEffect(() => {
    let mounted = true;
    superAdminApi.getSystemConfig().then((cfg) => {
      if (mounted) setMaintenanceMode(cfg.maintenanceMode);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleToggleLockdown = async () => {
    try {
      setIsTogglingLockdown(true);
      const res = await superAdminApi.toggleLockdown();
      setMaintenanceMode(res.maintenanceMode);
    } catch (err: any) {
      alert(`Lockdown toggle failed: ${err.message}`);
    } finally {
      setIsTogglingLockdown(false);
    }
  };

  const handlePurgeCache = async () => {
    try {
      setIsPurging(true);
      await superAdminApi.purgeCache();
      alert('System-wide Redis & Edge cache purged successfully.');
    } catch (err: any) {
      alert(`Cache purge failed: ${err.message}`);
    } finally {
      setIsPurging(false);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    window.location.href = '/super-admin/login';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#040812]/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Clearance & System State Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-300 font-mono shadow-[0_0_12px_rgba(6,182,212,0.15)]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold tracking-wider">ROOT CLEARANCE: LEVEL-0</span>
        </div>

        {maintenanceMode && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/60 px-3 py-1 text-xs text-rose-300 font-mono animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>EMERGENCY LOCKDOWN ACTIVE</span>
          </div>
        )}
      </div>

      {/* Right Controls: Quick Actions + Language + Theme + Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Emergency Lockdown Toggle */}
        <button
          type="button"
          onClick={handleToggleLockdown}
          disabled={isTogglingLockdown}
          className={`hidden md:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold transition ${
            maintenanceMode
              ? 'border-rose-500 bg-rose-900/60 text-rose-200 hover:bg-rose-900'
              : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-amber-500 hover:text-amber-300'
          }`}
          title="Toggle system maintenance lockdown"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>{maintenanceMode ? 'LIFT LOCKDOWN' : 'EMERGENCY LOCKDOWN'}</span>
        </button>

        {/* Flush Cache Button */}
        <button
          type="button"
          onClick={handlePurgeCache}
          disabled={isPurging}
          className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition"
          title="Flush all system Redis & Edge caches"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isPurging ? 'animate-spin' : ''}`} />
          <span>FLUSH CACHE</span>
        </button>

        {/* Multilingual Selector */}
        <div className="shrink-0">
          <LanguageSelector />
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/90 py-1 pl-1.5 pr-2.5 hover:border-cyan-400 transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-xs font-bold text-white shadow-sm font-mono">
              SA
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-white leading-tight font-mono">Super Admin</span>
              <span className="text-[9px] text-cyan-400 leading-none">ROOT ACCESS</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-cyan-900/60 bg-[#091122] p-2 text-slate-200 shadow-2xl shadow-black/80 backdrop-blur-xl z-50">
              <div className="border-b border-slate-800/80 p-2.5 mb-1">
                <p className="text-xs font-bold text-white font-mono">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-cyan-400 font-mono truncate">{user?.email || 'superadmin@gem.gov.in'}</p>
                <span className="mt-1 inline-block rounded bg-cyan-950 border border-cyan-800/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300">
                  SYSTEM ADMINISTRATION
                </span>
              </div>

              <Link
                href="/super-admin/dashboard"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-cyan-950/60 hover:text-cyan-300 transition"
              >
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Command Deck Overview</span>
              </Link>

              <Link
                href="/super-admin/security"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-cyan-950/60 hover:text-cyan-300 transition"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Forensic Security Vault</span>
              </Link>

              <Link
                href="/super-admin/config"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-cyan-950/60 hover:text-cyan-300 transition"
              >
                <Sliders className="h-4 w-4 text-amber-400" />
                <span>System Parameters &amp; Flags</span>
              </Link>

              <div className="my-1 border-t border-slate-800" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-950/60 transition"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Terminate Root Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
