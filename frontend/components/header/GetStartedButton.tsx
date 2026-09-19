'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface GetStartedButtonProps {
  className?: string;
  onClick?: () => void;
}

export function GetStartedButton({ className = '', onClick }: GetStartedButtonProps) {
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <Link
      href="/login"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 xl:gap-2 h-9 px-3.5 xl:h-10 xl:px-4 2xl:px-5 rounded-lg bg-[#1464B4] hover:bg-[#0B3558] text-white font-semibold text-[13px] xl:text-[13.5px] whitespace-nowrap shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4] focus:ring-offset-2 ${className}`}
      aria-label="Get Started with BidSure Compliance Verification"
    >
      <span>{t('auth.getStarted', 'Get Started')}</span>
      <ArrowRight
        className={`h-3.5 w-3.5 xl:h-4 xl:w-4 transition-transform duration-150 ${
          isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}
