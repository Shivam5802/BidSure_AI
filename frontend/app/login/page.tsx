'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  Globe,
  Volume2,
  Accessibility,
  ArrowUp,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShieldLogo } from '@/components/ui/ShieldLogo';

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
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLangMenu, setShowLangMenu] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScreenReaderAnnounce = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Screen reader active. BidGuard AI Government Procurement Portal Login.');
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative overflow-x-hidden">
      {/* 1. TOP GOVERNMENT OF INDIA UTILITY BAR */}
      <header className="w-full bg-[#031930] text-white text-xs py-2 px-4 sm:px-6 lg:px-12 border-b border-blue-950 flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left: National Emblem & Digital India */}
        <div className="flex items-center gap-3">
          <div className="relative h-7 w-6 flex-shrink-0">
            <Image
              src="/images/emblem_white.png"
              alt="Government of India Emblem"
              fill
              sizes="24px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[13px] tracking-wide text-white">Government of India</span>
            <span className="text-[11px] text-slate-300 font-normal">Digital India</span>
          </div>
        </div>

        {/* Right: Accessibility Controls & Language */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] text-slate-300">
          <a
            href="#main-login-form"
            className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <Accessibility className="h-3.5 w-3.5 text-blue-400" />
            <span>Skip to main content</span>
          </a>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <button
            type="button"
            onClick={handleScreenReaderAnnounce}
            className="hidden md:inline-flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            title="Screen Reader Access"
          >
            <Volume2 className="h-3.5 w-3.5 text-blue-400" />
            <span>Screen Reader</span>
          </button>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Text Resizer */}
          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`hover:text-blue-300 transition ${fontSize === 'lg' ? 'text-blue-400 underline' : ''}`}
              title="Increase font size"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('md')}
              className={`hover:text-blue-300 transition ${fontSize === 'md' ? 'text-blue-400' : ''}`}
              title="Standard font size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`hover:text-blue-300 transition ${fontSize === 'sm' ? 'text-blue-400' : ''}`}
              title="Decrease font size"
            >
              A-
            </button>
          </div>

          <span className="text-slate-600">|</span>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="inline-flex items-center gap-1.5 text-white font-medium hover:text-blue-300 transition"
              aria-label="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span>{selectedLanguage}</span>
              <span className="text-[10px]">▼</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
                {['English', 'हिन्दी', 'मराठी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'ગુજરાતી'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 transition ${
                      selectedLanguage === lang ? 'font-bold text-blue-600 bg-blue-50/50' : ''
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

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

        {/* Right Watermark: Parliament / Rashtrapati Bhavan Architectural Line-Art */}
        <div
          className="pointer-events-none absolute right-2 lg:right-8 xl:right-16 top-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] lg:w-[500px] h-[340px] sm:h-[420px] lg:h-[480px] opacity-[0.15] select-none hidden md:block"
          aria-hidden="true"
        >
          <Image
            src="/images/parliament_facade.svg"
            alt=""
            fill
            sizes="500px"
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] p-6 sm:p-8">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0A2540] transition mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            {/* Workspace Title & Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0A2540]">Sign in to your Workspace</h2>
              <p className="mt-1 text-xs text-slate-500">
                Procurement officials, administrators, and registered bidders.
              </p>
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
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Registered Email Address
                </label>
                <div className="relative rounded-xl">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-400" />
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
                    className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      emailError
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>
                {emailError && <p className="mt-1 text-[11px] text-rose-500">{emailError}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative rounded-xl">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-400" />
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
                    className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      passwordError
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1 text-[11px] text-rose-500">{passwordError}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full justify-center rounded-xl bg-[#0A2540] hover:bg-[#071D33] py-3 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
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

            {/* Bidder Registration Card */}
            <div className="mt-5 rounded-xl border border-blue-100 bg-[#F0F7FF]/70 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-[#0A2540] text-xs leading-tight">
                    New Vendor / Contractor?
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Self-service bidder organization onboarding
                  </span>
                </div>
              </div>
              <Link
                href="/register/bidder"
                className="rounded-lg bg-[#0A2540] hover:bg-[#071D33] text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-xs"
              >
                <span>Register Bidder</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* QUICK 1-CLICK DEMO ACCOUNTS CONTAINER */}
            <div className="mt-5 rounded-xl border border-blue-200/80 bg-[#F0F7FF] p-4 text-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 font-bold text-[#0A2E5C] text-[11.5px] tracking-wide">
                  <Info className="h-3.5 w-3.5 text-[#1D64EC] shrink-0" />
                  <span>QUICK 1-CLICK DEMO ACCOUNTS</span>
                </div>
                <span className="text-[10px] text-slate-400">Click to sign in instantly</span>
              </div>

              <div className="space-y-2.5">
                {/* 1. Procurement Officer */}
                <button
                  type="button"
                  onClick={() => handleFillDemo('officer@gem.gov.in', 'Officer@123', true)}
                  className="w-full rounded-xl border border-blue-100 bg-white p-3 text-left shadow-xs flex items-center justify-between hover:border-blue-300 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100 transition">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#0A2540] text-xs leading-tight">
                        Procurement Officer
                      </span>
                      <span className="block text-[10.5px] text-slate-500 font-mono mt-0.5">
                        officer@gem.gov.in • Pass: Officer@123
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg border border-blue-600 text-blue-600 group-hover:bg-blue-600 group-hover:text-white px-3 py-1 text-xs font-semibold shrink-0 transition flex items-center gap-1">
                    <span>Sign In</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>

                {/* 2. System Administrator */}
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@gem.gov.in', 'Admin@123', true)}
                  className="w-full rounded-xl border border-blue-100 bg-white p-3 text-left shadow-xs flex items-center justify-between hover:border-blue-300 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100 transition">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#0A2540] text-xs leading-tight">
                        System Administrator
                      </span>
                      <span className="block text-[10.5px] text-slate-500 font-mono mt-0.5">
                        admin@gem.gov.in • Pass: Admin@123
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg border border-blue-600 text-blue-600 group-hover:bg-blue-600 group-hover:text-white px-3 py-1 text-xs font-semibold shrink-0 transition flex items-center gap-1">
                    <span>Sign In</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>

                {/* 3. Demo Bidder (Vendor) */}
                <button
                  type="button"
                  onClick={() => handleFillDemo('demo.bidder@bidguard.local', 'Bidder@123', true)}
                  className="w-full rounded-xl border border-blue-100 bg-white p-3 text-left shadow-xs flex items-center justify-between hover:border-blue-300 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-100 transition">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#0A2540] text-xs leading-tight">
                        Demo Bidder (Contractor)
                      </span>
                      <span className="block text-[10.5px] text-slate-500 font-mono mt-0.5">
                        demo.bidder@bidguard.local • Pass: Bidder@123
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg border border-emerald-600 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white px-3 py-1 text-xs font-semibold shrink-0 transition flex items-center gap-1">
                    <span>Sign In</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FULL-WIDTH DEEP NAVY INSTITUTIONAL FOOTER */}
      <footer className="w-full bg-[#031930] text-slate-300 py-4 px-4 sm:px-6 lg:px-12 border-t border-blue-950 z-30">
        <div className="w-full max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Shield Logo & BidGuard Identity */}
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 flex-shrink-0">
              <ShieldLogo className="h-8 w-8" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white font-bold text-sm tracking-tight leading-tight">BidGuard AI</span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">Procurement. Verified.</span>
            </div>
          </div>

          {/* Middle: Copyright & Government Attribution */}
          <div className="text-[11px] text-slate-400 text-center">
            <span>© 2026 BidGuard AI. All rights reserved.</span>
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-slate-300 font-medium">Government of India</span>
          </div>

          {/* Right: Institutional Links & Back to Top */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-400">
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/terms" className="hover:text-white transition">Terms &amp; Conditions</Link>
              <span className="text-slate-600">|</span>
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <span className="text-slate-600">|</span>
              <Link href="/accessibility" className="hover:text-white transition">Accessibility</Link>
              <span className="text-slate-600">|</span>
              <Link href="/help" className="hover:text-white transition">Help</Link>
              <span className="text-slate-600">|</span>
              <Link href="/sitemap" className="hover:text-white transition">Sitemap</Link>
              <span className="text-slate-600">|</span>
              <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
            </div>

            {/* Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition text-[11px]"
              aria-label="Back to Top"
            >
              <ArrowUp className="h-3 w-3" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </footer>
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
