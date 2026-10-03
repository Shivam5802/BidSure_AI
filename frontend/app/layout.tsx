import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BidSure — AI-Powered Bid Compliance & Intelligence Platform',
  description:
    'Evidence-backed AI and deterministic compliance verification for government procurement under GeM and GFR 2017.',
  keywords: [
    'BidSure',
    'GeM',
    'Government Procurement',
    'Bid Compliance',
    'AI Verification',
    'GFR 2017',
    'Tender Evaluation',
    'Audit Trail',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
};

import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/components/theme';
import { LanguageProvider } from '@/lib/i18n';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full font-sans" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('bidsure_theme');
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
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
