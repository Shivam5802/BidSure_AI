'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function BidSureLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group select-none focus:outline-none focus:ring-2 focus:ring-[#1464B4] rounded-lg p-1 transition-transform"
      aria-label="BidSure - AI Powered Compliance for GeM Homepage"
    >
      {/* Official BidSure Shield Emblem */}
      <div className="relative flex-shrink-0 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(10,46,92,0.15)] group-hover:scale-105 transition-transform duration-200">
        <Image
          src="/images/bidsure_icon.png"
          alt="BidSure Official Emblem"
          fill
          sizes="48px"
          className="object-contain"
          priority
        />
      </div>

      {/* Official Brand Typography */}
      <div className="flex flex-col text-left justify-center">
        <span className="sr-only">BidSure</span>
        <div aria-hidden="true" className="flex items-center text-[26px] font-black tracking-[-0.03em] leading-none">
          <span className="text-[#0A2E5C]">Bid</span>
          <span className="text-[#1168CE]">Sure</span>
        </div>
        <span className="text-[11.5px] font-medium text-[#5B7084] tracking-tight mt-1 leading-tight">
          AI Powered Compliance for GeM
        </span>
      </div>
    </Link>
  );
}
