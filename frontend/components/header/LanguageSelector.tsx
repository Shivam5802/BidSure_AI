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
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg bg-white border border-[#D8E3EC] hover:border-[#1464B4] hover:bg-[#F4F8FC] text-[#0B3558] font-medium text-[13.5px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4] shadow-xs select-none"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Select website language. Current language is ${languageConfig.englishName}`}
      >
        <Globe className="h-4 w-4 text-[#1464B4]" aria-hidden="true" />
        <span className="font-semibold text-[#0B3558]">{languageConfig.nativeName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#5B7084] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <LanguageDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
