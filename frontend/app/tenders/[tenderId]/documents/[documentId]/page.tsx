'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Hash,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { tenderApi } from '@/features/tenders/api';
import { DocumentWithPages, DocumentPage } from '@/features/tenders/types';
import { PageDetailModal } from '@/features/tenders/components/PageDetailModal';

interface PageProps {
  params: Promise<{ tenderId: string; documentId: string }>;
}

export default function DocumentDetailPage({ params }: PageProps) {
  const { tenderId, documentId } = use(params);

  const [document, setDocument] = useState<DocumentWithPages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<DocumentPage | null>(null);

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        const data = await tenderApi.getDocument(tenderId, documentId);
        setDocument(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load document details');
      } finally {
        setLoading(false);
      }
    }
    loadDocument();
  }, [tenderId, documentId]);

  if (loading && !document) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          Loading document provenance...
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-8 text-center">
          <h2 className="text-base font-bold text-red-700">Document Unavailable</h2>
          <p className="mt-2 text-xs text-slate-600">{error || 'Document not found'}</p>
          <div className="mt-6">
            <Link href={`/tenders/${tenderId}/documents`}>
              <Button variant="outline" size="sm">
                Back to Documents
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pages = document.pages || [];
  const nativeCount = pages.filter((p) => p.hasTextLayer).length;
  const ocrCount = pages.filter((p) => p.ocrUsed).length;
  const reviewCount = pages.filter((p) => p.reviewRequired).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/tenders/${tenderId}/documents`}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                title="Back to Tender Documents"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      document.processingStatus === 'COMPLETED'
                        ? 'success'
                        : document.processingStatus === 'PARTIAL'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {document.processingStatus}
                  </Badge>
                  <span className="font-mono text-xs text-slate-400">
                    ID: {document.id}
                  </span>
                </div>
                <h1 className="mt-1 text-lg font-bold text-slate-900">
                  {document.originalFilename}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/tenders/${tenderId}/documents`}>
                <Button variant="outline" size="sm">
                  Tender Documents View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Document Diagnostics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document Processing Diagnostics</CardTitle>
            <CardDescription className="text-xs">
              Cryptographic hash, storage key, and page quality analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-slate-500">File Size</span>
                <p className="mt-1 font-bold text-slate-900">
                  {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-slate-500">Total Pages</span>
                <p className="mt-1 font-bold text-slate-900">{pages.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-slate-500">Native Text Pages</span>
                <p className="mt-1 font-bold text-emerald-700">{nativeCount}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-slate-500">OCR Pages</span>
                <p className="mt-1 font-bold text-blue-700">{ocrCount}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-slate-500">Review Required</span>
                <p
                  className={`mt-1 font-bold ${
                    reviewCount > 0 ? 'text-amber-600' : 'text-slate-900'
                  }`}
                >
                  {reviewCount}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-slate-500">Storage Key</span>
                <p className="mt-1 font-mono text-[10px] text-slate-700 truncate" title={document.storageKey}>
                  {document.storageKey}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="font-semibold text-slate-700">SHA-256 Digest:</span>
              <span className="select-all bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                {document.fileHash}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Page Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Extracted Pages ({pages.length})
            </h3>
            <span className="text-xs text-slate-500">
              Click any page to inspect structured evidence blocks and provenance
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {pages.map((page) => {
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setSelectedPage(page)}
                  className="flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center transition hover:border-brand-500 hover:shadow-md cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600">
                    Page {page.pageNumber}
                  </span>

                  <div className="my-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="space-y-1">
                    {page.ocrUsed ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        <Sparkles className="h-2.5 w-2.5" /> OCR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Native
                      </span>
                    )}

                    {page.reviewRequired && (
                      <span className="block text-[10px] font-bold text-amber-600">
                        ⚠ Review
                      </span>
                    )}

                    <p className="text-[10px] text-slate-400">
                      {page.evidenceBlocks?.length || 0} blocks
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Page Evidence Inspection Modal */}
      <PageDetailModal
        page={selectedPage}
        documentFilename={document.originalFilename}
        onClose={() => setSelectedPage(null)}
      />
    </div>
  );
}
