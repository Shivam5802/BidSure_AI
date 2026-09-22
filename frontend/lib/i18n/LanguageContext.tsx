'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_MAP, LanguageConfig } from './languages';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import bn from '@/locales/bn.json';
import te from '@/locales/te.json';
import mr from '@/locales/mr.json';
import ta from '@/locales/ta.json';
import gu from '@/locales/gu.json';
import ur from '@/locales/ur.json';
import kn from '@/locales/kn.json';
import ml from '@/locales/ml.json';
import orLocale from '@/locales/or.json';
import pa from '@/locales/pa.json';
import asLocale from '@/locales/as.json';
import ne from '@/locales/ne.json';
import sa from '@/locales/sa.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import pt from '@/locales/pt.json';
import ar from '@/locales/ar.json';
import zhCN from '@/locales/zh-CN.json';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';

const TRANSLATIONS_MAP: Record<string, Record<string, any>> = {
  en,
  hi,
  bn,
  te,
  mr,
  ta,
  gu,
  ur,
  kn,
  ml,
  or: orLocale,
  pa,
  as: asLocale,
  ne,
  sa,
  es,
  fr,
  de,
  pt,
  ar,
  'zh-CN': zhCN,
  ja,
  ko,
};

export type FontSizeOption = 'normal' | 'large' | 'small';

interface LanguageContextType {
  currentLanguage: string;
  languageConfig: LanguageConfig;
  direction: 'ltr' | 'rtl';
  setLanguage: (code: string) => void;
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  screenReaderActive: boolean;
  setScreenReaderActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  t: (keyPath: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bidsure_preferred_language';

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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [screenReaderActive, setScreenReaderActive] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Apply Google Translate to page DOM
  const applyGoogleTranslate = useCallback((langCode: string) => {
    if (typeof window === 'undefined') return;

    if (langCode === 'en') {
      const googleSelect = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (googleSelect) {
        googleSelect.value = '';
        googleSelect.dispatchEvent(new Event('change'));
      }
      const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = `googtrans=; expires=${expired}; path=/`;
      if (window.location.hostname) {
        document.cookie = `googtrans=; expires=${expired}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=; expires=${expired}; path=/; domain=.${window.location.hostname}`;
      }
      return;
    }

    // Set cookie for Google Translate
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    if (window.location.hostname) {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;
    }

    // Polling retry to set select element once Google Translate is ready
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const googleSelect = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (googleSelect) {
        if (googleSelect.value !== langCode) {
          googleSelect.value = langCode;
          googleSelect.dispatchEvent(new Event('change'));
        }
        clearInterval(interval);
      } else if (attempts > 35) {
        clearInterval(interval);
      }
    }, 150);
  }, []);

  // Initialize from localStorage or default
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && LANGUAGE_MAP[savedLang]) {
        setCurrentLanguage(savedLang);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Mount Google Translate script & hidden target
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initGoogleTranslate = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const target = document.getElementById('bidsure-google-translate-target');
      if (!target || target.dataset.initialized) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: ALL_LANGUAGES.filter((l) => l.code !== 'en')
            .map((l) => l.code)
            .join(','),
          autoDisplay: 'false',
        },
        'bidsure-google-translate-target'
      );
      target.dataset.initialized = 'true';

      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && savedLang !== 'en') {
        applyGoogleTranslate(savedLang);
      }
    };

    window.googleTranslateElementInit = initGoogleTranslate;

    // Observe body styles to prevent top banner gap
    const cleanBanner = () => {
      document
        .querySelectorAll<HTMLElement>(
          'iframe.goog-te-banner-frame, iframe[class*="goog-te-banner-frame"], .goog-te-banner-frame, body > .skiptranslate'
        )
        .forEach((banner) => {
          banner.style.display = 'none';
          banner.style.visibility = 'hidden';
        });
      if (document.body && document.body.style.top !== '0px' && document.body.style.top !== '') {
        document.body.style.top = '0px';
      }
    };

    cleanBanner();
    const observer = new MutationObserver(cleanBanner);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

    // Inject Google Translate script if not already present
    if (window.google?.translate?.TranslateElement) {
      initGoogleTranslate();
    } else if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      observer.disconnect();
    };
  }, [applyGoogleTranslate]);

  const languageConfig = useMemo(() => {
    return LANGUAGE_MAP[currentLanguage] || DEFAULT_LANGUAGE;
  }, [currentLanguage]);

  const direction = languageConfig.direction;

  // Synchronize document dir, lang, and font size
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.lang = languageConfig.code;
      root.dir = direction;

      if (fontSize === 'large') {
        root.style.fontSize = '112.5%';
      } else if (fontSize === 'small') {
        root.style.fontSize = '90%';
      } else {
        root.style.fontSize = '100%';
      }
    }
  }, [languageConfig, direction, fontSize]);

  const setLanguage = useCallback(
    (code: string) => {
      if (!LANGUAGE_MAP[code]) return;
      setCurrentLanguage(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // Ignore storage errors
      }
      applyGoogleTranslate(code);
    },
    [applyGoogleTranslate]
  );

  const t = useCallback(
    (keyPath: string, fallback?: string): string => {
      const currentCatalog = TRANSLATIONS_MAP[currentLanguage] || TRANSLATIONS_MAP['en'];
      const defaultCatalog = TRANSLATIONS_MAP['en'];

      const getNested = (obj: any, path: string) => {
        if (!obj) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
      };

      const resolved = getNested(currentCatalog, keyPath);
      if (typeof resolved === 'string' && resolved.trim().length > 0) {
        return resolved;
      }

      const defaultResolved = getNested(defaultCatalog, keyPath);
      if (typeof defaultResolved === 'string' && defaultResolved.trim().length > 0) {
        return defaultResolved;
      }

      return fallback ?? keyPath;
    },
    [currentLanguage]
  );

  const value = useMemo(
    () => ({
      currentLanguage,
      languageConfig,
      direction,
      setLanguage,
      fontSize,
      setFontSize,
      screenReaderActive,
      setScreenReaderActive,
      t,
    }),
    [currentLanguage, languageConfig, direction, setLanguage, fontSize, screenReaderActive, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div
        id="bidsure-google-translate-target"
        className="google-translate-target sr-only notranslate"
        translate="no"
        aria-hidden="true"
        style={{ display: 'none' }}
      />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
