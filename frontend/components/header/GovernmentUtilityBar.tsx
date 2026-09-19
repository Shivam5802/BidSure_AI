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

          <span className="hidden md:inline text-slate-500 text-xs" aria-hidden="true">
            |
          </span>

          {/* Screen Reader Control */}
          <button
            onClick={handleScreenReaderToggle}
            className={`hidden sm:inline-flex items-center gap-1.5 transition-colors px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-white ${
              screenReaderActive
                ? 'text-amber-300 font-semibold bg-white/10'
                : 'text-slate-200 hover:text-white'
            }`}
            title="Toggle Screen Reader Assistance"
            aria-pressed={screenReaderActive}
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('screenReader', 'Screen Reader')}</span>
          </button>

          <span className="hidden sm:inline text-slate-500 text-xs" aria-hidden="true">
            |
          </span>

          {/* Font Size Adjusters (A+, A, A-) */}
          <div
            className="flex items-center gap-1 font-semibold text-[12px]"
            role="group"
            aria-label="Text size controls"
          >
            <button
              onClick={() => setFontSize('large')}
              className={`px-1.5 py-0.5 rounded transition ${
                fontSize === 'large'
                  ? 'text-white bg-white/20 font-bold'
                  : 'text-slate-200 hover:text-white'
              }`}
              title={t('fontSizeIncrease', 'Increase text size')}
              aria-label="Increase text size (A+)"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-1.5 py-0.5 rounded transition ${
                fontSize === 'normal'
                  ? 'text-white bg-white/20 font-bold'
                  : 'text-slate-200 hover:text-white'
              }`}
              title={t('fontSizeNormal', 'Default text size')}
              aria-label="Default text size (A)"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('small')}
              className={`px-1.5 py-0.5 rounded transition ${
                fontSize === 'small'
                  ? 'text-white bg-white/20 font-bold'
                  : 'text-slate-200 hover:text-white'
              }`}
              title={t('fontSizeDecrease', 'Decrease text size')}
              aria-label="Decrease text size (A-)"
            >
              A-
            </button>
          </div>

          <span className="text-slate-500 text-xs" aria-hidden="true">
            |
          </span>

          {/* Direct Hindi / English Quick Toggle */}
          <div
            className="notranslate flex items-center gap-1 text-[12px]"
            translate="no"
            role="group"
            aria-label="Quick language toggle"
          >
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentLanguage === 'hi'
                  ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-amber-300'
                  : 'text-slate-200 hover:text-white'
              }`}
              aria-current={currentLanguage === 'hi' ? 'true' : undefined}
            >
              हिंदी
            </button>
            <span className="text-slate-500 text-xs" aria-hidden="true">
              |
            </span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentLanguage === 'en'
                  ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-amber-300'
                  : 'text-slate-200 hover:text-white'
              }`}
              aria-current={currentLanguage === 'en' ? 'true' : undefined}
            >
              English
            </button>
          </div>

          <span className="text-slate-500 text-xs" aria-hidden="true">
            |
          </span>

          {/* Dark / Light Mode Button */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-300 transition-transform hover:rotate-45" aria-hidden="true" />
                <span className="text-[11.5px] font-semibold">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-200 transition-transform hover:-rotate-12" aria-hidden="true" />
                <span className="text-[11.5px] font-semibold">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
