import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StockSearch } from '@/components/stock/StockSearch';
import Link from 'next/link';
import { Search, Brain, LineChart, Sparkles, ShieldCheck, Gauge, BarChart3 } from 'lucide-react';

const POPULAR_STOCKS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'BAJFINANCE', 'WIPRO', 'ICICIBANK'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-(--ink) text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 85% 10%, rgba(45,212,167,0.18), transparent 45%), radial-gradient(circle at 10% 90%, rgba(25,185,138,0.12), transparent 40%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center px-4 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-emerald-light">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Claude AI</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-5">
            Analyze any Indian stock<br className="hidden md:block" /> with{' '}
            <span className="brand-gradient-text">AI clarity</span>
          </h1>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            Instant AI-powered buy/sell recommendations, technical analysis, F&amp;O strategies, and news —
            for any NSE/BSE stock, explained in plain English.
          </p>
          <div className="flex justify-center">
            <StockSearch />
          </div>
        </div>
      </section>

      {/* Popular stocks */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-sm font-medium text-slate-500 mb-3">Popular stocks</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map(s => (
            <Link
              key={s}
              href={`/analysis/${s}`}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-emerald hover:text-emerald transition-colors shadow-sm"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--ink) mb-2">How It Works</h2>
          <p className="text-slate-500">From a stock name to a clear recommendation in under 15 seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Search, title: '1. Search', desc: 'Type any NSE/BSE stock name or symbol' },
            { icon: Brain, title: '2. AI Analyzes', desc: 'Claude AI fetches live data, news, and computes technicals' },
            { icon: LineChart, title: '3. Get Insights', desc: 'See a buy/sell recommendation with target and stop loss' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-light/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-emerald" />
              </div>
              <h3 className="font-display font-semibold text-(--ink) mb-1">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/about" className="text-sm font-semibold text-emerald hover:text-emerald-light transition-colors">
            Learn more about how StockSense AI works &rarr;
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-(--ink) mb-2">Built for Indian retail investors</h2>
            <p className="text-slate-500">Everything you need to make sense of the market — in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Technical Analysis', desc: 'RSI, SMA20/50/200, support &amp; resistance, and trend — pre-computed, never hallucinated.' },
              { icon: Gauge, title: 'F&O Strategy Tips', desc: 'Plain-language options ideas with strike, expiry, and clear risk warnings.' },
              { icon: ShieldCheck, title: 'Transparent & Educational', desc: 'Every recommendation comes with reasoning, risks, and a clear AI-generated disclosure.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-6">
                <div className="w-10 h-10 bg-(--ink) rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-light" />
                </div>
                <h3 className="font-display font-semibold text-(--ink) mb-1">{title}</h3>
                <p className="text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
