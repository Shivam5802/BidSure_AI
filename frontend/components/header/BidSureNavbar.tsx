'use client';

import React, { useState, useEffect } from 'react';
import { BidSureLogo } from './BidSureLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { GeMBrand } from './GeMBrand';
import { LanguageSelector } from './LanguageSelector';
import { LoginButton } from './LoginButton';
import { GetStartedButton } from './GetStartedButton';
import { MobileNavigation } from './MobileNavigation';

export function BidSureNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white transition-all duration-200 border-b border-[#D8E3EC] ${
        isScrolled
          ? 'h-[78px] shadow-sm bg-white/98 backdrop-blur-xs'
          : 'h-[96px] lg:h-[104px]'
      }`}
    >
      <div className="w-full max-w-[1440px] h-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: BidSure Branding */}
        <div className="flex-shrink-0">
          <BidSureLogo />
        </div>

        {/* Center: Main Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-4 xl:px-8">
          <DesktopNavigation />
        </div>

        {/* Right: GeM + Language + Login + Get Started */}
        <div className="hidden lg:flex items-center gap-3.5 xl:gap-4 flex-shrink-0">
          <GeMBrand />
          <LanguageSelector />
          <LoginButton />
          <GetStartedButton />
        </div>

        {/* Mobile Navigation Trigger */}
        <MobileNavigation />
      </div>
    </header>
  );
}
