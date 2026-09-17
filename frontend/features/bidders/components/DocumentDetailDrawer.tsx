import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Tag, Info, Database } from 'lucide-react';
import { BidDocument, BID_DOCUMENT_TYPE_LABELS } from '../types';

interface DocumentDetailDrawerProps {
  document: BidDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewClick?: (doc: BidDocument) => void;
}

export const DocumentDetailDrawer: React.FC<DocumentDetailDrawerProps> = ({
  document,
  isOpen,
  onClose,
  onReviewClick,
}) => {
  if (!isOpen || !document) return null;

  const confidencePct = document.classificationConfidence
    ? Math.round(document.classificationConfidence * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {document.originalFilename}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {(document.fileSize / 1024).toFixed(0)} KB • SHA-256: {document.fileHash.slice(0, 12)}...
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Classification Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                Classification Type
              </span>
              {document.reviewRequired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3" />
                  Review Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  Classified
                </span>
              )}
            </div>

            <div className="text-base font-bold text-slate-900 dark:text-white">
              {BID_DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Confidence Score:</span>
                <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{confidencePct}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Processing State:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{document.processingStatus}</p>
              </div>
            </div>

            {document.classificationReason && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-500">Classification Reason:</span>
                <p className="mt-0.5 italic">&quot;{document.classificationReason}&quot;</p>
              </div>
            )}
          </div>

          {/* Potential Requirement Relevance */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" />
              Potential Requirement Categories
            </h3>
            <p className="text-[11px] text-slate-500">
              Candidate requirement mapping indicating which tender requirement categories this document MAY be relevant to. Note: Document classification is only classification and does NOT constitute final compliance evaluation.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {document.possibleRequirementCategories && document.possibleRequirementCategories.length > 0 ? (
                document.possibleRequirementCategories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    <Tag className="w-3 h-3" />
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">No specific category mapped yet.</span>
              )}
            </div>
          </div>

          {/* Provenance Chain */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              Document Provenance Chain
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-20 font-bold text-slate-400">Submission ID:</span>
                <span>{document.bidSubmissionId}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-20 font-bold text-slate-400">Document ID:</span>
                <span>{document.id}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-20 font-bold text-slate-400">Pages Count:</span>
                <span>{document.pageCount} page(s) extracted</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-20 font-bold text-slate-400">OCR Used:</span>
                <span>{document.ocrUsed ? 'Yes (Text-poor fallback OCR)' : 'No (Native PDF Text Layer)'}</span>
              </div>
            </div>
          </div>

          {/* Audit & Human Review Trail */}
          {document.humanReviewed && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200">
                <ShieldCheck className="w-4 h-4" />
                Human Review Override Recorded
              </div>
              <p className="text-purple-700 dark:text-purple-300">
                Reviewed by: <span className="font-semibold">{document.reviewedBy || 'Procurement Officer'}</span>
              </p>
              {document.reviewedAt && (
                <p className="text-[11px] text-purple-600 dark:text-purple-400">
                  Timestamp: {new Date(document.reviewedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between">
          {document.reviewRequired && onReviewClick ? (
            <button
              onClick={() => {
                onClose();
                onReviewClick(document);
              }}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors text-center"
            >
              Manually Override Document Classification
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close Drawer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
