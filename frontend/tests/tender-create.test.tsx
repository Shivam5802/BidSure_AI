import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateTenderPage from '../app/tenders/create/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Tender Creation Form', () => {
  it('renders all required form fields', () => {
    render(<CreateTenderPage />);

    expect(screen.getByRole('heading', { name: /Create New Tender/i })).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Procurement of High-Capacity Server Hardware/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. GEM-2026-IT-9821/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Ministry of Electronics and IT/i)).toBeDefined();
  });

  it('displays validation errors when submitting empty form', async () => {
    render(<CreateTenderPage />);

    const submitBtn = screen.getByRole('button', { name: /Create Tender & Add Documents/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Tender title is required/i)).toBeDefined();
    expect(await screen.findByText(/Tender reference number is required/i)).toBeDefined();
    expect(await screen.findByText(/Procuring organization \/ department is required/i)).toBeDefined();
  });
});
