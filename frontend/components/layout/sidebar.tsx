'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FileText,
  BookOpen,
  Calculator,
  Users,
  SlidersHorizontal,
  BrainCircuit,
  History,
  PlusCircle,
  Menu,
  Sparkles,
  ExternalLink,
  Headphones,
  ChevronRight,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';
import { tenderApi } from '@/features/tenders/api';
import { workspaceApi } from '@/lib/api/workspace.api';
import { WorkspaceSummary } from '@/types/workspace';

// Canonical tender ID seeded for SIH live demonstrations
const CANONICAL_DEMO_TENDER_ID = 'tnd_1789567202603_77g22a';

export function Sidebar() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { user, logout } = useAuth();

  const [resolvedTenderId, setResolvedTenderId] = useState<string>(CANONICAL_DEMO_TENDER_ID);
  const [workspaceSummary, setWorkspaceSummary] = useState<WorkspaceSummary | null>(null);

  // Detect if currently viewing a specific tender
  const tenderMatch = pathname.match(/\/tenders\/([^/]+)/);
  const matchedTenderId = tenderMatch ? tenderMatch[1] : null;
  const isCreatePage = matchedTenderId === 'create';

  // If on a specific tender page, resolve immediately to that tender; otherwise resolve to the latest available tender
  useEffect(() => {
    let isMounted = true;
    async function resolveActiveTender() {
      if (!isCreatePage && matchedTenderId) {
        setResolvedTenderId(matchedTenderId);
        return;
      }
      try {
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('bidguard_selected_tender_id') : null;
        const list = await tenderApi.listTenders();
        if (isMounted && list.length > 0) {
          if (savedId && list.some((t) => t.id === savedId)) {
            setResolvedTenderId(savedId);
          } else {
            setResolvedTenderId(list[0].id);
          }
        }
      } catch {
        // Fallback remains CANONICAL_DEMO_TENDER_ID
      }
    }
    void resolveActiveTender();

    const handleTenderChanged = (e: any) => {
      if (e.detail?.tenderId && !matchedTenderId) {
        setResolvedTenderId(e.detail.tenderId);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('bidguard:tender-changed', handleTenderChanged);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('bidguard:tender-changed', handleTenderChanged);
      }
    };
  }, [matchedTenderId, isCreatePage]);

  const activeTenderId = (!isCreatePage && matchedTenderId) ? matchedTenderId : resolvedTenderId;

  // Load live summary for active tender
  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      if (!activeTenderId) return;
      try {
        const summary = await workspaceApi.getWorkspaceSummary(activeTenderId);
        if (isMounted) {
          setWorkspaceSummary(summary);
        }
      } catch (err) {
        console.warn('Sidebar could not load summary for active tender:', err);
      }
    }
    void loadSummary();
    return () => {
      isMounted = false;
    };
  }, [activeTenderId]);

  const globalNav = [
    {
      name: 'Portfolio Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'All Tenders Dossiers',
      href: '/dashboard/tenders',
      icon: Layers,
      active: pathname === '/dashboard/tenders' || pathname === '/tenders',
    },
    {
      name: 'Create New Tender',
      href: '/tenders/create',
      icon: PlusCircle,
      active: pathname === '/tenders/create',
    },
  ];

  const tenderWorkspaceNav = [
    {
      name: 'Command Center',
      href: `/tenders/${activeTenderId}/workspace`,
      icon: Layers,
      active: pathname.endsWith('/workspace'),
      badge: 'Live',
    },
    {
      name: 'Tender Documents',
      href: `/tenders/${activeTenderId}/documents`,
      icon: FileText,
      active: pathname.includes('/documents') && !pathname.includes('/bidders/'),
    },
    {
      name: 'Requirements Blueprint',
      href: `/tenders/${activeTenderId}/requirements`,
      icon: BookOpen,
      active: pathname.endsWith('/requirements'),
    },
    {
      name: 'Compliance Rules',
      href: `/tenders/${activeTenderId}/rules`,
      icon: Calculator,
      active: pathname.endsWith('/rules'),
    },
    {
      name: 'Bidders & Evidence',
      href: `/tenders/${activeTenderId}/bidders`,
      icon: Users,
      active: pathname.includes('/bidders'),
    },
    {
      name: 'Comparison Matrix',
      href: `/tenders/${activeTenderId}/comparison`,
      icon: SlidersHorizontal,
      active: pathname.endsWith('/comparison'),
    },
    {
      name: 'Intelligence & Risk',
      href: `/tenders/${activeTenderId}/intelligence`,
      icon: BrainCircuit,
      active: pathname.endsWith('/intelligence'),
      badge: 'AI',
    },
    {
      name: 'Audit Logs & Reports',
      href: `/tenders/${activeTenderId}/reports`,
      icon: History,
      active: pathname.includes('/reports'),
    },
  ];

  // Determine role-based navigation sections
  const isBidder = user?.role === 'BIDDER';
  const isAdmin = user?.role === 'ADMIN';

  // Bidder Navigation (text strictly preserved)
  const bidderNav = [
    {
      name: 'Bidder Dashboard',
      href: '/bidder/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/bidder/dashboard',
    },
    {
      name: 'Browse Published Tenders',
      href: '/bidder/tenders',
      icon: Layers,
      active: pathname === '/bidder/tenders' || (pathname.startsWith('/bidder/tenders/') && !pathname.includes('/apply')),
      badge: 'Live',
    },
    {
      name: 'My Applications',
      href: '/bidder/applications',
      icon: BookOpen,
      active: pathname.startsWith('/bidder/applications'),
    },
    {
      name: 'Organization Profile',
      href: '/bidder/profile',
      icon: Users,
      active: pathname === '/bidder/profile',
    },
  ];

  // Admin Navigation (text strictly preserved)
  const adminNav = [
    {
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard',
    },
    {
      name: 'Officer Management',
      href: '/admin/officers',
      icon: Users,
      active: pathname === '/admin/officers',
      badge: 'Gov',
    },
    {
      name: 'Procurement Portfolio',
      href: '/dashboard',
      icon: Layers,
      active: pathname === '/dashboard',
    },
  ];

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-[#FFFFFF] dark:bg-[#071324] text-slate-700 dark:text-slate-300 select-none transition-colors duration-200">
      {/* Top Hamburger Utility Bar */}
      <div className="flex h-12 items-center px-4 border-b border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {isBidder ? (
          <div>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Vendor Portal
            </div>
            <nav className="space-y-1">
              {bidderNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition duration-150',
                      item.active
                        ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                        : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Compliance Pre-Check
              </span>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                Submit authentic tender proposals. AI extracts and verifies compliance against mandatory clauses.
              </p>
            </div>
          </div>
        ) : isAdmin ? (
          <div>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              System Administration
            </div>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition duration-150',
                      item.active
                        ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                        : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-1.5 py-0.5 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : (
          <>
            {/* Global Navigation */}
            <div>
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation
              </div>
              <nav className="space-y-1">
                {globalNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition duration-150',
                        item.active
                          ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                          : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Active Tender Context Box */}
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-b from-[#F2F7FD] to-white dark:from-[#0D2442] dark:to-[#071324] p-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#1464B4]" />
                  {workspaceSummary?.tender?.referenceNumber === 'CPCL-INFRA-DEMO-2026' ? 'Demo Tender' : 'Active Dossier'}
                </span>
                <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                  {workspaceSummary?.tender?.status || 'Ready'}
                </span>
              </div>
              <div className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white truncate" title={workspaceSummary?.tender?.title || activeTenderId}>
                {workspaceSummary?.tender?.referenceNumber || activeTenderId}
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {workspaceSummary
                  ? `${workspaceSummary.counts.requirementCount} Reqs • ${workspaceSummary.counts.bidderCount} Bidders • ${workspaceSummary.counts.unresolvedConflictCount} Conflict${workspaceSummary.counts.unresolvedConflictCount === 1 ? '' : 's'}`
                  : 'Live Evaluation Dossier'}
              </p>
            </div>

            {/* Tender Intelligence Workspace */}
            <div>
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tender Workspace
              </div>
              <nav className="space-y-1">
                {tenderWorkspaceNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition duration-150',
                        item.active
                          ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                          : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'ml-2 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold',
                            item.active
                              ? 'bg-white/20 text-white'
                              : item.badge === 'AI'
                              ? 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>
        )}

        {/* GeM Integrated Card (Visual Matching Screenshot) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="relative h-6 w-6 shrink-0 mt-0.5">
              <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
                <path d="M20 2L24 14L20 18L16 14L20 2Z" fill="#F47920" />
                <path d="M38 15L27 20L20 18L24 14L38 15Z" fill="#1464B4" />
                <path d="M31 34L22 26L20 18L27 20L31 34Z" fill="#0E3D6E" />
                <path d="M9 34L18 26L20 18L22 26L9 34Z" fill="#2E8B57" />
                <path d="M2 15L16 14L20 18L18 26L2 15Z" fill="#E65100" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Government e-Marketplace
                </span>
                <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block">
                (GeM) Integrated
              </span>
              <p className="mt-1 text-[9.5px] text-slate-500 dark:text-slate-400 leading-snug">
                Access to GeM for verified procurement and vendor data.
              </p>
            </div>
          </div>
        </div>

        {/* Need Help Card (Visual Matching Screenshot) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-[#F4F8FC] dark:hover:bg-slate-800 transition">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1464B4] dark:text-[#58A6FF]">
              <Headphones className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[11.5px] font-bold text-slate-800 dark:text-slate-100 leading-none">
                Need Help?
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Contact Support
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Bottom Institutional Monument Watermark & National Branding */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 relative overflow-hidden bg-gradient-to-b from-transparent to-slate-50/60 dark:to-slate-900/40">
        {/* Subtle Indian Monument Architecture Outline */}
        <div className="flex items-center justify-center opacity-40 dark:opacity-20 mb-2">
          <svg viewBox="0 0 200 40" fill="none" className="h-8 w-auto stroke-[#1464B4] dark:stroke-slate-400 stroke-1">
            <path d="M20,38 L20,20 L30,20 L30,38" />
            <path d="M25,20 L25,12 L20,12 L25,6 L30,12 L25,12" />
            <path d="M40,38 L40,15 L55,15 L55,38" />
            <path d="M47.5,15 C47.5,10 47.5,5 47.5,2" />
            <path d="M70,38 L70,22 C70,18 80,18 80,22 L80,38" />
            <path d="M95,38 L95,10 C95,5 105,5 105,10 L105,38" />
            <path d="M120,38 L120,22 C120,18 130,18 130,22 L130,38" />
            <path d="M145,38 L145,15 L160,15 L160,38" />
            <path d="M170,38 L170,20 L180,20 L180,38" />
          </svg>
        </div>

        {/* Tricolor Wave Accent */}
        <div className="h-1 w-full rounded-full overflow-hidden flex mb-2">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* National Slogan */}
        <div className="text-center">
          <span className="text-[10px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Digital India | Atmanirbhar Bharat
          </span>
        </div>
      </div>
    </aside>
  );
}
