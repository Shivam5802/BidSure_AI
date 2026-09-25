import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '../app/page';
import { LanguageProvider } from '../lib/i18n/LanguageContext';

describe('Landing Page', () => {
  it('renders the main value proposition hero title', () => {
    render(
      <LanguageProvider>
        <LandingPage />
      </LanguageProvider>
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('BidSure');
    expect(heading.textContent).toContain('AI-Powered Bid Compliance');
  });

  it('renders the core governance principle of institutional accountability', () => {
    render(
      <LanguageProvider>
        <LandingPage />
      </LanguageProvider>
    );
    const accountabilityHeading = screen.getByText(/Built for Accountability\./i);
    expect(accountabilityHeading).toBeDefined();
  });

  it('renders the Get Started action button linking to login', () => {
    render(
      <LanguageProvider>
        <LandingPage />
      </LanguageProvider>
    );
    const ctaLinks = screen.getAllByRole('link', { name: /Get Started/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0]?.getAttribute('href')).toBe('/login');
  });
});
