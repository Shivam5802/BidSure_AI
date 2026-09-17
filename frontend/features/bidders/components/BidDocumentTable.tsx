import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit3,
  Loader2,
  Tag,
  FileCheck2,
} from 'lucide-react';
import { BidDocument, BID_DOCUMENT_TYPE_LABELS } from '../types';

interface BidDocumentTableProps {
  documents: BidDocument[];
  onReviewClick: (doc: BidDocument) => void;
  onViewClick: (doc: BidDocument) => void;
  onRetryClick?: (docId: string) => void;
  onEvidenceClick?: (doc: BidDocument) => void;
}

export const BidDocumentTable: React.FC<BidDocumentTableProps> = ({
  documents,
  onReviewClick,
  onViewClick,
  onRetryClick,
  onEvidenceClick,
}) => {
  if (documents.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-500">
        No bid documents uploaded yet. Upload the bidder&apos;s supporting documents to begin processing and classification.
      </div>
    );
  }

  const getConfidenceBadge = (confidence: number | null, reviewRequired: boolean) => {
    if (confidence === null) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
          Pending
        </span>
      );
    }

    const pct = Math.round(confidence * 100);
    if (reviewRequired || pct < 75) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-3 h-3" />
          {pct}% — Low (Review Req)
        </span>
      );
    }
    if (pct >= 90) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          {pct}% — High Confidence
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
        <CheckCircle2 className="w-3 h-3" />
        {pct}% — Medium Confidence
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          Ingested Bid Documents Inventory
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-6">Document Name</th>
              <th className="py-3 px-6">Classification Type</th>
              <th className="py-3 px-6 text-center">Confidence</th>
              <th className="py-3 px-6 text-center">Potential Relevance</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="font-semibold">{doc.originalFilename}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {(doc.fileSize / 1024).toFixed(0)} KB • SHA-256: {doc.fileHash.slice(0, 10)}...
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {BID_DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                  </span>
                  {doc.humanReviewed && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      Human Override
                    </span>
                  )}
                </td>

                <td className="py-4 px-6 text-center">
                  {getConfidenceBadge(doc.classificationConfidence, doc.reviewRequired)}
                </td>

                <td className="py-4 px-6 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {doc.possibleRequirementCategories && doc.possibleRequirementCategories.length > 0 ? (
                      doc.possibleRequirementCategories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          <Tag className="w-3 h-3 text-slate-400" />
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </div>
                </td>

                <td className="py-4 px-6 text-center">
                  {doc.processingStatus === 'COMPLETED' ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : doc.processingStatus === 'FAILED' ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing
                    </span>
                  )}
                </td>

                <td className="py-4 px-6 text-right space-x-2">
                  {onEvidenceClick && (
                    <button
                      onClick={() => onEvidenceClick(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <FileCheck2 className="w-3 h-3" />
                      Evidence
                    </button>
                  )}

                  {doc.reviewRequired && (
                    <button
                      onClick={() => onReviewClick(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Review
                    </button>
                  )}

                  <button
                    onClick={() => onViewClick(doc)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Details
                  </button>

                  {doc.processingStatus === 'FAILED' && onRetryClick && (
                    <button
                      onClick={() => onRetryClick(doc.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
