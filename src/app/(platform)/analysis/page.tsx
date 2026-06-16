'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, TrendingUp, TrendingDown, Minus, Flame, ArrowRight, Search } from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/utils';

interface ScreenerStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  rsi: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sector: string;
}

const POPULAR = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'BAJFINANCE', 'WIPRO', 'ICICIBANK', 'LT', 'AXISBANK'];
const PAGE_SIZE = 12;

export default function AnalysisLandingPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/screener');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load stocks');
        setStocks(data.results ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stocks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return stocks;
    return stocks.filter(s => s.symbol.toUpperCase().includes(q) || s.name.toUpperCase().includes(q));
  }, [stocks, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/analysis/${query.trim().toUpperCase()}`);
  }

  return (
    <div style={{ maxWidth: 900 }} className="mx-auto">
      {/* Editorial hero */}
      <section className="an-hero">
        <h2>
          Read the market,<br /><em>stock by stock</em>
        </h2>
        <p className="an-sub">
          Search any NSE/BSE stock for an instant AI recommendation, technical breakdown, and F&amp;O ideas.
        </p>

        <div className="an-search-wrap">
          <form onSubmit={handleSearch}>
            <div className="an-search">
              <Search width={19} height={19} style={{ flexShrink: 0 }} />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="Search by name or symbol — e.g. RELIANCE, TCS..."
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 14, flexShrink: 0 }}>
                Analyze <span className="arrow"><ArrowRight width={15} height={15} /></span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular chips */}
      <div className="popular">
        <p className="lbl">
          <Flame width={18} height={18} />
          Popular stocks
        </p>
        <div className="grid">
          {POPULAR.map(s => (
            <Link key={s} href={`/analysis/${s}`} className="chip">{s}</Link>
          ))}
        </div>
      </div>

      {/* Nifty 50 grid */}
      <div className="recent">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>
            {query ? `Results for "${query}"` : 'Nifty 50'}
          </p>
          {!loading && !error && (
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              {visible.length} of {filtered.length}
            </span>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s9) 0' }}>
            <Loader2 width={30} height={30} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: 'var(--s8) 0', color: 'var(--ink-soft)' }}>
            <p style={{ color: 'var(--down)' }}>{error}</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Try refreshing the page or search for a stock directly above.</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty" style={{ marginTop: 'var(--s6)' }}>
            <div className="e-ic">
              <Minus width={30} height={30} />
            </div>
            <h3>No stocks match &ldquo;{query}&rdquo;</h3>
            <p>Try a different name or symbol, or search directly above.</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <>
            <div className="row">
              {visible.map(s => {
                const up = s.changePercent >= 0;
                const TrendIcon = s.trend === 'BULLISH' ? TrendingUp : s.trend === 'BEARISH' ? TrendingDown : Minus;
                const verdictClass = s.trend === 'BULLISH' ? 'vp-buy' : s.trend === 'BEARISH' ? 'vp-sell' : 'vp-hold';
                const verdictLabel = s.trend === 'BULLISH' ? 'Bullish' : s.trend === 'BEARISH' ? 'Bearish' : 'Neutral';
                return (
                  <Link key={s.symbol} href={`/analysis/${s.symbol}`} className="recent-card" style={{ textDecoration: 'none' }}>
                    <div className="t">
                      <span className="sym">{s.symbol}</span>
                      <span className={`verdict-pill ${verdictClass}`}>{verdictLabel}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{s.name}</p>
                    <p className="price">{formatINR(s.price)}</p>
                    <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={up ? 'up' : 'down'} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <TrendIcon width={11} height={11} />
                        {formatPercent(Math.abs(s.changePercent))}
                      </span>
                      <span>RSI {s.rsi.toFixed(0)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--s6)' }}>
                <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="btn btn-ghost">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
