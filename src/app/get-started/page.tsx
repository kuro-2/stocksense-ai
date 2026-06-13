import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, UserPlus, Search, LineChart, ChevronDown,
} from 'lucide-react';

const STEPS = [
  { icon: UserPlus, title: '1. Create a free account', desc: 'Sign up with your email — no credit card, no payment details, ever.' },
  { icon: Search, title: '2. Search any stock', desc: 'Type any NSE/BSE stock name or symbol into the search bar.' },
  { icon: LineChart, title: '3. Get your AI analysis', desc: 'See a full breakdown — recommendation, technicals, F&O ideas, and news — in seconds.' },
];

const FAQS = [
  {
    q: 'Is StockSense AI really free?',
    a: 'Yes. Every feature — AI analysis, watchlist, paper portfolio, screener, alerts, and backtesting — is completely free, with no hidden costs or premium tiers.',
  },
  {
    q: 'Do I need a Demat or trading account to use this?',
    a: 'No. StockSense AI is an analysis and learning tool — it doesn\'t place trades. You can use it purely for research, or alongside whatever broker account you already have.',
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
    a: 'Technical indicators (RSI, moving averages, support & resistance) are computed directly from real market data — they\'re never invented. The AI then reasons over this data to produce a recommendation, but like any forecast, it can be wrong. Always treat it as one input among many.',
  },
  {
    q: 'Can I practice without risking real money?',
    a: 'Yes — the Paper Portfolio lets you buy and sell with virtual cash, so you can test ideas and track simulated returns with zero financial risk.',
  },
  {
    q: 'How do price alerts work?',
    a: 'Set a target price for any stock you\'re tracking, and StockSense AI will email you the moment the price crosses that level.',
  },
];

export default function GetStartedPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 80% 0%, rgba(45,212,167,0.16), transparent 45%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center px-4 pt-16 pb-14 md:pt-20 md:pb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full glass-card text-xs font-medium text-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get Started</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 text-(--foreground)">
            You&apos;re three steps away from your first AI analysis
          </h1>
          <p className="text-(--muted) text-lg max-w-2xl mx-auto">
            No payment details, no waitlists — just sign up and start exploring.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card glass-card-hover rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-emerald-light/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-emerald" />
              </div>
              <h3 className="font-display font-semibold text-(--foreground) mb-1">{title}</h3>
              <p className="text-sm text-(--muted)">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald/20 hover:opacity-90 transition-opacity"
          >
            Create your free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">Frequently Asked Questions</h2>
          <p className="text-(--muted)">Everything you need to know before you start.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group glass-card rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between gap-4 cursor-pointer font-display font-semibold text-(--foreground) list-none">
                {q}
                <ChevronDown className="w-4 h-4 text-emerald flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-sm text-(--muted) mt-3 leading-relaxed">{a}</p>
            </details>
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
              Still have questions?
            </h2>
            <p className="text-(--muted) mb-8 max-w-xl mx-auto">
              The best way to understand StockSense AI is to try it — sign up and analyze your first stock in seconds.
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
