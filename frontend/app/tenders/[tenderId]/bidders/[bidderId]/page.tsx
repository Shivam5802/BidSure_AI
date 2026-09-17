'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Tag, FileText, Loader2, AlertCircle, RefreshCw, CheckCircle2, Calculator, Layers } from 'lucide-react';
import {
  Bidder,
  BidSubmission,
  BidDocument,
  BidDocumentType,
  bidderApi,
  DocumentUploadZone,
  BidDocumentTable,
  ClassificationReviewModal,
  DocumentDetailDrawer,
} from '@/features/bidders';
import { ComplianceEvaluationMatrix } from '@/features/evaluations';
import { ConflictCenterView } from '@/features/conflicts';
import { AlertTriangle } from 'lucide-react';

interface PageProps {
  params: Promise<{ tenderId: string; bidderId: string }>;
}

export default function BidderWorkspacePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { tenderId, bidderId } = resolvedParams;
  const router = useRouter();

  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<BidSubmission | null>(null);
  const [documents, setDocuments] = useState<BidDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'EVALUATION' | 'CONFLICTS'>('DOCUMENTS');

  const [selectedReviewDoc, setSelectedReviewDoc] = useState<BidDocument | null>(null);
  const [selectedDetailDoc, setSelectedDetailDoc] = useState<BidDocument | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const fetchWorkspace = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await bidderApi.getBidderDetails(tenderId, bidderId);
      setBidder(details.bidder);

      let sub = await bidderApi.getOrCreateSubmission(tenderId, bidderId);
      setActiveSubmission(sub);

      const docs = await bidderApi.getSubmissionDocuments(sub.id);
      setDocuments(docs);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load bidder workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId && bidderId) {
      void fetchWorkspace();
    }
  }, [tenderId, bidderId]);

  const handleUploadSuccess = async () => {
    if (activeSubmission) {
      const docs = await bidderApi.getSubmissionDocuments(activeSubmission.id);
      setDocuments(docs);
    }
  };

  const handleClassificationOverride = async (
    documentId: string,
    data: { documentType: BidDocumentType; reason: string; reviewedBy: string }
  ) => {
    await bidderApi.updateClassification(documentId, data);
    if (activeSubmission) {
      const docs = await bidderApi.getSubmissionDocuments(activeSubmission.id);
      setDocuments(docs);
    }
  };

  const handleRetry = async (documentId: string) => {
    await bidderApi.retryProcessing(documentId);
    if (activeSubmission) {
      const docs = await bidderApi.getSubmissionDocuments(activeSubmission.id);
      setDocuments(docs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/tenders/${tenderId}/bidders`)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bidders List
          </button>

          <button
            onClick={fetchWorkspace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Workspace
          </button>
        </div>

        {/* Workspace Header */}
        {bidder && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {bidder.bidderCode}
                </span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {bidder.legalName}
                </h1>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Ref: {activeSubmission?.submissionReference || 'SUB-DEFAULT'}</span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">{bidder.status}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-28">
                <span className="text-[11px] text-slate-500">Uploaded Docs</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{documents.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-28">
                <span className="text-[11px] text-slate-500">Classified</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {documents.filter((d) => d.classificationStatus === 'CLASSIFIED').length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'DOCUMENTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents & Evidence Ingestion
          </button>
          <button
            onClick={() => setActiveTab('EVALUATION')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'EVALUATION'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Compliance Evaluation Engine
          </button>
          <button
            onClick={() => setActiveTab('CONFLICTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'CONFLICTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Contradiction & Conflict Graph
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading bidder workspace...</p>
          </div>
        ) : activeTab === 'DOCUMENTS' ? (
          <>
            {/* Multi-file Upload Zone */}
            {activeSubmission && (
              <DocumentUploadZone
                submissionId={activeSubmission.id}
                onUploadSuccess={handleUploadSuccess}
              />
            )}

            {/* Ingested Documents Inventory Table */}
            <BidDocumentTable
              documents={documents}
              onReviewClick={(doc) => {
                setSelectedReviewDoc(doc);
                setIsReviewModalOpen(true);
              }}
              onViewClick={(doc) => {
                setSelectedDetailDoc(doc);
                setIsDetailDrawerOpen(true);
              }}
              onEvidenceClick={(doc) => {
                router.push(`/tenders/${tenderId}/bidders/${bidderId}/documents/${doc.id}/evidence`);
              }}
              onRetryClick={handleRetry}
            />
          </>
        ) : activeTab === 'EVALUATION' ? (
          /* Deterministic Compliance Evaluation Engine Tab */
          <ComplianceEvaluationMatrix
            bidderId={bidderId}
            bidderName={bidder?.legalName}
          />
        ) : (
          /* Feature 1I Contradiction Engine & Evidence Conflict Graph Tab */
          <ConflictCenterView
            bidderId={bidderId}
            bidderName={bidder?.legalName}
            tenderId={tenderId}
          />
        )}
      </div>

      {/* Human Classification Review Modal */}
      <ClassificationReviewModal
        document={selectedReviewDoc}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleClassificationOverride}
      />

      {/* Document Provenance Detail Drawer */}
      <DocumentDetailDrawer
        document={selectedDetailDoc}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onReviewClick={(doc) => {
          setSelectedReviewDoc(doc);
          setIsReviewModalOpen(true);
        }}
      />
    </div>
  );
}
