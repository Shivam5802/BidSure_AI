'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  Menu,
  User,
  KeyRound,
  ChevronDown,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/components/theme';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
import { LanguageSelector } from '@/components/header/LanguageSelector';
import { getRoleLabel, getRoleDashboard, getInitials } from '@/types/auth';

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Close profile dropdown on outside click ─────────────────────────────
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

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      setIsLoggingOut(true);
      await logout();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ── Derived values — all from database (user object), no hardcoding ─────
  const displayName = user?.name?.replace(/\s*\(.*?\)\s*/g, '').trim() || user?.email?.split('@')[0] || '—';
  const roleLabel   = user?.designation || getRoleLabel(user?.role);
  const initials    = getInitials(user?.name, user?.email);
  const homeHref    = getRoleDashboard(user?.role);

  const profileHref =
    user?.role === 'BIDDER'              ? '/bidder/profile'            :
    user?.role === 'ADMIN'               ? '/admin/profile'             :
    user?.role === 'SUPER_ADMIN'         ? '/super-admin/security'        :
                                           '/dashboard/profile';

  const changePasswordHref = `${profileHref}?tab=password`;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <header className="sticky top-0 z-40 flex h-[68px] w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] px-3 sm:px-4 lg:px-6 select-none transition-colors duration-200 shadow-sm">

      {/* ── LEFT: Mobile hamburger + Logo ── */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('bidguard:open-mobile-nav'))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden transition focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 group" title="Return to Home">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center filter drop-shadow-[0_2px_4px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform duration-150">
            <ShieldLogo className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>
          <div className="flex flex-col text-left justify-center">
            <div className="flex items-center text-[18px] sm:text-[20px] font-black tracking-[-0.03em] leading-none">
              <span className="text-[#0A2E5C] dark:text-white">Bid</span>
              <span className="text-[#1168CE] dark:text-[#38BDF8]">Sure</span>
            </div>
            <span className="hidden sm:block text-[9.5px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mt-0.5 leading-tight whitespace-nowrap">
              Government Procurement Compliance Platform
            </span>
          </div>
        </Link>
      </div>

      {/* ── RIGHT: Language + Theme + Notifications + Profile ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* Language Selector — same as home page navbar */}
        <LanguageSelector />

        {/* Theme Toggle — Sun / Moon */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-800 border border-[#D8E3EC] dark:border-slate-700 hover:border-[#1464B4] dark:hover:border-[#58A6FF] hover:bg-[#F4F8FC] dark:hover:bg-slate-700/60 text-[#0B3558] dark:text-slate-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4] shrink-0"
          title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-[#0B3558] transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-[#1464B4] shrink-0"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

        {/* ── Profile Pill + Dropdown ── */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0A2540] to-[#1464B4] text-white font-bold text-xs ring-2 ring-[#1464B4]/20 shadow-sm">
              {initials}
            </div>
            {/* Name + Role */}
            <div className="hidden sm:flex flex-col text-left max-w-[120px] lg:max-w-[150px] min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
                {roleLabel}
              </span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* ── Dropdown ── */}
          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1E35] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

              {/* User identity header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0A2540] to-[#1464B4] text-white font-bold text-xs">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {roleLabel}
                    </span>
                    {user?.email && (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <Link
                  href={profileHref}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1464B4] dark:hover:text-[#58AAFF] transition-colors group/item"
                >
                  <User className="h-4 w-4 text-slate-400 group-hover/item:text-[#1464B4] dark:group-hover/item:text-[#58AAFF] transition-colors" />
                  <span className="font-medium">View Profile</span>
                </Link>

                <Link
                  href={changePasswordHref}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1464B4] dark:hover:text-[#58AAFF] transition-colors group/item"
                >
                  <KeyRound className="h-4 w-4 text-slate-400 group-hover/item:text-[#1464B4] dark:group-hover/item:text-[#58AAFF] transition-colors" />
                  <span className="font-medium">Change Password</span>
                </Link>

                <Link
                  href={`${profileHref}?tab=security`}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1464B4] dark:hover:text-[#58AAFF] transition-colors group/item"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-400 group-hover/item:text-[#1464B4] dark:group-hover/item:text-[#58AAFF] transition-colors" />
                  <span className="font-medium">Security Settings</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 dark:border-slate-800 py-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">{isLoggingOut ? 'Signing out…' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
