import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, GraduationCap, Rocket, TrendingUp, BookOpen,
  CheckCircle2, Star, Wallet, SlidersHorizontal, FlaskConical, Brain, Bell,
} from 'lucide-react';

const PERSONAS = [
  {
    icon: GraduationCap,
    title: 'The Beginner Investor',
    desc: 'You have a Demat account but charts, RSI, and "support & resistance" still feel like a foreign language. StockSense AI explains every term in plain English so you understand the "why," not just the "what."',
    uses: ['AI Recommendations with reasoning', 'How It Works guide', 'Paper Portfolio to practice risk-free'],
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
    desc: 'You’re building a portfolio for the long run and want a quick health-check on a stock — fundamentals, trend, and any red flags — before adding it to your basket.',
    uses: ['Watchlist to track candidates', 'Markets overview for sector trends', 'Risk factors on every analysis'],
  },
  {
    icon: BookOpen,
    title: 'The Curious Learner',
    desc: 'You’re not trading yet — you just want to understand how the market works, what indicators mean, and how professionals think about a stock.',
    uses: ['How It Works pipeline breakdown', 'Backtesting to see strategies in action', 'Live news context for any stock'],
  },
];

const TOOL_MAP = [
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
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 10% 0%, rgba(45,212,167,0.16), transparent 45%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center px-4 pt-16 pb-14 md:pt-20 md:pb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full glass-card text-xs font-medium text-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Who It&apos;s For</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 text-(--foreground)">
            Built for every kind of Indian investor
          </h1>
          <p className="text-(--muted) text-lg max-w-2xl mx-auto">
            Whether you&apos;re placing your first trade or your hundredth, StockSense AI meets you where
            you are — and explains everything along the way.
          </p>
        </div>
      </section>

      {/* Personas */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PERSONAS.map(({ icon: Icon, title, desc, uses }) => (
            <div key={title} className="glass-card glass-card-hover rounded-2xl p-6 md:p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald to-emerald-light rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-bold text-(--foreground) mb-2">{title}</h3>
              <p className="text-sm text-(--muted) mb-4">{desc}</p>
              <ul className="space-y-2">
                {uses.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-(--foreground)">
                    <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tool map */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="glass-card rounded-2xl p-6 md:p-10 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-(--foreground) mb-2">No matter who you are, the toolkit is the same</h2>
          <p className="text-(--muted) mb-8 max-w-2xl mx-auto">
            Every account gets full access to every tool — pick what&apos;s useful to you today, and grow into the rest.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TOOL_MAP.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-2 glass-strong glass-card-hover rounded-xl px-4 py-2.5 text-sm font-medium text-(--foreground)"
              >
                <Icon className="w-4 h-4 text-emerald" />
                {label}
              </Link>
            ))}
          </div>
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
              Find out where you fit — for free
            </h2>
            <p className="text-(--muted) mb-8 max-w-xl mx-auto">
              Create an account in seconds and explore the full platform. No payment details, ever.
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
