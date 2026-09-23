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

  it('renders publish to bidder portal toggle and submits with publishImmediately: true', async () => {
    const { tenderApi } = await import('@/features/tenders/api');
    const createSpy = vi.spyOn(tenderApi, 'createTender').mockResolvedValueOnce({
      id: 'tnd_new_123',
      title: 'Solar Inverters Procurement',
      referenceNumber: 'MNRE-2026-SOLAR-01',
      organization: 'Ministry of New and Renewable Energy',
      closingDate: new Date('2026-12-31').toISOString(),
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<CreateTenderPage />);

    expect(screen.getByText(/Publish to Bidder Portal Immediately/i)).toBeDefined();
    expect(screen.getByText(/Status: PUBLISHED/i)).toBeDefined();

    fireEvent.change(
      screen.getByPlaceholderText(/e\.g\. Procurement of High-Capacity Server Hardware/i),
      { target: { value: 'Solar Inverters Procurement' } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(/e\.g\. GEM-2026-IT-9821/i),
      { target: { value: 'MNRE-2026-SOLAR-01' } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(/e\.g\. Ministry of Electronics and IT/i),
      { target: { value: 'Ministry of New and Renewable Energy' } }
    );

    // Enter closing date
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2026-12-31' } });
    }

    const submitBtn = screen.getByRole('button', { name: /Create Tender & Add Documents/i });
    fireEvent.click(submitBtn);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Solar Inverters Procurement',
        referenceNumber: 'MNRE-2026-SOLAR-01',
        organization: 'Ministry of New and Renewable Energy',
        publishImmediately: true,
      })
    );
  });
});
