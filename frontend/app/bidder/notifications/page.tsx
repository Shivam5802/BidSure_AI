'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { toast } from '@/components/ui/Toast';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCheck,
  Loader2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export default function BidderNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBidderNotifications();
      setNotifications(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markBidderNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllBidderNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark all as read.');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EXPIRY_WARNING':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'VERIFICATION_SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'VERIFICATION_FAILED':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'CLARIFICATION_REQUEST':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-[#1464B4]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Notifications & Compliance Alerts
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time notifications regarding document expiry, tender deadlines, and clarification requests.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="rounded-xl text-xs font-semibold"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-[#1464B4] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            filter === 'UNREAD'
              ? 'bg-[#1464B4] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No Notifications</h3>
          <p className="mt-1 text-xs text-slate-500">You are completely up-to-date with all tender notices and compliance alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-xs transition flex items-start justify-between gap-4 ${
                !item.read
                  ? 'border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    {!item.read && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">
                    {new Date(item.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.actionUrl && (
                  <Link href={item.actionUrl}>
                    <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50">
                      Take Action <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(item.id)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
