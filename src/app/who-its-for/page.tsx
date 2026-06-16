import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/ui/Reveal';
import Link from 'next/link';
import {
  ArrowRight, GraduationCap, Rocket, TrendingUp, BookOpen,
  Check, Brain, Star, Wallet, SlidersHorizontal, FlaskConical, Bell,
} from 'lucide-react';

const PERSONAS = [
  {
    icon: GraduationCap,
    title: 'The Beginner Investor',
    desc: 'You have a Demat account but charts, RSI, and "support & resistance" still feel like a foreign language. StockSense AI explains every term in plain English so you understand the "why," not just the "what."',
    uses: ['AI Recommendations with reasoning', 'How It Works pipeline guide', 'Paper Portfolio to practice risk-free'],
  },
  {
    icon: Rocket,
    title: 'The Active Trader',
    desc: 'You already read charts, but want a faster way to scan opportunities, confirm a setup, or get a quick second opinion on a stock before you act.',
    uses: ['Screener to filter Nifty 50 by RSI & trend', 'F&O strategy ideas', 'Price alerts on breakout levels'],
  },
  {
    icon: TrendingUp,
    title: 'The Long-Term Planner',
    desc: 'You\'re building a portfolio for the long run and want a quick health-check on a stock — fundamentals, trend, and any red flags — before adding it to your basket.',
    uses: ['Watchlist to track candidates', 'Markets overview for sector trends', 'Risk factors on every analysis'],
  },
  {
    icon: BookOpen,
    title: 'The Curious Learner',
    desc: 'You\'re not trading yet — you just want to understand how the market works, what indicators mean, and how professionals think about a stock.',
    uses: ['How It Works pipeline breakdown', 'Backtesting to see strategies in action', 'Live news context for any stock'],
  },
];

const TOOLS = [
  { icon: Brain, label: 'AI Analysis', href: '/analysis' },
  { icon: Star, label: 'Watchlist', href: '/watchlist' },
  { icon: Wallet, label: 'Paper Portfolio', href: '/portfolio' },
  { icon: SlidersHorizontal, label: 'Screener', href: '/screener' },
  { icon: Bell, label: 'Price Alerts', href: '/alerts' },
  { icon: FlaskConical, label: 'Backtesting', href: '/backtest' },
];

export default function WhoItsForPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="section wrap">
        <p className="eyebrow">Who it&apos;s for</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(40px,6vw,70px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 'var(--s4)' }}>
          Built for every kind of<br /><em>Indian investor</em>
        </h1>
        <p className="lede" style={{ marginTop: 'var(--s5)', maxWidth: '52ch' }}>
          Whether you&apos;re placing your first trade or your hundredth, StockSense AI meets you where
          you are — and explains everything along the way.
        </p>
      </section>

      {/* Personas as editorial split rows */}
      {PERSONAS.map((persona, i) => {
        const Icon = persona.icon;
        const flip = i % 2 === 1;
        return (
          <Reveal key={persona.title} as="section" className="section wrap" delay={0.04}>
            <div className="split" style={{ direction: flip ? 'rtl' : 'ltr' }}>
              <div style={{ direction: 'ltr' }}>
                <span className="glyph" style={{ width: 48, height: 48, marginBottom: 'var(--s4)' }}>
                  <Icon width={24} height={24} />
                </span>
                <h2 className="section-title" style={{ marginTop: 'var(--s3)', fontSize: 'clamp(28px,3vw,42px)' }}>{persona.title}</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.65, marginTop: 'var(--s4)', maxWidth: '46ch' }}>{persona.desc}</p>
              </div>
              <div style={{ direction: 'ltr' }} className="checklist">
                {persona.uses.map(item => (
                  <div key={item} className="check">
                    <span className="tick"><Check width={15} height={15} strokeWidth={2.5} /></span>
                    <p><b>{item}</b></p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        );
      })}

      {/* Tool row */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="cta-band" style={{ textAlign: 'left' }}>
          <p className="eyebrow" style={{ textAlign: 'left' }}>The full toolkit</p>
          <h2 style={{ textAlign: 'left', fontSize: 'clamp(26px,3vw,40px)' }}>No matter who you are, every tool is free</h2>
          <p style={{ textAlign: 'left' }}>Pick what&apos;s useful to you today, and grow into the rest.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 'var(--s5)', justifyContent: 'flex-start' }}>
            {TOOLS.map(({ icon: ToolIcon, label, href }) => (
              <Link key={label} href={href} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <ToolIcon width={14} height={14} />
                {label}
              </Link>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'flex-start', marginTop: 'var(--s6)' }}>
            <Link href="/signup" className="btn btn-primary">
              Get Started Free <span className="arrow"><ArrowRight width={16} height={16} /></span>
            </Link>
            <Link href="/get-started" className="btn btn-ghost">Read the FAQ</Link>
          </div>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
