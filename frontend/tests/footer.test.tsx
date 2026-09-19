import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageProvider } from '@/lib/i18n';
import { Footer } from '@/components/layout/footer';

describe('BidSure Website Footer Suite', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('1. Column 1 displays BidSure brand, tagline, description, and National Emblem', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );

    expect(screen.getByText('Bid')).toBeInTheDocument();
    expect(screen.getByText('Sure')).toBeInTheDocument();
    expect(screen.getByText('Procurement. Verified.')).toBeInTheDocument();
    expect(
      screen.getByText(/An AI-powered platform for transparent, compliant and efficient government procurement through GeM/i)
    ).toBeInTheDocument();
    expect(screen.getByAltText('State Emblem of India')).toBeInTheDocument();
    expect(screen.getByText(/Transparent Procurement for a Stronger India/i)).toBeInTheDocument();
  });

  it('2. Column 2 displays QUICK LINKS with all 6 required items', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );

    expect(screen.getByText('QUICK LINKS')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Use Cases')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getAllByText('Contact Us').length).toBeGreaterThanOrEqual(1);
  });

  it('3. Column 3 displays RESOURCES with all 6 required items', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );

    expect(screen.getByText('RESOURCES')).toBeInTheDocument();
    expect(screen.getByText('User Manual')).toBeInTheDocument();
    expect(screen.getByText('FAQs')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    expect(screen.getByText('Video Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Download Brochure')).toBeInTheDocument();
    expect(screen.getAllByText('Sitemap').length).toBeGreaterThanOrEqual(1);
  });

  it('4. Column 4 displays LEGAL & COMPLIANCE links', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );

    expect(screen.getByText('LEGAL & COMPLIANCE')).toBeInTheDocument();
    expect(screen.getAllByText('Terms & Conditions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
    expect(screen.getByText('Accessibility Statement')).toBeInTheDocument();
    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
    expect(screen.getByText('Audit Integrity')).toBeInTheDocument();
  });

  it('5. Column 5 & 6 display GOVERNMENT / PROCUREMENT, GeM portal button card, and helpdesk', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );

    expect(screen.getByText('GOVERNMENT / PROCUREMENT')).toBeInTheDocument();
    expect(screen.getByText('Government e-Marketplace (GeM)')).toBeInTheDocument();
    expect(screen.getByText('GFR 2017 Rules')).toBeInTheDocument();
    expect(screen.getByText('Department of Expenditure')).toBeInTheDocument();
    expect(screen.getByText('CVC Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Procurement Policy')).toBeInTheDocument();

    expect(screen.getByText('Visit GeM Portal')).toBeInTheDocument();
    expect(screen.getByText(/Integrated with GeM Portal for seamless procurement/i)).toBeInTheDocument();
  });

  it('6. Bottom utility bar displays copyright, mission pillars, and Back to Top button', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );

    expect(screen.getByText(/© 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Government of India/i)).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Transparent')).toBeInTheDocument();
    expect(screen.getByText('Efficient')).toBeInTheDocument();

    const backToTopBtn = screen.getByRole('button', { name: /Back to Top/i });
    expect(backToTopBtn).toBeInTheDocument();
    fireEvent.click(backToTopBtn);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
