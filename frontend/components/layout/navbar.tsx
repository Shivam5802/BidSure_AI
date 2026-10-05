'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  LogOut,
  Menu,
  LayoutDashboard,
  FileText,
  Layers,
  BrainCircuit,
  Calculator,
  History,
  Headphones,
  X,
  ChevronRight,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from '@/components/theme';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
import { LanguageSelector } from './LanguageSelector';
import { getRoleLabel, getRoleDashboard, getInitials } from '@/types/auth';

// ─── Nav items per role ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const OFFICER_NAV: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',            icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Tenders',      href: '/dashboard/tenders',    icon: <FileText className="h-4 w-4" /> },
  { label: 'Compliance',   href: '/dashboard/compliance', icon: <Layers className="h-4 w-4" /> },
  { label: 'AI Analysis',  href: '/dashboard/ai',         icon: <BrainCircuit className="h-4 w-4" /> },
  { label: 'Cost Est.',    href: '/dashboard/cost',       icon: <Calculator className="h-4 w-4" /> },
  { label: 'Audit Log',    href: '/dashboard/audit',      icon: <History className="h-4 w-4" /> },
  { label: 'Support',      href: '/dashboard/support',    icon: <Headphones className="h-4 w-4" /> },
];

const BIDDER_NAV: NavItem[] = [
  { label: 'Dashboard',    href: '/bidder/dashboard',      icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Tenders',      href: '/bidder/tenders',        icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', href: '/bidder/applications',   icon: <Layers className="h-4 w-4" /> },
  { label: 'AI Assistant', href: '/bidder/ai',             icon: <BrainCircuit className="h-4 w-4" /> },
  { label: 'Profile',      href: '/bidder/profile',        icon: <History className="h-4 w-4" /> },
  { label: 'Support',      href: '/bidder/support',        icon: <Headphones className="h-4 w-4" /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',    href: '/admin/dashboard',       icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Users',        href: '/admin/users',           icon: <Layers className="h-4 w-4" /> },
  { label: 'Tenders',      href: '/admin/tenders',         icon: <FileText className="h-4 w-4" /> },
  { label: 'Analytics',    href: '/admin/analytics',       icon: <BrainCircuit className="h-4 w-4" /> },
  { label: 'Settings',     href: '/admin/settings',        icon: <Calculator className="h-4 w-4" /> },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname() || '';
  const { user, logout } = useAuth();

  const [backendHealth, setBackendHealth]   = useState<'checking' | 'healthy' | 'unreachable'>('checking');
  const [isLoggingOut, setIsLoggingOut]     = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [mobileOpen, setMobileOpen]         = useState(false);

  // ── Backend health ping ──────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const data = await api.checkHealth();
        if (mounted) setBackendHealth(data.status === 'healthy' ? 'healthy' : 'unreachable');
      } catch {
        if (mounted) setBackendHealth('unreachable');
      }
    };
    void check();
    const id = setInterval(check, 20_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/login');
    } catch {
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ── Derived display values ───────────────────────────────────────────────
  const rawName        = user?.name || (user?.role === 'BIDDER' ? 'Vikram Mehta' : 'Rajesh Kumar');
  const cleanName      = rawName.replace(/\s*\(.*?\)\s*/g, '').trim() || rawName;
  const initials       = cleanName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'US';

  const getRoleLabel = () => {
    if (user?.designation) return user.designation;
    if (user?.role === 'ADMIN')   return 'System Administrator';
    if (user?.role === 'BIDDER')  return 'Authorized Bidder';
    return 'Senior Procurement Officer';
  };

  const homeHref = user?.role === 'BIDDER' ? '/bidder/dashboard' : user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  const navItems: NavItem[] =
    user?.role === 'BIDDER' ? BIDDER_NAV :
    user?.role === 'ADMIN'  ? ADMIN_NAV  :
    OFFICER_NAV;

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && href !== '/bidder/dashboard' && href !== '/admin/dashboard' && pathname.startsWith(href));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-40 flex h-auto min-h-[68px] w-full max-w-full flex-wrap items-center justify-between gap-y-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] px-3 py-2 sm:h-[68px] sm:flex-nowrap sm:py-0 sm:px-4 lg:px-6 select-none transition-colors duration-200 shadow-sm">

        {/* ── LEFT: Brand + Mobile Hamburger ── */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden transition focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo + Wordmark */}
          <Link href="/" className="flex items-center gap-2 group" title="Return to Home">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center filter drop-shadow-[0_2px_4px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform duration-150">
              <ShieldLogo className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
            <div className="flex flex-col text-left justify-center">
              <div className="flex items-center text-[18px] sm:text-[20px] font-black tracking-[-0.03em] leading-none">
                <span className="text-[#0A2E5C] dark:text-white">Bid</span>
                <span className="text-[#1168CE] dark:text-[#38BDF8]">Sure</span>
              </div>
              <span className="hidden sm:block text-[9.5px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mt-0.5 leading-tight whitespace-nowrap">
                Government Procurement Compliance
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-4 xl:ml-6">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap
                  ${isActive(item.href)
                    ? 'bg-[#EEF4FF] text-[#1464B4] dark:bg-[#1464B4]/15 dark:text-[#58AAFF]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* ── CENTER: Search bar ── */}
        <div className="hidden md:flex items-center flex-1 max-w-xs xl:max-w-sm mx-2 sm:mx-3 lg:mx-4 min-w-[160px]">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tenders, bids, vendors..."
              className="h-9 w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-4 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1464B4] transition shadow-sm"
            />
          </div>
        </div>

        {/* ── RIGHT: Controls + User profile ── */}
        <div className="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto sm:gap-2">

          {/* Backend health dot */}
          <div
            title={backendHealth === 'healthy' ? 'Backend: Connected' : backendHealth === 'checking' ? 'Backend: Checking…' : 'Backend: Unreachable'}
            className={`hidden sm:block h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#071324] ${
              backendHealth === 'healthy'    ? 'bg-emerald-500' :
              backendHealth === 'checking'   ? 'bg-amber-400 animate-pulse' :
                                              'bg-rose-500'
            }`}
          />

          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme toggle */}
          <ThemeToggle variant="pill" />

          {/* Notification Bell */}
          <button
            type="button"
            className="relative inline-flex items-center justify-center h-8 w-8 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-[#1464B4] shrink-0"
            aria-label="Notifications - 9 unread compliance alerts"
            title="9 unread alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#071324]">
              9
            </span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A2540] dark:bg-slate-800 text-white font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm"
              title={rawName}
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left max-w-[100px] md:max-w-[130px] xl:max-w-[160px] min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate" title={rawName}>
                {cleanName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate" title={getRoleLabel()}>
                {getRoleLabel()}
              </span>
            </div>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 ml-0.5"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE SLIDE-DOWN NAV ── */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[68px] z-30 bg-white dark:bg-[#071324] border-b border-slate-200 dark:border-slate-800 shadow-xl md:hidden">
          {/* Mobile Search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tenders, bids, vendors..."
                className="h-9 w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-4 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1464B4] transition"
              />
            </div>
          </div>

          {/* Mobile Nav Links */}
          <nav className="px-3 pb-4 space-y-0.5">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(item.href)
                    ? 'bg-[#EEF4FF] text-[#1464B4] dark:bg-[#1464B4]/15 dark:text-[#58AAFF]'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            ))}
          </nav>

          {/* Mobile Footer: User + Logout */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A2540] dark:bg-slate-800 text-white font-bold text-xs">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{cleanName}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{getRoleLabel()}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-lg transition shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
