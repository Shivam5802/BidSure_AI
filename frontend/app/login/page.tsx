'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Info,
  User as UserIcon,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
import { DemoAccountsDropdown } from '@/components/auth/DemoAccountsDropdown';
import { toast } from '@/components/ui/Toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  // Safe redirect destination validation (prevents open redirects)
  const rawNext = searchParams.get('next');
  const safeNext =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('://')
      ? rawNext
      : '/dashboard';

  // If already authenticated, forward to destination immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'SUPER_ADMIN') {
        router.replace('/super-admin/dashboard');
      } else {
        router.replace(safeNext);
      }
    }
  }, [isLoading, isAuthenticated, router, safeNext, user]);

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
      toast.warning('Email Required', { description: 'Please enter your registered email address.' });
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Enter a valid email address.');
        toast.warning('Invalid Email Format', { description: 'Please enter a valid email address.' });
        valid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      if (valid) {
        toast.warning('Password Required', { description: 'Please enter your account password.' });
      }
      valid = false;
    }

    return valid;
  };

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const loggedUser = await login(normalizeEmailShortcut(loginEmail), loginPass);

      const isValidPath =
        rawNext &&
        rawNext.startsWith('/') &&
        !rawNext.startsWith('//') &&
        !rawNext.includes('://') &&
        rawNext !== '/login';

      const isBidderRoute = isValidPath && rawNext.startsWith('/bidder');
      const isAdminRoute = isValidPath && rawNext.startsWith('/admin');
      const isOfficerRoute = isValidPath && !isBidderRoute && !isAdminRoute;

      if (loggedUser?.role === 'SUPER_ADMIN') {
        await logout();
        setIsSubmitting(false);
        const msg = 'RESTRICTED ACCESS: Super Administrator accounts cannot be authenticated via the public portal. Please navigate to the secure Root Command Gateway.';
        setServerError(msg);
        toast.error('Restricted Access', { description: msg });
        return;
      }

      toast.success('Login Successful', {
        description: `Welcome back, ${loggedUser?.name || 'Officer'}!`,
      });

      if (loggedUser?.role === 'BIDDER') {
        if (isBidderRoute) {
          router.replace(rawNext);
        } else {
          router.replace('/bidder/dashboard');
        }
      } else if (loggedUser?.role === 'ADMIN') {
        if (isAdminRoute && rawNext !== '/admin/dashboard') {
          router.replace(rawNext);
        } else {
          router.replace('/dashboard');
        }
      } else {
        if (isOfficerRoute && rawNext !== '/dashboard') {
          router.replace(rawNext);
        } else {
          router.replace('/dashboard');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      const msg = err.message || 'Invalid email or password.';
      setServerError(msg);
      toast.error('Authentication Failed', { description: msg });
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
    router.replace('/');
  };

  // Close demo dropdown on outside click
  useEffect(() => {
    if (!demoOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [demoOpen]);

  const handleDemoToggle  = () => setDemoOpen((v) => !v);
  const handleDemoOfficer = () => { handleFillDemo('officer@gem.gov.in', 'Officer@123', true); setDemoOpen(false); };
  const handleDemoAdmin   = () => { handleFillDemo('admin@gem.gov.in', 'Admin@123', true); setDemoOpen(false); };
  const handleDemoBidder  = () => { handleFillDemo('demo.bidder@bidguard.local', 'Bidder@123', true); setDemoOpen(false); };


  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative overflow-x-hidden">

      {/* 2. MAIN BODY WITH BACKGROUND WATERMARKS */}
      <main id="main-login-form" className="relative flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
        {/* Left Watermark: Ashoka Lion Emblem */}
        <div
          className="pointer-events-none absolute left-2 lg:left-12 xl:left-20 top-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] lg:w-[400px] h-[360px] sm:h-[460px] lg:h-[540px] opacity-[0.14] select-none hidden md:block"
          aria-hidden="true"
        >
          <Image
            src="/images/indian_emblem.png"
            alt=""
            fill
            sizes="400px"
            className="object-contain"
            priority
          />
        </div>

        {/* Right Watermark: Ashoka Lion Emblem */}
        <div
          className="pointer-events-none absolute right-2 lg:right-12 xl:right-20 top-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] lg:w-[400px] h-[360px] sm:h-[460px] lg:h-[540px] opacity-[0.14] select-none hidden md:block"
          aria-hidden="true"
        >
          <Image
            src="/images/indian_emblem.png"
            alt=""
            fill
            sizes="400px"
            className="object-contain"
            priority
          />
        </div>

        {/* Brand Header Section (Centered above login card) */}
        <div className="relative z-10 text-center max-w-xl mx-auto mb-6 sm:mb-8">
          {/* Official Royal Blue Shield Emblem */}
          <div className="mx-auto flex items-center justify-center mb-3.5">
            <div className="relative h-16 w-16 sm:h-18 sm:w-18 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:scale-105 transition-transform duration-200">
              <ShieldLogo className="h-16 w-16 sm:h-18 sm:w-18" />
            </div>
          </div>

          {/* Heading: BidGuard AI */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0A2540]">
            BidGuard <span className="text-[#1D64EC]">AI</span>
          </h1>

          {/* Subtitle: EVIDENCE-DRIVEN BID COMPLIANCE INTELLIGENCE PLATFORM */}
          <p className="mt-1.5 text-xs sm:text-[13px] font-bold tracking-[0.14em] text-[#0A2E5C] uppercase">
            EVIDENCE-DRIVEN BID COMPLIANCE INTELLIGENCE PLATFORM
          </p>

          {/* Gold Accent Lines: GeM National Public Procurement Portal Integration */}
          <div className="mt-2 flex items-center justify-center gap-2.5 text-xs text-slate-500 font-medium">
            <span className="h-[1.5px] w-6 sm:w-10 bg-[#EAB308]" aria-hidden="true" />
            <span>GeM National Public Procurement Portal Integration</span>
            <span className="h-[1.5px] w-6 sm:w-10 bg-[#EAB308]" aria-hidden="true" />
          </div>
        </div>

        {/* Central Sign-In Card */}
        <div className="relative z-10 w-full max-w-[480px]">

          {/* Quick Demo Dropdown */}
          <div ref={demoRef} className="relative mb-3">
            <button
              type="button"
              onClick={handleDemoToggle}
              className="w-full flex items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 text-xs font-bold text-[#0A2E5C] transition-all shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-[#1D64EC] shrink-0" />
                QUICK 1-CLICK DEMO ACCOUNTS
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {demoOpen ? 'Close' : 'Click to sign in instantly'}
              </span>
            </button>
            {demoOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-blue-200 bg-white shadow-xl overflow-hidden">
                <div className="p-2 space-y-1.5">
                  <button type="button" onClick={handleDemoOfficer} className="w-full rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 p-2.5 text-left flex items-center justify-between transition cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200"><UserIcon className="h-3.5 w-3.5" /></div>
                      <div>
                        <span className="block font-bold text-[#0A2540] text-[11px] leading-tight">Procurement Officer</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">officer@gem.gov.in</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-blue-600 text-white px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shrink-0">Sign In <ArrowRight className="h-2.5 w-2.5" /></span>
                  </button>
                  <button type="button" onClick={handleDemoAdmin} className="w-full rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 p-2.5 text-left flex items-center justify-between transition cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200"><UserIcon className="h-3.5 w-3.5" /></div>
                      <div>
                        <span className="block font-bold text-[#0A2540] text-[11px] leading-tight">System Administrator</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">admin@gem.gov.in</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-purple-600 text-white px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shrink-0">Sign In <ArrowRight className="h-2.5 w-2.5" /></span>
                  </button>
                  <button type="button" onClick={handleDemoBidder} className="w-full rounded-lg border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 p-2.5 text-left flex items-center justify-between transition cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200"><Building2 className="h-3.5 w-3.5" /></div>
                      <div>
                        <span className="block font-bold text-[#0A2540] text-[11px] leading-tight">Demo Bidder (Contractor)</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">demo.bidder@bidguard.local</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shrink-0">Sign In <ArrowRight className="h-2.5 w-2.5" /></span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(10,37,64,0.08),0_1px_3px_rgba(0,0,0,0.05)] p-6 sm:p-8">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1D64EC] via-[#3B82F6] to-[#EAB308]" aria-hidden="true" />

            {/* Header row: Back button & Security badge */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0A2540] bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs group cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-[#0A2540] transition-transform" />
                <span>Back to Home</span>
              </button>
            </div>

            {/* Section Heading */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">Portal Authentication</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter your institutional credentials to access your procurement workspace</p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Address Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-700 tracking-tight"
                  >
                    Registered Email Address
                  </label>
                  <span className="text-[10.5px] font-medium text-slate-400">
                    GeM / NIC / Vendor ID
                  </span>
                </div>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-label="Official Work Email Address / Registered Email Address"
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="officer@gem.gov.in"
                    className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                      emailError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#1D64EC]'
                    }`}
                  />
                </div>
                {emailError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-slate-700 tracking-tight"
                  >
                    Password
                  </label>
                  <span className="text-[10.5px] font-medium text-slate-400">
                    Institutional Access Key
                  </span>
                </div>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    aria-label="Password"
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="••••••••••••"
                    className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-11 text-xs text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                      passwordError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#1D64EC]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 transition focus:outline-none cursor-pointer"
                  >
                    <span className="p-1 rounded-md hover:bg-slate-100 transition">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </span>
                  </button>
                </div>
                {passwordError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full justify-center rounded-xl bg-gradient-to-r from-[#0A2540] to-[#0D3156] hover:from-[#071D33] hover:to-[#0A2540] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      <span>Verifying Credentials {'&'} Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <a
                  href="/register"
                  className="font-bold text-[#1D64EC] hover:text-[#0A2540] hover:underline underline-offset-2 transition-colors"
                >
                  Create Account
                </a>
              </p>
            </div>

            </div>
          </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-[#0A2540]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D64EC]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
