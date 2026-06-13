import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Search, Brain, LineChart, TrendingUp, ShieldAlert, Newspaper,
  Activity, Target, AlertTriangle, Sparkles, ArrowRight,
} from 'lucide-react';

export default function HowItWorksPage() {
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
            <span>How It Works</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 text-(--foreground)">
            From a stock name to a clear recommendation
          </h1>
          <p className="text-(--muted) text-lg max-w-2xl mx-auto">
            StockSense AI turns a confusing pile of charts and news into one clear, jargon-free
            recommendation — in under 15 seconds.
          </p>
        </div>
      </section>

      {/* The pipeline */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">The Pipeline</h2>
          <p className="text-(--muted)">We never let the AI guess raw numbers. Hard data first, AI judgement second.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Search,
              title: '1. Live market data',
              desc: 'The moment you search a stock, we pull a live quote and 90 days of price history straight from the market — current price, % change, 52-week range, market cap, P/E.',
            },
            {
              icon: Activity,
              title: '2. Local technical analysis',
              desc: 'RSI(14), SMA(20/50/200), support &amp; resistance, and trend direction are computed locally from real price data — these numbers are never invented by the AI.',
            },
            {
              icon: Brain,
              title: '3. AI reasoning layer',
              desc: 'Gemini AI receives the price, indicators, and sector as structured context, and produces a recommendation, target price, stop loss, F&amp;O idea, risks, and a plain-English summary.',
            },
            {
              icon: LineChart,
              title: '4. One clear result',
              desc: 'Everything is merged into a single page — recommendation card, price chart, technicals, F&amp;O panel, news highlights, and risk warnings.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald to-emerald-light rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-(--foreground) mb-2">{title}</h3>
              <p className="text-sm text-(--muted)" dangerouslySetInnerHTML={{ __html: desc }} />
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="glass-card rounded-2xl p-6 md:p-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">What You Get on Every Analysis</h2>
            <p className="text-(--muted)">A complete picture, broken into clear, scannable panels.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Recommendation', desc: 'Buy/Sell/Hold with confidence, target price, stop loss, and timeframe.' },
              { icon: Activity, title: 'Technical Panel', desc: 'RSI, SMA20/50/200, support &amp; resistance, and trend — bullish, bearish, or neutral.' },
              { icon: Target, title: 'F&O Strategy', desc: 'A plain-language options idea with suggested strike, expiry, and a prominent risk warning.' },
              { icon: Newspaper, title: 'News Highlights', desc: 'Recent headlines relevant to the stock, summarized for context.' },
              { icon: AlertTriangle, title: 'Risk Factors', desc: '3-5 specific risks the AI identified for this stock.' },
              { icon: ShieldAlert, title: 'Disclosure', desc: 'A persistent reminder that this is AI-generated, educational content — not registered investment advice.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl glass-strong p-5">
                <div className="w-10 h-10 bg-emerald-light/15 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-emerald" />
                </div>
                <h3 className="font-display font-semibold text-(--foreground) mb-1">{title}</h3>
                <p className="text-sm text-(--muted)" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclosure box */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm text-amber-700 dark:text-amber-300">
          <p className="font-semibold mb-1">⚠️ Important</p>
          <p>
            StockSense AI is an educational tool only. It is not registered with SEBI as an Investment
            Adviser or Research Analyst. Nothing on this site is investment advice or a recommendation to
            buy, sell, or hold any security. See our{' '}
            <a href="/legal/disclaimer" className="font-semibold underline">Risk Disclosure</a> for details.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-20 text-center">
        <Link
          href="/who-its-for"
          className="inline-flex items-center gap-2 text-sm font-semibold glass-card glass-card-hover text-(--foreground) px-6 py-3 rounded-xl"
        >
          See who StockSense AI is built for <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
