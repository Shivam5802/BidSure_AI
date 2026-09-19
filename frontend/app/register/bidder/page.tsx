'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api/client';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Globe,
  Volume2,
  Accessibility,
  ArrowUp,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShieldLogo } from '@/components/ui/ShieldLogo';

export default function BidderRegistrationPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('Private Limited');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Authorized representative name is required.';
    if (!email.trim()) {
      errors.email = 'Official work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Invalid email address format.';
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (!companyName.trim()) {
      errors.companyName = 'Legal company name is required.';
    }

    if (gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.trim().toUpperCase())) {
        errors.gstin = 'Invalid GSTIN format (e.g., 27AAAAA0000A1Z5).';
      }
    }

    if (pan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan.trim().toUpperCase())) {
        errors.pan = 'Invalid PAN format (e.g., ABCDE1234F).';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setServerError(null);

      await api.registerBidder({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        companyName: companyName.trim(),
        companyType,
        gstin: gstin.trim().toUpperCase() || undefined,
        pan: pan.trim().toUpperCase() || undefined,
        registeredAddress: registeredAddress.trim() || undefined,
        contactPhone: phone.trim() || undefined,
      });

      // Automatically log the user in via AuthContext
      await login(email.trim().toLowerCase(), password);
      router.replace('/bidder/dashboard');
    } catch (err: any) {
      setIsSubmitting(false);
      setServerError(err.message || 'Registration failed. Please check your information.');
    }
  };

  const fillDemoData = () => {
    const timestamp = Date.now().toString().slice(-4);
    setFullName('Rajesh Singhania');
    setEmail(`rajesh.singhania_${timestamp}@apexinfra.co.in`);
    setPassword('Bidder@123');
    setPhone('+91 98200 44556');
    setCompanyName('Apex Infrastructure Solutions Ltd');
    setCompanyType('Public Limited');
    setGstin('27AAACA1234B1Z2');
    setPan('AAACA1234B');
    setRegisteredAddress('Tower 4, Bandra Kurla Complex, Mumbai, Maharashtra 400051');
    setFieldErrors({});
    setServerError(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScreenReaderAnnounce = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Bidder Organization Registration Portal.');
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative overflow-x-hidden">
      {/* 1. TOP GOVERNMENT UTILITY BAR */}
      <header className="w-full bg-[#031930] text-white text-xs py-2 px-4 sm:px-6 lg:px-12 border-b border-blue-950 flex flex-wrap items-center justify-between gap-3 z-30">
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

        <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] text-slate-300">
          <a href="#register-form" className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition">
            <Accessibility className="h-3.5 w-3.5 text-blue-400" />
            <span>Skip to main content</span>
          </a>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={handleScreenReaderAnnounce}
            className="hidden md:inline-flex items-center gap-1.5 hover:text-white transition cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5 text-blue-400" />
            <span>Screen Reader</span>
          </button>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`hover:text-blue-300 transition ${fontSize === 'lg' ? 'text-blue-400 underline' : ''}`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('md')}
              className={`hover:text-blue-300 transition ${fontSize === 'md' ? 'text-blue-400' : ''}`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`hover:text-blue-300 transition ${fontSize === 'sm' ? 'text-blue-400' : ''}`}
            >
              A-
            </button>
          </div>
          <span className="text-slate-600">|</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="inline-flex items-center gap-1.5 text-white font-medium hover:text-blue-300 transition"
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
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 transition"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN REGISTRATION SECTION WITH BACKGROUND WATERMARKS */}
      <main id="register-form" className="relative flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
        {/* Left Watermark */}
        <div
          className="pointer-events-none absolute left-2 lg:left-12 xl:left-20 top-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] lg:w-[400px] h-[360px] sm:h-[460px] lg:h-[540px] opacity-[0.12] select-none hidden md:block"
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

        {/* Right Watermark */}
        <div
          className="pointer-events-none absolute right-2 lg:right-8 xl:right-16 top-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] lg:w-[500px] h-[340px] sm:h-[420px] lg:h-[480px] opacity-[0.12] select-none hidden md:block"
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

        {/* Brand Header */}
        <div className="relative z-10 text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <div className="mx-auto flex items-center justify-center mb-3">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
              <ShieldLogo className="h-14 w-14 sm:h-16 sm:w-16" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A2540]">
            Bidder Organization Registration
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] font-bold tracking-wide text-[#0A2E5C] uppercase">
            GeM Public Procurement Self-Service Onboarding
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-2.5 text-xs text-slate-500 font-medium">
            <span className="h-[1.5px] w-6 sm:w-10 bg-[#EAB308]" aria-hidden="true" />
            <span>Direct Vendor Enrollment for Electronic Tendering</span>
            <span className="h-[1.5px] w-6 sm:w-10 bg-[#EAB308]" aria-hidden="true" />
          </div>
        </div>

        {/* Main Form Card */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0A2540] transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Login</span>
              </Link>

              {/* Demo Pre-fill Action */}
              <button
                type="button"
                onClick={fillDemoData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Fill Sample Contractor Info</span>
              </button>
            </div>

            {serverError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Section 1: Legal Entity Details */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2E5C] border-b border-slate-200 pb-2">
                  1. Organization Legal Entity Details
                </h2>
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Legal Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Apex Infrastructure Solutions Ltd"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {fieldErrors.companyName && (
                      <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Entity Constitution
                    </label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Private Limited">Private Limited Company</option>
                      <option value="Public Limited">Public Limited Company</option>
                      <option value="Partnership / LLP">Partnership / LLP</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Joint Venture">Joint Venture / Consortium</option>
                      <option value="PSU / Government Entity">PSU / Government Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GSTIN Identification
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AAACA1234B1Z2"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs uppercase text-slate-900 font-mono transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {fieldErrors.gstin && (
                      <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.gstin}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Permanent Account Number (PAN)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="AAACA1234B"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs uppercase text-slate-900 font-mono transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {fieldErrors.pan && <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.pan}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200 44556"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Authorized Representative Account */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2E5C] border-b border-slate-200 pb-2">
                  2. Authorized Signatory / Portal Credentials
                </h2>
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Authorized Representative Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Rajesh Singhania"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contractor@company.co.in"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Password * (Min. 8 characters)
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Office Address
                    </label>
                    <textarea
                      rows={2}
                      value={registeredAddress}
                      onChange={(e) => setRegisteredAddress(e.target.value)}
                      placeholder="Registered business address with City, State, PIN..."
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Compliance Commitment */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  By registering, your organization agrees to submit authentic evidence documents for automated
                  OCR and deterministic rule validation under GFR 2017.
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full justify-center rounded-xl bg-[#0A2540] hover:bg-[#071D33] py-3 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Bidder Portal Account...
                  </>
                ) : (
                  <>
                    Complete Registration &amp; Open Bidder Workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                Already registered your organization?{' '}
                <Link href="/login" className="font-bold text-[#1D64EC] hover:underline">
                  Sign in to Portal →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FULL-WIDTH FOOTER */}
      <footer className="w-full bg-[#031930] text-slate-300 py-4 px-4 sm:px-6 lg:px-12 border-t border-blue-950 z-30">
        <div className="w-full max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldLogo className="h-8 w-8" />
            <div className="flex flex-col text-left">
              <span className="text-white font-bold text-sm tracking-tight leading-tight">BidGuard AI</span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">Procurement. Verified.</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            <span>© 2026 BidGuard AI. All rights reserved.</span>
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-slate-300 font-medium">Government of India</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition text-[11px]"
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
