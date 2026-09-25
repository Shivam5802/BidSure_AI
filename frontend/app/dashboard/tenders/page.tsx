'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  Building,
  Layers,
  IndianRupee,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  FolderOpen,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tenderApi } from '@/features/tenders/api';
import { api } from '@/lib/api/client';
import { Tender } from '@/features/tenders/types';

export default function TendersDirectoryPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'CLOSED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'CLOSING_SOON' | 'VALUE_HIGH' | 'REF'>('NEWEST');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [activeTenderId, setActiveTenderId] = useState<string>('');

  const loadTenders = async () => {
    try {
      setLoading(true);
      const list = await tenderApi.listTenders();
      setTenders(list);
      if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem('bidguard_selected_tender_id');
        if (savedId) {
          setActiveTenderId(savedId);
        } else if (list.length > 0) {
          setActiveTenderId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTenders();
  }, []);

  const handleSelectTender = (id: string, redirectPath?: string) => {
    setActiveTenderId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bidguard_selected_tender_id', id);
      window.dispatchEvent(new CustomEvent('bidguard:tender-changed', { detail: { tenderId: id } }));
    }
    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  const handlePublish = async (tenderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setPublishingId(tenderId);
      await api.publishTender(tenderId);
      await loadTenders();
    } catch (err: any) {
      alert(err.message || 'Failed to publish tender');
    } finally {
      setPublishingId(null);
    }
  };

  // Derived counts
  const publishedCount = useMemo(() => tenders.filter((t) => t.status === 'PUBLISHED').length, [tenders]);
  const draftCount = useMemo(() => tenders.filter((t) => t.status === 'DRAFT').length, [tenders]);
  const closedCount = useMemo(() => tenders.filter((t) => t.status === 'CLOSED').length, [tenders]);

  const totalEstimatedValue = useMemo(() => {
    return tenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0);
  }, [tenders]);

  // Format currency
  const formatCurrency = (val?: number | null) => {
    if (!val || isNaN(val)) return 'Value On Application';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Format closing date & countdown
  const getClosingInfo = (dateStr: string) => {
    try {
      const closing = new Date(dateStr);
      const now = new Date();
      const diffMs = closing.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const formatted = closing.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      if (diffDays < 0) {
        return { text: `Closed on ${formatted}`, isPast: true, urgent: false };
      }
      if (diffDays === 0) {
        return { text: `Closes Today (${formatted})`, isPast: false, urgent: true };
      }
      if (diffDays <= 5) {
        return { text: `${diffDays} days remaining (${formatted})`, isPast: false, urgent: true };
      }
      return { text: `${diffDays} days left (${formatted})`, isPast: false, urgent: false };
    } catch {
      return { text: dateStr, isPast: false, urgent: false };
    }
  };

  // Filter and sort tenders
  const filteredTenders = useMemo(() => {
    return tenders
      .filter((t) => {
        // Status filter
        if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

        // Category filter
        if (categoryFilter !== 'ALL' && (t.category || '').toUpperCase() !== categoryFilter.toUpperCase()) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesRef = t.referenceNumber.toLowerCase().includes(q);
          const matchesOrg = t.organization.toLowerCase().includes(q);
          const matchesDept = (t.department || '').toLowerCase().includes(q);
          const matchesCat = (t.category || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesRef && !matchesOrg && !matchesDept && !matchesCat) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'CLOSING_SOON') {
          return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime();
        }
        if (sortBy === 'VALUE_HIGH') {
          return (b.estimatedValue || 0) - (a.estimatedValue || 0);
        }
        if (sortBy === 'REF') {
          return a.referenceNumber.localeCompare(b.referenceNumber);
        }
        return 0;
      });
  }, [tenders, statusFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 hover:text-[#1464B4] dark:hover:text-[#58A6FF] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Portfolio Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200">Tenders Directory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A2540] dark:text-white">
            Procurement Tenders Dossier Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Complete registry of all Active (Live on GeM), Draft (In-Preparation), and Historical tenders.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tenders/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1464B4] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F5298] transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Tender</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Tenders</span>
            <FileText className="h-4 w-4 text-[#1464B4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {tenders.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Dossiers in compliance engine
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active / Published</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-200">
            {publishedCount}
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            Live on Bidder Portal & GeM
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Drafts / In Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-200">
            {draftCount}
          </div>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">
            Internal preparation & specs
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Cumulative Value</span>
            <IndianRupee className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
            {formatCurrency(totalEstimatedValue)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Estimated procurement volume
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-[#1464B4] dark:text-[#58A6FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>All Tenders</span>
              <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px]">
                {tenders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('PUBLISHED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'PUBLISHED'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Active / Published</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 text-[10px] text-emerald-800 dark:text-emerald-300">
                {publishedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('DRAFT')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'DRAFT'
                  ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Drafts</span>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 text-[10px] text-amber-800 dark:text-amber-300">
                {draftCount}
              </span>
            </button>

            {closedCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('CLOSED')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === 'CLOSED'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Closed</span>
                <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px]">
                  {closedCount}
                </span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, title, organization, category..."
              className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            >
              <option value="ALL">All Categories</option>
              <option value="TECHNICAL">Technical (IT / Software / Hardware)</option>
              <option value="FINANCIAL">Financial (Commercial / Banking)</option>
              <option value="STATUTORY">Statutory & Regulatory</option>
              <option value="HSE">HSE (Health, Safety & Environment)</option>
              <option value="EXPERIENCE">Works / EPC / Turnkey</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            >
              <option value="NEWEST">Newest Created First</option>
              <option value="CLOSING_SOON">Closing Soonest First</option>
              <option value="VALUE_HIGH">Highest Estimated Value</option>
              <option value="REF">Reference Number (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tenders Dossier List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4] mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Loading tenders directory...
          </p>
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1464B4] dark:text-[#58A6FF] mb-3">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Tenders Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'No dossiers match your current filter criteria. Try resetting your search filters.'
              : 'There are currently no tenders in the system. Create your first tender dossier to begin.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Link href="/tenders/create">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Create New Tender
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTenders.map((tender) => {
            const isSelected = activeTenderId === tender.id;
            const closingInfo = getClosingInfo(tender.closingDate);
            const isDraft = tender.status === 'DRAFT';
            const isPublished = tender.status === 'PUBLISHED';

            return (
              <div
                key={tender.id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:shadow-md ${
                  isSelected
                    ? 'border-[#1464B4] ring-1 ring-[#1464B4]/20 dark:border-[#58A6FF]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1464B4] dark:text-[#58A6FF] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2.5 py-0.5 rounded-md">
                        {tender.referenceNumber}
                      </span>

                      {/* Status Pill */}
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>PUBLISHED / LIVE</span>
                        </span>
                      ) : isDraft ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          <span>DRAFT (INTERNAL)</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {tender.status}
                        </span>
                      )}

                      {/* Category Badge */}
                      {tender.category && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <Layers className="h-3 w-3 text-slate-400" />
                          <span>{tender.category}</span>
                        </span>
                      )}

                      {isSelected && (
                        <span className="rounded-md bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Active Context
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {tender.title}
                    </h2>

                    {/* Organization & Department */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tender.organization}
                        </span>
                        {tender.department && (
                          <span className="text-slate-500">({tender.department})</span>
                        )}
                      </div>

                      {/* Estimated Value */}
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                        <IndianRupee className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="font-bold">{formatCurrency(tender.estimatedValue)}</span>
                      </div>

                      {/* Closing Date */}
                      <div
                        className={`flex items-center gap-1 ${
                          closingInfo.urgent
                            ? 'text-red-600 dark:text-red-400 font-bold'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{closingInfo.text}</span>
                      </div>
                    </div>

                    {/* Description preview */}
                    {tender.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-0.5 leading-relaxed">
                        {tender.description}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Primary Button: Open Command Center */}
                    <button
                      type="button"
                      onClick={() => handleSelectTender(tender.id, `/tenders/${tender.id}/workspace`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1464B4] hover:bg-[#0F5298] text-white px-3.5 py-2 text-xs font-bold transition shadow-2xs"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Documents Link */}
                      <button
                        type="button"
                        onClick={() => handleSelectTender(tender.id, `/tenders/${tender.id}/documents`)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        Documents
                      </button>

                      {/* Rules Link */}
                      <button
                        type="button"
                        onClick={() => handleSelectTender(tender.id, `/tenders/${tender.id}/rules`)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        Rules
                      </button>

                      {/* If DRAFT: Publish Button */}
                      {isDraft && (
                        <button
                          type="button"
                          disabled={publishingId === tender.id}
                          onClick={(e) => handlePublish(tender.id, e)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
                        >
                          {publishingId === tender.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>Publish</span>
                        </button>
                      )}

                      {/* If PUBLISHED: Bidder Portal View */}
                      {isPublished && (
                        <Link
                          href={`/bidder/tenders/${tender.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 text-xs font-bold transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Bidder View</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
