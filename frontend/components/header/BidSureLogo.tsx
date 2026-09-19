'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function BidSureLogo() {
  return (
    <Link
      href="/"
      className="notranslate flex items-center gap-2.5 sm:gap-3 group select-none focus:outline-none focus:ring-2 focus:ring-[#1464B4] rounded-lg p-1 transition-transform"
      translate="no"
      aria-label="BidSure - AI Powered Compliance for GeM Homepage"
    >
      {/* Official BidSure Shield Emblem */}
      <div className="relative flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 xl:h-12 xl:w-12 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(10,46,92,0.15)] group-hover:scale-105 transition-transform duration-200">
        <Image
          src="/images/bidsure_icon.png"
          alt="BidSure Official Emblem"
          fill
          sizes="48px"
          className="object-contain"
          priority
        />
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
