'use client';

import React, { useId } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const GOOGLE_TRANSLATE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ur', name: 'Urdu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'as', name: 'Assamese' },
  { code: 'ne', name: 'Nepali' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
] as const;

export function LanguageSelector() {
  const selectId = `lang-select-${useId().replace(/:/g, '')}`;
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div
      className="notranslate relative flex items-center gap-1.5"
      translate="no"
      title="Change language"
    >
      <Languages className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <label htmlFor={selectId} className="sr-only">
        Change language
      </label>
      <select
        id={selectId}
        translate="no"
        value={currentLanguage}
        onChange={(event) => setLanguage(event.target.value)}
        className="h-8.5 w-[94px] sm:w-[105px] rounded-lg border border-slate-200 bg-white px-1.5 sm:px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-[#1464B4] focus:ring-2 focus:ring-[#1464B4]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
      >
        {GOOGLE_TRANSLATE_LANGUAGES.map(({ code, name }) => (
          <option key={code} value={code} translate="no">
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export { GOOGLE_TRANSLATE_LANGUAGES };
