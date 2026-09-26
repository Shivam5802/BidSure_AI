'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, LogOut, ExternalLink, Activity } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from '@/components/theme';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
import { LanguageSelector } from './LanguageSelector';

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [backendHealth, setBackendHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const data = await api.checkHealth();
        if (isMounted) {
          setBackendHealth(data.status === 'healthy' ? 'healthy' : 'unreachable');
        }
      } catch {
        if (isMounted) {
          setBackendHealth('unreachable');
        }
      }
    }

    void checkStatus();
    const interval = setInterval(checkStatus, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/login');
    } catch {
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userDisplayName = user?.name || (user?.role === 'BIDDER' ? 'Vikram Mehta' : 'Rajesh Kumar');
  // Strip redundant role in parentheses like "(Chief Estimator)" from the display name to prevent layout overflow
  const cleanDisplayName = userDisplayName.replace(/\s*\(.*?\)\s*/g, '').trim() || userDisplayName;

  const getUserRoleLabel = () => {
    if (user?.designation) return user.designation;
    if (user?.role === 'ADMIN') return 'System Administrator';
    if (user?.role === 'BIDDER') return 'Authorized Bidder';
    return 'Senior Procurement Officer';
  };

  const userRole = getUserRoleLabel();
  const initials = cleanDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || (user?.role === 'BIDDER' ? 'VM' : 'RK');

  const homeHref =
    user?.role === 'BIDDER'
      ? '/bidder/dashboard'
      : user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/dashboard';

  return (
    <header className="sticky top-0 z-40 flex h-[68px] w-full max-w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] px-3 sm:px-4 lg:px-6 select-none transition-colors duration-200 shadow-2xs overflow-hidden">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <Link href={homeHref} className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center filter drop-shadow-[0_2px_4px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform duration-150">
            <ShieldLogo className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>
          <div className="flex flex-col text-left justify-center">
            <div className="flex items-center text-[18px] sm:text-[20px] font-black tracking-[-0.03em] leading-none">
              <span className="text-[#0A2E5C] dark:text-white">Bid</span>
              <span className="text-[#1168CE] dark:text-[#38BDF8]">Sure</span>
            </div>
            <span className="text-[9px] sm:text-[9.5px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mt-0.5 leading-tight whitespace-nowrap">
              Government Procurement Compliance Platform
            </span>
          </div>
        </Link>

        {/* Vertical Divider (shown only on ultra-wide screens to guarantee zero overflow) */}
        <div className="hidden min-[1600px]:block h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

        {/* National Motto / Procurement Principle (shown only on ultra-wide screens) */}
        <div className="hidden min-[1600px]:flex items-center gap-2 text-[11.5px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          <span>Transparent Bids</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>Compliant Business</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-[#0B3558] dark:text-slate-300 font-semibold">A Stronger India</span>
        </div>
      </div>

      {/* Center: Search Tenders, Bids, Vendors, GeM ID */}
      <div className="hidden md:flex items-center flex-1 max-w-xs xl:max-w-sm mx-2 sm:mx-3 lg:mx-4 min-w-[160px]">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenders, bids, vendors..."
            className="h-9 w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-4 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1464B4] transition shadow-2xs"
          />
        </div>
      </div>

      {/* Right: Controls & User Officer Identity (Guaranteed to fit in display) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Day / Night Mode Pill */}
        <ThemeToggle variant="pill" />

        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="relative inline-flex items-center justify-center h-8.5 w-8.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-[#1464B4] shrink-0"
          aria-label="Notifications - 9 unread compliance alerts"
          title="9 unread alerts"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#071324]">
            9
          </span>
        </button>

        {/* User Officer Profile Pill with tight constraints and tooltip */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <div
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-[#0A2540] dark:bg-slate-800 text-white font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs"
            title={userDisplayName}
          >
            {initials}
          </div>
          <div className="hidden sm:flex flex-col text-left max-w-[100px] md:max-w-[120px] lg:max-w-[140px] xl:max-w-[170px] min-w-0">
            <span
              className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate"
              title={userDisplayName}
            >
              {cleanDisplayName}
            </span>
            <span
              className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate"
              title={userRole}
            >
              {userRole}
            </span>
          </div>

          {/* Quick Sign Out Action (always visible, never cut off) */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 ml-0.5"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
