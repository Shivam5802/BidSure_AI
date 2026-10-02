import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Sidebar } from '@/components/layout/sidebar';

// Mock dependencies
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: { name: 'Rajesh Kumar', role: 'PROCUREMENT_OFFICER' },
    logout: vi.fn(),
  }),
}));

vi.mock('@/features/tenders/api', () => ({
  tenderApi: {
    listTenders: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/lib/api/workspace.api', () => ({
  workspaceApi: {
    getWorkspaceSummary: vi.fn().mockResolvedValue({
      tender: { id: 'tnd_123', referenceNumber: 'GEM/2026/TEST', title: 'Test Tender', status: 'ACTIVE' },
      counts: { requirementCount: 12, bidderCount: 4, unresolvedConflictCount: 0, conflictCount: 0, investigationCount: 0, humanReviewInvestigationCount: 0, pendingInvestigationCount: 0 },
      processingStatus: { stage: 'EVALUATION' },
      bidderSummary: [],
      actions: [],
      recentActivity: [],
      evidenceCoverage: { overallPercentage: 90, statusCounts: { compliant: 10, nonCompliant: 2, ambiguous: 0, missing: 0, partial: 0 }, highConfidenceExtractionCount: 10, lowConfidenceExtractionCount: 0, verifiedFactCount: 10, unverifiedFactCount: 0, conflictingFactCount: 0, missingEvidenceCount: 0 },
    }),
  },
}));

describe('Sidebar Component - Collapse / Open Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders sidebar expanded by default with 260px width and "Close sidebar" button', () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();
    expect(aside?.className).toContain('md:w-[260px]');

    const toggleBtn = screen.getByTitle('Close sidebar');
    expect(toggleBtn).toBeInTheDocument();
  });

  it('closes sidebar when clicking the three lines button on top of sidebar, and opens on second click', () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector('aside');
    const toggleBtn = screen.getByTitle('Close sidebar');

    // Click 1: Closes / collapses the sidebar
    fireEvent.click(toggleBtn);
    expect(aside?.className).toContain('md:w-[68px]');
    expect(localStorage.getItem('bidguard_sidebar_collapsed')).toBe('true');
    expect(screen.getByTitle('Open sidebar')).toBeInTheDocument();

    // Click 2: Opens the sidebar again
    const openBtn = screen.getByTitle('Open sidebar');
    fireEvent.click(openBtn);
    expect(aside?.className).toContain('md:w-[260px]');
    expect(localStorage.getItem('bidguard_sidebar_collapsed')).toBe('false');
    expect(screen.getByTitle('Close sidebar')).toBeInTheDocument();
  });

  it('restores collapsed state from localStorage on initial render', () => {
    localStorage.setItem('bidguard_sidebar_collapsed', 'true');
    const { container } = render(<Sidebar />);
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('md:w-[68px]');
    expect(screen.getByTitle('Open sidebar')).toBeInTheDocument();
  });

  it('toggles sidebar when receiving "bidguard:toggle-sidebar" event from Topbar', () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('md:w-[260px]');

    act(() => {
      window.dispatchEvent(new Event('bidguard:toggle-sidebar'));
    });

    expect(aside?.className).toContain('md:w-[68px]');
    expect(localStorage.getItem('bidguard_sidebar_collapsed')).toBe('true');

    act(() => {
      window.dispatchEvent(new Event('bidguard:toggle-sidebar'));
    });

    expect(aside?.className).toContain('md:w-[260px]');
    expect(localStorage.getItem('bidguard_sidebar_collapsed')).toBe('false');
  });
});
