'use client';

import React, { useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import {
  INDIAN_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
  LanguageConfig,
} from '@/lib/i18n/languages';
import { useLanguage } from '@/lib/i18n';

interface LanguageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageDropdown({ isOpen, onClose }: LanguageDropdownProps) {
  const { currentLanguage, setLanguage, direction, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRTL = direction === 'rtl';

  // Close on Escape key and Click Outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    onClose();
  };

  const renderLanguageItem = (lang: LanguageConfig) => {
    const isSelected = currentLanguage === lang.code;

    return (
      <button
        key={lang.code}
        type="button"
        onClick={() => handleSelectLanguage(lang.code)}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors duration-150 text-left w-full focus:outline-none focus:ring-1 focus:ring-[#1464B4] ${
          isSelected
            ? 'bg-[#EBF3FC] text-[#1464B4] font-semibold'
            : 'text-[#17324D] hover:bg-[#F4F8FC] hover:text-[#1464B4]'
        }`}
        aria-selected={isSelected}
        role="option"
      >
        <span className="truncate">{lang.nativeName}</span>
        {isSelected && (
          <Check className="h-4 w-4 text-[#1464B4] flex-shrink-0 ml-1.5" aria-hidden="true" />
        )}
      </button>
    );
  };

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Language selection modal"
      aria-modal="false"
      className={`absolute top-[calc(100%+8px)] ${
        isRTL ? 'left-0' : 'right-0'
      } w-[92vw] sm:w-[440px] md:w-[480px] bg-white rounded-xl shadow-2xl border border-[#D8E3EC] p-5 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#17324D] select-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D8E3EC]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-md bg-[#F4F8FC] text-[#1464B4]">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[15px] font-bold text-[#0B3558] leading-tight">
              {t('selector.title', 'Select Language')}
            </span>
            <span className="text-[11px] font-medium text-[#5B7084] leading-tight">
              {t('selector.subtitle', 'भाषा चुनें')}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[#1464B4] bg-[#EBF3FC] px-2 py-0.5 rounded-full">
          23 Languages
        </span>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pr-1 mt-3 space-y-4">
        {/* Section 1: Indian Languages (14) */}
        <div>
          <div className="text-[11px] font-bold tracking-wider text-[#5B7084] uppercase mb-2 px-1">
            {t('selector.indianLanguages', 'INDIAN LANGUAGES (14)')}
          </div>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-1"
            role="listbox"
            aria-label="Indian Languages"
          >
            {INDIAN_LANGUAGES.map(renderLanguageItem)}
          </div>
        </div>

        {/* Section 2: International Languages (9) */}
        <div>
          <div className="text-[11px] font-bold tracking-wider text-[#5B7084] uppercase mb-2 px-1">
            {t('selector.internationalLanguages', 'INTERNATIONAL LANGUAGES (9)')}
          </div>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-1"
            role="listbox"
            aria-label="International Languages"
          >
            {INTERNATIONAL_LANGUAGES.map(renderLanguageItem)}
          </div>
        </div>
      </div>
    </div>
  );
}
