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
  CreditCard,
  Hash,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShieldLogo } from '@/components/ui/ShieldLogo';

export default function BidderRegistrationPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('Private Limited');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        phone: phone.trim() || undefined,
        contactPhone: phone.trim() || undefined,
      });

      // Automatically log the user in via AuthContext
      try {
        await login(email.trim().toLowerCase(), password);
      } catch {
        // Fallback: token was saved by registerBidder
      }
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

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative overflow-x-hidden">

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
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(10,37,64,0.08),0_1px_3px_rgba(0,0,0,0.05)] p-6 sm:p-8">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1D64EC] via-[#3B82F6] to-[#EAB308]" aria-hidden="true" />

            {/* Header Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0A2540] bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs group cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-[#0A2540] transition-transform" />
                <span>Back to Home</span>
              </button>

              {/* Demo Pre-fill Action */}
              <button
                type="button"
                onClick={fillDemoData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/80 hover:from-blue-100 hover:to-indigo-100 px-3 py-1.5 text-xs font-bold text-[#1D64EC] hover:text-blue-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
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

            <form onSubmit={handleRegister} className="space-y-6" noValidate>
              {/* Section 1: Legal Entity Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/80">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[#1D64EC] font-bold text-[11px]">1</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2E5C]">
                    Organization Legal Entity Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Legal Company / Organization Name *
                    </label>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (fieldErrors.companyName) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.companyName;
                              return next;
                            });
                          }
                        }}
                        placeholder="e.g., Apex Infrastructure Solutions Ltd"
                        className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                          fieldErrors.companyName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-300 hover:border-slate-400 focus:border-[#1D64EC]'
                        }`}
                      />
                    </div>
                    {fieldErrors.companyName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{fieldErrors.companyName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Entity Constitution
                    </label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-white py-2.5 px-3 text-xs text-slate-900 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-[#1D64EC]"
                    >
                      <option value="Private Limited">Private Limited Company</option>
                      <option value="Public Limited">Public Limited Company</option>
                      <option value="Partnership / LLP">Partnership / LLP</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Joint Venture">Joint Venture / Consortium</option>
                      <option value="PSU / Government Entity">PSU / Government Enterprise</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 tracking-tight">
                        GSTIN Identification
                      </label>
                      <span className="text-[10px] text-slate-400">15-digit Alpha-numeric</span>
                    </div>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <Hash className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => {
                          setGstin(e.target.value.toUpperCase());
                          if (fieldErrors.gstin) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.gstin;
                              return next;
                            });
                          }
                        }}
                        placeholder="27AAACA1234B1Z2"
                        className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs uppercase text-slate-900 font-mono placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                          fieldErrors.gstin
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-300 hover:border-slate-400 focus:border-[#1D64EC]'
                        }`}
                      />
                    </div>
                    {fieldErrors.gstin && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{fieldErrors.gstin}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 tracking-tight">
                        Permanent Account Number (PAN)
                      </label>
                      <span className="text-[10px] text-slate-400">10-digit PAN</span>
                    </div>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        value={pan}
                        onChange={(e) => {
                          setPan(e.target.value.toUpperCase());
                          if (fieldErrors.pan) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.pan;
                              return next;
                            });
                          }
                        }}
                        placeholder="AAACA1234B"
                        className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs uppercase text-slate-900 font-mono placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                          fieldErrors.pan
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-300 hover:border-slate-400 focus:border-[#1D64EC]'
                        }`}
                      />
                    </div>
                    {fieldErrors.pan && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{fieldErrors.pan}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Contact Phone
                    </label>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98200 44556"
                        className="block w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-[#1D64EC]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Authorized Representative Account */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/80">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[#1D64EC] font-bold text-[11px]">2</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2E5C]">
                    Authorized Signatory &amp; Portal Credentials
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Authorized Representative Full Name *
                    </label>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fieldErrors.fullName) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.fullName;
                              return next;
                            });
                          }
                        }}
                        placeholder="e.g., Rajesh Singhania"
                        className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                          fieldErrors.fullName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-300 hover:border-slate-400 focus:border-[#1D64EC]'
                        }`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{fieldErrors.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Official Work Email Address *
                    </label>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.email;
                              return next;
                            });
                          }
                        }}
                        placeholder="contractor@company.co.in"
                        className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                          fieldErrors.email
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-300 hover:border-slate-400 focus:border-[#1D64EC]'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Account Password * (Min. 8 characters)
                    </label>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.password;
                              return next;
                            });
                          }
                        }}
                        placeholder="••••••••••••"
                        className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-11 text-xs text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                          fieldErrors.password
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
                    {fieldErrors.password && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Registered Office Address
                    </label>
                    <div className="relative rounded-xl group">
                      <div className="pointer-events-none absolute top-3 left-3 text-slate-400 group-focus-within:text-[#1D64EC] transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <textarea
                        rows={2}
                        value={registeredAddress}
                        onChange={(e) => setRegisteredAddress(e.target.value)}
                        placeholder="Registered business address with City, State, PIN..."
                        className="block w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-[#1D64EC]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Commitment */}
              <div className="rounded-xl border border-blue-100 bg-[#F0F7FF]/80 p-3.5 flex items-start gap-3 text-xs text-slate-700 shadow-2xs">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="leading-relaxed">
                  <span className="font-semibold text-[#0A2540]">GFR 2017 Compliance Protocol:</span>{' '}
                  <span>By registering, your organization agrees to submit authentic verifiable evidence documents for automated OCR extraction and deterministic rule engine audit.</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full justify-center rounded-xl bg-gradient-to-r from-[#0A2540] to-[#0D3156] hover:from-[#071D33] hover:to-[#0A2540] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    <span>Creating Bidder Portal Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration &amp; Open Bidder Workspace</span>
                    <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered your organization?{' '}
                <Link href="/login" className="font-bold text-[#1D64EC] hover:text-[#0A2540] transition hover:underline">
                  Sign in to Portal →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
