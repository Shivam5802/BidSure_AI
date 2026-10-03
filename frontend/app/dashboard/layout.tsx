import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { AuthGuard } from '@/features/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['PROCUREMENT_OFFICER', 'ADMIN']}>
      <div className="flex h-screen overflow-hidden flex-col bg-[#F8FAFC] dark:bg-[#071324] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Full-width Official Institutional Topbar */}
        <Topbar />

        {/* Content Shell: Left Sidebar + Scrollable Center/Right Dashboard */}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar />

          {/* Main Dashboard & Feature Content */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
              <div className="mx-auto min-w-0 max-w-[1540px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
