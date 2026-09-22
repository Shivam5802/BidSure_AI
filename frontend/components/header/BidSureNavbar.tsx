'use client';

import React, { useState, useEffect } from 'react';
import { BidSureLogo } from './BidSureLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { GeMBrand } from './GeMBrand';
import { LanguageSelector } from './LanguageSelector';
import { LoginButton } from './LoginButton';
import { GetStartedButton } from './GetStartedButton';
import { MobileNavigation } from './MobileNavigation';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme';

export function BidSureNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white dark:bg-[#081528] transition-all duration-200 border-b border-[#D8E3EC] dark:border-slate-800 ${
        isScrolled
          ? 'h-[78px] shadow-sm bg-white/98 dark:bg-[#081528]/98 backdrop-blur-xs'
          : 'h-[96px] lg:h-[104px]'
      }`}
    >
      <div className="w-full max-w-[1440px] h-full mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-6 2xl:px-8 gap-2 xl:gap-3">
        {/* Left: BidSure Branding */}
        <div className="flex-shrink-0">
          <BidSureLogo />
        </div>

        {/* Center: Main Navigation */}
        <div className="hidden xl:flex items-center justify-center flex-1 min-w-0 px-2">
          <DesktopNavigation />
        </div>

        {/* Right: GeM + Language + Theme + Login + Get Started */}
        <div className="hidden xl:flex items-center gap-1.5 xl:gap-2 2xl:gap-2.5 flex-shrink-0">
          <GeMBrand />
          <LanguageSelector />
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-800 border border-[#D8E3EC] dark:border-slate-700 hover:border-[#1464B4] dark:hover:border-[#58A6FF] hover:bg-[#F4F8FC] dark:hover:bg-slate-700/60 text-[#0B3558] dark:text-slate-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-[#0B3558] transition-transform hover:-rotate-12" />
            )}
          </button>
          <LoginButton />
          <GetStartedButton />
        </div>

        {/* Mobile Navigation Trigger */}
        <MobileNavigation />
      </div>
    </header>
  );
}
