import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/ui/Reveal';
import Link from 'next/link';
import {
  Search, Brain, LineChart, TrendingUp, ShieldAlert, Newspaper,
  Activity, Target, AlertTriangle, ArrowRight,
} from 'lucide-react';

const PIPELINE = [
  {
    n: '01',
    icon: Search,
    title: 'Live market data',
    desc: 'The moment you search a stock, we pull a live quote and 90 days of price history straight from the market — current price, % change, 52-week range, market cap, P/E.',
  },
  {
    n: '02',
    icon: Activity,
    title: 'Local technical analysis',
    desc: 'RSI(14), SMA(20/50/200), support & resistance, and trend direction are computed locally from real price data — these numbers are never invented by the AI.',
  },
  {
    n: '03',
    icon: Brain,
    title: 'AI reasoning layer',
    desc: 'Gemini AI receives the price, indicators, and sector as structured context, and produces a recommendation, target price, stop loss, F&O idea, risks, and a plain-English summary.',
  },
  {
    n: '04',
    icon: LineChart,
    title: 'One clear result',
    desc: 'Everything is merged into a single page — recommendation card, price chart, technicals, F&O panel, news highlights, and risk warnings.',
  },
];

const WHAT_YOU_GET = [
  { icon: TrendingUp, title: 'Recommendation', desc: 'Buy/Sell/Hold with confidence, target price, stop loss, and timeframe.' },
  { icon: Activity, title: 'Technical Panel', desc: 'RSI, SMA20/50/200, support & resistance, and trend — bullish, bearish, or neutral.' },
  { icon: Target, title: 'F&O Strategy', desc: 'A plain-language options idea with suggested strike, expiry, and a prominent risk warning.' },
  { icon: Newspaper, title: 'News Highlights', desc: 'Recent headlines relevant to the stock, summarized for context.' },
  { icon: AlertTriangle, title: 'Risk Factors', desc: '3–5 specific risks the AI identified for this stock.' },
  { icon: ShieldAlert, title: 'Disclosure', desc: 'A persistent reminder that this is AI-generated, educational content — not registered investment advice.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="section wrap">
        <p className="eyebrow">How It Works</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(40px,6vw,70px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 'var(--s4)' }}>
          From a stock name to a<br /><em>clear recommendation</em>
        </h1>
        <p className="lede" style={{ marginTop: 'var(--s5)', maxWidth: '52ch' }}>
          StockSense AI turns a confusing pile of charts and news into one clear, jargon-free
          recommendation — in under 15 seconds.
        </p>
      </section>

      {/* The pipeline as editorial flow */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">The pipeline</p>
          <h2 className="section-title">Hard data first, AI judgement second</h2>
          <p className="section-sub">We never let the AI guess raw numbers. Real data in, clear recommendation out.</p>
        </div>
        <div className="flow">
          {PIPELINE.map(step => (
            <div key={step.n} className="flow-item">
              <span className="flow-num">{step.n}</span>
              <div className="flow-body">
                <h3 className="flow-title">{step.title}</h3>
                <p className="flow-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* What you get */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">Every analysis</p>
          <h2 className="section-title">What You Get on Every Analysis</h2>
          <p className="section-sub">A complete picture, broken into clear, scannable panels.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s6)' }}>
          {WHAT_YOU_GET.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="panel" style={{ padding: 'var(--s5)' }}>
              <span className="glyph" style={{ marginBottom: 'var(--s3)', display: 'inline-grid' }}>
                <Icon width={20} height={20} />
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ marginTop: 'var(--s2)', color: 'var(--ink-soft)', fontSize: 14.5, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Disclosure */}
      <section className="wrap" style={{ paddingBottom: 'var(--s8)' }}>
        <div className="disclaimer">
          <span>⚠️</span>
          <p>
            StockSense AI is an educational tool only. It is not registered with SEBI as an Investment
            Adviser or Research Analyst. Nothing on this site is investment advice or a recommendation to
            buy, sell, or hold any security.{' '}
            <Link href="/legal/disclaimer">See our Risk Disclosure for details.</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="cta-band">
          <h2>See who StockSense AI is built for</h2>
          <p>Beginners and experienced traders alike — find out how this tool fits your investing style.</p>
          <div className="row">
            <Link href="/who-its-for" className="btn btn-primary">
              Who it&apos;s for <span className="arrow"><ArrowRight width={16} height={16} /></span>
            </Link>
            <Link href="/signup" className="btn btn-ghost">Get started free</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
