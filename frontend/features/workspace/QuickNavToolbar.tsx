'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Calculator,
  Users,
  Shield,
  BookOpen,
  Layers,
  SlidersHorizontal,
  BarChart3,
  LayoutDashboard,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme';
import { cn } from '@/lib/utils';

interface QuickNavToolbarProps {
  tenderId: string;
}

export const QuickNavToolbar: React.FC<QuickNavToolbarProps> = ({ tenderId }) => {
  const pathname = usePathname() || '';

  const navItems = [
    {
      name: 'Command Center',
      href: `/tenders/${tenderId}/workspace`,
      icon: Layers,
      active: pathname.endsWith('/workspace'),
    },
    {
      name: 'Tender Documents',
      href: `/tenders/${tenderId}/documents`,
      icon: FileText,
      active: pathname.includes('/documents') && !pathname.includes('/bidders/'),
    },
    {
      name: 'Requirements',
      href: `/tenders/${tenderId}/requirements`,
      icon: BookOpen,
      active: pathname.endsWith('/requirements'),
    },
    {
      name: 'Compliance Rules',
      href: `/tenders/${tenderId}/rules`,
      icon: Calculator,
      active: pathname.endsWith('/rules'),
    },
    {
      name: 'Bidders & Evidence',
      href: `/tenders/${tenderId}/bidders`,
      icon: Users,
      active: pathname.includes('/bidders'),
    },
    {
      name: 'Bidder Comparison',
      href: `/tenders/${tenderId}/comparison`,
      icon: SlidersHorizontal,
      active: pathname.endsWith('/comparison'),
    },
    {
      name: 'Intelligence & Risk',
      href: `/tenders/${tenderId}/intelligence`,
      icon: BarChart3,
      active: pathname.endsWith('/intelligence'),
    },
    {
      name: 'Audit Reports',
      href: `/tenders/${tenderId}/reports`,
      icon: Shield,
      active: pathname.includes('/reports'),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3 flex-wrap text-xs select-none">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1464B4] dark:text-[#58A6FF] font-bold text-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10.5px] tracking-wider hidden sm:inline">
          Officer Modules:
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 text-xs',
                item.active
                  ? 'bg-[#1464B4] text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-[#F4F8FC] dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#1464B4] dark:hover:text-white'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 shrink-0', item.active ? 'text-white' : 'text-[#1464B4] dark:text-[#58A6FF]')} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
          <ThemeToggle variant="pill" />
        </div>
      </div>
    </div>
  );
};
