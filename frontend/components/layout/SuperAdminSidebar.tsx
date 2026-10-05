'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Sliders,
  Database,
  Layers,
  ChevronRight,
  LogOut,
  Terminal,
  Activity,
  Cpu,
  Lock,
  History,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';
import { ShieldLogo } from '@/components/ui/ShieldLogo';

export function SuperAdminSidebar() {
  const pathname = usePathname() || '';
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      name: 'Master Command Deck',
      href: '/super-admin/dashboard',
      icon: LayoutDashboard,
      badge: 'LIVE',
      active: pathname === '/super-admin/dashboard' || pathname === '/super-admin',
    },
    {
      name: 'Global User Registry',
      href: '/super-admin/users',
      icon: Users,
      badge: 'AUTH',
      active: pathname === '/super-admin/users',
    },
    {
      name: 'Admin Governance',
      href: '/super-admin/admins',
      icon: ShieldCheck,
      badge: 'ROOT',
      active: pathname === '/super-admin/admins',
    },
    {
      name: 'Roles & RBAC Matrix',
      href: '/super-admin/roles',
      icon: Lock,
      active: pathname === '/super-admin/roles',
    },
    {
      name: 'Tender & Bid Oversight',
      href: '/super-admin/oversight',
      icon: Layers,
      active: pathname === '/super-admin/oversight',
    },
    {
      name: 'Statutory Compliance Rules',
      href: '/super-admin/compliance',
      icon: Terminal,
      active: pathname === '/super-admin/compliance',
    },
    {
      name: 'Connector Registry',
      href: '/super-admin/integrations',
      icon: BrainCircuit,
      active: pathname === '/super-admin/integrations',
    },
    {
      name: 'AI Model & Processing',
      href: '/super-admin/ai-engine',
      icon: Cpu,
      badge: 'GEMINI',
      active: pathname === '/super-admin/ai-engine',
    },
    {
      name: 'Security Vault & Threat Logs',
      href: '/super-admin/security',
      icon: ShieldAlert,
      badge: 'DEFENSE',
      active: pathname === '/super-admin/security',
    },
    {
      name: 'Forensic Audit Ledger',
      href: '/super-admin/audit',
      icon: History,
      badge: 'SEALED',
      active: pathname === '/super-admin/audit',
    },
    {
      name: 'System Health & Metrics',
      href: '/super-admin/health',
      icon: Activity,
      active: pathname === '/super-admin/health',
    },
    {
      name: 'Incidents & Alerts Desk',
      href: '/super-admin/incidents',
      icon: AlertTriangle,
      active: pathname === '/super-admin/incidents',
    },
    {
      name: 'Executive Reports',
      href: '/super-admin/reports',
      icon: Sliders,
      active: pathname === '/super-admin/reports',
    },
    {
      name: 'Global System Config',
      href: '/super-admin/config',
      icon: Sliders,
      active: pathname === '/super-admin/config',
    },
    {
      name: 'Database & Snapshots',
      href: '/super-admin/database',
      icon: Database,
      badge: 'RECOVERY',
      active: pathname === '/super-admin/database',
    },
    {
      name: 'Super Admin Profile',
      href: '/super-admin/profile',
      icon: KeyRound,
      active: pathname === '/super-admin/profile',
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col border-r border-slate-800 bg-[#060c18] text-slate-300 transition-all duration-300 select-none',
        isCollapsed ? 'w-[72px]' : 'w-[270px]'
      )}
    >
      {/* Brand & Security Level Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4 bg-[#040812]">
        <Link href="/super-admin/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <ShieldLogo className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold tracking-wider text-cyan-400 uppercase">BidSure</span>
                <span className="rounded bg-cyan-950 px-1 py-0.2 text-[9px] font-mono text-cyan-300 border border-cyan-800/60 font-semibold">
                  ROOT
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">Super Admin Command</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            ROOT INFRASTRUCTURE
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all',
                item.active
                  ? 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                  : 'text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-200'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  item.active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'ml-2 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider border',
                        item.badge === 'LIVE'
                          ? 'border-emerald-500/30 bg-emerald-950/50 text-emerald-400'
                          : item.badge === 'ROOT'
                          ? 'border-cyan-500/30 bg-cyan-950/50 text-cyan-400'
                          : 'border-amber-500/30 bg-amber-950/50 text-amber-400'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}

        {/* Procurement Overseer Section */}
        <div className="pt-4">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              CROSS-PORTAL SURVEILLANCE
            </div>
          )}
          <Link
            href="/dashboard"
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 transition"
          >
            <Layers className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-400" />
            {!isCollapsed && <span>Procurement Officer View</span>}
          </Link>
          <Link
            href="/admin/dashboard"
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 transition"
          >
            <Users className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-400" />
            {!isCollapsed && <span>Standard Admin Console</span>}
          </Link>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="border-t border-slate-800/80 bg-[#040812] p-3">
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="truncate font-mono text-xs font-semibold text-slate-200">
                  {user?.name || 'Super Admin'}
                </span>
              </div>
              <p className="truncate text-[10px] font-mono text-cyan-400">
                SUPER ADMIN
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={async () => {
              await logout();
              window.location.href = '/super-admin/login';
            }}
            title="Terminate Root Session"
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-950/60 hover:text-rose-300 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
