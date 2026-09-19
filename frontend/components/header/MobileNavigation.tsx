'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { LoginButton } from './LoginButton';
import { GetStartedButton } from './GetStartedButton';
import { GeMBrand } from './GeMBrand';
import { LanguageSelector } from './LanguageSelector';

const MOBILE_NAV_ITEMS = [
  { id: 'home', href: '#', key: 'nav.home', defaultLabel: 'Home' },
  { id: 'about', href: '#about', key: 'nav.aboutUs', defaultLabel: 'About Us' },
  { id: 'features', href: '#features', key: 'nav.features', defaultLabel: 'Features' },
  { id: 'use-cases', href: '#use-cases', key: 'nav.useCases', defaultLabel: 'Use Cases' },
  { id: 'how-it-works', href: '#how-it-works', key: 'nav.howItWorks', defaultLabel: 'How It Works' },
  { id: 'support', href: '#support', key: 'nav.helpSupport', defaultLabel: 'Help & Support' },
  { id: 'contact', href: '#contact', key: 'nav.contact', defaultLabel: 'Contact' },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      {/* Mobile Language Selector */}
      <LanguageSelector />

      {/* Hamburger Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-lg text-[#0B3558] hover:bg-[#F4F8FC] border border-[#D8E3EC] focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`fixed inset-y-0 ${
              isRTL ? 'left-0' : 'right-0'
            } w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-50`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#D8E3EC]">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 flex-shrink-0">
                    <Image
                      src="/images/bidsure_icon.png"
                      alt="BidSure Emblem"
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center text-lg font-black tracking-tight leading-none">
                      <span className="text-[#0A2E5C]">Bid</span>
                      <span className="text-[#1168CE]">Sure</span>
                    </div>
                    <span className="text-[10.5px] text-[#5B7084] mt-0.5">
                      AI Powered Compliance for GeM
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-4" aria-label="Mobile Navigation">
                <ul className="space-y-1 p-0 list-none">
                  {MOBILE_NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-[15px] font-medium text-[#17324D] hover:bg-[#F4F8FC] hover:text-[#1464B4] transition-colors"
                      >
                        {t(item.key, item.defaultLabel)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#D8E3EC] space-y-4">
              <div className="flex justify-start">
                <GeMBrand />
              </div>
              <div className="flex flex-col gap-2.5">
                <LoginButton className="w-full justify-center" onClick={() => setIsOpen(false)} />
                <GetStartedButton className="w-full justify-center" onClick={() => setIsOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
