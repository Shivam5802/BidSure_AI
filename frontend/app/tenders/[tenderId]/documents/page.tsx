'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, Calendar, Hash, ShieldCheck, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tenderApi } from '@/features/tenders/api';
import { TenderDetailsResponse } from '@/features/tenders/types';
import { FileUploadDropzone } from '@/features/tenders/components/FileUploadDropzone';
import { ProcessingDashboard } from '@/features/tenders/components/ProcessingDashboard';

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export default function TenderDocumentsPage({ params }: PageProps) {
  const { tenderId } = use(params);

  const [data, setData] = useState<TenderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);

  const loadTender = async () => {
    try {
      setLoading(true);
      const res = await tenderApi.getTender(tenderId);
      setData(res);
      if (res.tender.documents.length === 0) {
        setShowUploadZone(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tender details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTender();
  }, [tenderId]);

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          Loading tender workspace...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-8 text-center">
          <h2 className="text-base font-bold text-red-700">Tender Workspace Unavailable</h2>
          <p className="mt-2 text-xs text-slate-600">{error || 'Tender not found'}</p>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { tender } = data;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Breadcrumb & Metadata Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {tender.referenceNumber}
                  </span>
                  <Badge variant={tender.status === 'READY' ? 'success' : 'neutral'}>
                    {tender.status}
                  </Badge>
                </div>
                <h1 className="mt-1 text-lg font-bold text-slate-900">{tender.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 mr-2">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>{tender.organization}</span>
              </div>
              <Link href={`/tenders/${tenderId}/requirements`}>
                <Button variant="outline" size="sm">
                  Requirements
                </Button>
              </Link>
              <Link href={`/tenders/${tenderId}/rules`}>
                <Button variant="outline" size="sm">
                  Rules Engine
                </Button>
              </Link>
              <Link href={`/tenders/${tenderId}/bidders`}>
                <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Bidders & Ingestion
                </Button>
              </Link>
              <Button
                variant={showUploadZone ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowUploadZone(!showUploadZone)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {showUploadZone ? 'Hide Upload' : 'Add PDFs'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Conditional Drag & Drop Zone */}
        {showUploadZone && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload Tender Documents</h3>
                <p className="text-xs text-slate-500">
                  Upload RFP, BoQ, Specifications, Corrigenda, and General Conditions.
                </p>
              </div>
              {tender.documents.length > 0 && (
                <button
                  onClick={() => setShowUploadZone(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Close
                </button>
              )}
            </div>
            <FileUploadDropzone
              tenderId={tenderId}
              onUploadSuccess={() => {
                loadTender();
              }}
            />
          </div>
        )}

        {/* Processing Dashboard & Status */}
        <ProcessingDashboard initialData={data} tenderId={tenderId} />
      </main>
    </div>
  );
}
