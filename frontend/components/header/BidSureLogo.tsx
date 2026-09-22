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
      <div className="relative flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 xl:h-10 xl:w-10 2xl:h-11 2xl:w-11 flex items-center justify-center filter drop-shadow-[0_2px_6px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform duration-200">
        <ShieldLogo className="h-9 w-9 sm:h-10 sm:w-10 xl:h-10 xl:w-10 2xl:h-11 2xl:w-11" />
      </div>

      {/* Official Brand Typography (Strictly Invariant) */}
      <div className="notranslate flex flex-col text-left justify-center" translate="no">
        <span className="sr-only notranslate" translate="no">BidSure</span>
        <div aria-hidden="true" className="notranslate flex items-center text-[20px] sm:text-[22px] xl:text-[23px] 2xl:text-[24px] font-black tracking-[-0.03em] leading-none" translate="no">
          <span className="text-[#0A2E5C] dark:text-white">Bid</span>
          <span className="text-[#1168CE] dark:text-[#38BDF8]">Sure</span>
        </div>
        <span className="notranslate hidden sm:block text-[9.5px] sm:text-[10px] 2xl:text-[10.5px] font-medium text-[#5B7084] dark:text-slate-400 tracking-tight mt-0.5 leading-tight whitespace-nowrap" translate="no">
          AI Powered Compliance for GeM
        </span>
      </div>
    </Link>
  );
}

export default BidSureLogo;
