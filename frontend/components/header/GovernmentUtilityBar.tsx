'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { Volume2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme';

export function GovernmentUtilityBar() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const {
    currentLanguage,
    setLanguage,
    fontSize,
    setFontSize,
    screenReaderActive,
    setScreenReaderActive,
    t,
  } = useLanguage();

  const handleScreenReaderToggle = () => {
    const nextState = !screenReaderActive;
    setScreenReaderActive(nextState);
    if (nextState) {
      const utterance = new SpeechSynthesisUtterance(
        'Screen reader assistance activated for BidSure Government Procurement Portal.'
      );
      window.speechSynthesis?.speak(utterance);
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  return (
    <div
      role="region"
      aria-label="Government of India Utility Bar"
      className="bg-[#0B3558] text-white border-b border-[#123E66] select-none h-[60px] flex items-center px-4 sm:px-6 lg:px-10 z-40 relative"
    >
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left Side: National Emblem and Ministry Title */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-9 flex-shrink-0">
            <Image
              src="/images/emblem_white.png"
              alt="State Emblem of India"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[13px] font-semibold tracking-wide text-white">
              {t('govtOfIndia', 'Government of India')}
            </span>
            <span className="text-[11px] font-normal text-slate-200 tracking-normal">
              {t('deptOfExpenditure', 'Department of Expenditure')}
            </span>
          </div>
        </div>

        {/* Right Side: Accessibility and Quick Language Switch Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-slate-200 text-[12px] font-medium">
          {/* Skip to main content */}
          <a
            href="#main-content"
            className="hidden md:inline-flex items-center gap-1 text-slate-200 hover:text-white transition-colors focus:ring-1 focus:ring-white rounded px-1.5 py-0.5"
          >
            <span>{t('skipToMain', 'Skip to main content')}</span>
          </a>        
        </div>
      </div>
    </div>
  );
}
