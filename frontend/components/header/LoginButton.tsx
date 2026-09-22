'use client';

import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface LoginButtonProps {
  className?: string;
  onClick?: () => void;
}

export function LoginButton({ className = '', onClick }: LoginButtonProps) {
  const { t } = useLanguage();

  return (
    <Link
      href="/login"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 xl:gap-2 h-9 px-3 xl:h-10 xl:px-4 rounded-lg bg-white dark:bg-slate-800 border border-[#D8E3EC] dark:border-slate-700 hover:border-[#1464B4] dark:hover:border-[#58A6FF] hover:bg-[#F4F8FC] dark:hover:bg-slate-700/60 text-[#0B3558] dark:text-slate-100 font-semibold text-[13px] xl:text-[13.5px] whitespace-nowrap transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1464B4] ${className}`}
      aria-label="Login to BidSure Portal"
    >
      <User className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[#1464B4] dark:text-[#58A6FF]" aria-hidden="true" />
      <span>{t('auth.login', 'Login')}</span>
    </Link>
  );
}
