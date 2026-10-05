'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  duration?: number; // in milliseconds (default: 4500)
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  createdAt: number;
}

type Listener = (toasts: ToastItem[]) => void;

// ── Global Pub/Sub Toast Store ─────────────────────────────────────────────
class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners: Set<Listener> = new Set();
  private maxToasts = 5;

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public addToast(type: ToastType, messageOrOptions: string | ToastOptions, options?: ToastOptions): string {
    const id = options?.id || (typeof messageOrOptions === 'object' && messageOrOptions.id) || Math.random().toString(36).substring(2, 9);

    let toastData: ToastOptions = {};
    if (typeof messageOrOptions === 'string') {
      toastData = {
        title: messageOrOptions,
        ...options,
      };
    } else {
      toastData = { ...messageOrOptions };
    }

    const newToast: ToastItem = {
      id,
      type,
      duration: toastData.duration ?? 4500,
      createdAt: Date.now(),
      ...toastData,
    };

    // Remove existing if matching id
    this.toasts = this.toasts.filter((t) => t.id !== id);

    // Limit stack size
    if (this.toasts.length >= this.maxToasts) {
      this.toasts.shift();
    }

    this.toasts.push(newToast);
    this.notify();

    // Auto-dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }

    return id;
  }

  public dismiss(id: string) {
    const exists = this.toasts.some((t) => t.id === id);
    if (!exists) return;
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clearAll() {
    this.toasts = [];
    this.notify();
  }
}

export const toastStore = new ToastStore();

// Universal callable toast API
export const toast = {
  success: (titleOrOptions: string | ToastOptions, options?: ToastOptions) =>
    toastStore.addToast('success', titleOrOptions, options),

  error: (titleOrOptions: string | ToastOptions, options?: ToastOptions) =>
    toastStore.addToast('error', titleOrOptions, options),

  warning: (titleOrOptions: string | ToastOptions, options?: ToastOptions) =>
    toastStore.addToast('warning', titleOrOptions, options),

  info: (titleOrOptions: string | ToastOptions, options?: ToastOptions) =>
    toastStore.addToast('info', titleOrOptions, options),

  dismiss: (id: string) => toastStore.dismiss(id),

  clearAll: () => toastStore.clearAll(),
};

// ── UI Icons & Color Profiles ──────────────────────────────────────────────
const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />,
  error: <AlertOctagon className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />,
};

const TOAST_STYLES: Record<ToastType, { border: string; bg: string; bar: string; glow: string }> = {
  success: {
    border: 'border-emerald-200 dark:border-emerald-800/80',
    bg: 'bg-white/95 dark:bg-[#071912]/95',
    bar: 'bg-emerald-500',
    glow: 'shadow-[0_4px_24px_-4px_rgba(16,185,129,0.15)]',
  },
  error: {
    border: 'border-rose-200 dark:border-rose-800/80',
    bg: 'bg-white/95 dark:bg-[#1f090d]/95',
    bar: 'bg-rose-500',
    glow: 'shadow-[0_4px_24px_-4px_rgba(244,63,94,0.2)]',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-800/80',
    bg: 'bg-white/95 dark:bg-[#1a1205]/95',
    bar: 'bg-amber-500',
    glow: 'shadow-[0_4px_24px_-4px_rgba(245,158,11,0.18)]',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-800/80',
    bg: 'bg-white/95 dark:bg-[#09152a]/95',
    bar: 'bg-blue-500',
    glow: 'shadow-[0_4px_24px_-4px_rgba(59,130,246,0.18)]',
  },
};

function ToastMessage({ item }: { item: ToastItem }) {
  const styles = TOAST_STYLES[item.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl border ${styles.border} ${styles.bg} ${styles.glow} p-3.5 sm:p-4 shadow-xl backdrop-blur-xl transition-all duration-200 animate-in fade-in slide-in-from-top-3 sm:slide-in-from-right-4`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className="mt-0.5">{TOAST_ICONS[item.type]}</div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          {item.title && (
            <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {item.title}
            </h5>
          )}
          {item.description && (
            <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
              {item.description}
            </p>
          )}

          {item.action && (
            <button
              type="button"
              onClick={item.action.onClick}
              className="mt-2 inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {item.action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => toast.dismiss(item.id)}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      {item.duration && item.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-200/40 dark:bg-slate-800/60 overflow-hidden">
          <div
            className={`h-full ${styles.bar} origin-left`}
            style={{
              animation: `toast-progress ${item.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Master Toast Container Component ───────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastStore.subscribe((updated) => {
      setToasts(updated);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-3 left-3 sm:left-auto sm:right-5 z-[999999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((item) => (
        <ToastMessage key={item.id} item={item} />
      ))}
    </div>
  );
}

export default ToastContainer;
