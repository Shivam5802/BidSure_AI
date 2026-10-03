'use client';

import { useEffect } from 'react';
import { scrollToHash } from '@/lib/scroll';

export function useHashScroll(): void {
  useEffect(() => {
    const handleHashLinkClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      // Only handle in-page hash links (e.g. #about, #features, #)
      if (href && href.startsWith('#')) {
        e.preventDefault();
        scrollToHash(href);
      }
    };

    document.addEventListener('click', handleHashLinkClick);
    return () => {
      document.removeEventListener('click', handleHashLinkClick);
    };
  }, []);
}
