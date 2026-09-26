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
      <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#071324] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Full-width Official Institutional Topbar */}
        <Topbar />

        {/* Content Shell: Left Sidebar + Scrollable Center/Right Dashboard */}
        <div className="flex min-h-0 min-w-0 flex-1">
          {/* Left Navigation Sidebar */}
          <Sidebar />

          {/* Main Dashboard & Feature Content */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
              <div className="mx-auto min-w-0 max-w-[1540px]">{children}</div>
            </main>

            {/* Official Government Institutional Footer (Matching Screenshot) */}
            <footer className="bg-[#081A36] text-white py-3.5 px-6 sm:px-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <span className="font-black tracking-tight text-white text-sm">BidSure</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 text-[11px] sm:text-xs">
                  Government Procurement Compliance Platform
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-300">
                <Link href="#" className="hover:text-white transition">
                  Privacy Policy
                </Link>
                <span className="text-slate-600">|</span>
                <Link href="#" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
                <span className="text-slate-600">|</span>
                <Link href="#" className="hover:text-white transition">
                  Accessibility
                </Link>
                <div className="relative h-6 w-5 shrink-0 ml-1">
                  <Image
                    src="/images/emblem_white.png"
                    alt="Emblem of India"
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
