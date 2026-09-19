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
      className={`inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-[#1464B4] hover:bg-[#0B3558] text-white font-semibold text-[13.5px] shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1464B4] focus:ring-offset-2 ${className}`}
      aria-label="Get Started with BidSure Compliance Verification"
    >
      <span>{t('auth.getStarted', 'Get Started')}</span>
      <ArrowRight
        className={`h-4 w-4 transition-transform duration-150 ${
          isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}
