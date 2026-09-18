'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, User, Menu, X, ArrowRight, ExternalLink } from 'lucide-react';

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['about', 'features', 'how-it-works', 'ai-rules', 'evidence', 'governance', 'security', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#', id: 'home' },
    { label: 'About Us', href: '#about', id: 'about' },
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
    { label: 'AI & Rules', href: '#ai-rules', id: 'ai-rules' },
    { label: 'Evidence', href: '#evidence', id: 'evidence' },
    { label: 'Governance', href: '#governance', id: 'governance' },
    { label: 'Help & Support', href: '#support', id: 'support' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D9E3EC]' : 'bg-white border-b border-[#D9E3EC]'
    }`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-3.5 group" aria-label="BidSure Homepage">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#1464B4] text-white shadow-md shadow-blue-900/15 group-hover:bg-[#082B4C] transition-colors">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black tracking-tight text-[#082B4C] font-serif leading-none">
              BidSure
            </span>
            <span className="text-[11px] font-medium text-[#52677A] tracking-tight mt-1">
              AI Powered Compliance for GeM
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 xl:gap-7 text-[14px] font-medium text-[#17324D] lg:flex" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`transition-colors pb-1 border-b-2 font-medium ${
                  isActive
                    ? 'text-[#1464B4] font-semibold border-[#1464B4]'
                    : 'text-[#52677A] hover:text-[#1464B4] border-transparent'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Action: GeM Badge & Auth Buttons */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Institutional GeM Badge */}
          <div className="flex items-center gap-2 border-r border-[#D9E3EC] pr-4">
            <div className="flex items-center gap-1.5 bg-[#F3F8FC] px-2.5 py-1.5 rounded-lg border border-[#D9E3EC]">
              <div className="h-5 w-5 rounded-full bg-[#B83232] flex items-center justify-center text-white text-[9px] font-bold">
                GeM
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[11px] font-bold text-[#082B4C]">GeM</span>
                <span className="text-[8px] text-[#52677A] font-medium">Govt e-Marketplace</span>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <Link href="/login">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9E3EC] hover:border-[#1464B4] bg-white hover:bg-[#F3F8FC] text-[#17324D] font-semibold text-xs px-3.5 py-2 transition-all">
              <User className="h-3.5 w-3.5 text-[#1464B4]" />
              <span>Login</span>
            </button>
          </Link>

          {/* Get Started Button */}
          <Link href="/login">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#1464B4] hover:bg-[#082B4C] text-white font-semibold text-xs px-4 py-2 shadow-sm transition-all">
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/login" className="sm:hidden">
            <button className="inline-flex items-center gap-1 rounded-md bg-[#1464B4] text-white text-xs px-2.5 py-1.5 font-medium">
              <User className="h-3 w-3" />
              <span>Login</span>
            </button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#17324D] hover:bg-[#F3F8FC] focus:outline-none focus:ring-2 focus:ring-[#1464B4]"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D9E3EC] bg-white px-4 pt-3 pb-6 space-y-2.5 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2 px-3 rounded-lg transition-colors ${
                  activeSection === link.id
                    ? 'bg-blue-50 text-[#1464B4] font-semibold'
                    : 'text-[#17324D] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-[#F3F8FC] px-2 py-1 rounded border border-[#D9E3EC]">
              <span className="text-xs font-bold text-[#B83232]">GeM</span>
              <span className="text-[10px] text-[#52677A]">Aligned with GFR 2017</span>
            </div>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#1464B4] text-white font-semibold text-xs px-4 py-2">
                <span>Access Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
