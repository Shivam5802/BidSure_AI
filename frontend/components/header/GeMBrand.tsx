'use client';

import React from 'react';

export function GeMBrand() {
  return (
    <div className="notranslate flex items-center gap-2 xl:gap-2.5 2xl:gap-3 select-none" translate="no">
      {/* GeM Multi-color Star Emblem + Typography */}
      <div className="notranslate flex items-center gap-1.5 xl:gap-2" translate="no" title="Government e-Marketplace (GeM)">
        {/* Stylized GeM Emblem */}
        <div className="relative h-6 w-6 xl:h-7 xl:w-7 flex-shrink-0">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            {/* 5-point faceted colorful star */}
            {/* Top / Saffron / Orange */}
            <path d="M20 2L24 14L20 18L16 14L20 2Z" fill="#F47920" />
            {/* Right / Blue */}
            <path d="M38 15L27 20L20 18L24 14L38 15Z" fill="#1464B4" />
            {/* Bottom Right / Navy */}
            <path d="M31 34L22 26L20 18L27 20L31 34Z" fill="#0E3D6E" />
            {/* Bottom Left / Green */}
            <path d="M9 34L18 26L20 18L22 26L9 34Z" fill="#2E8B57" />
            {/* Left / Amber / Light Orange */}
            <path d="M2 15L16 14L20 18L18 26L2 15Z" fill="#E65100" />
          </svg>
        </div>

        {/* Text */}
        <div className="notranslate flex flex-col text-left leading-none" translate="no">
          <span className="text-[14px] xl:text-[15px] font-bold text-[#0B3558] dark:text-slate-100 tracking-tight">
            GeM
          </span>
          <span className="hidden 2xl:inline text-[9px] font-medium text-[#5B7084] dark:text-slate-400 mt-0.5 tracking-tight whitespace-nowrap">
            Government
          </span>
          <span className="hidden 2xl:inline text-[9px] font-medium text-[#5B7084] dark:text-slate-400 tracking-tight whitespace-nowrap">
            e Marketplace
          </span>
        </div>
      </div>

      {/* Subtle Vertical Divider */}
      <div className="h-7 xl:h-8 w-[1px] bg-[#D8E3EC] dark:bg-slate-700" aria-hidden="true" />
    </div>
  );
}
