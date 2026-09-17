import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '../app/page';

describe('Landing Page', () => {
  it('renders the main value proposition hero title', () => {
    render(<LandingPage />);
    const heading = screen.getByRole('heading', {
      name: /AI-Powered Bid Compliance Intelligence/i,
    });
    expect(heading).toBeDefined();
  });

  it('renders the core governance principle: AI assists. Rules verify. Officer decides.', () => {
    render(<LandingPage />);
    const trustStatement = screen.getByText(/AI assists\. Rules verify\. Officer decides\./i);
    expect(trustStatement).toBeDefined();
  });

  it('renders the Start New Tender action button', () => {
    render(<LandingPage />);
    const ctaButton = screen.getByRole('button', { name: /Start New Tender/i });
    expect(ctaButton).toBeDefined();
  });
});
