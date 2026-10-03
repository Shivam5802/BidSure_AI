'use client';

import React from 'react';
import Link from 'next/link';

export function BidSureLogo() {
  return (
    <Link
      href="/"
      className="notranslate inline-flex items-center gap-2.5 group select-none focus:outline-none focus:ring-2 focus:ring-[#1464B4] rounded-lg transition-all hover:opacity-95 px-1 py-0.5"
      translate="no"
      aria-label="BidSure - AI Powered Compliance for GeM. Homepage"
    >
      {/* Shield / Icon only */}
      <img
        src="/images/bidsure_icon.png"
        alt="BidSure shield icon"
        width={48}
        height={48}
        className="h-9 sm:h-10 xl:h-11 w-auto object-contain filter drop-shadow-[0_2px_6px_rgba(26,106,239,0.22)] select-none pointer-events-none group-hover:scale-[1.03] transition-transform duration-200 flex-shrink-0"
      />
      {/* Brand name + tagline */}
      <div className="notranslate flex flex-col leading-none gap-0.5" translate="no">
        <div
          className="notranslate flex items-center text-[18px] sm:text-[20px] xl:text-[21px] font-black tracking-[-0.03em] leading-none"
          translate="no"
          aria-hidden="true"
        >
          <span className="text-[#0A2E5C] dark:text-white">Bid</span>
          <span className="text-[#1168CE] dark:text-[#38BDF8]">Sure</span>
        </div>
        <span className="notranslate text-[9px] sm:text-[10px] font-medium text-[#5B7084] dark:text-slate-400 tracking-tight leading-tight whitespace-nowrap" translate="no">
          AI Powered Compliance for GeM
        </span>
      </div>
    </Link>
  );
}

export default BidSureLogo;
