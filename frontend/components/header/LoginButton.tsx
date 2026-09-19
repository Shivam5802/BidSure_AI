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
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white border border-[#D8E3EC] hover:border-[#1464B4] hover:bg-[#F4F8FC] text-[#0B3558] font-semibold text-[13.5px] transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1464B4] ${className}`}
      aria-label="Login to BidSure Portal"
    >
      <User className="h-4 w-4 text-[#1464B4]" aria-hidden="true" />
      <span>{t('auth.login', 'Login')}</span>
    </Link>
  );
}
