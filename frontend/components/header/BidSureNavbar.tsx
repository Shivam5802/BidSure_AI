'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BidSureLogo } from './BidSureLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { GeMBrand } from './GeMBrand';
import { LanguageSelector } from './LanguageSelector';
import { LoginButton } from './LoginButton';
import { GetStartedButton } from './GetStartedButton';
import { MobileNavigation } from './MobileNavigation';

import { Sun, Moon, LayoutDashboard, LogOut, ChevronDown, User, KeyRound, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/theme';
import { useAuth } from '@/features/auth';
import { getRoleLabel, getRoleDashboard, getInitials } from '@/types/auth';

export function BidSureNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [profileOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      setIsLoggingOut(true);
      await logout();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Derived user values
  const displayName = user?.name?.replace(/\s*\(.*?\)\s*/g, '').trim() || user?.email?.split('@')[0] || '—';
  const roleLabel   = user?.designation || (user?.role ? getRoleLabel(user.role) : '');
  const initials    = user ? getInitials(user.name, user.email) : '';
  const dashboardHref = user ? getRoleDashboard(user.role) : '/dashboard';

  const profileHref =
    user?.role === 'BIDDER'              ? '/bidder/profile'            :
    user?.role === 'ADMIN'               ? '/admin/profile'             :
    user?.role === 'SUPER_ADMIN'         ? '/super-admin/security'        :
                                           '/dashboard/profile';

  const changePasswordHref = `${profileHref}?tab=password`;

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white dark:bg-[#081528] transition-all duration-200 border-b border-[#D8E3EC] dark:border-slate-800 ${
        isScrolled
          ? 'h-[78px] shadow-sm bg-white/98 dark:bg-[#081528]/98 backdrop-blur-xs'
          : 'h-[96px] lg:h-[104px]'
      }`}
    >
      <div className="w-full max-w-[1440px] h-full mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-6 2xl:px-8 gap-2 xl:gap-3">
        {/* Left: BidSure Branding */}
        <div className="flex-shrink-0">
          <BidSureLogo />
        </div>

        {/* Center: Main Navigation */}
        <div className="hidden xl:flex items-center justify-center flex-1 min-w-0 px-2">
          <DesktopNavigation />
        </div>

        {/* Right: GeM + Language + Theme + Login/Dashboard */}
        <div className="hidden xl:flex items-center gap-1.5 xl:gap-2 2xl:gap-2.5 flex-shrink-0">
          <GeMBrand />
          <LanguageSelector />
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-800 border border-[#D8E3EC] dark:border-slate-700 hover:border-[#1464B4] dark:hover:border-[#58A6FF] hover:bg-[#F4F8FC] dark:hover:bg-slate-700/60 text-[#0B3558] dark:text-slate-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-[#0B3558] transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* If user is logged in, show exact topbar-style user profile pill & dropdown; otherwise show Login & Register */}
          {user ? (
            <div ref={profileDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl border border-[#D8E3EC] dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 px-2.5 py-1.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4] shadow-xs"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0A2540] to-[#1464B4] text-white font-bold text-xs ring-2 ring-[#1464B4]/20 shadow-xs">
                  {initials}
                </div>
                {/* Name + Role */}
                <div className="flex flex-col text-left max-w-[120px] lg:max-w-[150px] min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
                    {roleLabel}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* ── Dropdown ── */}
              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1E35] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User identity header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0A2540] to-[#1464B4] text-white font-bold text-xs">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {roleLabel}
                        </span>
                        {user.email && (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    {/* Topmost option: Go to Dashboard */}
                    <Link
                      href={dashboardHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1464B4] dark:hover:text-[#58AAFF] transition-colors group/item"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover/item:text-[#1464B4] dark:group-hover/item:text-[#58AAFF] transition-colors" />
                      <span className="font-semibold text-[#1464B4] dark:text-[#58AAFF]">Go to Dashboard</span>
                    </Link>

                    {/* View Profile */}
                    <Link
                      href={profileHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1464B4] dark:hover:text-[#58AAFF] transition-colors group/item"
                    >
                      <User className="h-4 w-4 text-slate-400 group-hover/item:text-[#1464B4] dark:group-hover/item:text-[#58AAFF] transition-colors" />
                      <span className="font-medium">View Profile</span>
                    </Link>

                    {/* Change Password */}
                    <Link
                      href={changePasswordHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1464B4] dark:hover:text-[#58AAFF] transition-colors group/item"
                    >
                      <KeyRound className="h-4 w-4 text-slate-400 group-hover/item:text-[#1464B4] dark:group-hover/item:text-[#58AAFF] transition-colors" />
                      <span className="font-medium">Change Password</span>
                    </Link>

                    {/* Security Settings */}
                    <Link
                      href={`${profileHref}?tab=security`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1464B4] dark:hover:text-[#58AAFF] transition-colors group/item"
                    >
                      <ShieldCheck className="h-4 w-4 text-slate-400 group-hover/item:text-[#1464B4] dark:group-hover/item:text-[#58AAFF] transition-colors" />
                      <span className="font-medium">Security Settings</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 dark:border-slate-800 py-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">{isLoggingOut ? 'Signing out…' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <LoginButton />
              <GetStartedButton />
            </>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <MobileNavigation />
      </div>
    </header>
  );
}
