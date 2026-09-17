'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  FileSearch,
  Layers,
  Table,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { tenderApi } from '../api';
import { TenderDetailsResponse, TenderDocument } from '../types';

interface ProcessingDashboardProps {
  initialData: TenderDetailsResponse;
  tenderId: string;
}

export function ProcessingDashboard({ initialData, tenderId }: ProcessingDashboardProps) {
  const [data, setData] = useState<TenderDetailsResponse>(initialData);
  const [isProcessingTriggered, setIsProcessingTriggered] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { tender, statistics } = data;
  const documents = tender.documents || [];

  const isAnyProcessing = documents.some((d) =>
    ['VALIDATING', 'STORED', 'PROCESSING', 'OCR_PROCESSING', 'EXTRACTING'].includes(
      d.processingStatus
    )
  );

  // Poll real backend state every 2 seconds while processing is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAnyProcessing || isProcessingTriggered) {
      interval = setInterval(async () => {
        try {
          const fresh = await tenderApi.getTender(tenderId);
          setData(fresh);
          const stillProcessing = fresh.tender.documents.some((d) =>
            ['VALIDATING', 'STORED', 'PROCESSING', 'OCR_PROCESSING', 'EXTRACTING'].includes(
              d.processingStatus
            )
          );
          if (!stillProcessing) {
            setIsProcessingTriggered(false);
          }
        } catch {
          // Keep current state on network flicker
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnyProcessing, isProcessingTriggered, tenderId]);

  const handleStartProcessing = async () => {
    setActionError(null);
    setIsProcessingTriggered(true);
    try {
      await tenderApi.startProcessing(tenderId);
      const fresh = await tenderApi.getTender(tenderId);
      setData(fresh);
    } catch (err: any) {
      setActionError(err.message || 'Failed to initiate document processing');
      setIsProcessingTriggered(false);
    }
  };

  const handleRetry = async (documentId: string) => {
    setActionError(null);
    setIsProcessingTriggered(true);
    try {
      await tenderApi.retryDocument(tenderId, documentId);
      const fresh = await tenderApi.getTender(tenderId);
      setData(fresh);
    } catch (err: any) {
      setActionError(err.message || 'Failed to retry document');
    }
  };

  const hasUnprocessed = documents.some((d) =>
    ['UPLOADED', 'FAILED'].includes(d.processingStatus)
  );

  return (
    <div className="space-y-8">
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Statistics Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Document Dataset Provenance
                </span>
                <Badge
                  variant={
                    tender.status === 'READY'
                      ? 'success'
                      : tender.status === 'PARTIAL'
                      ? 'warning'
                      : tender.status === 'FAILED'
                      ? 'error'
                      : 'neutral'
                  }
                >
                  {tender.status}
                </Badge>
              </div>
              <CardTitle className="mt-1 text-xl">Processing Summary</CardTitle>
            </div>

            {hasUnprocessed && (
              <Button
                variant="primary"
                size="md"
                onClick={handleStartProcessing}
                disabled={isAnyProcessing}
              >
                <Play className="h-4 w-4 mr-2" />
                {isAnyProcessing ? 'Processing Documents...' : 'Start Document Processing'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-left">
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-500">Documents</span>
              <p className="mt-1 text-xl font-bold text-slate-900">{statistics.documentCount}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-500">Total Pages</span>
              <p className="mt-1 text-xl font-bold text-slate-900">{statistics.totalPages}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-500">Processed Pages</span>
              <p className="mt-1 text-xl font-bold text-slate-900">{statistics.processedPages}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-500">OCR Pages</span>
              <p className="mt-1 text-xl font-bold text-blue-700">{statistics.ocrPages}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-500">Tables Detected</span>
              <p className="mt-1 text-xl font-bold text-purple-700">{statistics.tablesDetected}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-500">Review Required</span>
              <p
                className={`mt-1 text-xl font-bold ${
                  statistics.reviewRequired > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {statistics.reviewRequired}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Progress List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
          Tender Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm">No documents uploaded yet for this tender.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const isProcessing = [
                'VALIDATING',
                'STORED',
                'PROCESSING',
                'OCR_PROCESSING',
                'EXTRACTING',
              ].includes(doc.processingStatus);

              const isCompleted = doc.processingStatus === 'COMPLETED';
              const isPartial = doc.processingStatus === 'PARTIAL';
              const isFailed = doc.processingStatus === 'FAILED';

              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {doc.originalFilename}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{doc.pageCount} pages</span>
                          {doc.ocrUsed && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> OCR Applied
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            SHA: {doc.fileHash.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCompleted && (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {isPartial && (
                        <Badge variant="warning">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Partially Processed
                        </Badge>
                      )}
                      {isFailed && (
                        <Badge variant="error">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                      {doc.processingStatus === 'UPLOADED' && (
                        <Badge variant="neutral">Ready to Process</Badge>
                      )}

                      {(isCompleted || isPartial) && (
                        <Link href={`/tenders/${tenderId}/documents/${doc.id}`}>
                          <Button variant="outline" size="sm">
                            Inspect Pages
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}

                      {(isFailed || isPartial) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRetry(doc.id)}
                          disabled={isProcessing}
                        >
                          <RotateCw className="h-3.5 w-3.5 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Real-time Progress Bar & Stage Indicator */}
                  {isProcessing && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                        <span className="flex items-center gap-1.5 font-medium">
                          <RotateCw className="h-3.5 w-3.5 text-brand-600 animate-spin" />
                          {doc.currentStage || 'Processing...'}
                        </span>
                        <span className="font-mono font-semibold">{doc.processingProgress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-brand-600 transition-all duration-300"
                          style={{ width: `${doc.processingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {doc.processingError && (
                    <p className="mt-3 text-xs text-red-600 font-medium">
                      Error: {doc.processingError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
