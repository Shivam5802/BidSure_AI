'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/features/auth';
import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';
import { SuperAdminTopbar } from '@/components/layout/SuperAdminTopbar';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';

  if (pathname === '/super-admin/login') {
    return <>{children}</>;
  }

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="flex min-h-screen flex-col bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-black">
        {/* Full-width Super Admin Topbar */}
        <SuperAdminTopbar />

        {/* Content Shell: SuperAdminSidebar + Main Area */}
        <div className="flex min-h-0 min-w-0 flex-1">
          <SuperAdminSidebar />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <main className="min-w-0 flex-1 p-6 lg:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
