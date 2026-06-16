'use client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, UserPlus, Search, LineChart, ChevronDown, AlertTriangle } from 'lucide-react';

const STEPS = [
  { n: '01', icon: UserPlus, title: 'Create a free account', desc: 'Sign up with your email — no credit card, no payment details, ever.' },
  { n: '02', icon: Search, title: 'Search any stock', desc: 'Type any NSE/BSE stock name or symbol into the search bar.' },
  { n: '03', icon: LineChart, title: 'Get your AI analysis', desc: 'See a full breakdown — recommendation, technicals, F&O ideas, and news — in seconds.' },
];

const FAQS = [
  {
    q: 'Is StockSense AI really free?',
    a: 'Yes. Every feature — AI analysis, watchlist, paper portfolio, screener, alerts, and backtesting — is completely free, with no hidden costs or premium tiers.',
  },
  {
    q: 'Do I need a Demat or trading account to use this?',
    a: "No. StockSense AI is an analysis and learning tool — it doesn't place trades. You can use it purely for research, or alongside whatever broker account you already have.",
  },
  {
    q: 'Is this investment advice?',
    a: 'No. StockSense AI is an educational tool only. It is not registered with SEBI as an Investment Adviser or Research Analyst, and nothing it generates is a recommendation to buy, sell, or hold any security. Always do your own research and consult a SEBI-registered adviser before investing.',
  },
  {
    q: 'Which stocks are covered?',
    a: 'StockSense AI covers NSE and BSE listed stocks, including all of the Nifty 50, with live price data and historical charts. You can search by company name or ticker symbol.',
  },
  {
    q: 'How accurate are the AI recommendations?',
    a: "Technical indicators (RSI, moving averages, support & resistance) are computed directly from real market data — they're never invented. The AI then reasons over this data to produce a recommendation, but like any forecast, it can be wrong. Always treat it as one input among many.",
  },
  {
    q: 'Can I practice without risking real money?',
    a: 'Yes — the Paper Portfolio lets you buy and sell with virtual cash, so you can test ideas and track simulated returns with zero financial risk.',
  },
  {
    q: 'How do price alerts work?',
    a: "Set a target price for any stock you're tracking, and StockSense AI will email you the moment the price crosses that level.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span>{q}</span>
        <ChevronDown className="chev" width={20} height={20} />
      </button>
      <div className="faq-a" style={{ maxHeight: open ? 400 : 0 }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero wrap">
        <p className="eyebrow">Get Started</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(40px,6vw,70px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 'var(--s4)' }}>
          Three steps to your<br /><em>first AI analysis</em>
        </h1>
        <p className="lede" style={{ marginTop: 'var(--s5)', maxWidth: '48ch' }}>
          No payment details, no waitlists — just sign up and start exploring.
        </p>
      </section>

      {/* Steps — editorial flow */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">The process</p>
          <h2 className="section-title">How to get going</h2>
        </div>
        <div className="flow">
          {STEPS.map(step => (
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
          <Link href="/signup" className="btn btn-primary">
            Create your free account <span className="arrow"><ArrowRight width={16} height={16} /></span>
          </Link>
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal as="section" className="section wrap" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-sub">Everything you need to know before you start.</p>
        </div>
        <div className="faq" style={{ marginTop: 'var(--s6)' }}>
          {FAQS.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
        </div>
      </Reveal>

      {/* SEBI disclaimer */}
      <section className="wrap" style={{ paddingBottom: 'var(--s6)' }}>
        <div className="disclaimer">
          <AlertTriangle width={20} height={20} style={{ flexShrink: 0, marginTop: 1 }} />
          <p>
            StockSense AI is an educational tool only. It is not registered with SEBI as an Investment
            Adviser or Research Analyst, and nothing on this site constitutes investment advice. Outputs are
            generated by an AI model and may be inaccurate or incomplete. Investments in securities markets
            are subject to market risk — please consult a SEBI-registered investment adviser before investing.{' '}
            <Link href="/legal/disclaimer">See our Risk Disclosure.</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="cta-band">
          <h2>Still have questions?</h2>
          <p>The best way to understand StockSense AI is to try it — sign up and analyze your first stock in seconds.</p>
          <div className="row">
            <Link href="/signup" className="btn btn-primary">
              Get Started Free <span className="arrow"><ArrowRight width={16} height={16} /></span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
