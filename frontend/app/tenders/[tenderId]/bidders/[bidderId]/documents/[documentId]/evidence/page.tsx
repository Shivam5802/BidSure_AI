'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import {
  evidenceApi,
  ExtractedEvidence,
  EvidenceExtractionRun,
  EvidenceSummary,
  EvidenceSummaryHeader,
  EvidenceTable,
  EvidenceInspectorDrawer,
  AddManualEvidenceModal,
} from '@/features/evidence';

interface EvidencePageProps {
  params: Promise<{ tenderId: string; bidderId: string; documentId: string }>;
}

export default function DocumentEvidencePage({ params }: EvidencePageProps) {
  const resolvedParams = use(params);
  const { tenderId, bidderId, documentId } = resolvedParams;
  const router = useRouter();

  const [documentInfo, setDocumentInfo] = useState<{
    id: string;
    originalFilename: string;
    documentType: string;
    bidSubmissionId: string;
  } | null>(null);

  const [latestRun, setLatestRun] = useState<EvidenceExtractionRun | null>(null);
  const [evidenceList, setEvidenceList] = useState<ExtractedEvidence[]>([]);
  const [summary, setSummary] = useState<EvidenceSummary>({
    totalExtracted: 0,
    highConfidence: 0,
    reviewRequired: 0,
    humanVerified: 0,
    conflicts: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvidence, setSelectedEvidence] = useState<ExtractedEvidence | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await evidenceApi.getEvidenceForDocument(documentId);
      setDocumentInfo(res.document);
      setLatestRun(res.latestRun);
      setEvidenceList(res.evidence);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load document evidence facts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      void loadData();
    }
  }, [documentId]);

  const handleTriggerExtraction = async () => {
    setIsExtracting(true);
    setError(null);
    try {
      await evidenceApi.triggerExtraction(documentId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Extraction trigger failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVerify = async (item: ExtractedEvidence) => {
    try {
      await evidenceApi.verifyEvidenceFact(item.id, 'Procurement Officer');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to verify evidence fact.');
    }
  };

  const handleReject = async (item: ExtractedEvidence) => {
    const reason = window.prompt(
      `Enter reason for rejecting evidence fact (${item.fieldLabel}):`,
      'Data does not match supporting document scan'
    );
    if (!reason) return;

    try {
      await evidenceApi.rejectEvidenceFact(item.id, reason, 'Procurement Officer');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject evidence fact.');
    }
  };

  const handleInspect = (item: ExtractedEvidence) => {
    setSelectedEvidence(item);
    setIsInspectorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/tenders/${tenderId}/bidders/${bidderId}`)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bidder Workspace
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
          <div className="p-12 text-center bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading evidence facts...</p>
          </div>
        ) : (
          <>
            {documentInfo && (
              <EvidenceSummaryHeader
                document={documentInfo}
                latestRun={latestRun}
                summary={summary}
                onTriggerExtraction={handleTriggerExtraction}
                onOpenAddManual={() => setIsAddManualOpen(true)}
                onRefresh={loadData}
                isExtracting={isExtracting}
              />
            )}

            <EvidenceTable
              evidence={evidenceList}
              onInspect={handleInspect}
              onVerify={handleVerify}
              onReject={handleReject}
            />
          </>
        )}
      </div>

      {/* Evidence Provenance & Human Correction Drawer */}
      <EvidenceInspectorDrawer
        evidence={selectedEvidence}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onUpdateSuccess={loadData}
      />

      {/* Manual Evidence Modal */}
      <AddManualEvidenceModal
        documentId={documentId}
        isOpen={isAddManualOpen}
        onClose={() => setIsAddManualOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
