'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth';
import {
  ShieldAlert,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
import { toast } from '@/components/ui/Toast';

function SuperAdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rawReturn = searchParams.get('returnUrl');
  const returnUrl =
    rawReturn && rawReturn !== '/super-admin/login' && rawReturn.startsWith('/') && !rawReturn.startsWith('//')
      ? rawReturn
      : '/super-admin/dashboard';

  // If already authenticated as SUPER_ADMIN, route directly
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'SUPER_ADMIN') {
      router.replace(returnUrl);
    }
  }, [isLoading, isAuthenticated, user, router, returnUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      const msg = 'Super Admin email address and password are required.';
      setErrorMessage(msg);
      toast.warning('Credentials Required', { description: msg });
      return;
    }

    try {
      setIsSubmitting(true);
      const authUser = await login(trimmedEmail, password);

      if (authUser.role !== 'SUPER_ADMIN') {
        // Disallow non-super admins from this portal
        await logout();
        setIsSubmitting(false);
        const msg = `ACCESS DENIED: Role [${authUser.role}] is not authorized for Super Administrator access.`;
        setErrorMessage(msg);
        toast.error('Access Denied', { description: msg });
        return;
      }

      toast.success('Super Admin Authenticated', {
        description: 'Initializing secure command console...',
      });
      router.replace(returnUrl);
    } catch (err: any) {
      setIsSubmitting(false);
      const msg = err.message || 'Authentication failed: Invalid credentials.';
      setErrorMessage(msg);
      toast.error('Authentication Failed', { description: msg });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black overflow-hidden font-sans">
      {/* Background Matrix/Grid & Radial Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]"></div>
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">

          {/* Card Container */}
          <div className="relative rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-[#0b1329]/90 to-[#070d1e]/90 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.12)] backdrop-blur-xl">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-mono">
                Super Admin Login
              </h1>
              <p className="mt-1.5 text-xs text-slate-400">
                Enter your Super Administrator credentials to access the master system deck.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-200">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-mono text-[11px] leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300 font-mono">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="superadmin@example.com"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300 font-mono">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-cyan-200" />
                      <span>SIGN IN AS SUPER ADMIN</span>
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Back link */}
            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="text-[11px] text-slate-500 hover:text-slate-400 transition font-mono"
              >
                &larr; Return to Standard Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#030712] text-cyan-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SuperAdminLoginForm />
    </Suspense>
  );
}
