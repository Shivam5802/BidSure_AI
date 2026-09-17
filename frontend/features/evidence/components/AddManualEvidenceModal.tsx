import React, { useState } from 'react';
import { AddManualEvidencePayload } from '../types';
import { X, Plus, FileText } from 'lucide-react';
import { evidenceApi } from '../api';

interface AddManualEvidenceModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_FIELD_KEYS = [
  { key: 'ANNUAL_TURNOVER', label: 'Annual Turnover' },
  { key: 'NET_WORTH', label: 'Net Worth' },
  { key: 'GSTIN', label: 'GST Identification Number' },
  { key: 'PAN', label: 'Permanent Account Number (PAN)' },
  { key: 'UDYAM_REGISTRATION_NUMBER', label: 'Udyam Registration Number' },
  { key: 'CIN', label: 'Corporate Identity Number (CIN)' },
  { key: 'EXPERIENCE_YEARS', label: 'Experience (Years)' },
  { key: 'SIMILAR_WORK_VALUE', label: 'Similar Completed Work Value' },
  { key: 'PROJECT_COMPLETION_DATE', label: 'Project Completion Date' },
  { key: 'OEM_AUTHORIZATION', label: 'OEM Authorization Status' },
  { key: 'ISO_CERTIFICATION', label: 'ISO Certification Standard' },
  { key: 'BID_SECURITY_EMD_AMOUNT', label: 'EMD / Bid Security Amount' },
  { key: 'BLACK_LISTING_DECLARATION', label: 'Blacklisting Declaration Status' },
];

export const AddManualEvidenceModal: React.FC<AddManualEvidenceModalProps> = ({
  documentId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fieldKey, setFieldKey] = useState('ANNUAL_TURNOVER');
  const [customKey, setCustomKey] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [sourceText, setSourceText] = useState('');
  const [reviewer, setReviewer] = useState('Procurement Officer');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalKey = fieldKey === 'CUSTOM' ? customKey.trim() : fieldKey;

    if (!finalKey) {
      setError('Please select or specify a field key.');
      return;
    }
    if (!rawValue.trim()) {
      setError('Please enter the raw value.');
      return;
    }
    if (!sourceText.trim()) {
      setError('Please enter the source text snippet for grounding.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: AddManualEvidencePayload = {
      fieldKey: finalKey,
      rawValue: rawValue.trim(),
      pageNumber: pageNumber || 1,
      sourceText: sourceText.trim(),
      reviewer: reviewer.trim() || 'Procurement Officer',
      reason: reason.trim() || 'Manually added evidence fact by procurement officer',
    };

    try {
      await evidenceApi.addManualEvidence(documentId, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add manual evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Add Manual Evidence Fact
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Field Parameter Key <span className="text-rose-500">*</span>
            </label>
            <select
              value={fieldKey}
              onChange={(e) => setFieldKey(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {COMMON_FIELD_KEYS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label} ({item.key})
                </option>
              ))}
              <option value="CUSTOM">+ Custom Field Key...</option>
            </select>
          </div>

          {fieldKey === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Field Key (SNAKE_CASE) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. WORK_EXPERIENCE_LOCATION"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Raw Extracted Value <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rs. 15.5 Crores or 07AAAAA0000A1Z5"
              value={rawValue}
              onChange={(e) => setRawValue(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Page Number
              </label>
              <input
                type="number"
                min={1}
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Officer Name
              </label>
              <input
                type="text"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Source Text Snippet (Grounding Quote) <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400">Anti-hallucination source link</span>
            </label>
            <textarea
              rows={2}
              placeholder="Paste exact verbatim sentence/snippet from document page..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Reason
            </label>
            <input
              type="text"
              placeholder="Optional comment on manual insertion..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add & Verify Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
