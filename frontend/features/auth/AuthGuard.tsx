'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Prevent open redirect: Ensure 'next' parameter is strictly an internal relative path starting with '/' and not '//'
      const safeNext =
        pathname && pathname.startsWith('/') && !pathname.startsWith('//') && !pathname.includes('://')
          ? pathname
          : '/dashboard';

      router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold tracking-tight text-white">BidGuard AI</h2>
            <p className="mt-1 text-xs text-slate-400">Verifying Procurement Credentials...</p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
