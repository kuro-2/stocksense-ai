import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StockSearch } from '@/components/stock/StockSearch';
import { Reveal } from '@/components/ui/Reveal';
import Link from 'next/link';
import {
  Brain, BarChart3, Gauge, Star, Wallet, Globe2, SlidersHorizontal,
  Bell, FlaskConical, ArrowRight, Check, AlertTriangle,
} from 'lucide-react';

const POPULAR_STOCKS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'BAJFINANCE', 'WIPRO', 'ICICIBANK'];

const STATS = [
  { value: '50+', label: 'Nifty 50 stocks covered' },
  { value: '<15s', label: 'From search to insight' },
  { value: '10+', label: 'Technical indicators' },
  { value: '100%', label: 'Free, always' },
];

const HOW_STEPS = [
  { n: '01', title: 'Search any stock', desc: 'Type any NSE/BSE name or symbol — Nifty 50 and beyond.' },
  { n: '02', title: 'AI fetches live data', desc: 'Real-time quote, 90-day history, and recent headlines pulled fresh.' },
  { n: '03', title: 'Technicals computed locally', desc: 'RSI, SMAs, support/resistance — calculated from real data, never invented by the AI.' },
  { n: '04', title: 'One clear recommendation', desc: 'Buy, Sell, or Hold with a target price, stop loss, and plain-English reasoning.' },
];

const FEATURES = [
  { icon: Brain, title: 'AI Recommendations', desc: 'Buy, sell, or hold — with a target price, stop loss, and plain-English reasoning behind every call.' },
  { icon: BarChart3, title: 'Technical Analysis', desc: 'RSI, SMA20/50/200, support & resistance, and trend — computed from real data, never hallucinated.' },
  { icon: Gauge, title: 'F&O Strategy Ideas', desc: 'Plain-language options ideas with strike, expiry, and clear risk warnings attached.' },
];

const TOOLS = [
  { icon: Star, title: 'Watchlist', desc: 'Track stocks you care about in one place.' },
  { icon: Wallet, title: 'Paper Portfolio', desc: 'Practice trading with virtual cash, zero risk.' },
  { icon: Globe2, title: 'Markets', desc: 'Live NSE & BSE indices and sector moves.' },
  { icon: SlidersHorizontal, title: 'Screener', desc: 'Filter Nifty 50 by RSI, trend & moving averages.' },
  { icon: Bell, title: 'Price Alerts', desc: 'Get emailed when a stock hits your target.' },
  { icon: FlaskConical, title: 'Backtesting', desc: 'Test strategies against historical data.' },
];

const CHECKLIST = [
  'No jargon — every term explained in plain English',
  'Real technical indicators, not AI guesses',
  'Practice with a paper portfolio before risking real money',
  'Set price alerts and never miss a move',
  'F&O strategy ideas with clear risk disclosures',
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero wrap">
        <p className="eyebrow">Powered by Gemini AI · 100% Free</p>

        <h1 style={{ marginTop: 'var(--s4)' }}>
          Analyze any Indian stock<br />
          with <em>AI clarity</em>
        </h1>

        <p className="lede" style={{ maxWidth: '52ch', marginTop: 'var(--s5)' }}>
          Instant AI-powered buy/sell recommendations, technical analysis, F&amp;O strategies, and
          news — for any NSE/BSE stock, explained in plain English.
        </p>

        <div className="hero-search" style={{ marginTop: 'var(--s6)' }}>
          <StockSearch />
        </div>

        <div className="hero-try" style={{ marginTop: 'var(--s7)' }}>
          <p className="label">Try a popular stock</p>
          <div className="chips">
            {POPULAR_STOCKS.map(s => (
              <Link key={s} href={`/analysis/${s}`} className="chip">{s}</Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'var(--s7)' }}>
          <Link href="/signup" className="btn btn-primary">
            Get Started Free <span className="arrow"><ArrowRight width={16} height={16} /></span>
          </Link>
          <Link href="/how-it-works" className="btn btn-ghost">
            How It Works
          </Link>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="stats">
          {STATS.map(s => (
            <div key={s.label} className="stat">
              <p className="statnum">{s.value}</p>
              <p className="statlab">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── How It Works ────────────────────────────────────── */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">The process</p>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">From a stock name to a clear recommendation in under 15 seconds.</p>
        </div>
        <div className="flow">
          {HOW_STEPS.map((step, i) => (
            <div key={step.n} className="flow-item">
              <span className="flow-num">{step.n}</span>
              <div className="flow-body">
                <h3 className="flow-title">{step.title}</h3>
                <p className="flow-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--s6)' }}>
          <Link href="/how-it-works" className="btn btn-ghost">
            Full breakdown <span className="arrow"><ArrowRight width={16} height={16} /></span>
          </Link>
        </div>
      </Reveal>

      {/* ── Core Features ───────────────────────────────────── */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">What you get</p>
          <h2 className="section-title">Built for Indian retail investors</h2>
          <p className="section-sub">Everything you need to make sense of the market — in one place.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s6)' }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="panel panel-hover" style={{ padding: 'var(--s6)' }}>
              <span className="glyph" style={{ marginBottom: 'var(--s4)', display: 'inline-grid' }}>
                <Icon width={22} height={22} />
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ marginTop: 'var(--s2)', color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--s6)' }}>
          <Link href="/features" className="btn btn-ghost">
            All features <span className="arrow"><ArrowRight width={16} height={16} /></span>
          </Link>
        </div>
      </Reveal>

      {/* ── Platform tools ──────────────────────────────────── */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">The platform</p>
          <h2 className="section-title">A full toolkit, not just analysis</h2>
          <p className="section-sub">Track, plan, and practice — all in the same place as your AI insights.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s6)' }}>
          {TOOLS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="panel panel-hover" style={{ padding: 'var(--s5)', display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start' }}>
              <span className="glyph" style={{ flexShrink: 0 }}>
                <Icon width={20} height={20} />
              </span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ marginTop: 'var(--s2)', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Who it's for ────────────────────────────────────── */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="split">
          <div>
            <p className="eyebrow">Who it's for</p>
            <h2 className="section-title" style={{ marginTop: 'var(--s3)' }}>
              Whether you&apos;re just starting out or <em>refining your strategy</em>
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.6, marginTop: 'var(--s4)', maxWidth: '46ch' }}>
              StockSense AI explains charts and indicators in plain English for beginners, while giving
              experienced traders fast technicals, screeners, and F&amp;O ideas.
            </p>
            <div style={{ marginTop: 'var(--s6)' }}>
              <Link href="/who-its-for" className="btn btn-ghost">
                See who it&apos;s for <span className="arrow"><ArrowRight width={16} height={16} /></span>
              </Link>
            </div>
          </div>
          <div className="checklist">
            {CHECKLIST.map(item => (
              <div key={item} className="check">
                <span className="tick"><Check width={15} height={15} strokeWidth={2.5} /></span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── CTA band ────────────────────────────────────────── */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="cta-band">
          <h2>Start making sense of the market today</h2>
          <p>No subscriptions, no hidden costs — sign up free and get your first AI stock analysis in seconds.</p>
          <div className="row">
            <Link href="/signup" className="btn btn-primary">
              Get Started Free <span className="arrow"><ArrowRight width={16} height={16} /></span>
            </Link>
            <Link href="/get-started" className="btn btn-ghost">
              Read the FAQ
            </Link>
          </div>
        </div>

        <div className="disclaimer" style={{ marginTop: 'var(--s6)' }}>
          <AlertTriangle width={20} height={20} style={{ flexShrink: 0, marginTop: 1 }} />
          <p>
            StockSense AI is an educational tool only — not registered with SEBI as an Investment Adviser
            or Research Analyst. Nothing here is investment advice.{' '}
            <Link href="/legal/disclaimer">See our Risk Disclosure.</Link>
          </p>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
