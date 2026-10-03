'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
import { FadeArc, Wave } from '@/components/ui/LoadingState';
import { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (pathname === '/super-admin/login' || pathname === '/login') {
        return;
      }
      const returnUrl = encodeURIComponent(pathname);
      if (pathname.startsWith('/super-admin')) {
        router.push(`/super-admin/login?returnUrl=${returnUrl}`);
      } else {
        router.push(`/login?returnUrl=${returnUrl}`);
      }
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Role-based routing to correct cockpit
      if (user.role === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard');
      } else if (user.role === 'BIDDER') {
        router.push('/bidder/dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center filter drop-shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
            <ShieldLogo className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">BidSure AI</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Verifying Procurement Credentials &amp; Role...</p>
          </div>
          <FadeArc className="size-8 text-[#1a6aef]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (pathname === '/super-admin/login' || pathname === '/login') {
      return <>{children}</>;
    }
    return null; // Will redirect via useEffect
  }

  // If specific roles are required and the user's role is not permitted, do NOT render children
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center space-y-3">
          <Wave className="h-6 text-[#1a6aef]" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Redirecting to authorized dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
