'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Search, Mic, Check, X, MapPin, Volume2, AlertCircle } from 'lucide-react';
import { ALL_LANGUAGES, LanguageConfig } from '@/lib/i18n/languages';
import { useLanguage } from '@/lib/i18n';
import { toast } from '@/components/ui/Toast';

interface LanguageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageDropdown({ isOpen, onClose }: LanguageDropdownProps) {
  const { currentLanguage, setLanguage, detectedRegionCode } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Stop and cleanup recognition when dropdown closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      setIsListening(false);
      setVoiceStatus(null);
      setVoiceError(null);
      setSearchQuery('');
    } else {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close on Escape & Outside click
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

  const handleSelectLanguage = (code: string) => {
    // stop voice recognition if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    const selected = ALL_LANGUAGES.find((l) => l.code === code);
    if (selected && selected.code !== currentLanguage) {
      toast.info('Language Updated', {
        description: `Switched language to ${selected.englishName} (${selected.nativeName})`,
      });
    }
    setLanguage(code);
    onClose();
  };

  const handleVoiceSearch = () => {
    // 1. If currently listening, toggle to STOP
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setVoiceStatus(null);
      return;
    }

    setVoiceError(null);
    setVoiceStatus(null);

    // 2. Browser SpeechRecognition support check
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.';
      setVoiceError(msg);
      toast.warning('Browser Not Supported', { description: msg });
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // We allow standard Indian English which also accurately transcribes Indian language names
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setVoiceStatus('Listening... Speak language name (e.g. Hindi, Bengali, Tamil, English)');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const spoken = (final || interim).trim();
        if (spoken) {
          // Clean common voice phrases
          const cleaned = spoken
            .replace(/^(select|switch to|change to|set language to|set to|open|go to|choose)\s+/i, '')
            .replace(/[.?]$/, '')
            .trim();

          setSearchQuery(cleaned);
          setVoiceStatus(`Heard: "${cleaned}"`);

          // If final transcript received, check if we have a match
          if (final) {
            const lower = cleaned.toLowerCase();
            const matched = ALL_LANGUAGES.find(
              (l) =>
                l.englishName.toLowerCase() === lower ||
                l.nativeName.toLowerCase() === lower ||
                l.shortCode.toLowerCase() === lower ||
                l.code.toLowerCase() === lower ||
                lower.includes(l.englishName.toLowerCase()) ||
                lower.includes(l.nativeName.toLowerCase())
            );

            if (matched) {
              setVoiceStatus(`Recognized: ${matched.englishName} (${matched.nativeName})`);
              toast.success('Language Recognized', {
                description: `Found ${matched.englishName} (${matched.nativeName})`,
              });
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const err = event.error;

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          const msg = 'Microphone access blocked. Please click the mic icon in your address bar to allow.';
          setVoiceError(msg);
          toast.error('Microphone Access Blocked', {
            description: 'Please click the mic icon in your browser address bar to allow microphone permissions.',
          });
        } else if (err === 'no-speech') {
          const msg = 'No speech detected. Please speak closer to your microphone and try again.';
          setVoiceError(msg);
          toast.warning('No Speech Detected', {
            description: msg,
          });
        } else if (err === 'audio-capture') {
          const msg = 'No microphone found on your device.';
          setVoiceError(msg);
          toast.error('Microphone Not Found', {
            description: 'Please connect a microphone to your device and try again.',
          });
        } else if (err === 'network') {
          const msg = 'Network connection issue for speech recognition.';
          setVoiceError(msg);
          toast.error('Network Issue', {
            description: msg,
          });
        } else if (err !== 'aborted') {
          setVoiceError(`Voice recognition error: ${err}`);
          toast.error('Voice Recognition Error', {
            description: `Error code: ${err}`,
          });
        }
        setVoiceStatus(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setVoiceError(err?.message || 'Unable to start microphone.');
      setVoiceStatus(null);
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
        className="notranslate fixed top-14 left-3 right-3 sm:left-auto sm:right-0 sm:top-full sm:absolute sm:mt-2 sm:w-84 max-w-sm mx-auto sm:mx-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out flex flex-col max-h-[82vh]"
      >
        {/* Header with Search and Close */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Select Language
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                ({ALL_LANGUAGES.length} supported)
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
              placeholder="Search or speak (e.g. Hindi, English)..."
              className={`w-full pl-8 py-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all ${
                isListening
                  ? 'border-rose-400 ring-2 ring-rose-400/20 pr-16'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#1a6aef] pr-16'
              }`}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Clear button if text exists */}
              {searchQuery && !isListening && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setVoiceStatus(null);
                    setVoiceError(null);
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Mic / Voice Search button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400/50'
                    : 'text-slate-400 hover:text-[#1a6aef] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isListening ? 'Listening... Click to stop' : 'Click to speak language name'}
                aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
              >
                <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : ''}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Voice Search Feedback Banner */}
          {isListening && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="font-semibold truncate">
                {voiceStatus || 'Listening... Speak a language name'}
              </span>
            </div>
          )}

          {/* Voice Search Recognized Message (when not listening anymore) */}
          {!isListening && voiceStatus && (
            <div className="flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 truncate">
                <Volume2 className="w-3 h-3 shrink-0" />
                <span className="font-medium truncate">{voiceStatus}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceStatus(null)}
                className="p-0.5 text-emerald-600 hover:text-emerald-900"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Voice Search Error Alert */}
          {voiceError && (
            <div className="flex items-start justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{voiceError}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="p-0.5 text-amber-600 hover:text-amber-900 shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable list */}
        <div className="max-h-64 sm:max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No matching languages found for &quot;{searchQuery}&quot;
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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:white hover:bg-slate-100 dark:hover:bg-slate-800/80'
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
