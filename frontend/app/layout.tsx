import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BidGuard AI — AI-Powered Bid Compliance Verification Platform',
  description:
    'Integrated Bid Compliance Verification Platform for GeM Procurement. Transforms complex tender documents into structured compliance requirements, verifies bidder evidence, and produces explainable intelligence.',
  keywords: [
    'GeM',
    'Government Procurement',
    'Bid Compliance',
    'AI Verification',
    'Tender Evaluation',
    'Audit Trail',
  ],
};

import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/components/theme';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('bidguard_theme');
                  var d = document.documentElement;
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    d.classList.add('dark');
                    d.style.colorScheme = 'dark';
                  } else {
                    d.classList.remove('dark');
                    d.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
