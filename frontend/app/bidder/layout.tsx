'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { AuthGuard } from '@/features/auth';

export default function BidderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['BIDDER']}>
      <div className="flex h-screen overflow-hidden flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Full-width Official Institutional Topbar with Logo */}
        <Topbar />

        {/* Content Shell: Sidebar below logo + Main Content */}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {/* Role-aware Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <main className="min-w-0 flex-1 p-6 lg:p-8">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
