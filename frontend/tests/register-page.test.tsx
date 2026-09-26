import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BidderRegistrationPage from '../app/register/bidder/page';
import { AuthProvider } from '../features/auth';
import { api } from '../lib/api/client';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
  usePathname: () => '/register/bidder',
}));

vi.mock('../lib/api/client', () => ({
  api: {
    registerBidder: vi.fn().mockResolvedValue({
      token: 'mock-jwt-token',
      user: { id: 'bidder-1', email: 'rajesh@example.com', role: 'BIDDER' },
      profile: {},
    }),
    login: vi.fn().mockResolvedValue({
      token: 'mock-jwt-token',
      user: { id: 'bidder-1', email: 'rajesh@example.com', role: 'BIDDER' },
    }),
    getMe: vi.fn().mockResolvedValue(null),
    logout: vi.fn().mockResolvedValue({ message: 'Logged out' }),
  },
}));

describe('Bidder Registration Page Component', () => {
  it('1. renders registration form fields, header, and buttons', () => {
    render(
      <AuthProvider>
        <BidderRegistrationPage />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /Bidder Organization Registration/i })).toBeDefined();
    expect(screen.getByPlaceholderText(/Apex Infrastructure Solutions Ltd/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/27AAACA1234B1Z2/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/^AAACA1234B$/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Rajesh Singhania/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/contractor@company.co.in/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Go back/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Fill Sample Contractor Info/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Complete Registration/i })).toBeDefined();
  });

  it('2. validates required fields on empty submission', async () => {
    render(
      <AuthProvider>
        <BidderRegistrationPage />
      </AuthProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Complete Registration/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Authorized representative name is required/i)).toBeDefined();
    expect(await screen.findByText(/Official work email is required/i)).toBeDefined();
    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeDefined();
    expect(await screen.findByText(/Legal company name is required/i)).toBeDefined();
  });

  it('3. fills sample contractor info when clicking demo prefill button', () => {
    render(
      <AuthProvider>
        <BidderRegistrationPage />
      </AuthProvider>
    );

    const prefillBtn = screen.getByRole('button', { name: /Fill Sample Contractor Info/i });
    fireEvent.click(prefillBtn);

    const companyInput = screen.getByPlaceholderText(/Apex Infrastructure Solutions Ltd/i) as HTMLInputElement;
    const nameInput = screen.getByPlaceholderText(/Rajesh Singhania/i) as HTMLInputElement;
    const gstinInput = screen.getByPlaceholderText(/27AAACA1234B1Z2/i) as HTMLInputElement;

    expect(companyInput.value).toBe('Apex Infrastructure Solutions Ltd');
    expect(nameInput.value).toBe('Rajesh Singhania');
    expect(gstinInput.value).toBe('27AAACA1234B1Z2');
  });

  it('4. toggles password visibility between password and text', () => {
    render(
      <AuthProvider>
        <BidderRegistrationPage />
      </AuthProvider>
    );

    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    const hideBtn = screen.getByRole('button', { name: /Hide password/i });
    fireEvent.click(hideBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('5. submits valid registration and redirects to bidder dashboard', async () => {
    render(
      <AuthProvider>
        <BidderRegistrationPage />
      </AuthProvider>
    );

    const prefillBtn = screen.getByRole('button', { name: /Fill Sample Contractor Info/i });
    fireEvent.click(prefillBtn);

    const submitBtn = screen.getByRole('button', { name: /Complete Registration/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.registerBidder).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/bidder/dashboard');
    });
  });
});
