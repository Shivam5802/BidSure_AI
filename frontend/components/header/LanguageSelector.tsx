'use client';

import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { LanguageDropdown } from './LanguageDropdown';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { languageConfig, currentLanguage } = useLanguage();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const isEnglish = currentLanguage === 'en';

  return (
    <div className={`notranslate relative inline-block ${className}`} translate="no">
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold shrink-0 cursor-pointer shadow-xs ${
          isOpen
            ? 'border-[#1a6aef] bg-blue-500/10 text-[#1a6aef]'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-[#1a6aef] hover:bg-slate-50 dark:hover:bg-slate-700/60'
        }`}
        title="Select Language"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Globe
          className={`w-3.5 h-3.5 shrink-0 ${
            isOpen ? 'text-[#1a6aef]' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-hidden="true"
        />
        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 hidden min-[480px]:inline">
          {languageConfig.englishName}
        </span>
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 min-[480px]:hidden uppercase">
          {languageConfig.shortCode}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <LanguageDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
