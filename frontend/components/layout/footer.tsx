'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Landmark, ArrowRight, Mail, ArrowUp, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/components/theme';

export function Footer() {
  const { direction, setScreenReaderActive, screenReaderActive } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isRTL = direction === 'rtl';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScreenReaderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setScreenReaderActive((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          'Screen reader assistance active. Navigating BidSure Government Portal.'
        );
        window.speechSynthesis.speak(utterance);
      }
      return next;
    });
  };

  return (
    <footer
      role="contentinfo"
      aria-label="BidSure Institutional Portal Footer"
      className="bg-[#072541] text-slate-300 pt-12 pb-6 border-t border-[#0F3960] select-none text-left"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Main 6 Columns strictly side-by-side on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr_1.1fr_1.4fr] gap-6 xl:gap-8 pb-10">
          
          {/* COLUMN 1 — BIDSURE IDENTITY */}
          <div className="space-y-3.5">
            {/* BidSure Horizontal Brand Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#1464B4] rounded-lg p-0.5"
              aria-label="BidSure - Procurement. Verified."
            >
              {/* Official Emblem */}
              <div className="relative h-11 w-11 flex-shrink-0 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                <Image
                  src="/images/bidsure_icon.png"
                  alt="BidSure Official Emblem"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>

              {/* Typography */}
              <div className="flex flex-col text-left justify-center">
                <div className="flex items-center text-[24px] font-black tracking-[-0.02em] leading-none">
                  <span className="text-white">Bid</span>
                  <span className="text-[#38BDF8]">Sure</span>
                </div>
                {/* Gold Tagline with subtle divider bars */}
                <div className="flex items-center gap-1 mt-1 text-[10.5px] font-bold text-[#FBBF24] tracking-wide">
                  <span className="h-[1px] w-2.5 bg-[#FBBF24]" aria-hidden="true" />
                  <span>Procurement. Verified.</span>
                  <span className="h-[1px] w-2.5 bg-[#FBBF24]" aria-hidden="true" />
                </div>
              </div>
            </Link>

            {/* Description */}
            <p className="text-[12.5px] text-slate-300 leading-relaxed max-w-[260px]">
              An AI-powered platform for transparent, compliant and efficient government procurement through GeM.
            </p>

            {/* National Emblem & Stronger India Badge */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2.5 py-1">
                <div className="relative h-10 w-8 flex-shrink-0">
                  <Image
                    src="/images/emblem_white.png"
                    alt="State Emblem of India"
                    fill
                    sizes="32px"
                    className="object-contain opacity-90"
                  />
                </div>
                <div className="h-8 w-[1px] bg-slate-600/70" aria-hidden="true" />
                <span className="text-[11px] font-medium text-slate-300 leading-snug max-w-[140px]">
                  Transparent Procurement for a Stronger India
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2 — QUICK LINKS */}
          <div className="space-y-2.5">
            <div>
              <h3 className="text-[12.5px] font-bold text-white tracking-wider uppercase">
                QUICK LINKS
              </h3>
              <div className="w-8 h-[2px] bg-[#1464B4] mt-1.5 mb-3 rounded-full" aria-hidden="true" />
            </div>
            <ul className="space-y-2 text-[12.5px] text-slate-300 p-0 m-0 list-none font-medium">
              {[
                { label: 'Home', href: '#' },
                { label: 'About Us', href: '#about' },
                { label: 'Features', href: '#features' },
                { label: 'Use Cases', href: '#use-cases' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Contact Us', href: '#contact' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:underline"
                  >
                    <ChevronRight
                      className={`h-3 w-3 text-[#38BDF8] transition-transform duration-150 ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 — RESOURCES */}
          <div className="space-y-2.5">
            <div>
              <h3 className="text-[12.5px] font-bold text-white tracking-wider uppercase">
                RESOURCES
              </h3>
              <div className="w-8 h-[2px] bg-[#1464B4] mt-1.5 mb-3 rounded-full" aria-hidden="true" />
            </div>
            <ul className="space-y-2 text-[12.5px] text-slate-300 p-0 m-0 list-none font-medium">
              {[
                { label: 'User Manual', href: '#' },
                { label: 'FAQs', href: '#' },
                { label: 'Help & Support', href: '#support' },
                { label: 'Video Tutorials', href: '#' },
                { label: 'Download Brochure', href: '#' },
                { label: 'Sitemap', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:underline"
                  >
                    <ChevronRight
                      className={`h-3 w-3 text-[#38BDF8] transition-transform duration-150 ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — LEGAL & COMPLIANCE */}
          <div className="space-y-2.5">
            <div>
              <h3 className="text-[12.5px] font-bold text-white tracking-wider uppercase">
                LEGAL & COMPLIANCE
              </h3>
              <div className="w-8 h-[2px] bg-[#1464B4] mt-1.5 mb-3 rounded-full" aria-hidden="true" />
            </div>
            <ul className="space-y-2 text-[12.5px] text-slate-300 p-0 m-0 list-none font-medium">
              {[
                { label: 'Terms & Conditions', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'Accessibility Statement', href: '#' },
                { label: 'Disclaimer', href: '#' },
                { label: 'Audit Integrity', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:underline"
                  >
                    <ChevronRight
                      className={`h-3 w-3 text-[#38BDF8] transition-transform duration-150 ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5 — GOVERNMENT / PROCUREMENT */}
          <div className="space-y-2.5">
            <div>
              <h3 className="text-[12.5px] font-bold text-white tracking-wider uppercase">
                GOVERNMENT / PROCUREMENT
              </h3>
              <div className="w-8 h-[2px] bg-[#1464B4] mt-1.5 mb-3 rounded-full" aria-hidden="true" />
            </div>
            <ul className="space-y-2 text-[12.5px] text-slate-300 p-0 m-0 list-none font-medium">
              {[
                { label: 'Government e-Marketplace (GeM)', href: 'https://gem.gov.in', external: true },
                { label: 'GFR 2017 Rules', href: '#' },
                { label: 'Department of Expenditure', href: '#' },
                { label: 'CVC Guidelines', href: '#' },
                { label: 'Procurement Policy', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:underline"
                  >
                    <ChevronRight
                      className={`h-3 w-3 text-[#38BDF8] transition-transform duration-150 ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 6 — GeM & CONTACT (Side-by-side on desktop, not taking extra vertical space) */}
          <div className="space-y-3">
            {/* GeM Multi-color Star Logo + Text */}
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                  <path d="M20 2L24 14L20 18L16 14L20 2Z" fill="#F47920" />
                  <path d="M38 15L27 20L20 18L24 14L38 15Z" fill="#1464B4" />
                  <path d="M31 34L22 26L20 18L27 20L31 34Z" fill="#0E3D6E" />
                  <path d="M9 34L18 26L20 18L22 26L9 34Z" fill="#2E8B57" />
                  <path d="M2 15L16 14L20 18L18 26L2 15Z" fill="#E65100" />
                </svg>
              </div>
              <div className="flex flex-col leading-none text-left">
                <span className="text-[14px] font-bold text-white tracking-tight">GeM</span>
                <span className="text-[8.5px] font-medium text-slate-300 mt-0.5">Government</span>
                <span className="text-[8.5px] font-medium text-slate-300">e Marketplace</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Integrated with GeM Portal for seamless procurement.
            </p>

            {/* GeM Portal Card Button */}
            <a
              href="https://gem.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-2.5 rounded-lg border border-[#1C5384] bg-[#0A2E50]/70 hover:bg-[#0E3D6E] transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              aria-label="Visit GeM Portal - Government e Marketplace (opens in new tab)"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-[#0F3960] flex items-center justify-center text-[#38BDF8] flex-shrink-0">
                  <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[12px] font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                    Visit GeM Portal
                  </span>
                  <span className="text-[9.5px] text-slate-400">
                    Government e Marketplace
                  </span>
                </div>
              </div>
              <ArrowRight
                className={`h-3.5 w-3.5 text-[#38BDF8] transition-transform duration-150 ${
                  isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
                }`}
                aria-hidden="true"
              />
            </a>

            {/* Contact Helpdesk Link */}
            <div>
              <a
                href="#contact"
                className="inline-flex items-start gap-2 text-left group focus:outline-none"
              >
                <Mail className="h-3.5 w-3.5 text-[#38BDF8] mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11.5px] font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                    Contact Us
                  </span>
                  <span className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">
                    For support and queries, please reach out through our helpdesk.
                  </span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM UTILITY BAR */}
        <div className="pt-5 border-t border-[#123E66] flex flex-col lg:flex-row items-center justify-between gap-4 text-[12px] text-slate-300">
          {/* Left Side: Copyright & Mission Pillars */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1">
            <span>© 2026 <strong className="text-white font-semibold">BidSure</strong>. All rights reserved.</span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>
            <span className="text-slate-300 font-medium">Government of India</span>
            <span className="text-slate-500" aria-hidden="true">•</span>
            <span>Secure</span>
            <span className="text-slate-500" aria-hidden="true">•</span>
            <span>Transparent</span>
            <span className="text-slate-500" aria-hidden="true">•</span>
            <span>Efficient</span>
          </div>

          {/* Right Side: Legal Links & Back to Top */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-3 gap-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <button
                onClick={handleScreenReaderClick}
                className={`hover:text-white transition-colors px-1 rounded ${
                  screenReaderActive ? 'text-amber-300 font-bold underline' : ''
                }`}
                title="Toggle Screen Reader Mode"
                aria-pressed={screenReaderActive}
              >
                Screen Reader
              </button>
              <span className="text-slate-600" aria-hidden="true">|</span>
              {/* Dark / Light Mode Button */}
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors px-1 rounded focus:outline-none"
                title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="h-3 w-3 text-amber-300" aria-hidden="true" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3 w-3 text-slate-300" aria-hidden="true" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1C5384] bg-[#0A2E50] hover:bg-[#1464B4] text-white text-[11px] font-semibold transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              aria-label="Back to Top of Page"
            >
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
