'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Safe redirect destination validation (prevents open redirects)
  const rawNext = searchParams.get('next');
  const safeNext =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('://')
      ? rawNext
      : '/dashboard';

  // If already authenticated, forward to destination immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(safeNext);
    }
  }, [isLoading, isAuthenticated, router, safeNext]);

  const normalizeEmailShortcut = (val: string): string => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === 'officer' || trimmed === 'officer@gem' || trimmed === 'officer@gem.gov') {
      return 'officer@gem.gov.in';
    }
    if (trimmed === 'admin' || trimmed === 'admin@gem' || trimmed === 'admin@gem.gov') {
      return 'admin@gem.gov.in';
    }
    if (trimmed === 'bidder' || trimmed === 'demo.bidder' || trimmed === 'bidder@bidguard') {
      return 'demo.bidder@bidguard.local';
    }
    if (trimmed === 'contractor' || trimmed === 'contractor@gem' || trimmed === 'contractor@gem.gov') {
      return 'contractor@gem.gov.in';
    }
    return trimmed;
  };

  const validate = (): boolean => {
    let valid = true;
    setEmailError(null);
    setPasswordError(null);
    setServerError(null);

    const trimmedEmail = normalizeEmailShortcut(email);
    if (!trimmedEmail) {
      setEmailError('Email is required.');
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Enter a valid email address.');
        valid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    return valid;
  };

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const user = await login(normalizeEmailShortcut(loginEmail), loginPass);

      if (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('://') && rawNext !== '/dashboard') {
        router.replace(rawNext);
      } else if (user?.role === 'BIDDER') {
        router.replace('/bidder/dashboard');
      } else if (user?.role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setServerError(err.message || 'Invalid email or password.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    await executeLogin(email, password);
  };

  const handleFillDemo = (demoEmail: string, demoPass: string, autoLogin: boolean = true) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setEmailError(null);
    setPasswordError(null);
    setServerError(null);
    if (autoLogin) {
      void executeLogin(demoEmail, demoPass);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 select-none text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Theme Toggle in upper right corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Government Portal Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/20">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          BidGuard <span className="text-indigo-600 dark:text-indigo-400">AI</span>
        </h1>
        <p className="mt-1 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Evidence-Driven Bid Compliance Intelligence Platform
        </p>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          GeM National Public Procurement Portal Integration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sign in to your Workspace</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Procurement officers, administrators, and registered bidders.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Work Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Registered Email Address
              </label>
              <div className="relative mt-1.5 rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="officer@gem.gov.in"
                  className={`block w-full rounded-xl border bg-slate-50 dark:bg-slate-950/60 py-2.5 pl-10 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    emailError
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {emailError && <p className="mt-1 text-[11px] text-rose-500 dark:text-rose-400">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5 rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="••••••••••••"
                  className={`block w-full rounded-xl border bg-slate-50 dark:bg-slate-950/60 py-2.5 pl-10 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    passwordError
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-[11px] text-rose-500 dark:text-rose-400">{passwordError}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full justify-center rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Self-Registration Banner for Bidders */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              New Vendor / Contractor?{' '}
              <a
                href="/register/bidder"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Register Organization Portal <ArrowRight className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Development / Demo Quick Credentials Box */}
          <div className="mt-5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 text-[11px]">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>QUICK 1-CLICK DEMO ACCOUNTS</span>
              </div>
              <span className="text-[10px] text-slate-400">Click to sign in instantly</span>
            </div>
            <div className="mt-2.5 space-y-2">
              <button
                type="button"
                onClick={() => handleFillDemo('officer@gem.gov.in', 'Officer@123', true)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-2.5 text-left transition hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-slate-800 dark:text-slate-200 text-xs">Procurement Officer</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">officer@gem.gov.in • Pass: Officer@123</span>
                </div>
                <span className="rounded bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 shrink-0">Sign In ➔</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin@gem.gov.in', 'Admin@123', true)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-2.5 text-left transition hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-slate-800 dark:text-slate-200 text-xs">System Administrator</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">admin@gem.gov.in • Pass: Admin@123</span>
                </div>
                <span className="rounded bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 shrink-0">Sign In ➔</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('demo.bidder@bidguard.local', 'Bidder@123', true)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-2.5 text-left transition hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-slate-800 dark:text-slate-200 text-xs">Demo Bidder (Vendor)</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">demo.bidder@bidguard.local • Pass: Bidder@123</span>
                </div>
                <span className="rounded bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 shrink-0">Sign In ➔</span>
              </button>
            </div>
          </div>
        </div>

        {/* Governance Protocol Banner */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Decision Protocol: AI assists. Rules verify. Officer decides.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
