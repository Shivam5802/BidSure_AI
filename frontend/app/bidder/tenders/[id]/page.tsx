'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { PublishedTenderDetail, TenderApplicationData } from '@/types/application';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  FileCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderTenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params.id as string;

  const [tender, setTender] = useState<PublishedTenderDetail | null>(null);
  const [existingApp, setExistingApp] = useState<TenderApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingApp, setIsStartingApp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'requirements' | 'protocol'>('checklist');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [tenderData, myApps] = await Promise.all([
          api.getPublishedTender(tenderId),
          api.getMyApplications().catch(() => []),
        ]);

        if (isMounted) {
          setTender(tenderData);
          const matched = myApps.find((a: any) => a.tenderId === tenderId);
          if (matched) {
            setExistingApp(matched);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load tender details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (tenderId) {
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, [tenderId]);

  const handleStartApplication = async () => {
    if (existingApp) {
      router.push(`/bidder/applications/${existingApp.id}`);
      return;
    }

    try {
      setIsStartingApp(true);
      setError(null);
      const newApp = await api.createApplication(tenderId);
      router.push(`/bidder/applications/${newApp.id}`);
    } catch (err: any) {
      setIsStartingApp(false);
      setError(err.message || 'Failed to create application draft.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading tender specifications...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
        <h2 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Tender Not Found</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The requested tender may have been closed or archived.
        </p>
        <Link href="/bidder/tenders" className="mt-4 inline-block">
          <Button size="sm" variant="outline" className="rounded-xl text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Tenders
          </Button>
        </Link>
      </div>
    );
  }

  const formattedValue = tender.estimatedValue
    ? `₹${(tender.estimatedValue / 10000000).toFixed(2)} Crore`
    : 'Not Disclosed';

  return (
    <div className="space-y-6">
      {/* Back link & Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/bidder/tenders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tender Directory
        </Link>
        <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-3 py-0.5 text-xs font-bold uppercase">
          Open For Submission
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {tender.tenderNumber}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Published {tender.publishedAt ? new Date(tender.publishedAt).toLocaleDateString() : 'Active'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {tender.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="h-4 w-4 text-slate-400" />
                {tender.organization}
                {tender.department ? ` • ${tender.department}` : ''}
              </span>
              <span>•</span>
              <span>
                Estimated Value: <strong className="text-slate-900 dark:text-white font-bold">{formattedValue}</strong>
              </span>
              {tender.submissionDeadline && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                    <Calendar className="h-4 w-4" />
                    Deadline: {new Date(tender.submissionDeadline).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>

            {tender.summary && (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                {tender.summary}
              </p>
            )}
          </div>

          {/* Application Action Button Box */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 shrink-0 sm:min-w-[260px] text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Electronic Submission
            </div>
            {existingApp ? (
              <div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                  Application <strong className="font-mono text-indigo-600">{existingApp.applicationNumber}</strong> is currently {existingApp.status}.
                </p>
                <Button
                  onClick={handleStartApplication}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  {existingApp.status === 'DRAFT' ? 'Continue Application' : 'Inspect Submitted Dossier'}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                  Prepare and submit your evidence documents for automated compliance verification.
                </p>
                <Button
                  onClick={handleStartApplication}
                  disabled={isStartingApp}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  {isStartingApp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      Apply for Tender
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            )}
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Non-repudiation and OCR verification active
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === 'checklist'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Eligibility Checklist ({tender.eligibilityChecklist?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requirements')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === 'requirements'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tender Requirements Specification ({tender.requirements?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('protocol')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === 'protocol'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Submission Protocol & Governance
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'checklist' && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ensure your organization possesses and uploads the corresponding evidence documents for each mandatory criterion.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tender.eligibilityChecklist?.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.mandatory
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {item.mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    Recommended Document: <span className="underline">{item.recommendedDocument}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-4 pt-2">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-20">Req #</th>
                    <th className="py-3 px-4 w-28">Category</th>
                    <th className="py-3 px-4">Description & Acceptance Criteria</th>
                    <th className="py-3 px-4 w-32">Verification Method</th>
                    <th className="py-3 px-4 w-24">Clause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {tender.requirements?.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {req.requirementNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{req.description}</p>
                        {req.acceptanceCriteria && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Criteria: {req.acceptanceCriteria}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400">
                        {req.verificationMethod || 'DOCUMENT_EVALUATION'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            req.mandatory
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                          }`}
                        >
                          {req.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'protocol' && (
          <div className="space-y-4 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">GeM Public Procurement Standards</h3>
              <p>
                1. <strong>Submission Lock & Immutability:</strong> Once your application is finalized and submitted, all uploaded evidence documents and company statements are permanently locked. No further modifications or file replacements are permitted unless formally requested by the Procurement Officer through an official Clarification Notice.
              </p>
              <p>
                2. <strong>Automated OCR Fact Extraction:</strong> The platform utilizes deep document parsing to extract financial turnover, safety metrics, and past project values directly from your certificates and balance sheets. Ensure scans are clear and legibly signed.
              </p>
              <p>
                3. <strong>Human Officer Decision Authority:</strong> While compliance verification runs deterministic audit formulas, final qualification or disqualification decisions are authored and approved solely by the designated Procurement Officer.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
