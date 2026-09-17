'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'compact' | 'pill';
}

export function ThemeToggle({ className, showLabel = false, variant = 'icon' }: ThemeToggleProps) {
  const { resolvedTheme, theme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Toggle theme"
        className={cn(
          'inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-400 dark:border-slate-800 dark:text-slate-500',
          className
        )}
      >
        <div className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full border border-slate-200 bg-slate-100/80 p-0.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80',
          className
        )}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          title="Light theme"
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition',
            theme === 'light'
              ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Sun className="h-3.5 w-3.5" />
          {showLabel && <span>Light</span>}
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          title="Dark theme"
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition',
            theme === 'dark'
              ? 'bg-slate-800 text-indigo-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Moon className="h-3.5 w-3.5" />
          {showLabel && <span>Dark</span>}
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          title="System default"
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition',
            theme === 'system'
              ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-800 dark:text-slate-200'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Monitor className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={cn(
        'group relative inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 transition-transform group-hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
