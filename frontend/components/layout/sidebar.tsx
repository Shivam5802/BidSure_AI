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
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from '@/components/theme';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
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
        const list = await tenderApi.listTenders();
        if (isMounted && list.length > 0) {
          setResolvedTenderId(list[0].id);
        }
      } catch {
        // Fallback remains CANONICAL_DEMO_TENDER_ID
      }
    }
    resolveActiveTender();
    return () => {
      isMounted = false;
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
    loadSummary();
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

  // Bidder Navigation
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

  // Admin Navigation
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
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 dark:border-slate-800/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center filter drop-shadow-[0_2px_4px_rgba(37,99,235,0.25)]">
          <ShieldLogo className="h-9 w-9" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">BidGuard</span>
            <span className="rounded bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              AI
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
            {isBidder ? 'Bidder Workspace' : isAdmin ? 'Admin Console' : 'Procurement Portal'}
          </span>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
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
                      'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition',
                      item.active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', item.active ? 'text-white' : 'text-slate-400')} />
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

            <div className="mt-6 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
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
                      'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition',
                      item.active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', item.active ? 'text-white' : 'text-slate-400')} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-1.5 py-0.5 text-[9px] font-bold">
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
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition',
                        item.active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', item.active ? 'text-white' : 'text-slate-400')} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Active Tender Context Box */}
            <div className="rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-gradient-to-b dark:from-indigo-950/40 dark:to-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {workspaceSummary?.tender?.referenceNumber === 'CPCL-INFRA-DEMO-2026' ? 'Demo Tender' : 'Active Dossier'}
                </span>
                <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
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
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                        'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition',
                        item.active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-400')} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'ml-2 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold',
                            item.active
                              ? 'bg-white/20 text-white'
                              : item.badge === 'AI'
                              ? 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
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
      </div>

      {/* User Session & Sign Out */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
        {/* Theme Switcher */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Appearance</span>
          <ThemeToggle variant="pill" />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-100/80 dark:bg-slate-900/80 px-2.5 py-2">
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[11px]">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="truncate">
              <span className="block text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                {user?.name || 'Procurement Officer'}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {user?.email || 'officer@gem.gov.in'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              void logout();
              router.replace('/login');
            }}
            title="Sign out"
            className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Governance Protocol Badge */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Decision Protocol
          </div>
          <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
            AI assists. Rules verify. Officer decides.
          </p>
        </div>
      </div>
    </aside>
  );
}
