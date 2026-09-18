'use client';

import React, { useState, useEffect } from 'react';

export function GovernmentTopBar() {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [screenReaderActive, setScreenReaderActive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'large') {
      root.style.fontSize = '112.5%';
    } else if (fontSize === 'small') {
      root.style.fontSize = '90%';
    } else {
      root.style.fontSize = '100%';
    }
  }, [fontSize]);

  return (
    <div
      role="region"
      aria-label="Government Official Bar"
      className="bg-[#082B4C] text-white text-[12px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#123B63] select-none"
    >
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Official Indian Government Authority Identification */}
        <div className="flex items-center gap-2.5 font-medium tracking-wide">
          {/* Institutional Emblem Placeholder Icon */}
          <div className="flex items-center justify-center h-4 w-4 text-amber-300">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12 2L15 8H9L12 2Z" />
              <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M12 9V19M7 14H17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-slate-300 font-medium">Government of India</span>
          <span className="text-slate-500" aria-hidden="true">|</span>
          <span className="text-slate-100 font-semibold tracking-normal">Department of Expenditure</span>
        </div>

        {/* Right: Accessibility & Internationalization Controls */}
        <div className="flex items-center gap-3 text-slate-300 text-[11px]">
          <a
            href="#main-content"
            className="hover:text-amber-300 transition-colors hidden sm:inline focus:outline-none focus:ring-1 focus:ring-amber-300 rounded px-1"
          >
            Skip to main content
          </a>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>

          <button
            onClick={() => setScreenReaderActive(!screenReaderActive)}
            className={`hover:text-amber-300 transition-colors hidden md:inline px-1 rounded ${
              screenReaderActive ? 'text-amber-300 underline font-semibold' : ''
            }`}
            title="Screen Reader Access"
            aria-pressed={screenReaderActive}
          >
            Screen Reader
          </button>

          <span className="text-slate-600 hidden md:inline" aria-hidden="true">|</span>

          {/* Font Resizing Controls (A-, A, A+) */}
          <div className="flex items-center gap-1 font-semibold text-[11px]" role="group" aria-label="Text size controls">
            <button
              onClick={() => setFontSize('large')}
              className={`hover:text-amber-300 px-1 py-0.5 rounded transition ${
                fontSize === 'large' ? 'text-amber-300 bg-white/10 font-bold' : 'text-slate-300'
              }`}
              title="Increase text size"
              aria-label="Increase text size (A+)"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('normal')}
              className={`hover:text-amber-300 px-1 py-0.5 rounded transition ${
                fontSize === 'normal' ? 'text-amber-300 bg-white/10 font-bold' : 'text-slate-300'
              }`}
              title="Normal text size"
              aria-label="Default text size (A)"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('small')}
              className={`hover:text-amber-300 px-1 py-0.5 rounded transition ${
                fontSize === 'small' ? 'text-amber-300 bg-white/10 font-bold' : 'text-slate-300'
              }`}
              title="Decrease text size"
              aria-label="Decrease text size (A-)"
            >
              A-
            </button>
          </div>

          <span className="text-slate-600" aria-hidden="true">|</span>

          {/* Bilingual Switch */}
          <div className="flex items-center gap-1.5 font-medium" role="group" aria-label="Language selection">
            <button
              onClick={() => setLang('hi')}
              className={`transition-colors px-1 py-0.5 rounded ${
                lang === 'hi' ? 'text-amber-300 font-bold underline' : 'hover:text-amber-200'
              }`}
            >
              हिंदी
            </button>
            <span className="text-slate-500" aria-hidden="true">|</span>
            <button
              onClick={() => setLang('en')}
              className={`transition-colors px-1 py-0.5 rounded ${
                lang === 'en' ? 'text-amber-300 font-bold underline' : 'hover:text-amber-200'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
