'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { ShieldLogo } from '@/components/ui/ShieldLogo';

import { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const rolesKey = allowedRoles ? allowedRoles.slice().sort().join(',') : '';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Prevent open redirect: Ensure 'next' parameter is strictly an internal relative path
        const safeNext =
          pathname && pathname.startsWith('/') && !pathname.startsWith('//') && !pathname.includes('://')
            ? pathname
            : '/dashboard';

        router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
        return;
      }

      // If specific roles required and user's role is not permitted:
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (user.role === 'BIDDER') {
          router.replace('/bidder/dashboard');
        } else if (user.role === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, rolesKey, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center filter drop-shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
            <ShieldLogo className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">BidSure</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Verifying Procurement Credentials...</p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // If specific roles are required and the user's role is not permitted, do NOT render children
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#1464B4]" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Redirecting to authorized dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
