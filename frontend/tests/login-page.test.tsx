import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/login/page';
import { AuthProvider } from '../features/auth';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'next' ? '/dashboard' : null),
  }),
  usePathname: () => '/login',
}));

describe('Login Page Component', () => {
  it('1. renders government procurement portal branding and sign-in header', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /BidGuard/i })).toBeDefined();
    expect(screen.getByText(/Sign in to your Workspace/i)).toBeDefined();
    expect(screen.getByLabelText(/Official Work Email/i)).toBeDefined();
    expect(screen.getByLabelText(/^Password$/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign In to Portal/i })).toBeDefined();
  });

  it('2. validates required fields on empty submission', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Sign In to Portal/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Email is required/i)).toBeDefined();
    expect(await screen.findByText(/Password is required/i)).toBeDefined();
  });

  it('3. validates invalid email format', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/Official Work Email/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });

    const submitBtn = screen.getByRole('button', { name: /Sign In to Portal/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Enter a valid email address/i)).toBeDefined();
  });

  it('4. toggles password visibility between password and text', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe('text');

    const hideBtn = screen.getByRole('button', { name: /Hide password/i });
    fireEvent.click(hideBtn);

    expect(passwordInput.type).toBe('password');
  });

  it('5. auto-fills demo credentials when clicking demo account buttons', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const officerBtn = screen.getByText(/Procurement Officer/i).closest('button')!;
    fireEvent.click(officerBtn);

    const emailInput = screen.getByLabelText(/Official Work Email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;

    expect(emailInput.value).toBe('officer@gem.gov.in');
    expect(passwordInput.value).toBe('Officer@123');
  });
});
