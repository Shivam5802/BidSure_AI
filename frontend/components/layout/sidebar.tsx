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
  X,
  Sparkles,
  ExternalLink,
  Headphones,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Building2,
  ShieldCheck,
  FolderLock,
  Bell,
  Lock,
  Search,
  MessageSquare,
  Activity,
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bidguard_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // ignore in environments without localStorage
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bidguard_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Listen for external toggle events (e.g. from topbar hamburger)
  useEffect(() => {
    const handleToggle = () => toggleCollapse();
    window.addEventListener('bidguard:toggle-sidebar', handleToggle);
    return () => window.removeEventListener('bidguard:toggle-sidebar', handleToggle);
  }, []);

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

  useEffect(() => {
    const openMobileNav = () => setIsMobileNavOpen(true);
    window.addEventListener('bidguard:open-mobile-nav', openMobileNav);
    return () => window.removeEventListener('bidguard:open-mobile-nav', openMobileNav);
  }, []);

  const activeTenderId = (!isCreatePage && matchedTenderId) ? matchedTenderId : resolvedTenderId;

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const restoreSidebarScroll = React.useCallback(() => {
    try {
      const saved = sessionStorage.getItem('bidguard_sidebar_scroll_top');
      if (saved !== null && scrollContainerRef.current) {
        const top = Number(saved);
        if (Math.abs(scrollContainerRef.current.scrollTop - top) > 1) {
          scrollContainerRef.current.scrollTop = top;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Restore immediately upon mount and pathname/tender switch
  React.useEffect(() => {
    restoreSidebarScroll();
    const frameId = requestAnimationFrame(restoreSidebarScroll);
    const timer1 = setTimeout(restoreSidebarScroll, 30);
    const timer2 = setTimeout(restoreSidebarScroll, 100);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, activeTenderId, restoreSidebarScroll]);

  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      sessionStorage.setItem('bidguard_sidebar_scroll_top', String(e.currentTarget.scrollTop));
    } catch {
      // ignore
    }
  };

  const saveScrollBeforeNav = () => {
    try {
      if (scrollContainerRef.current) {
        sessionStorage.setItem('bidguard_sidebar_scroll_top', String(scrollContainerRef.current.scrollTop));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileNavOpen]);

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

  // Global / Core Officer Navigation
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
      active: pathname === '/dashboard/tenders' || (pathname.startsWith('/tenders') && pathname.endsWith('/tenders')),
    },
    {
      name: 'Create New Tender',
      href: '/tenders/create',
      icon: PlusCircle,
      active: pathname === '/tenders/create',
    },
  ];

  // Officer Governance & Review Modules
  const officerReviewNav = [
    {
      name: 'Received Bids',
      href: '/officer/bids',
      icon: Users,
      active: pathname === '/officer/bids',
      badge: 'Live',
    },
    {
      name: 'Compliance Reviews',
      href: '/officer/compliance',
      icon: CheckCircle2,
      active: pathname === '/officer/compliance',
      badge: 'AI',
    },
    {
      name: 'Bid Comparison',
      href: '/officer/comparison',
      icon: SlidersHorizontal,
      active: pathname === '/officer/comparison',
    },
    {
      name: 'Clarifications',
      href: '/officer/clarifications',
      icon: MessageSquare,
      active: pathname === '/officer/clarifications',
    },
    {
      name: 'Audit Trail',
      href: '/officer/audit',
      icon: History,
      active: pathname === '/officer/audit',
      badge: 'Ledger',
    },
    {
      name: 'Reports & Analytics',
      href: '/officer/reports',
      icon: FileText,
      active: pathname.startsWith('/officer/reports'),
    },
    {
      name: 'Notifications',
      href: '/officer/notifications',
      icon: Bell,
      active: pathname === '/officer/notifications',
    },
    {
      name: 'Profile & Settings',
      href: '/officer/profile',
      icon: Building2,
      active: pathname === '/officer/profile',
    },
  ];

  // Tender Workspace Navigation (Detailed Dossier Analysis)
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
      active: pathname.endsWith('/reports') || pathname.includes('/reports/'),
    },
  ];

  // Determine role-based navigation sections
  const isBidder = user?.role === 'BIDDER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Bidder / Vendor Navigation (10 Recommended Portal Sections)
  const bidderNav = [
    {
      name: 'Overview',
      href: '/bidder/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/bidder/dashboard',
    },
    {
      name: 'Company Profile',
      href: '/bidder/profile',
      icon: Building2,
      active: pathname === '/bidder/profile',
    },
    {
      name: 'Registrations & Certificates',
      href: '/bidder/registrations',
      icon: ShieldCheck,
      active: pathname === '/bidder/registrations',
    },
    {
      name: 'Document Vault',
      href: '/bidder/documents',
      icon: FolderLock,
      active: pathname === '/bidder/documents',
    },
    {
      name: 'Compliance Center',
      href: '/bidder/compliance',
      icon: CheckCircle2,
      active: pathname === '/bidder/compliance',
      badge: 'Audit',
    },
    {
      name: 'Find Tenders',
      href: '/bidder/tenders',
      icon: Search,
      active: pathname === '/bidder/tenders' || (pathname.startsWith('/bidder/tenders/') && !pathname.includes('/apply')),
      badge: 'Live',
    },
    {
      name: 'My Bids',
      href: '/bidder/applications',
      icon: BookOpen,
      active: pathname.startsWith('/bidder/applications'),
    },
    {
      name: 'Clarifications',
      href: '/bidder/clarifications',
      icon: MessageSquare,
      active: pathname.startsWith('/bidder/clarifications'),
      badge: 'Queries',
    },
    {
      name: 'Reports & History',
      href: '/bidder/reports',
      icon: History,
      active: pathname === '/bidder/reports',
    },
    {
      name: 'Notifications',
      href: '/bidder/notifications',
      icon: Bell,
      active: pathname === '/bidder/notifications',
    },
    {
      name: 'Account & Security',
      href: '/bidder/security',
      icon: Lock,
      active: pathname === '/bidder/security',
    },
  ];

  // Comprehensive Admin Navigation (13 Functional Oversight Sections)
  const adminNav = [
    {
      name: 'Overview',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard',
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      active: pathname === '/admin/users',
      badge: 'Active',
    },
    {
      name: 'Officer Management',
      href: '/admin/officers',
      icon: Building2,
      active: pathname === '/admin/officers',
      badge: 'Gov',
    },
    {
      name: 'Roles & Permissions',
      href: '/admin/roles',
      icon: ShieldCheck,
      active: pathname === '/admin/roles',
    },
    {
      name: 'Tenders Overview',
      href: '/admin/tenders',
      icon: FileText,
      active: pathname === '/admin/tenders',
    },
    {
      name: 'Bid Monitoring',
      href: '/admin/bids',
      icon: BookOpen,
      active: pathname === '/admin/bids',
      badge: 'Live',
    },
    {
      name: 'Compliance Rules',
      href: '/admin/compliance-rules',
      icon: Calculator,
      active: pathname === '/admin/compliance-rules',
    },
    {
      name: 'Verification Integrations',
      href: '/admin/integrations',
      icon: BrainCircuit,
      active: pathname === '/admin/integrations',
      badge: 'Gov',
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit',
      icon: History,
      active: pathname === '/admin/audit',
    },
    {
      name: 'System Health',
      href: '/admin/system-health',
      icon: Activity,
      active: pathname === '/admin/system-health',
    },
    {
      name: 'Reports & Analytics',
      href: '/admin/reports',
      icon: SlidersHorizontal,
      active: pathname === '/admin/reports',
    },
    {
      name: 'Notifications & Incidents',
      href: '/admin/incidents',
      icon: Bell,
      active: pathname === '/admin/incidents',
    },
    {
      name: 'Platform Settings',
      href: '/admin/settings',
      icon: Lock,
      active: pathname === '/admin/settings',
    },
    {
      name: 'Admin Profile',
      href: '/admin/profile',
      icon: Building2,
      active: pathname === '/admin/profile',
    },
    ...(isSuperAdmin
      ? [
          {
            name: 'Super Admin Vault',
            href: '/super-admin/dashboard',
            icon: ShieldCheck,
            active: pathname.startsWith('/super-admin'),
            badge: 'Root',
          },
        ]
      : []),
  ];

  return (
    <>
    {isMobileNavOpen && (
      <button
        type="button"
        aria-label="Close navigation drawer"
        onClick={() => setIsMobileNavOpen(false)}
        className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
      />
    )}
    <aside className={cn(
      'flex shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-[#FFFFFF] dark:bg-[#071324] text-slate-700 dark:text-slate-300 select-none transition-all duration-300 ease-in-out',
      'h-full md:h-full md:overflow-hidden z-30',
      isMobileNavOpen
        ? 'fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] h-full shadow-xl'
        : 'hidden md:flex',
      isCollapsed ? 'md:w-[68px]' : 'md:w-[260px]'
    )}>
      {/* Top Hamburger Utility Bar */}
      <div className={cn(
        'flex h-12 items-center border-b border-slate-100 dark:border-slate-800/80 transition-colors',
        isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
      )}>
        <button
          type="button"
          onClick={() => {
            if (isMobileNavOpen) {
              setIsMobileNavOpen(false);
            } else {
              toggleCollapse();
            }
          }}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
          aria-label={isMobileNavOpen ? 'Close navigation drawer' : isCollapsed ? 'Open sidebar' : 'Close sidebar'}
          title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <X className="h-5 w-5 md:hidden" />
          <Menu className="hidden h-5 w-5 md:block" />
        </button>
        {!isCollapsed && (
          <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </span>
        )}
      </div>

      {/* Navigation Scroll Area */}
      <div
        ref={(node) => {
          scrollContainerRef.current = node;
          if (node) {
            try {
              const saved = sessionStorage.getItem('bidguard_sidebar_scroll_top');
              if (saved !== null) {
                const top = Number(saved);
                if (Math.abs(node.scrollTop - top) > 1) {
                  node.scrollTop = top;
                }
              }
            } catch {}
          }
        }}
        onScroll={handleSidebarScroll}
        className={cn('flex-1 overflow-y-auto space-y-4 py-3', isCollapsed ? 'px-2' : 'px-3')}
      >
        {isBidder ? (
          <div>
            {!isCollapsed && (
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Vendor Portal
              </div>
            )}
            <nav className="space-y-1">
              {bidderNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    scroll={false}
                    onClick={saveScrollBeforeNav}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'transition duration-150 rounded-lg text-xs font-medium',
                      isCollapsed
                        ? 'relative flex h-10 w-10 mx-auto items-center justify-center p-2'
                        : 'flex items-center justify-between px-3 py-2.5',
                      item.active
                        ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                        : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                    )}
                  >
                    <div className={cn('flex items-center', !isCollapsed && 'gap-3')}>
                      <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {item.badge && !isCollapsed && (
                      <span className="rounded bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.badge && isCollapsed && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {!isCollapsed ? (
              <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Compliance Pre-Check
                </span>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  Submit authentic tender proposals. AI extracts and verifies compliance against mandatory clauses.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex justify-center" title="Compliance Pre-Check Active">
                <div className="h-8 w-8 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 flex items-center justify-center text-[#1464B4] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ) : isAdmin ? (
          <div>
            {!isCollapsed && (
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                System Administration
              </div>
            )}
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    scroll={false}
                    onClick={saveScrollBeforeNav}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'transition duration-150 rounded-lg text-xs font-medium',
                      isCollapsed
                        ? 'relative flex h-10 w-10 mx-auto items-center justify-center p-2'
                        : 'flex items-center justify-between px-3 py-2.5',
                      item.active
                        ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                        : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                    )}
                  >
                    <div className={cn('flex items-center', !isCollapsed && 'gap-3')}>
                      <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {item.badge && !isCollapsed && (
                      <span className="rounded bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-1.5 py-0.5 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.badge && isCollapsed && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-500" />
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
              {!isCollapsed && (
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Navigation
                </div>
              )}
              <nav className="space-y-1">
                {globalNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      scroll={false}
                      onClick={saveScrollBeforeNav}
                      title={isCollapsed ? item.name : undefined}
                      className={cn(
                        'transition duration-150 rounded-lg text-xs font-medium',
                        isCollapsed
                          ? 'relative flex h-10 w-10 mx-auto items-center justify-center p-2'
                          : 'flex items-center justify-between px-3 py-2.5',
                        item.active
                          ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                          : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                      )}
                    >
                      <div className={cn('flex items-center', !isCollapsed && 'gap-3')}>
                        <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* Tender Workspace Navigation */}
            <div>
              {!isCollapsed && (
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Tender Workspace
                </div>
              )}
              <nav className="space-y-1">
                {tenderWorkspaceNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      scroll={false}
                      onClick={saveScrollBeforeNav}
                      title={isCollapsed ? item.name : undefined}
                      className={cn(
                        'transition duration-150 rounded-lg text-xs font-medium',
                        isCollapsed
                          ? 'relative flex h-10 w-10 mx-auto items-center justify-center p-2'
                          : 'flex items-center justify-between px-3 py-2',
                        item.active
                          ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                          : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                      )}
                    >
                      <div className={cn('flex items-center truncate', !isCollapsed && 'gap-3')}>
                        <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {item.badge && !isCollapsed && (
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
                      {item.badge && isCollapsed && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Officer Review & Governance Modules */}
            <div>
              {!isCollapsed && (
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Review & Governance
                </div>
              )}
              <nav className="space-y-1">
                {officerReviewNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      scroll={false}
                      onClick={saveScrollBeforeNav}
                      title={isCollapsed ? item.name : undefined}
                      className={cn(
                        'transition duration-150 rounded-lg text-xs font-medium',
                        isCollapsed
                          ? 'relative flex h-10 w-10 mx-auto items-center justify-center p-2'
                          : 'flex items-center justify-between px-3 py-2.5',
                        item.active
                          ? 'bg-[#1464B4] text-white font-semibold shadow-xs'
                          : 'text-[#17324D] dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/80 hover:text-[#1464B4] dark:hover:text-white'
                      )}
                    >
                      <div className={cn('flex items-center', !isCollapsed && 'gap-3')}>
                        <Icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      {item.badge && !isCollapsed && (
                        <span className="rounded bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-1.5 py-0.5 text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                      {item.badge && isCollapsed && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>
        )}

        {/* GeM Integrated Card */}
        {!isCollapsed ? (
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
        ) : (
          <div className="flex justify-center" title="Government e-Marketplace (GeM) Integrated">
            <a
              href="https://gem.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              aria-label="Visit GeM Portal"
            >
              <div className="relative h-5 w-5">
                <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
                  <path d="M20 2L24 14L20 18L16 14L20 2Z" fill="#F47920" />
                  <path d="M38 15L27 20L20 18L24 14L38 15Z" fill="#1464B4" />
                  <path d="M31 34L22 26L20 18L27 20L31 34Z" fill="#0E3D6E" />
                  <path d="M9 34L18 26L20 18L22 26L9 34Z" fill="#2E8B57" />
                  <path d="M2 15L16 14L20 18L18 26L2 15Z" fill="#E65100" />
                </svg>
              </div>
            </a>
          </div>
        )}

        {/* Need Help Card */}
        {!isCollapsed ? (
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
        ) : (
          <div className="flex justify-center" title="Need Help? Contact Support">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-[#1464B4] dark:text-[#58A6FF] hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
              <Headphones className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Institutional Monument Watermark & National Branding */}
      <div className={cn(
        'border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden bg-gradient-to-b from-transparent to-slate-50/60 dark:to-slate-900/40',
        isCollapsed ? 'p-2' : 'p-3'
      )}>
        {!isCollapsed ? (
          <>
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
          </>
        ) : (
          <div className="flex justify-center" title="Digital India | Atmanirbhar Bharat">
            <div className="h-1.5 w-6 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#138808]" />
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
