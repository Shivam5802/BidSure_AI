'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

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
      className="hidden lg:flex items-center gap-6 xl:gap-8 text-[14.5px] font-medium text-[#17324D] select-none"
      aria-label="Main Navigation"
    >
      <ul className="flex items-center gap-6 xl:gap-8 list-none m-0 p-0">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const label = t(item.key, item.defaultLabel);

          return (
            <li key={item.id} className="relative py-2">
              <a
                href={item.href}
                onClick={() => setActiveId(item.id)}
                className={`inline-block transition-colors duration-200 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-[#1464B4] rounded ${
                  isActive
                    ? 'text-[#1464B4] font-semibold'
                    : 'text-[#17324D] hover:text-[#1464B4]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
                {/* Thin Blue Underline for Active Item */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1464B4] rounded-full transition-all duration-200 ${
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
