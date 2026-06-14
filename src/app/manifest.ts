import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StockSense AI — Indian Stock Market Analysis',
    short_name: 'StockSense AI',
    description: 'AI-powered investment analysis for NSE/BSE stocks. Get buy/sell recommendations, technical analysis, and F&O strategies.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f3f6fb',
    theme_color: '#19b98a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
