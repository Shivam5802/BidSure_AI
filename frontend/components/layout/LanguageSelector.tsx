'use client';

import React, { useEffect, useId, useState } from 'react';
import { Languages } from 'lucide-react';

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

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (options: Record<string, string>, elementId: string) => unknown;
      };
    };
  }
}

function initializeGoogleTranslate() {
  if (!window.google?.translate?.TranslateElement) return;

  document.querySelectorAll<HTMLElement>('[data-google-translate-target]').forEach((target) => {
    if (target.dataset.googleTranslateInitialized) return;

    new window.google!.translate!.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: GOOGLE_TRANSLATE_LANGUAGES.filter(({ code }) => code !== 'en')
          .map(({ code }) => code)
          .join(','),
        autoDisplay: 'false',
      },
      target.id
    );
    target.dataset.googleTranslateInitialized = 'true';
  });
}

function hideGoogleTranslateBanner() {
  document
    .querySelectorAll<HTMLElement>(
      'iframe.goog-te-banner-frame, iframe[class*="goog-te-banner-frame"], .goog-te-banner-frame, body > .skiptranslate'
    )
    .forEach((banner) => {
      banner.style.display = 'none';
      banner.style.visibility = 'hidden';
    });
  if (document.body.style.top !== '0px') {
    document.body.style.top = '0px';
  }
}

export function LanguageSelector() {
  const targetId = `google-translate-${useId().replace(/:/g, '')}`;
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    window.googleTranslateElementInit = initializeGoogleTranslate;
    hideGoogleTranslateBanner();

    const bannerObserver = new MutationObserver(hideGoogleTranslateBanner);
    bannerObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslate();
    } else if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => bannerObserver.disconnect();
  }, []);

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    const googleSelect = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (!googleSelect) return;

    googleSelect.value = nextLanguage === 'en' ? '' : nextLanguage;
    googleSelect.dispatchEvent(new Event('change'));
  };

  return (
    <div className="relative flex items-center gap-1.5" title="Change language">
      <Languages className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <label htmlFor={`${targetId}-select`} className="sr-only">
        Change language
      </label>
      <select
        id={`${targetId}-select`}
        value={language}
        onChange={(event) => handleLanguageChange(event.target.value)}
        className="h-9 max-w-[9rem] rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {GOOGLE_TRANSLATE_LANGUAGES.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <div id={targetId} data-google-translate-target className="google-translate-target" aria-hidden="true" />
    </div>
  );
}

export { GOOGLE_TRANSLATE_LANGUAGES };
