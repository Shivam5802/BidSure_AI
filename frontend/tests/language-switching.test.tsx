import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { LanguageSelector as TopbarLanguageSelector } from '@/components/layout/LanguageSelector';

function TestConsumer() {
  const { currentLanguage, setLanguage, direction, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{currentLanguage}</span>
      <span data-testid="current-dir">{direction}</span>
      <span data-testid="translated-home">{t('nav.home', 'Home')}</span>
      <button onClick={() => setLanguage('hi')}>Switch to Hindi</button>
      <button onClick={() => setLanguage('ur')}>Switch to Urdu</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  );
}

describe('Language Switching & Default English Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  it('1. sets default language strictly to English ("en") with LTR direction', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('current-dir').textContent).toBe('ltr');
    expect(screen.getByTestId('translated-home').textContent).toBe('Home');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('2. changes language to Hindi and updates translations & HTML lang', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Switch to Hindi'));

    expect(screen.getByTestId('current-lang').textContent).toBe('hi');
    expect(screen.getByTestId('translated-home').textContent).toBe('मुख्य पृष्ठ');
    expect(localStorage.getItem('bidsure_preferred_language')).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');
  });

  it('3. changes language to Urdu and sets RTL direction on document root', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Switch to Urdu'));

    expect(screen.getByTestId('current-lang').textContent).toBe('ur');
    expect(screen.getByTestId('current-dir').textContent).toBe('rtl');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ur');
  });

  it('4. switching back to English cleanly restores default language and LTR direction', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    // First switch to Hindi
    fireEvent.click(screen.getByText('Switch to Hindi'));
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');

    // Then switch back to English
    fireEvent.click(screen.getByText('Switch to English'));
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('current-dir').textContent).toBe('ltr');
    expect(screen.getByTestId('translated-home').textContent).toBe('Home');
    expect(localStorage.getItem('bidsure_preferred_language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('5. Topbar LanguageSelector dropdown is synchronized with LanguageProvider', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
        <TopbarLanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe('en');

    // Change to Tamil
    fireEvent.change(select, { target: { value: 'ta' } });

    expect(screen.getByTestId('current-lang').textContent).toBe('ta');
    expect(localStorage.getItem('bidsure_preferred_language')).toBe('ta');
    expect((select as HTMLSelectElement).value).toBe('ta');
  });
});
