'use client';

import React, { useId } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { ALL_LANGUAGES, INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from '@/lib/i18n/languages';

export function LanguageSelector() {
  const selectId = `lang-select-${useId().replace(/:/g, '')}`;
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div
      className="notranslate relative flex items-center gap-1.5"
      translate="no"
      title="Change language / भाषा चुनें"
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
        className="h-8.5 w-[110px] sm:w-[140px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-[#1a6aef] focus:ring-2 focus:ring-[#1a6aef]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
      >
        <optgroup label="Default">
          <option value="en" translate="no">
            English (English)
          </option>
        </optgroup>
        <optgroup label={`Indian Languages (${INDIAN_LANGUAGES.length})`}>
          {INDIAN_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} translate="no">
              {lang.nativeName} ({lang.englishName})
            </option>
          ))}
        </optgroup>
        <optgroup label={`International (${INTERNATIONAL_LANGUAGES.length - 1})`}>
          {INTERNATIONAL_LANGUAGES.filter((l) => l.code !== 'en').map((lang) => (
            <option key={lang.code} value={lang.code} translate="no">
              {lang.nativeName} ({lang.englishName})
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

export const GOOGLE_TRANSLATE_LANGUAGES = ALL_LANGUAGES.map((l) => ({
  code: l.code,
  name: `${l.nativeName} (${l.englishName})`,
}));
