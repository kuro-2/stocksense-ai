import type { Metadata, Viewport } from 'next';
import { Spectral, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const hankenGrotesk = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const spectral = Spectral({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'StockSense AI — Indian Stock Market Analysis',
  description: 'AI-powered investment analysis for NSE/BSE stocks. Get buy/sell recommendations, technical analysis, and F&O strategies.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicon-180.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#19b98a',
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${hankenGrotesk.variable} ${spectral.variable} ${jetbrainsMono.variable} ${hankenGrotesk.className} min-h-full bg-[var(--background)] text-[var(--foreground)]`}>
        <ThemeProvider>
          <div className="ambient-bg" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
