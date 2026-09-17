'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, Sparkles, FileText, Layers, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocumentPage, EvidenceBlock } from '../types';

interface PageDetailModalProps {
  page: DocumentPage | null;
  documentFilename: string;
  onClose: () => void;
}

export function PageDetailModal({ page, documentFilename, onClose }: PageDetailModalProps) {
  if (!page) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Page {page.pageNumber} Inspection
              </h3>
              {page.hasTextLayer ? (
                <Badge variant="success">Native Text</Badge>
              ) : (
                <Badge variant="default">
                  <Sparkles className="h-3 w-3 mr-1" /> OCR Applied
                </Badge>
              )}
              {page.reviewRequired && (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Review Required
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Source: {documentFilename}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div>
              <span className="text-slate-500">Page Number</span>
              <p className="mt-0.5 font-bold text-slate-900">Page {page.pageNumber}</p>
            </div>
            <div>
              <span className="text-slate-500">Extraction Mode</span>
              <p className="mt-0.5 font-medium text-slate-900">
                {page.ocrUsed ? 'OCR Engine' : 'Native Layout'}
              </p>
            </div>
            <div>
              <span className="text-slate-500">OCR Confidence</span>
              <p className="mt-0.5 font-mono text-slate-900">
                {page.textConfidence !== null && page.textConfidence !== undefined
                  ? `${(page.textConfidence * 100).toFixed(1)}%`
                  : 'N/A (Unmeasured)'}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Evidence Blocks</span>
              <p className="mt-0.5 font-bold text-slate-900">{page.evidenceBlocks.length}</p>
            </div>
          </div>

          {/* Evidence Blocks Section */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
              Extracted Evidence Blocks (Provenance Anchors)
            </h4>

            {page.evidenceBlocks.length === 0 ? (
              <div className="rounded-lg border border-slate-200 p-6 text-center text-xs text-slate-400">
                No structured evidence blocks identified on this page.
              </div>
            ) : (
              <div className="space-y-3">
                {page.evidenceBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                          <Hash className="h-3 w-3" /> Seq {block.sequence}
                        </span>
                        <Badge
                          variant={
                            block.blockType === 'HEADING'
                              ? 'default'
                              : block.blockType === 'TABLE'
                              ? 'warning'
                              : 'neutral'
                          }
                          className="text-[10px]"
                        >
                          {block.blockType}
                        </Badge>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        Block: {block.id}
                      </span>
                    </div>

                    {block.blockType === 'TABLE' ? (
                      <pre className="overflow-x-auto rounded bg-slate-50 p-3 font-mono text-xs text-slate-800">
                        {block.content}
                      </pre>
                    ) : (
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {block.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
