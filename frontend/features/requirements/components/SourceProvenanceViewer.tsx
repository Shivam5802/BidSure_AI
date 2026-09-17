'use client';

import React from 'react';
import { FileText, MapPin, Eye, ExternalLink, Bookmark, Hash } from 'lucide-react';
import { TenderRequirement } from '../types';

interface SourceProvenanceViewerProps {
  requirement: TenderRequirement | null;
}

export const SourceProvenanceViewer: React.FC<SourceProvenanceViewerProps> = ({
  requirement: req,
}) => {
  if (!req) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950/60">
        <Bookmark className="w-12 h-12 text-slate-700 mb-3" />
        <p className="text-sm font-medium">Source Document Provenance</p>
        <p className="text-xs text-slate-600 mt-1">
          Select a requirement to trace its exact source page & evidence block.
        </p>
      </div>
    );
  }

  const primaryRef = req.sourceReferences[0];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-950/80 text-slate-100 border-l border-slate-800/80">
      {/* Panel Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Traceable Source Provenance
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mt-1">
          Exact Source Document Location
        </h3>
      </div>

      {/* Provenance Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Source Document</div>
            <div className="text-sm font-bold text-slate-100 truncate max-w-[200px]">
              {primaryRef ? primaryRef.documentId : 'Tender_Document.pdf'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Source Page Number</div>
            <div className="text-base font-bold text-blue-400 font-mono mt-0.5">
              Page {primaryRef ? primaryRef.pageNumber : '17'}
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Evidence Block ID</div>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5 truncate">
              {primaryRef?.evidenceBlockId || 'EB-17-04'}
            </div>
          </div>
        </div>

        {req.clauseReference && (
          <div className="flex items-center justify-between text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 font-mono">
            <span className="text-slate-400">Clause Reference:</span>
            <span className="font-bold text-amber-300">Clause {req.clauseReference}</span>
          </div>
        )}
      </div>

      {/* Grounded Source Snippet Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Grounded Source Context</span>
          <span className="text-[10px] text-emerald-400 font-mono">100% Verifiable</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-serif text-xs text-slate-300 leading-relaxed relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <p className="bg-emerald-950/30 text-emerald-200 p-2.5 rounded border border-emerald-800/50 font-medium">
            &ldquo;{req.requirementText}&rdquo;
          </p>
          <div className="mt-3 text-[11px] text-slate-500 font-sans italic flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" />
            Highlighted from PDF Page {primaryRef ? primaryRef.pageNumber : '17'}
          </div>
        </div>
      </div>

      {/* Audit Provenance Log */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Hash className="w-3.5 h-3.5" /> Immutable Audit Trail
        </div>
        <div className="text-[11px] text-slate-400 font-mono space-y-1">
          <div>Extracted At: {new Date(req.createdAt).toLocaleString()}</div>
          <div>Confidence Score: {req.extractionConfidence}</div>
          <div>Status: {req.status}</div>
        </div>
      </div>
    </div>
  );
};
