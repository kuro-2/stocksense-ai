import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StockSearch } from '@/components/stock/StockSearch';
import Link from 'next/link';
import {
  Search, Brain, LineChart, Sparkles, ShieldCheck, Gauge, BarChart3,
  ArrowRight, Zap, Globe2, Bell, Star, Wallet, FlaskConical, SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';

const POPULAR_STOCKS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'BAJFINANCE', 'WIPRO', 'ICICIBANK'];

const STATS = [
  { value: '50+', label: 'Nifty 50 stocks covered' },
  { value: '<15s', label: 'From search to insight' },
  { value: '10+', label: 'Technical indicators' },
  { value: '100%', label: 'Free, always' },
];

const FEATURE_HIGHLIGHTS = [
  { icon: Brain, title: 'AI Recommendations', desc: 'Buy, sell, or hold — with a target price, stop loss, and plain-English reasoning behind every call.' },
  { icon: BarChart3, title: 'Technical Analysis', desc: 'RSI, SMA20/50/200, support & resistance, and trend — computed from real data, never hallucinated.' },
  { icon: Gauge, title: 'F&O Strategy Ideas', desc: 'Plain-language options ideas with strike, expiry, and clear risk warnings attached.' },
];

const PLATFORM_TOOLS = [
  { icon: Star, title: 'Watchlist', desc: 'Track the stocks you care about in one place.' },
  { icon: Wallet, title: 'Paper Portfolio', desc: 'Practice trading with virtual cash, zero risk.' },
  { icon: Globe2, title: 'Markets', desc: 'Live NSE & BSE indices and sector moves.' },
  { icon: SlidersHorizontal, title: 'Screener', desc: 'Filter Nifty 50 by RSI, trend & moving averages.' },
  { icon: Bell, title: 'Price Alerts', desc: 'Get emailed when a stock hits your target.' },
  { icon: FlaskConical, title: 'Backtesting', desc: 'Test strategies against historical data.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 85% 10%, rgba(45,212,167,0.16), transparent 45%), radial-gradient(circle at 10% 90%, rgba(25,185,138,0.10), transparent 40%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center px-4 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full glass-card text-xs font-medium text-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Google Gemini AI &middot; 100% Free</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-5 text-(--foreground)">
            Analyze any Indian stock<br className="hidden md:block" /> with{' '}
            <span className="brand-gradient-text">AI clarity</span>
          </h1>
          <p className="text-(--muted) text-lg mb-10 max-w-2xl mx-auto">
            Instant AI-powered buy/sell recommendations, technical analysis, F&amp;O strategies, and news —
            for any NSE/BSE stock, explained in plain English.
          </p>
          <div className="flex justify-center mb-8">
            <StockSearch />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald/20 hover:opacity-90 transition-opacity"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold glass-card glass-card-hover text-(--foreground) px-6 py-3 rounded-xl"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <div className="glass-card rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 md:divide-x divide-(--surface-border)">
          {STATS.map(stat => (
            <div key={stat.label} className="px-4 py-6 text-center">
              <p className="font-display text-2xl md:text-3xl font-bold brand-gradient-text mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-(--muted)">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular stocks */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <p className="text-sm font-medium text-(--muted) mb-3">Try it on a popular stock</p>
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
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">How It Works</h2>
          <p className="text-(--muted)">From a stock name to a clear recommendation in under 15 seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Search, title: '1. Search', desc: 'Type any NSE/BSE stock name or symbol' },
            { icon: Brain, title: '2. AI Analyzes', desc: 'Gemini AI fetches live data, news, and computes technicals' },
            { icon: LineChart, title: '3. Get Insights', desc: 'See a buy/sell recommendation with target and stop loss' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card glass-card-hover rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-emerald-light/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-emerald" />
              </div>
              <h3 className="font-display font-semibold text-(--foreground) mb-1">{title}</h3>
              <p className="text-sm text-(--muted)">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/how-it-works" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald hover:text-emerald-light transition-colors">
            Learn more about how StockSense AI works <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">Built for Indian retail investors</h2>
          <p className="text-(--muted)">Everything you need to make sense of the market — in one place.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald to-emerald-light rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-(--foreground) mb-1">{title}</h3>
              <p className="text-sm text-(--muted)">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/features" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald hover:text-emerald-light transition-colors">
            Explore all features <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Platform tools */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">A full toolkit, not just analysis</h2>
          <p className="text-(--muted)">Track, plan, and practice — all in the same place as your AI insights.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PLATFORM_TOOLS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card glass-card-hover rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-light/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-(--foreground) mb-1">{title}</h3>
                <p className="text-sm text-(--muted)">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for teaser */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="glass-card rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-light/15 text-xs font-medium text-emerald">
              <Zap className="w-3.5 h-3.5" />
              <span>For every kind of investor</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-3">
              Whether you&apos;re just starting out or refining your strategy
            </h2>
            <p className="text-(--muted) mb-6">
              StockSense AI explains charts and indicators in plain English for beginners, while giving
              experienced traders fast technicals, screeners, and F&amp;O ideas to speed up research.
            </p>
            <Link href="/who-its-for" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald hover:text-emerald-light transition-colors">
              See who it&apos;s for <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              'No jargon — every term is explained simply',
              'Real technical indicators, not AI guesses',
              'Practice with a paper portfolio before risking real money',
              'Set price alerts and never miss a move',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
                <p className="text-sm text-(--foreground)">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclosure */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-700 dark:text-amber-300">
          <p>
            ⚠️ StockSense AI is an educational tool only — not registered with SEBI as an Investment Adviser
            or Research Analyst. Nothing here is investment advice. See our{' '}
            <Link href="/legal/disclaimer" className="font-semibold underline">Risk Disclosure</Link>.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden glass-strong rounded-2xl px-6 py-14 md:py-16 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(45,212,167,0.18), transparent 50%)',
            }}
          />
          <div className="relative">
            <ShieldCheck className="w-10 h-10 text-emerald mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-3">
              Start making sense of the market today
            </h2>
            <p className="text-(--muted) mb-8 max-w-xl mx-auto">
              No subscriptions, no hidden costs — sign up free and get your first AI stock analysis in seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald/20 hover:opacity-90 transition-opacity"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 text-sm font-semibold glass-card glass-card-hover text-(--foreground) px-6 py-3 rounded-xl"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
