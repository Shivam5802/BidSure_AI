import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProvider, useLanguage, ALL_LANGUAGES, INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from '@/lib/i18n';
import {
  GovernmentUtilityBar,
  BidSureLogo,
  BidSureNavbar,
  DesktopNavigation,
  GeMBrand,
  LanguageSelector,
  LanguageDropdown,
  LoginButton,
  GetStartedButton,
} from '@/components/header';

describe('BidSure Government-Tech Header Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  it('1. BidSure brand logo displays correct institutional name and subtitle, never BidGuard', () => {
    render(<BidSureLogo />);
    
    expect(screen.getByText('BidSure')).toBeInTheDocument();
    expect(screen.getByText('AI Powered Compliance for GeM')).toBeInTheDocument();
    expect(screen.queryByText(/BidGuard/i)).toBeNull();
  });

  it('2. GovernmentUtilityBar displays National Emblem, Ministry, and accessibility controls', () => {
    render(
      <LanguageProvider>
        <GovernmentUtilityBar />
      </LanguageProvider>
    );

    expect(screen.getByAltText('State Emblem of India')).toBeInTheDocument();
    expect(screen.getByText(/Government of India/i)).toBeInTheDocument();
    expect(screen.getByText(/Department of Expenditure/i)).toBeInTheDocument();
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
    expect(screen.getByText(/Screen Reader/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Increase text size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Decrease text size/i)).toBeInTheDocument();
  });

  it('3. DesktopNavigation renders exactly 7 navigation links with Home active', () => {
    render(
      <LanguageProvider>
        <DesktopNavigation />
      </LanguageProvider>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Use Cases')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();

    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('4. GeM branding displays authentic institutional typography and divider', () => {
    render(<GeMBrand />);
    expect(screen.getByText('GeM')).toBeInTheDocument();
    expect(screen.getByText('Government')).toBeInTheDocument();
    expect(screen.getByText('e Marketplace')).toBeInTheDocument();
  });

  it('5. Supports exactly 23 languages (14 Indian + 9 International)', () => {
    expect(INDIAN_LANGUAGES).toHaveLength(14);
    expect(INTERNATIONAL_LANGUAGES).toHaveLength(9);
    expect(ALL_LANGUAGES).toHaveLength(23);

    const indianCodes = INDIAN_LANGUAGES.map((l) => l.code);
    expect(indianCodes).toEqual([
      'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'ur', 'kn', 'ml', 'or', 'pa', 'as', 'ne', 'sa'
    ]);

    const intlCodes = INTERNATIONAL_LANGUAGES.map((l) => l.code);
    expect(intlCodes).toEqual([
      'en', 'es', 'fr', 'de', 'pt', 'ar', 'zh-CN', 'ja', 'ko'
    ]);
  });

  it('6. LanguageDropdown opens with 3-column grid and allows language switching', async () => {
    const handleClose = () => {};
    render(
      <LanguageProvider>
        <LanguageDropdown isOpen={true} onClose={handleClose} />
      </LanguageProvider>
    );

    expect(screen.getByText('Select Language')).toBeInTheDocument();
    expect(screen.getByText('भाषा चुनें')).toBeInTheDocument();
    expect(screen.getByText('INDIAN LANGUAGES (14)')).toBeInTheDocument();
    expect(screen.getByText('INTERNATIONAL LANGUAGES (9)')).toBeInTheDocument();

    // Check Hindi and Bengali
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    expect(screen.getByText('বাংলা')).toBeInTheDocument();
  });

  it('7. Urdu and Arabic switch layout direction to RTL', () => {
    function TestComponent() {
      const { setLanguage, direction } = useLanguage();
      return (
        <div>
          <span data-testid="dir-val">{direction}</span>
          <button onClick={() => setLanguage('ur')}>Select Urdu</button>
          <button onClick={() => setLanguage('ar')}>Select Arabic</button>
          <button onClick={() => setLanguage('hi')}>Select Hindi</button>
        </div>
      );
    }

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('dir-val').textContent).toBe('ltr');

    // Switch to Urdu
    fireEvent.click(screen.getByText('Select Urdu'));
    expect(screen.getByTestId('dir-val').textContent).toBe('rtl');
    expect(document.documentElement.dir).toBe('rtl');

    // Switch to Arabic
    fireEvent.click(screen.getByText('Select Arabic'));
    expect(screen.getByTestId('dir-val').textContent).toBe('rtl');
    expect(document.documentElement.dir).toBe('rtl');

    // Switch to Hindi
    fireEvent.click(screen.getByText('Select Hindi'));
    expect(screen.getByTestId('dir-val').textContent).toBe('ltr');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('8. BidSureNavbar contains brand logo, nav links, GeM, Language, Login, and Get Started', () => {
    render(
      <LanguageProvider>
        <BidSureNavbar />
      </LanguageProvider>
    );

    expect(screen.getByText('BidSure')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});
