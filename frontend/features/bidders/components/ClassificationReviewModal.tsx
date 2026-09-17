import React, { useState } from 'react';
import { X, ShieldCheck, Tag, FileText, AlertCircle } from 'lucide-react';
import { BidDocument, BidDocumentType, BID_DOCUMENT_TYPE_LABELS } from '../types';

interface ClassificationReviewModalProps {
  document: BidDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (documentId: string, data: { documentType: BidDocumentType; reason: string; reviewedBy: string }) => Promise<void>;
}

export const ClassificationReviewModal: React.FC<ClassificationReviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedType, setSelectedType] = useState<BidDocumentType>(document?.documentType || 'UNKNOWN');
  const [reason, setReason] = useState('');
  const [reviewerName, setReviewerName] = useState('Procurement Officer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a brief justification for this manual reclassification.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(document.id, {
        documentType: selectedType,
        reason: reason.trim(),
        reviewedBy: reviewerName.trim() || 'Procurement Officer',
      });
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update classification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Human Classification Review
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {document.originalFilename}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Original AI Suggestion:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{BID_DOCUMENT_TYPE_LABELS[document.documentType]}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Confidence Score:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {document.classificationConfidence ? `${(document.classificationConfidence * 100).toFixed(0)}%` : 'N/A'}
              </span>
            </div>
            {document.classificationReason && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                &quot;{document.classificationReason}&quot;
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Select Correct Document Type *
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as BidDocumentType)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {(Object.keys(BID_DOCUMENT_TYPE_LABELS) as BidDocumentType[]).map((typeKey) => (
                <option key={typeKey} value={typeKey}>
                  {BID_DOCUMENT_TYPE_LABELS[typeKey]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Reviewer Justification / Notes *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Verified document contents manually. Contains Chartered Accountant UDIN turnover certificate."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Reviewing Officer Name
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? 'Updating Audit Log...' : 'Save Human Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
