'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, ArrowRight, Building, Calendar, Hash, FileText, Globe, IndianRupee, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tenderApi } from '@/features/tenders/api';

export default function CreateTenderPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    referenceNumber: '',
    organization: '',
    department: '',
    estimatedValue: '',
    category: 'TECHNICAL',
    closingDate: '',
    description: '',
    publishImmediately: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = 'Tender title is required (minimum 3 characters).';
    }
    if (!formData.referenceNumber.trim()) {
      errs.referenceNumber = 'Tender reference number is required.';
    } else if (!/^[a-zA-Z0-9\-_./]+$/.test(formData.referenceNumber.trim())) {
      errs.referenceNumber = 'Reference number contains invalid characters.';
    }
    if (!formData.organization.trim() || formData.organization.trim().length < 2) {
      errs.organization = 'Procuring organization / department is required.';
    }
    if (!formData.closingDate) {
      errs.closingDate = 'Closing / submission deadline date is required.';
    }
    if (formData.estimatedValue && (isNaN(Number(formData.estimatedValue)) || Number(formData.estimatedValue) <= 0)) {
      errs.estimatedValue = 'Estimated value must be a valid positive number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = await tenderApi.createTender({
        title: formData.title.trim(),
        referenceNumber: formData.referenceNumber.trim(),
        organization: formData.organization.trim(),
        department: formData.department.trim() || undefined,
        estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
        category: formData.category || 'TECHNICAL',
        closingDate: new Date(formData.closingDate).toISOString(),
        description: formData.description.trim() || undefined,
        publishImmediately: formData.publishImmediately,
      });

      // Route directly to tender document management
      router.push(`/tenders/${created.id}/documents`);
    } catch (err: any) {
      setServerError(err.message || 'Failed to create tender');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <Badge variant="neutral">Tender Dossier Ingestion</Badge>
        </div>

        {/* Form Container */}
        <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Create New Tender</CardTitle>
                <CardDescription className="text-xs">
                  Initiate a structured procurement compliance workspace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {serverError && (
              <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tender Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tender Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Procurement of High-Capacity Server Hardware for Data Center"
                    className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.title
                        ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  />
                </div>
                {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>}
              </div>

              {/* Reference Number & Organization */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Tender Reference Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, referenceNumber: e.target.value })
                      }
                      placeholder="e.g. GEM-2026-IT-9821"
                      className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.referenceNumber
                          ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    />
                  </div>
                  {errors.referenceNumber && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.referenceNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Procuring Organization / Ministry <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      placeholder="e.g. Ministry of Electronics and IT"
                      className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.organization
                          ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    />
                  </div>
                  {errors.organization && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.organization}</p>
                  )}
                </div>
              </div>

              {/* Department & Primary Category */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Department / Division (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. IT & Telecommunications Division"
                      className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Primary Category
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="TECHNICAL">TECHNICAL (Equipment / Software / IT)</option>
                      <option value="FINANCIAL">FINANCIAL (Commercial / Banking / Capital)</option>
                      <option value="STATUTORY">STATUTORY (Regulatory / Compliance / Legal)</option>
                      <option value="HSE">HSE (Health, Safety & Environment)</option>
                      <option value="EXPERIENCE">EXPERIENCE (Works / EPC / Turnkey Services)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Estimated Value & Closing Date */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Estimated Tender Value (INR) (Optional)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                      placeholder="e.g. 50000000 (5 Crore)"
                      className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.estimatedValue
                          ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    />
                  </div>
                  {errors.estimatedValue && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.estimatedValue}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Submission Closing Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={formData.closingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, closingDate: e.target.value })
                      }
                      className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.closingDate
                          ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    />
                  </div>
                  {errors.closingDate && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.closingDate}</p>
                  )}
                </div>
              </div>

              {/* Optional Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tender Scope / Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional contextual notes, division details, or delivery timelines..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Publication & Bidder Portal Visibility Card */}
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="publishImmediatelyToggle"
                          className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                        >
                          Publish to Bidder Portal Immediately
                        </label>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            formData.publishImmediately
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {formData.publishImmediately ? 'Status: PUBLISHED' : 'Status: DRAFT'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        When enabled, registered bidders will immediately see this tender on their portal (
                        <code className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 px-1 py-0.5 rounded">
                          /bidder/tenders
                        </code>
                        ), view eligibility details, and begin proposal preparation. You can still upload RFP documents at any time.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      id="publishImmediatelyToggle"
                      type="checkbox"
                      checked={formData.publishImmediately}
                      onChange={(e) =>
                        setFormData({ ...formData, publishImmediately: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/dashboard">
                  <Button variant="outline" type="button" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Creating Tender...'
                  ) : (
                    <>
                      Create Tender & Add Documents
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
