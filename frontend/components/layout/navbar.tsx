import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              BidGuard <span className="text-brand-600 dark:text-brand-400">AI</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 uppercase">
              GeM Procurement Intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a href="#how-it-works" className="transition hover:text-brand-600 dark:hover:text-brand-400">
            How It Works
          </a>
          <a href="#capabilities" className="transition hover:text-brand-600 dark:hover:text-brand-400">
            Core Capabilities
          </a>
          <a href="#trust" className="transition hover:text-brand-600 dark:hover:text-brand-400">
            Governance & Trust
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Enter Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
