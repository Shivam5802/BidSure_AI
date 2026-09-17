import React from 'react';
import { AuthGuard } from '@/features/auth';

export default function TendersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
