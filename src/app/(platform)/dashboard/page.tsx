'use client';

import Link from 'next/link';
import {
  Star, Wallet, Globe2, SlidersHorizontal, Bell, FlaskConical,
  LineChart, Sparkles, ArrowRight,
} from 'lucide-react';
import { StockSearch } from '@/components/stock/StockSearch';

const POPULAR_STOCKS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'BAJFINANCE', 'WIPRO', 'ICICIBANK'];

const FEATURE_LINKS = [
  { href: '/watchlist', icon: Star, title: 'Watchlist', desc: 'Track the stocks you care about and watch them move in real time.' },
  { href: '/portfolio', icon: Wallet, title: 'Paper Portfolio', desc: 'Practice trading with virtual cash — no real money at risk.' },
  { href: '/markets', icon: Globe2, title: 'Markets', desc: 'Live indices and sector performance across NSE & BSE.' },
  { href: '/screener', icon: SlidersHorizontal, title: 'Screener', desc: 'Filter the Nifty 50 by RSI, trend, and moving averages.' },
  { href: '/alerts', icon: Bell, title: 'Price Alerts', desc: 'Get notified by email when a stock crosses your target price.' },
  { href: '/backtest', icon: FlaskConical, title: 'Backtesting', desc: 'Test simple strategies against historical data and buy-and-hold.' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero / search */}
      <section className="glass-card rounded-2xl px-8 py-8 mb-8">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full glass-card text-xs font-medium text-emerald">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Google Gemini AI</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-2 text-(--foreground)">
          Analyze any Indian stock with <span className="brand-gradient-text">AI clarity</span>
        </h1>
        <p className="text-(--muted) text-base mb-6 max-w-xl">
          Search any NSE/BSE stock to get an instant AI-powered recommendation, technicals, and F&amp;O ideas.
        </p>
        <StockSearch />
      </section>

      {/* Popular stocks */}
      <section className="mb-10">
        <p className="text-sm font-medium text-(--muted) mb-3">Popular stocks</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map(s => (
            <Link
              key={s}
              href={`/analysis/${s}`}
              className="px-4 py-2 glass-card glass-card-hover rounded-lg text-sm font-medium text-(--foreground) hover:text-emerald transition-colors"
            >
              {s}
            </Link>
          ))}
          <Link
            href="/markets"
            className="px-4 py-2 rounded-lg text-sm font-medium text-emerald hover:text-emerald-light transition-colors flex items-center gap-1"
          >
            View markets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-5 h-5 text-emerald" />
          <h2 className="font-display text-xl font-bold text-(--foreground)">Explore the platform</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_LINKS.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} className="glass-card glass-card-hover rounded-2xl p-5 group">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald to-emerald-light flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-(--foreground) mb-1 flex items-center gap-1.5">
                {title}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald" />
              </h3>
              <p className="text-sm text-(--muted)">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
