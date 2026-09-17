import React, { useState, useEffect } from 'react';
import {
  ExtractedEvidence,
  HumanCorrectionPayload,
  EvidenceValueType,
} from '../types';
import {
  X,
  ShieldCheck,
  History,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { evidenceApi } from '../api';

interface EvidenceInspectorDrawerProps {
  evidence: ExtractedEvidence | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export const EvidenceInspectorDrawer: React.FC<EvidenceInspectorDrawerProps> = ({
  evidence,
  isOpen,
  onClose,
  onUpdateSuccess,
}) => {
  const [rawValue, setRawValue] = useState('');
  const [normalizedValue, setNormalizedValue] = useState('');
  const [valueType, setValueType] = useState<EvidenceValueType>('STRING');
  const [unit, setUnit] = useState('');
  const [reason, setReason] = useState('');
  const [reviewer, setReviewer] = useState('Procurement Officer');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (evidence) {
      setRawValue(evidence.rawValue || '');
      setNormalizedValue(
        evidence.normalizedValue !== undefined && evidence.normalizedValue !== null
          ? typeof evidence.normalizedValue === 'object'
            ? JSON.stringify(evidence.normalizedValue, null, 2)
            : String(evidence.normalizedValue)
          : ''
      );
      setValueType(evidence.valueType || 'STRING');
      setUnit(evidence.unit || '');
      setReason('');

      // Fetch audit logs
      setLoadingHistory(true);
      evidenceApi
        .getEvidenceById(evidence.id)
        .then((res) => {
          setAuditLogs(res.auditLogs || []);
        })
        .catch((err) => {
          console.error('Failed to load audit history:', err);
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [evidence]);

  if (!isOpen || !evidence) return null;

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for the human correction/verification.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let parsedNormalized: any = normalizedValue;
    if (normalizedValue.trim()) {
      try {
        if (normalizedValue.trim().startsWith('{') || normalizedValue.trim().startsWith('[')) {
          parsedNormalized = JSON.parse(normalizedValue);
        } else if (!isNaN(Number(normalizedValue))) {
          parsedNormalized = Number(normalizedValue);
        }
      } catch {
        parsedNormalized = normalizedValue;
      }
    } else {
      parsedNormalized = null;
    }

    const payload: HumanCorrectionPayload = {
      rawValue,
      normalizedValue: parsedNormalized,
      valueType,
      unit: unit || undefined,
      reason: reason.trim(),
      reviewer: reviewer.trim() || 'Procurement Officer',
    };

    try {
      await evidenceApi.updateEvidenceByHuman(evidence.id, payload);
      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit correction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {evidence.fieldKey}
              </span>
              <span className="text-xs text-slate-400">Page {evidence.pageNumber}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {evidence.fieldLabel}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Text Grounding Box */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4 text-indigo-500" />
                Source Text Snippet Grounding
              </span>
              <span>Confidence: {Math.round(evidence.confidence * 100)}%</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-800 dark:text-slate-200 italic">
              "{evidence.sourceText}"
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
              <span>Method: <strong>{evidence.extractionMethod}</strong></span>
              {evidence.conflictFlag && (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Conflict Detected
                </span>
              )}
            </div>
          </div>

          {/* Original AI vs Human Comparison */}
          {evidence.originalValue !== undefined && evidence.originalValue !== null && (
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
              <span className="font-semibold text-amber-900 dark:text-amber-200 block">
                Original AI Extracted Value:
              </span>
              <code className="text-amber-800 dark:text-amber-300 font-mono block">
                {typeof evidence.originalValue === 'object'
                  ? JSON.stringify(evidence.originalValue)
                  : String(evidence.originalValue)}
              </code>
            </div>
          )}

          {/* Correction Form */}
          <form onSubmit={handleSubmitCorrection} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Human Review & Value Correction
            </h3>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Raw Extracted Value (Exact Snippet)
              </label>
              <input
                type="text"
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Value Type
                </label>
                <select
                  value={valueType}
                  onChange={(e) => setValueType(e.target.value as EvidenceValueType)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="STRING">STRING</option>
                  <option value="CURRENCY">CURRENCY</option>
                  <option value="PERCENTAGE">PERCENTAGE</option>
                  <option value="DATE">DATE</option>
                  <option value="IDENTIFIER">IDENTIFIER</option>
                  <option value="INTEGER">INTEGER</option>
                  <option value="DECIMAL">DECIMAL</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="ENTITY">ENTITY</option>
                  <option value="ADDRESS">ADDRESS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit (Optional)
                </label>
                <input
                  type="text"
                  placeholder="INR, %, SqFt"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Normalized Value (Deterministic integer/string/ISO date)
              </label>
              <input
                type="text"
                value={normalizedValue}
                onChange={(e) => setNormalizedValue(e.target.value)}
                placeholder="e.g. 50000000 or 2024-03-31"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reviewer / Officer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verification / Correction Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State reason for manual update or verification approval..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving Correction...' : 'Save & Mark Human Verified'}
            </button>
          </form>

          {/* Audit History Log */}
          <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              Audit Log & Modification History
            </h3>

            {loadingHistory ? (
              <p className="text-xs text-slate-400">Loading audit history...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous human modifications logged.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700/50"
                  >
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      By: <strong className="text-slate-800 dark:text-slate-100">{log.performedBy}</strong>
                    </p>
                    {log.reason && (
                      <p className="text-slate-500 dark:text-slate-400 italic">
                        "{log.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
