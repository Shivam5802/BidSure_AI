'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_MAP, LanguageConfig } from './languages';


export type FontSizeOption = 'normal' | 'large' | 'small';

interface LanguageContextType {
  currentLanguage: string;
  detectedRegionCode: string | null;
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

/**
 * Detect regional language candidate based on client locale & timezone
 */
function detectRegionalLanguage(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'hi';
  try {
    const navLangs = navigator.languages ? [...navigator.languages] : [navigator.language || ''];
    for (const raw of navLangs) {
      if (!raw) continue;
      const lower = raw.toLowerCase();
      // Look for exact or prefix matches with supported Indian/regional languages
      for (const lang of ALL_LANGUAGES) {
        if (lang.code === 'en') continue;
        if (lower === lang.code.toLowerCase() || lower.startsWith(`${lang.code.toLowerCase()}-`)) {
          return lang.code;
        }
      }
    }

    // Check timezone for Indian subcontinent
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone && (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('Asia/Colombo'))) {
      return 'hi'; // Default regional Indian language recommendation
    }
  } catch {
    // fallback
  }
  return 'hi';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [detectedRegionCode, setDetectedRegionCode] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [screenReaderActive, setScreenReaderActive] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Apply Google Translate to page DOM
  const applyGoogleTranslate = useCallback((langCode: string) => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isEnglish = !langCode || langCode === 'en';

    if (isEnglish) {
      const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
      const domains = [hostname, `.${hostname}`, ''];
      const paths = ['/', '/en', ''];
      domains.forEach((d) => {
        paths.forEach((p) => {
          document.cookie = `googtrans=; expires=${expired}; path=${p}${d ? `; domain=${d}` : ''}`;
        });
      });

      const isCurrentlyTranslated =
        document.documentElement.classList.contains('translated-ltr') ||
        document.documentElement.classList.contains('translated-rtl') ||
        !!(document.querySelector<HTMLSelectElement>('.goog-te-combo')?.value);

      if (isCurrentlyTranslated) {
        try { localStorage.setItem(STORAGE_KEY, 'en'); } catch { /* ignore */ }
        window.location.reload();
        return;
      }

      document.documentElement.classList.remove('translated-ltr', 'translated-rtl');
      document.body.classList.remove('translated-ltr', 'translated-rtl');

      const banners = document.querySelectorAll<HTMLElement>(
        'iframe.goog-te-banner-frame, iframe[class*="goog-te-banner-frame"], .goog-te-banner-frame, body > .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame, .VIpgJd-yAWNEb-L7lbkb'
      );
      banners.forEach((b) => {
        b.style.display = 'none';
        b.style.visibility = 'hidden';
      });

      if (document.body && document.body.style.top !== '0px' && document.body.style.top !== '') {
        document.body.style.top = '0px';
      }

      return;
    }

    document.cookie = `googtrans=/en/${langCode}; path=/`;
    if (hostname) {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${hostname}`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${hostname}`;
    }

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
      } else if (attempts > 50) {
        clearInterval(interval);
      }
    }, 100);
  }, []);

  // Initialize strictly to English unless valid non-English language is already saved
  useEffect(() => {
    setIsMounted(true);
    setDetectedRegionCode(detectRegionalLanguage());

    try {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && LANGUAGE_MAP[savedLang] && savedLang !== 'en') {
        setCurrentLanguage(savedLang);
        applyGoogleTranslate(savedLang);
      } else {
        setCurrentLanguage('en');
        localStorage.setItem(STORAGE_KEY, 'en');
        const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
        const hostname = window.location.hostname;
        [hostname, `.${hostname}`, ''].forEach((d) => {
          ['/', '/en', ''].forEach((p) => {
            document.cookie = `googtrans=; expires=${expired}; path=${p}${d ? `; domain=${d}` : ''}`;
          });
        });
      }
    } catch {
      setCurrentLanguage('en');
    }
  }, [applyGoogleTranslate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initGoogleTranslate = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const target = document.getElementById('bidsure-google-translate-target');
      if (!target || target.dataset.initialized) return;

      try {
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

        const savedLang = localStorage.getItem(STORAGE_KEY) || 'en';
        if (savedLang && savedLang !== 'en') {
          applyGoogleTranslate(savedLang);
        }
      } catch (err) {
        console.warn('Google Translate initialization:', err);
      }
    };

    window.googleTranslateElementInit = initGoogleTranslate;

    const cleanBanner = () => {
      document
        .querySelectorAll<HTMLElement>(
          'iframe.goog-te-banner-frame, iframe[class*="goog-te-banner-frame"], .goog-te-banner-frame, body > .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame'
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
      const validCode = LANGUAGE_MAP[code] ? code : 'en';
      setCurrentLanguage(validCode);
      try {
        localStorage.setItem(STORAGE_KEY, validCode);
      } catch {
        // Ignore storage errors
      }
      applyGoogleTranslate(validCode);
    },
    [applyGoogleTranslate]
  );

  const t = useCallback((keyPath: string, fallback?: string): string => {
    if (fallback) return fallback;
    const parts = keyPath.split('.');
    const last = parts[parts.length - 1];
    return last ? last.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim() : keyPath;
  }, []);

  const value = useMemo(
    () => ({
      currentLanguage,
      detectedRegionCode,
      languageConfig,
      direction,
      setLanguage,
      fontSize,
      setFontSize,
      screenReaderActive,
      setScreenReaderActive,
      t,
    }),
    [currentLanguage, detectedRegionCode, languageConfig, direction, setLanguage, fontSize, screenReaderActive, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div
        id="bidsure-google-translate-target"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999,
        }}
      />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLanguage: 'en',
      detectedRegionCode: 'hi',
      languageConfig: DEFAULT_LANGUAGE,
      direction: 'ltr',
      setLanguage: () => {},
      fontSize: 'normal',
      setFontSize: () => {},
      screenReaderActive: false,
      setScreenReaderActive: () => {},
      t: (key: string, fallback?: string) => fallback || key,
    } as LanguageContextType;
  }
  return context;
}
