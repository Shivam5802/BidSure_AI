'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, AlertCircle, FileCheck2 } from 'lucide-react';
import {
  BlueprintData,
  ComplianceBlueprint,
  TenderRequirement,
  RequirementFilterState,
  requirementApi,
  BlueprintHeader,
  RequirementFilterBar,
  RequirementCard,
  RequirementDetail,
  RequirementEditModal,
  SourceProvenanceViewer,
} from '@/features/requirements';
import { ThemeToggle } from '@/components/theme';
import { QuickNavToolbar } from '@/features/workspace/QuickNavToolbar';

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export default function TenderRequirementsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tenderId = resolvedParams.tenderId;
  const router = useRouter();

  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(null);
  const [versions, setVersions] = useState<ComplianceBlueprint[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<TenderRequirement | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<TenderRequirement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<RequirementFilterState>({
    category: 'ALL',
    status: 'ALL',
    ambiguity: false,
    conflict: false,
    duplicate: false,
    search: '',
  });

  const fetchBlueprint = async (version?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requirementApi.getBlueprint(tenderId, version);
      setBlueprintData(data);
      if (data.requirements.length > 0) {
        setSelectedRequirement((prev) => {
          if (prev) {
            const found = data.requirements.find((r) => r.id === prev.id);
            if (found) return found;
          }
          return data.requirements[0]!;
        });
      }
    } catch (err: any) {
      if (err?.code === 'HTTP_404') {
        setBlueprintData(null);
      } else {
        setError(err.message || 'Failed to load tender requirements blueprint');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const v = await requirementApi.getBlueprintVersions(tenderId);
      setVersions(v);
    } catch {
      // Ignore version listing failures
    }
  };

  useEffect(() => {
    void fetchBlueprint();
    void fetchVersions();
  }, [tenderId]);

  const handleExtract = async () => {
    setIsExtracting(true);
    setError(null);
    try {
      await requirementApi.triggerExtraction(tenderId);
      await fetchBlueprint();
      await fetchVersions();
    } catch (err: any) {
      setError(err.message || 'Failed to extract tender requirements.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApprove = async (reqId: string) => {
    try {
      const updated = await requirementApi.approveRequirement(tenderId, reqId);
      setSelectedRequirement(updated);
      await fetchBlueprint(blueprintData?.blueprint.version);
    } catch (err: any) {
      setError(err.message || 'Failed to approve requirement.');
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      const updated = await requirementApi.rejectRequirement(tenderId, reqId);
      setSelectedRequirement(updated);
      await fetchBlueprint(blueprintData?.blueprint.version);
    } catch (err: any) {
      setError(err.message || 'Failed to reject requirement.');
    }
  };

  const handleSaveEdit = async (payload: Partial<TenderRequirement>) => {
    if (!editingRequirement) return;
    try {
      const updated = await requirementApi.updateRequirement(tenderId, editingRequirement.id, payload);
      setSelectedRequirement(updated);
      setEditingRequirement(null);
      await fetchBlueprint(blueprintData?.blueprint.version);
    } catch (err: any) {
      setError(err.message || 'Failed to save requirement modifications.');
    }
  };

  const handleLock = async () => {
    if (!blueprintData?.blueprint) return;
    try {
      await requirementApi.lockBlueprint(tenderId, blueprintData.blueprint.id);
      await fetchBlueprint(blueprintData.blueprint.version);
      await fetchVersions();
    } catch (err: any) {
      setError(err.message || 'Failed to lock blueprint.');
    }
  };

  // Filter requirements in-memory for instant search UI feedback
  const filteredRequirements = (blueprintData?.requirements || []).filter((req) => {
    if (filters.category !== 'ALL' && req.category !== filters.category) return false;
    if (filters.status !== 'ALL' && req.status !== filters.status) return false;
    if (filters.ambiguity && !req.ambiguityFlag) return false;
    if (filters.conflict && !req.conflictFlag) return false;
    if (filters.duplicate && !req.duplicateFlag) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const textMatch = req.requirementText.toLowerCase().includes(q);
      const clauseMatch = req.clauseReference && req.clauseReference.toLowerCase().includes(q);
      const codeMatch = req.requirementCode.toLowerCase().includes(q);
      if (!textMatch && !clauseMatch && !codeMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tender
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">BidSure AI — Requirements Engine</span>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <QuickNavToolbar tenderId={tenderId} />
      </div>

      {/* Header Banner */}
      <BlueprintHeader
        tenderTitle={blueprintData?.blueprint ? `Tender #${tenderId}` : 'Tender Compliance Blueprint'}
        referenceNumber={tenderId.substring(0, 14)}
        blueprintData={blueprintData}
        versions={versions}
        isExtracting={isExtracting}
        onExtract={handleExtract}
        onLock={handleLock}
        onSelectVersion={(v) => fetchBlueprint(v)}
      />

      {error && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 3-Column Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-220px)]">
        {/* Column 1: Requirement Navigator List (3/12 width) */}
        <div className="lg:col-span-3 border-r border-slate-800/80 flex flex-col h-full bg-slate-900/40">
          <RequirementFilterBar filters={filters} onChange={setFilters} />

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">Loading compliance blueprint...</p>
              </div>
            ) : filteredRequirements.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center space-y-3">
                <FileCheck2 className="w-10 h-10 text-slate-700" />
                <p className="text-xs font-medium">
                  {blueprintData ? 'No requirements match current filters.' : 'No compliance blueprint generated yet.'}
                </p>
                {!blueprintData && (
                  <button
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
                  >
                    Start AI Extraction
                  </button>
                )}
              </div>
            ) : (
              filteredRequirements.map((req) => (
                <RequirementCard
                  key={req.id}
                  requirement={req}
                  isSelected={selectedRequirement?.id === req.id}
                  onSelect={() => setSelectedRequirement(req)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Selected Requirement Detail & Actions (6/12 width) */}
        <div className="lg:col-span-6 h-full bg-slate-900/20">
          <RequirementDetail
            requirement={selectedRequirement}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={(req) => setEditingRequirement(req)}
          />
        </div>

        {/* Column 3: Source Provenance Viewer (3/12 width) */}
        <div className="lg:col-span-3 h-full bg-slate-950/60">
          <SourceProvenanceViewer requirement={selectedRequirement} />
        </div>
      </div>

      {/* Edit Modal */}
      {editingRequirement && (
        <RequirementEditModal
          requirement={editingRequirement}
          onClose={() => setEditingRequirement(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
