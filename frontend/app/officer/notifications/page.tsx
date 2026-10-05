'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { officerApi, OfficerNotificationItem } from '@/lib/api/officer.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OfficerNotificationsPage() {
  const [notifications, setNotifications] = useState<OfficerNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await officerApi.listNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await officerApi.markNotificationRead(id);
    setNotifications((prev) =>
      (prev || []).map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await officerApi.markAllNotificationsRead();
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, read: true })));
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Procurement Officer Notifications
            </h1>
            <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              {unreadCount} Unread
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time procurement alerts, incoming vendor bid submissions, compliance evaluations, and deadline warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadNotifications} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            No notifications available.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                item.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                  {item.type === 'BID_SUBMITTED' && <FileText className="w-5 h-5 text-blue-600" />}
                  {item.type === 'CLARIFICATION_REPLIED' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                  {item.type === 'EVALUATION_DONE' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                  {item.type === 'DEADLINE_ALERT' && <Clock className="w-5 h-5 text-amber-600" />}
                  {item.type === 'COMPLIANCE_WARNING' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-0.5">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(item.id)}
                    className="h-8 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100/50"
                  >
                    Mark as Read
                  </Button>
                )}
                {item.type === 'BID_SUBMITTED' && (
                  <Link href="/officer/bids">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                      View Bids <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
