'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Menu, X, ExternalLink } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'small'>('normal');

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs">
      {/* 1. TOP GOVERNMENT BAR */}
      <div className="bg-[#0b1b36] text-white text-[12px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          {/* Left: Govt Emblem & Department */}
          <div className="flex items-center gap-2 font-medium tracking-wide">
            {/* National Emblem SVG Icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-400">
              <path d="M12 2L15 8H9L12 2Z" fill="currentColor" />
              <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M12 9V19M7 14H17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-slate-300">Government of India</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200 font-semibold">Department of Expenditure</span>
          </div>

          {/* Right: Accessibility & Language Controls */}
          <div className="flex items-center gap-3 text-slate-300 text-[11px]">
            <a href="#main-content" className="hover:text-white transition hidden sm:inline">
              Skip to main content
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hover:text-white cursor-pointer transition hidden md:inline">Screen Reader</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            {/* Font Size Selector */}
            <div className="flex items-center gap-1 font-semibold text-[11px]">
              <button
                onClick={() => setFontSize('large')}
                className={`hover:text-amber-300 px-0.5 ${fontSize === 'large' ? 'text-amber-300 underline' : ''}`}
                title="Increase font size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('normal')}
                className={`hover:text-amber-300 px-0.5 ${fontSize === 'normal' ? 'text-amber-300' : ''}`}
                title="Normal font size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('small')}
                className={`hover:text-amber-300 px-0.5 ${fontSize === 'small' ? 'text-amber-300 underline' : ''}`}
                title="Decrease font size"
              >
                A-
              </button>
            </div>
            <span className="text-slate-600">|</span>
            {/* Language switch */}
            <div className="flex items-center gap-1 font-medium">
              <button className="hover:text-amber-300 transition">हिंदी</button>
              <span className="text-slate-500">|</span>
              <button className="text-amber-300 font-semibold">English</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="bg-white border-b border-slate-200/90 transition-colors duration-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e40af] text-white shadow-md shadow-blue-900/20 group-hover:bg-[#1d4ed8] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" strokeWidth="1.5">
                <path
                  d="M12 2.5C7.5 4.5 3.5 3.5 3.5 3.5C3.5 13.5 7.5 19.5 12 21.5C16.5 19.5 20.5 13.5 20.5 3.5C20.5 3.5 16.5 4.5 12 2.5Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7L13.2 10.8L17 12L13.2 13.2L12 17L10.8 13.2L7 12L10.8 10.8L12 7Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-[#0f2942] leading-tight font-serif">
                BidSure
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-tight">
                AI-Powered Compliance for GeM
              </span>
            </div>
          </Link>

          {/* Navigation Links Center */}
          <nav className="hidden items-center gap-7 text-[15px] font-medium text-slate-700 lg:flex">
            <Link
              href="/"
              className="text-[#1e40af] font-semibold border-b-2 border-[#1e40af] pb-1 transition-colors"
            >
              Home
            </Link>
            <a
              href="#about"
              className="hover:text-[#1e40af] transition-colors pb-1 border-b-2 border-transparent hover:border-blue-200"
            >
              About Us
            </a>
            <a
              href="#features"
              className="hover:text-[#1e40af] transition-colors pb-1 border-b-2 border-transparent hover:border-blue-200"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="hover:text-[#1e40af] transition-colors pb-1 border-b-2 border-transparent hover:border-blue-200"
            >
              Use Cases
            </a>
            <a
              href="#support"
              className="hover:text-[#1e40af] transition-colors pb-1 border-b-2 border-transparent hover:border-blue-200"
            >
              Help & Support
            </a>
            <a
              href="#contact"
              className="hover:text-[#1e40af] transition-colors pb-1 border-b-2 border-transparent hover:border-blue-200"
            >
              Contact
            </a>
          </nav>

          {/* Right Action & GeM Logo */}
          <div className="hidden sm:flex items-center gap-5">
            {/* GeM Badge Graphic */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-5">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-50 via-amber-50 to-emerald-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
                  GeM
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-bold text-slate-900">GeM</span>
                  <span className="text-[9px] text-slate-500 font-medium">Government e-Marketplace</span>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Link href="/login">
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] hover:bg-[#1d4ed8] active:bg-[#1e3a8a] text-white font-semibold text-sm px-5 py-2.5 shadow-md shadow-blue-900/15 transition-all hover:shadow-lg">
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <Link
              href="/"
              className="block font-semibold text-[#1e40af] py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <a
              href="#about"
              className="block font-medium text-slate-700 hover:text-[#1e40af] py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              href="#features"
              className="block font-medium text-slate-700 hover:text-[#1e40af] py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="block font-medium text-slate-700 hover:text-[#1e40af] py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Use Cases
            </a>
            <a
              href="#support"
              className="block font-medium text-slate-700 hover:text-[#1e40af] py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help & Support
            </a>
            <a
              href="#contact"
              className="block font-medium text-slate-700 hover:text-[#1e40af] py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                <span className="text-xs font-bold text-red-600">GeM</span>
                <span className="text-[10px] text-slate-600 font-medium">Government e-Marketplace</span>
              </div>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] text-white font-semibold text-xs px-4 py-2">
                  <User className="h-3.5 w-3.5" />
                  <span>Login</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

