'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api/client';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  FileText,
  MapPin,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';

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

      const res = await api.registerBidder({
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

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Upper header */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Bidder Organization Registration
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            National Public Procurement Electronic Tender Workspace • Self-Service Onboarding
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          {/* Demo Pre-fill Action */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/20 p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                Evaluating BidGuard AI?
              </span>
            </div>
            <button
              type="button"
              onClick={fillDemoData}
              className="rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              Fill Sample Contractor Info
            </button>
          </div>

          {serverError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Section 1: Organization Details */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                1. Organization Legal Entity Details
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Apex Infrastructure Solutions Ltd"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {fieldErrors.companyName && (
                    <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Entity Constitution
                  </label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    GSTIN Identification
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27AAACA1234B1Z2"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs uppercase text-slate-900 dark:text-white font-mono transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {fieldErrors.gstin && (
                    <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.gstin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Permanent Account Number (PAN)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="AAACA1234B"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs uppercase text-slate-900 dark:text-white font-mono transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {fieldErrors.pan && <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.pan}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 44556"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Registered Corporate Address
                  </label>
                  <textarea
                    rows={2}
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    placeholder="Plot / Street / City / State / Pincode"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Authorized Representative Account */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                2. Authorized Signatory / Bid Manager Account
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Authorized Signatory Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Rajesh Singhania"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rep@contractor.co.in"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Portal Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Compliance Guarantee Notice */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>
                By registering, your organization agrees to submit authentic evidence documents for automated
                OCR and deterministic rule validation. Misrepresentation is subject to GeM debarment guidelines.
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Bidder Portal Account...
                </>
              ) : (
                <>
                  Complete Registration & Open Bidder Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already registered your organization?{' '}
              <a href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign in to Portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
