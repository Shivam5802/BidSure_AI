import React, { useState } from 'react';
import { ConflictGraphData, ConflictGraphNode } from '@/types/conflict';
import { X, Network, FileText, AlertTriangle, Search, CheckCircle2, Shield } from 'lucide-react';
import { ConflictStatusBadge } from './ConflictStatusBadge';

interface EvidenceConflictGraphViewProps {
  graphData: ConflictGraphData | null;
  isOpen: boolean;
  onClose: () => void;
  conflictTitle?: string;
  onSelectEvidence?: (docId: string, pageNumber: number) => void;
}

export const EvidenceConflictGraphView: React.FC<EvidenceConflictGraphViewProps> = ({
  graphData,
  isOpen,
  onClose,
  conflictTitle = 'Evidence Conflict Graph',
  onSelectEvidence,
}) => {
  const [selectedNode, setSelectedNode] = useState<ConflictGraphNode | null>(null);

  if (!isOpen || !graphData) return null;

  const { nodes, edges } = graphData;

  const getNodeColor = (type: ConflictGraphNode['type'], severity?: string) => {
    switch (type) {
      case 'REQUIREMENT':
        return 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-300';
      case 'EVALUATION':
        return 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-300';
      case 'CONFLICT':
        return severity === 'HIGH' || severity === 'CRITICAL'
          ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-300 animate-pulse'
          : 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-300';
      case 'EVIDENCE':
        return 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-300';
      case 'DOCUMENT':
        return 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300';
      case 'PAGE':
        return 'bg-slate-500/10 border-slate-400 text-slate-600 dark:text-slate-300';
      case 'INVESTIGATION':
        return 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300';
      default:
        return 'bg-slate-500/10 border-slate-500 text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {conflictTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auditable Relationship Graph linking Requirement, Evaluation, Conflict, Evidence, and Document Provenance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Visual Graph Layout */}
          <div className="p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-inner relative min-h-[380px] flex flex-col justify-between overflow-x-auto">
            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400 border-b border-slate-800/80 pb-3 flex-wrap">
              <span className="font-semibold text-slate-300">Graph Nodes:</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Requirement</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Evaluation</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Conflict</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Evidence</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Document</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Investigation</span>
            </div>

            {/* Render Nodes as Interactive Cards */}
            <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${getNodeColor(
                      node.type,
                      node.severity
                    )} ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 shadow-lg scale-102 bg-slate-900'
                        : 'hover:scale-101 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-80">
                        {node.type}
                      </span>
                      {node.severity && <ConflictStatusBadge severity={node.severity as any} />}
                      {node.status && <ConflictStatusBadge status={node.status as any} />}
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1">{node.label}</h4>
                    {node.sublabel && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{node.sublabel}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Edge Connection Details */}
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
              <span>Relationships: {edges.length} Active Provenance Edges</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Verified from PostgreSQL Evidence Relationships
              </span>
            </div>
          </div>

          {/* Node Detail Inspector */}
          {selectedNode && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Node Inspector: {selectedNode.type}
                </h4>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {selectedNode.label}
              </p>
              {selectedNode.sublabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedNode.sublabel}
                </p>
              )}

              {selectedNode.metadata && (
                <div className="mt-2 text-xs font-mono p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 overflow-x-auto space-y-1">
                  {Object.entries(selectedNode.metadata).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{k}:</span>
                      <span className="truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trust Footnote */}
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
            <Shield className="w-4 h-4 shrink-0 text-indigo-500" />
            <span>
              <strong>BidGuard detected the conflict — it did not decide which document was correct.</strong> Graphs represent real database provenance relationships.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Close Graph
          </button>
        </div>
      </div>
    </div>
  );
};
