'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserCheck, Activity, Bell, LogOut, Shield } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from '@/components/theme';
import { LanguageSelector } from './LanguageSelector';

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [backendHealth, setBackendHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
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

  const userDisplayName = user?.name || 'Senior Procurement Officer';
  const userRole = user?.role || 'PROCUREMENT_OFFICER';
  const initials = userDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 transition-colors duration-200">
      {/* Search Bar / Context Indicator */}
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenders, bids, evidence..."
            disabled
            className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-4 text-xs text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none cursor-not-allowed"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Live Backend Connection Status */}
        <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3">
          <Activity className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">API:</span>
          {backendHealth === 'healthy' && (
            <Badge variant="success" className="text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
              Connected
            </Badge>
          )}
          {backendHealth === 'checking' && (
            <Badge variant="neutral" className="text-[11px]">
              Connecting...
            </Badge>
          )}
          {backendHealth === 'unreachable' && (
            <Badge variant="warning" className="text-[11px]">
              Offline
            </Badge>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <LanguageSelector />
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          type="button"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User Profile Area */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-xs font-semibold text-white ring-1 ring-slate-700 shadow-xs">
            {initials || 'PO'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[140px] truncate" title={userDisplayName}>
              {userDisplayName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {user?.email || 'officer@gem.gov.in'}
            </span>
          </div>
          <Badge
            variant={userRole === 'ADMIN' ? 'error' : 'default'}
            className="text-[10px] uppercase font-mono tracking-wider"
          >
            {userRole === 'ADMIN' ? (
              <>
                <Shield className="h-3 w-3 mr-0.5" />
                ADMIN
              </>
            ) : (
              <>
                <UserCheck className="h-3 w-3 mr-0.5" />
                OFFICER
              </>
            )}
          </Badge>
        </div>

        {/* Sign Out Action Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign out of procurement session"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </header>
  );
}
