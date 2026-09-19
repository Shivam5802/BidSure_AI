'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'bidsure_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Apply theme to DOM
  const applyTheme = useCallback((resolved: ResolvedTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Initialize on mount from localStorage or system preference
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme: Theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
      setThemeState(initialTheme);

      const resolved = initialTheme === 'system' ? getSystemTheme() : initialTheme;
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch {
      // localStorage may fail in strict private browsing environments
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
  }, [applyTheme]);

  // Listen for system theme changes if theme === 'system'
  useEffect(() => {
    if (!isMounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isMounted, theme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        // ignore storage error
      }

      const newResolved = newTheme === 'system' ? getSystemTheme() : newTheme;
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const defaultThemeContext: ThemeContextType = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
};

export function useTheme() {
  const context = useContext(ThemeContext);
  return context ?? defaultThemeContext;
}
