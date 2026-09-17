import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            {/* Custom Shield with 4-point star SVG */}
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" strokeWidth="1.5">
              <path
                d="M12 2.5C7.5 4.5 3.5 3.5 3.5 3.5C3.5 13.5 7.5 19.5 12 21.5C16.5 19.5 20.5 13.5 20.5 3.5C20.5 3.5 16.5 4.5 12 2.5Z"
                fill="currentColor"
                fillOpacity="0.15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 7L13.2 10.8L17 12L13.2 13.2L12 17L10.8 13.2L7 12L10.8 10.8L12 7Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Bidguard <span className="text-blue-600 dark:text-blue-400">AI</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
              GEM PROCUREMENT INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a
            href="#how-it-works"
            className="transition hover:text-blue-600 dark:hover:text-blue-400"
          >
            How It Works
          </a>
          <a
            href="#capabilities"
            className="transition hover:text-blue-600 dark:hover:text-blue-400"
          >
            Core Capabilities
          </a>
          <a
            href="#trust"
            className="transition hover:text-blue-600 dark:hover:text-blue-400"
          >
            Governance & Trust
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm px-4 sm:px-5 py-2.5 shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]">
              <span>Enter Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
