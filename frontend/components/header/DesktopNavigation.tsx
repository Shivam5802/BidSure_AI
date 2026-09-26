'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { scrollToHash } from '@/lib/scroll';

interface NavItem {
  id: string;
  href: string;
  key: string;
  defaultLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '#', key: 'nav.home', defaultLabel: 'Home' },
  { id: 'about', href: '#about', key: 'nav.aboutUs', defaultLabel: 'About Us' },
  { id: 'features', href: '#features', key: 'nav.features', defaultLabel: 'Features' },
  { id: 'use-cases', href: '#use-cases', key: 'nav.useCases', defaultLabel: 'Use Cases' },
  { id: 'how-it-works', href: '#how-it-works', key: 'nav.howItWorks', defaultLabel: 'How It Works' },
  { id: 'support', href: '#support', key: 'nav.helpSupport', defaultLabel: 'Help & Support' },
  { id: 'contact', href: '#contact', key: 'nav.contact', defaultLabel: 'Contact' },
];

export function DesktopNavigation() {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string>('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 150) {
        setActiveId('home');
        return;
      }

      const sections = ['about', 'features', 'use-cases', 'how-it-works', 'support', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveId(id);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="hidden xl:flex items-center text-[11.5px] xl:text-[12px] 2xl:text-[13px] font-medium text-[#17324D] select-none"
      aria-label="Main Navigation"
    >
      <ul className="flex items-center gap-0.5 xl:gap-1 2xl:gap-2.5 list-none m-0 p-0">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const label = t(item.key, item.defaultLabel);

          return (
            <li key={item.id} className="relative py-1 shrink-0">
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash(item.href);
                  setActiveId(item.id);
                }}
                className={`inline-block transition-colors duration-200 px-1.5 2xl:px-2 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-[#1464B4] rounded whitespace-nowrap ${
                  isActive
                    ? 'text-[#1464B4] dark:text-[#58A6FF] font-semibold'
                    : 'text-[#17324D] dark:text-slate-200 hover:text-[#1464B4] dark:hover:text-[#58A6FF]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
                {/* Thin Blue Underline for Active Item */}
                <span
                  className={`absolute bottom-0 left-1.5 right-1.5 xl:left-2 xl:right-2 h-[2px] bg-[#1464B4] rounded-full transition-all duration-200 ${
                    isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}
                  aria-hidden="true"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
