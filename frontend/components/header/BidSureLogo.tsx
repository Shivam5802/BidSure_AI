'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldLogo } from '@/components/ui/ShieldLogo';

export function BidSureLogo() {
  return (
    <Link
      href="/"
      className="notranslate flex items-center gap-2.5 sm:gap-3 group select-none focus:outline-none focus:ring-2 focus:ring-[#1464B4] rounded-lg p-1 transition-transform"
      translate="no"
      aria-label="BidSure - AI Powered Compliance for GeM Homepage"
    >
      {/* Official Blue Shield Emblem with Checkmark */}
      <div className="relative flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 xl:h-12 xl:w-12 flex items-center justify-center filter drop-shadow-[0_2px_6px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform duration-200">
        <ShieldLogo className="h-10 w-10 sm:h-11 sm:w-11 xl:h-12 xl:w-12" />
      </div>

      {/* Official Brand Typography (Strictly Invariant) */}
      <div className="notranslate flex flex-col text-left justify-center" translate="no">
        <span className="sr-only notranslate" translate="no">BidSure</span>
        <div aria-hidden="true" className="notranslate flex items-center text-[22px] sm:text-[24px] xl:text-[25px] 2xl:text-[26px] font-black tracking-[-0.03em] leading-none" translate="no">
          <span className="text-[#0A2E5C] dark:text-white">Bid</span>
          <span className="text-[#1168CE] dark:text-[#38BDF8]">Sure</span>
        </div>
        <span className="notranslate hidden sm:block xl:hidden 2xl:block text-[10px] sm:text-[11px] 2xl:text-[11.5px] font-medium text-[#5B7084] dark:text-slate-400 tracking-tight mt-1 leading-tight whitespace-nowrap" translate="no">
          AI Powered Compliance for GeM
        </span>
      </div>
    </Link>
  );
}

export default BidSureLogo;
