import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Brain, BarChart3, Gauge, Newspaper, Star, Wallet, Globe2,
  SlidersHorizontal, Bell, FlaskConical, Sparkles, ArrowRight,
  TrendingUp, Target, AlertTriangle, ShieldAlert, Activity,
} from 'lucide-react';

const CORE_FEATURES = [
  {
    icon: Brain,
    title: 'AI Recommendations',
    desc: 'Every stock gets a clear Buy, Sell, or Hold call with a confidence level, target price, stop loss, and a timeframe — all explained in plain English, never just a number.',
  },
  {
    icon: BarChart3,
    title: 'Technical Analysis',
    desc: 'RSI(14), SMA20/50/200, support & resistance levels, and trend direction are computed locally from real price data. The AI explains what they mean — it never invents them.',
  },
  {
    icon: Gauge,
    title: 'F&O Strategy Ideas',
    desc: 'Get a plain-language options idea — suggested strike, expiry, and the reasoning behind it — alongside a prominent risk warning so you understand what you’re getting into.',
  },
  {
    icon: Newspaper,
    title: 'News Highlights',
    desc: 'Recent headlines relevant to the stock are pulled in and summarized, so you understand the "why" behind a price move without reading ten articles.',
  },
];

const ANALYSIS_DETAILS = [
  { icon: TrendingUp, title: 'Recommendation Card', desc: 'Buy/Sell/Hold, confidence score, target price, stop loss and suggested timeframe at a glance.' },
  { icon: Activity, title: 'Technical Panel', desc: 'RSI, moving averages, support & resistance, and an overall trend reading — bullish, bearish, or neutral.' },
  { icon: Target, title: 'F&O Panel', desc: 'A suggested options strategy with strike, expiry, and a clear explanation of the risk involved.' },
  { icon: AlertTriangle, title: 'Risk Factors', desc: '3-5 specific risks the AI identified for this stock, based on its sector and recent news.' },
  { icon: ShieldAlert, title: 'AI Disclosure', desc: 'A persistent reminder that this is AI-generated, educational content — never investment advice.' },
  { icon: BarChart3, title: 'Price Chart', desc: 'An interactive price chart with 90 days of history, so you can see the trend for yourself.' },
];

const PLATFORM_TOOLS = [
  { icon: Star, title: 'Watchlist', href: '/watchlist', desc: 'Save stocks you’re tracking and see their latest price and recommendation in one list.' },
  { icon: Wallet, title: 'Paper Portfolio', href: '/portfolio', desc: 'Buy and sell with virtual cash to practice strategies risk-free, and track your simulated returns.' },
  { icon: Globe2, title: 'Markets', href: '/markets', desc: 'A live overview of NSE & BSE indices and how each market sector is performing today.' },
  { icon: SlidersHorizontal, title: 'Screener', href: '/screener', desc: 'Filter the Nifty 50 by RSI, trend, and moving averages to quickly find stocks worth a closer look.' },
  { icon: Bell, title: 'Price Alerts', href: '/alerts', desc: 'Set a target price for any stock and get an email the moment it’s crossed.' },
  { icon: FlaskConical, title: 'Backtesting', href: '/backtest', desc: 'Run a simple strategy against historical data and compare it to a buy-and-hold baseline.' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 90% 0%, rgba(45,212,167,0.16), transparent 45%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center px-4 pt-16 pb-14 md:pt-20 md:pb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full glass-card text-xs font-medium text-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Features</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 text-(--foreground)">
            Everything you need to invest smarter
          </h1>
          <p className="text-(--muted) text-lg max-w-2xl mx-auto">
            From instant AI analysis to portfolio tracking and price alerts — StockSense AI brings every
            tool an Indian retail investor needs into one clean, free platform.
          </p>
        </div>
      </section>

      {/* Core AI features */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">AI-Powered Stock Analysis</h2>
          <p className="text-(--muted)">Search any NSE/BSE stock and get a full breakdown in seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald to-emerald-light rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-(--foreground) mb-2">{title}</h3>
              <p className="text-sm text-(--muted)">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inside an analysis */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="glass-card rounded-2xl p-6 md:p-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">What&apos;s Inside Every Analysis</h2>
            <p className="text-(--muted)">One page, six panels, zero guesswork.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ANALYSIS_DETAILS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl glass-strong p-5">
                <div className="w-10 h-10 bg-emerald-light/15 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-emerald" />
                </div>
                <h3 className="font-display font-semibold text-(--foreground) mb-1">{title}</h3>
                <p className="text-sm text-(--muted)">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/analysis/RELIANCE"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-5 py-2.5 rounded-xl shadow-md shadow-emerald/20 hover:opacity-90 transition-opacity"
            >
              See a live example <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Platform tools */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">A Complete Investing Toolkit</h2>
          <p className="text-(--muted)">Beyond analysis — track, plan, and practice, all in one place.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_TOOLS.map(({ icon: Icon, title, href, desc }) => (
            <Link key={title} href={href} className="glass-card glass-card-hover rounded-2xl p-6 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald to-emerald-light flex items-center justify-center mb-4">
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

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden glass-strong rounded-2xl px-6 py-14 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 0%, rgba(45,212,167,0.18), transparent 50%)' }}
          />
          <div className="relative">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-3">
              Ready to try it on your own watchlist?
            </h2>
            <p className="text-(--muted) mb-8 max-w-xl mx-auto">
              Create a free account and get instant access to every feature above — no credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald/20 hover:opacity-90 transition-opacity"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
