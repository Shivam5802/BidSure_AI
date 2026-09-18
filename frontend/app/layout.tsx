import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
});

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
};

import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/components/theme';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${merriweather.variable}`} suppressHydrationWarning>
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
