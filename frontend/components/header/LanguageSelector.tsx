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
  const { languageConfig } = useLanguage();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`notranslate relative inline-block ${className}`} translate="no">
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex items-center gap-1.5 xl:gap-2 h-9 px-2.5 xl:px-3 rounded-lg bg-white dark:bg-slate-800 border border-[#D8E3EC] dark:border-slate-700 hover:border-[#1464B4] dark:hover:border-[#58A6FF] hover:bg-[#F4F8FC] dark:hover:bg-slate-700/60 text-[#0B3558] dark:text-slate-100 font-medium text-[12.5px] xl:text-[13px] whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4] shadow-xs select-none"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Select website language. Current language is ${languageConfig.englishName}`}
      >
        <Globe className="h-3.5 w-3.5 text-[#1464B4] dark:text-[#58A6FF]" aria-hidden="true" />
        <span className="font-semibold text-[#0B3558] dark:text-slate-100">{languageConfig.nativeName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#5B7084] dark:text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <LanguageDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
