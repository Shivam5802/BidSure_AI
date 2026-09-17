import React from 'react';
import { VerificationType } from '@/types/verification';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface VerificationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  verificationType: VerificationType;
  requestedIdentifier: string;
  evidenceSource?: string;
  providerName?: string;
  isSubmitting?: boolean;
}

export function VerificationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  verificationType,
  requestedIdentifier,
  evidenceSource = 'Bidder Document Evidence',
  providerName = 'Demo Verification Provider',
  isSubmitting = false,
}: VerificationConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Initiate External Verification</h3>
              <p className="text-xs text-slate-500">Cross-check bidder evidence against external provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2.5 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Verification Type:</span>
              <span className="font-semibold text-slate-900">{verificationType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Evidence Source:</span>
              <span className="font-medium text-slate-800">{evidenceSource}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Identifier to Verify:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {requestedIdentifier}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Provider:</span>
              <span className="font-medium text-slate-800">{providerName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Mode:</span>
              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">
                MOCK / SYNTHETIC DATA
              </span>
            </div>
          </div>

          {/* SIH Hackathon Mandatory Warning */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Hackathon Demonstration Notice</p>
              <p className="mt-0.5 text-amber-800">
                This demonstration uses deterministic mock providers and synthetic data. It does not connect to live government databases.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Start Verification</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
