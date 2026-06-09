import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StockSense AI — Indian Stock Market Analysis',
  description: 'AI-powered investment analysis for NSE/BSE stocks. Get buy/sell recommendations, technical analysis, and F&O strategies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
