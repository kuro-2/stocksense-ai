import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/ui/Reveal';
import Link from 'next/link';
import {
  Brain, BarChart3, Gauge, Newspaper, Star, Wallet, Globe2,
  SlidersHorizontal, Bell, FlaskConical, ArrowRight,
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
    desc: 'Get a plain-language options idea — suggested strike, expiry, and the reasoning behind it — alongside a prominent risk warning so you understand what you\'re getting into.',
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
  { icon: AlertTriangle, title: 'Risk Factors', desc: '3–5 specific risks the AI identified for this stock, based on its sector and recent news.' },
  { icon: ShieldAlert, title: 'AI Disclosure', desc: 'A persistent reminder that this is AI-generated, educational content — never investment advice.' },
  { icon: BarChart3, title: 'Price Chart', desc: 'An interactive price chart with 90 days of history, so you can see the trend for yourself.' },
];

const PLATFORM_TOOLS = [
  { icon: Star, title: 'Watchlist', href: '/watchlist', desc: 'Save stocks you\'re tracking and see their latest price and recommendation in one list.' },
  { icon: Wallet, title: 'Paper Portfolio', href: '/portfolio', desc: 'Buy and sell with virtual cash to practice strategies risk-free, and track your simulated returns.' },
  { icon: Globe2, title: 'Markets', href: '/markets', desc: 'A live overview of NSE & BSE indices and how each market sector is performing today.' },
  { icon: SlidersHorizontal, title: 'Screener', href: '/screener', desc: 'Filter the Nifty 50 by RSI, trend, and moving averages to quickly find stocks worth a closer look.' },
  { icon: Bell, title: 'Price Alerts', href: '/alerts', desc: 'Set a target price for any stock and get an email the moment it\'s crossed.' },
  { icon: FlaskConical, title: 'Backtesting', href: '/backtest', desc: 'Run a simple strategy against historical data and compare it to a buy-and-hold baseline.' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero wrap">
        <p className="eyebrow">Features</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(40px,6vw,70px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 'var(--s4)' }}>
          Everything you need to<br /><em>invest smarter</em>
        </h1>
        <p className="lede" style={{ marginTop: 'var(--s5)', maxWidth: '52ch' }}>
          From instant AI analysis to portfolio tracking and price alerts — StockSense AI brings every
          tool an Indian retail investor needs into one clean, free platform.
        </p>
      </section>

      {/* Core AI features */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">AI analysis</p>
          <h2 className="section-title">AI-Powered Stock Analysis</h2>
          <p className="section-sub">Search any NSE/BSE stock and get a full breakdown in seconds.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s6)' }}>
          {CORE_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="panel panel-hover" style={{ padding: 'var(--s6)' }}>
              <span className="glyph" style={{ marginBottom: 'var(--s4)', display: 'inline-grid' }}>
                <Icon width={22} height={22} />
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ marginTop: 'var(--s3)', color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Inside an analysis */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">Every analysis page</p>
          <h2 className="section-title">What&apos;s Inside Every Analysis</h2>
          <p className="section-sub">One page, six panels, zero guesswork.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s6)' }}>
          {ANALYSIS_DETAILS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="panel" style={{ padding: 'var(--s5)' }}>
              <span className="glyph" style={{ marginBottom: 'var(--s3)', display: 'inline-grid' }}>
                <Icon width={20} height={20} />
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ marginTop: 'var(--s2)', color: 'var(--ink-soft)', fontSize: 14.5, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--s6)' }}>
          <Link href="/analysis/RELIANCE" className="btn btn-primary">
            See a live example <span className="arrow"><ArrowRight width={16} height={16} /></span>
          </Link>
        </div>
      </Reveal>

      {/* Platform tools */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">The platform</p>
          <h2 className="section-title">A Complete Investing Toolkit</h2>
          <p className="section-sub">Beyond analysis — track, plan, and practice, all in one place.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s6)' }}>
          {PLATFORM_TOOLS.map(({ icon: Icon, title, href, desc }) => (
            <Link key={title} href={href} className="panel panel-hover" style={{ padding: 'var(--s5)', display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start', textDecoration: 'none' }}>
              <span className="glyph" style={{ flexShrink: 0 }}>
                <Icon width={20} height={20} />
              </span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {title}
                  <ArrowRight width={14} height={14} style={{ color: 'var(--accent)', opacity: 0.7 }} />
                </h3>
                <p style={{ marginTop: 'var(--s2)', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="cta-band">
          <h2>Ready to try it on your own watchlist?</h2>
          <p>Create a free account and get instant access to every feature above — no credit card required.</p>
          <div className="row">
            <Link href="/signup" className="btn btn-primary">
              Get Started Free <span className="arrow"><ArrowRight width={16} height={16} /></span>
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost">How it works</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
