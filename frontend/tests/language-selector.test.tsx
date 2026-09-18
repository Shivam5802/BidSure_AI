import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GOOGLE_TRANSLATE_LANGUAGES, LanguageSelector } from '../components/layout/LanguageSelector';

describe('Language Selector', () => {
  it('offers English and 22 Google Translate languages', () => {
    render(<LanguageSelector />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(23);
    expect(screen.getByRole('option', { name: 'Hindi' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Tamil' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Arabic' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Japanese' })).toBeDefined();
    expect(GOOGLE_TRANSLATE_LANGUAGES.filter(({ code }) => code !== 'en')).toHaveLength(22);
  });
});
