'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Sun, Moon, LayoutDashboard, LogOut, User, KeyRound } from 'lucide-react';
import { ShieldLogo } from '@/components/ui/ShieldLogo';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/components/theme';
import { useAuth } from '@/features/auth';
import { getRoleLabel, getRoleDashboard, getInitials } from '@/types/auth';
import { LoginButton } from './LoginButton';
import { GetStartedButton } from './GetStartedButton';
import { GeMBrand } from './GeMBrand';
import { LanguageSelector } from './LanguageSelector';
import { scrollToHash } from '@/lib/scroll';

const MOBILE_NAV_ITEMS = [
  { id: 'home', href: '#', key: 'nav.home', defaultLabel: 'Home' },
  { id: 'about', href: '#about', key: 'nav.aboutUs', defaultLabel: 'About Us' },
  { id: 'features', href: '#features', key: 'nav.features', defaultLabel: 'Features' },
  { id: 'use-cases', href: '#use-cases', key: 'nav.useCases', defaultLabel: 'Use Cases' },
  { id: 'how-it-works', href: '#how-it-works', key: 'nav.howItWorks', defaultLabel: 'How It Works' },
  { id: 'support', href: '#support', key: 'nav.helpSupport', defaultLabel: 'Help & Support' },
  { id: 'contact', href: '#contact', key: 'nav.contact', defaultLabel: 'Contact' },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 xl:hidden">
      {/* Mobile Language Selector */}
      <LanguageSelector />

      {/* Dark / Light Mode Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-lg text-[#0B3558] dark:text-slate-200 hover:bg-[#F4F8FC] dark:hover:bg-slate-800 border border-[#D8E3EC] dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
        title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-5 w-5 text-amber-400" />
        ) : (
          <Moon className="h-5 w-5 text-[#0B3558] dark:text-slate-200" />
        )}
      </button>

      {/* Hamburger Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-lg text-[#0B3558] dark:text-slate-200 hover:bg-[#F4F8FC] dark:hover:bg-slate-800 border border-[#D8E3EC] dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`fixed inset-y-0 ${
              isRTL ? 'left-0' : 'right-0'
            } w-full max-w-xs bg-white dark:bg-[#0B192C] text-slate-900 dark:text-slate-100 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-50`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#D8E3EC] dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 flex-shrink-0 flex items-center justify-center">
                    <ShieldLogo className="h-9 w-9" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center text-lg font-black tracking-tight leading-none">
                      <span className="text-[#0A2E5C] dark:text-white">Bid</span>
                      <span className="text-[#1168CE] dark:text-[#38BDF8]">Sure</span>
                    </div>
                    <span className="text-[10.5px] text-[#5B7084] dark:text-slate-400 mt-0.5">
                      AI Powered Compliance for GeM
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-4" aria-label="Mobile Navigation">
                <ul className="space-y-1 p-0 list-none">
                  {MOBILE_NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToHash(item.href);
                          setIsOpen(false);
                        }}
                        className="block px-3 py-2.5 rounded-lg text-[15px] font-medium text-[#17324D] dark:text-slate-200 hover:bg-[#F4F8FC] dark:hover:bg-slate-800 hover:text-[#1464B4] dark:hover:text-[#58A6FF] transition-colors"
                      >
                        {t(item.key, item.defaultLabel)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#D8E3EC] dark:border-slate-800 space-y-4">
              <div className="flex justify-start">
                <GeMBrand />
              </div>
              {user ? (
                <div className="flex flex-col gap-2.5">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1464B4] text-xs font-bold text-white shadow-xs">
                        {getInitials(user.name, user.email)}
                      </div>
                      <div className="truncate">
                        <span className="block font-bold text-xs text-[#0B3558] dark:text-white truncate">{user.name}</span>
                        <span className="block text-[10px] text-slate-400 truncate">{getRoleLabel(user.role)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={getRoleDashboard(user.role)}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#1464B4] text-white font-semibold text-xs transition shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>

                  <div className="flex flex-col gap-1 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-1">
                    <Link
                      href={
                        user.role === 'BIDDER' ? '/bidder/profile' :
                        user.role === 'ADMIN' ? '/admin/profile' :
                        user.role === 'SUPER_ADMIN' ? '/super-admin/security' :
                        '/dashboard/profile'
                      }
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#1464B4] transition rounded-lg hover:bg-white dark:hover:bg-slate-800"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>View Profile</span>
                    </Link>
                    <Link
                      href={
                        user.role === 'BIDDER' ? '/bidder/profile?tab=password' :
                        user.role === 'ADMIN' ? '/admin/profile?tab=password' :
                        user.role === 'SUPER_ADMIN' ? '/super-admin/security?tab=password' :
                        '/dashboard/profile?tab=password'
                      }
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#1464B4] transition rounded-lg hover:bg-white dark:hover:bg-slate-800"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                      <span>Change Password</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsOpen(false);
                      await logout();
                      window.location.href = '/login';
                    }}
                    className="flex items-center justify-center gap-2 h-9 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <LoginButton className="w-full justify-center" onClick={() => setIsOpen(false)} />
                  <GetStartedButton className="w-full justify-center" onClick={() => setIsOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
