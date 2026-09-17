'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, ArrowRight, Building, Calendar, Hash, FileText } from 'lucide-react';
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
    closingDate: '',
    description: '',
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
        closingDate: new Date(formData.closingDate).toISOString(),
        description: formData.description.trim() || undefined,
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <Badge variant="neutral">Tender Dossier Ingestion</Badge>
        </div>

        {/* Form Container */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-white">
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
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tender Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tender Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Procurement of High-Capacity Server Hardware for Data Center"
                    className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-300 bg-white'
                    }`}
                  />
                </div>
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              {/* Reference Number & Organization */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.referenceNumber
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-slate-300 bg-white'
                      }`}
                    />
                  </div>
                  {errors.referenceNumber && (
                    <p className="mt-1 text-xs text-red-600">{errors.referenceNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.organization
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-slate-300 bg-white'
                      }`}
                    />
                  </div>
                  {errors.organization && (
                    <p className="mt-1 text-xs text-red-600">{errors.organization}</p>
                  )}
                </div>
              </div>

              {/* Closing Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className={`h-10 w-full rounded-md border pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.closingDate
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-slate-300 bg-white'
                    }`}
                  />
                </div>
                {errors.closingDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.closingDate}</p>
                )}
              </div>

              {/* Optional Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tender Scope / Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional contextual notes, division details, or delivery timelines..."
                  className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
