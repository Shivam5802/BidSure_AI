import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/dashboard/page';
import { AuthProvider } from '../features/auth';

describe('Dashboard Page Shell', () => {
  it('renders workspace welcome message', () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    );
    const welcome = screen.getByRole('heading', {
      name: /Procurement Officer Command Center/i,
    });
    expect(welcome).toBeDefined();
  });

  it('renders the Create New Tender button', () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    );
    const createButton = screen.getByRole('button', {
      name: /Create New Tender/i,
    });
    expect(createButton).toBeDefined();
  });

  it('renders dynamic operational KPI cards and pipeline progression', async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    );

    expect(screen.getAllByText(/Active Tenders/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bidders & Evidence/i)).toBeDefined();
    expect(screen.getByText(/Rule Compliance Rate/i)).toBeDefined();
    expect(screen.getByText(/Officer Authority/i)).toBeDefined();
    expect(screen.getByText(/Evaluation Pipeline/i)).toBeDefined();
  });
});
