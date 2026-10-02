import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LandingPage from '../app/page';
import { LanguageProvider } from '../lib/i18n/LanguageContext';
import { ThemeProvider } from '../components/theme';

describe('Landing Page', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders the main value proposition hero title', () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <LandingPage />
        </ThemeProvider>
      </LanguageProvider>
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('BidSure');
    expect(heading.textContent).toContain('AI-Powered Bid Compliance');
  });

  it('renders the core governance principle of institutional accountability', () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <LandingPage />
        </ThemeProvider>
      </LanguageProvider>
    );
    const accountabilityHeading = screen.getByText(/Built for Accountability\./i);
    expect(accountabilityHeading).toBeDefined();
  });

  it('renders the Get Started action button linking to login', () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <LandingPage />
        </ThemeProvider>
      </LanguageProvider>
    );
    const ctaLinks = screen.getAllByRole('link', { name: /Get Started/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks.some((l) => l.getAttribute('href') === '/login')).toBe(true);
  });

  it('toggles dark mode and light mode on landing page', () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <LandingPage />
        </ThemeProvider>
      </LanguageProvider>
    );

    const themeToggles = screen.getAllByRole('button', { name: /Switch to (Dark|Light) Mode/i });
    expect(themeToggles.length).toBeGreaterThan(0);

    // Initial state: light
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click toggle to switch to dark mode
    act(() => {
      fireEvent.click(themeToggles[0]!);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click toggle again to switch back to light mode
    act(() => {
      fireEvent.click(themeToggles[0]!);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

