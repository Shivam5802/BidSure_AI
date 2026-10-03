'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Search, Mic, Check, X, MapPin } from 'lucide-react';
import { ALL_LANGUAGES, LanguageConfig } from '@/lib/i18n/languages';
import { useLanguage } from '@/lib/i18n';

interface LanguageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageDropdown({ isOpen, onClose }: LanguageDropdownProps) {
  const { currentLanguage, setLanguage, detectedRegionCode } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  // Close on Escape & Outside click
  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

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

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    onClose();
  };

  // Speech Recognition (Voice search)
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setSearchQuery(spoken.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch {
      setIsListening(false);
    }
  };

  // Filter languages
  const filteredLanguages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ALL_LANGUAGES;

    return ALL_LANGUAGES.filter((lang) => {
      return (
        lang.englishName.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.shortCode.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query) ||
        lang.description.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 sm:hidden transition-all duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dropdown container */}
      <div
        ref={dropdownRef}
        role="dialog"
        aria-label="Language selection modal"
        aria-modal="true"
        translate="no"
        className="notranslate fixed top-14 left-3 right-3 sm:left-auto sm:right-0 sm:top-full sm:absolute sm:mt-2 sm:w-80 max-w-sm mx-auto sm:mx-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out flex flex-col max-h-[82vh]"
      >
        {/* Header with Search and Close */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Select Language
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              title="Close"
              aria-label="Close language selector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center">
            <Search
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              placeholder="Search language, script or state..."
              className="w-full pl-8 pr-9 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1a6aef]"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all text-slate-400 hover:text-[#1a6aef] hover:bg-white dark:hover:bg-slate-800 ${
                isListening ? 'text-[#1a6aef] animate-pulse bg-blue-50 dark:bg-blue-950/80' : ''
              }`}
              title="Speak language name (Voice Search)"
              aria-label="Voice search"
            >
              <Mic className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="max-h-64 sm:max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No matching languages found
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              const isRegion = detectedRegionCode === lang.code && lang.code !== 'en';

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-[#1a6aef] text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lang.shortCode}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs leading-none">
                          {lang.nativeName}
                        </span>
                        <span
                          className={`text-[11px] ${
                            isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          ({lang.englishName})
                        </span>
                        {isRegion && !isSelected && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-0.5 shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                            <span>Your Region</span>
                          </span>
                        )}
                        {isRegion && isSelected && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-0.5 shrink-0 bg-white/20 text-white border border-white/30">
                            <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                            <span>Your Region</span>
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-blue-100/90' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {lang.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-white shrink-0 ml-2" aria-hidden="true" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
