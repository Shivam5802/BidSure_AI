import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TendersDirectoryPage from '../app/dashboard/tenders/page';
import { AuthProvider } from '../features/auth';

// Mock tenderApi
vi.mock('@/features/tenders/api', () => ({
  tenderApi: {
    listTenders: vi.fn().mockResolvedValue([
      {
        id: 'tnd_1',
        title: 'Active High Voltage Transformer Tender',
        referenceNumber: 'TRANS-2026-001',
        organization: 'Power Grid Corporation of India',
        status: 'PUBLISHED',
        closingDate: '2026-11-15T00:00:00.000Z',
        category: 'TECHNICAL',
        estimatedValue: 50000000,
        createdAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'tnd_2',
        title: 'Draft Solar Microgrid Project Tender',
        referenceNumber: 'SOLAR-2026-DRAFT',
        organization: 'Ministry of New and Renewable Energy',
        status: 'DRAFT',
        closingDate: '2026-12-01T00:00:00.000Z',
        category: 'TECHNICAL',
        estimatedValue: 30000000,
        createdAt: '2026-09-10T00:00:00.000Z',
      },
    ]),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/dashboard/tenders',
}));

describe('Tenders Directory Page', () => {
  it('renders directory heading and summary metrics', async () => {
    render(
      <AuthProvider>
        <TendersDirectoryPage />
      </AuthProvider>
    );

    expect(screen.getByText(/Procurement Tenders Dossier Directory/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Active High Voltage Transformer Tender/i)).toBeDefined();
      expect(screen.getByText(/Draft Solar Microgrid Project Tender/i)).toBeDefined();
    });

    expect(screen.getByText('TRANS-2026-001')).toBeDefined();
    expect(screen.getByText('SOLAR-2026-DRAFT')).toBeDefined();
    expect(screen.getByText(/PUBLISHED \/ LIVE/i)).toBeDefined();
    expect(screen.getByText(/DRAFT \(INTERNAL\)/i)).toBeDefined();
  });

  it('renders filter tabs and create new tender button', async () => {
    render(
      <AuthProvider>
        <TendersDirectoryPage />
      </AuthProvider>
    );

    expect(screen.getByText('All Tenders')).toBeDefined();
    expect(screen.getAllByText(/Active \/ Published/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Drafts')).toBeDefined();
    expect(screen.getByText(/Create New Tender/i)).toBeDefined();
  });
});
