'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, TrendingDown, Minus, SearchX, ArrowRight } from 'lucide-react';
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

const PAGE_SIZE = 10;

const TREND_CONFIG = {
  BULLISH: { icon: TrendingUp, label: 'Bullish', className: 'text-green-600 bg-green-50' },
  BEARISH: { icon: TrendingDown, label: 'Bearish', className: 'text-red-600 bg-red-50' },
  NEUTRAL: { icon: Minus, label: 'Neutral', className: 'text-(--muted) bg-(--surface-hover)' },
};

export default function AnalysisLandingPage() {
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState('');

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
    const q = filter.trim().toUpperCase();
    if (!q) return stocks;
    return stocks.filter(s => s.symbol.toUpperCase().includes(q) || s.name.toUpperCase().includes(q));
  }, [stocks, filter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-(--foreground)">Stock Analysis</h1>
        <p className="text-(--muted) text-sm mt-1">Browse Nifty 50 companies or jump straight to any NSE/BSE stock.</p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <input
          value={filter}
          onChange={e => { setFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}
          placeholder="Filter the list by name or symbol..."
          className="w-full sm:w-72 px-3 py-2 rounded-lg glass-card text-sm outline-none text-(--foreground) placeholder-slate-400"
        />
        {!loading && !error && (
          <span className="text-xs text-(--muted) whitespace-nowrap">
            Showing {visible.length} of {filtered.length}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16 text-(--muted)">
          <p className="font-medium text-red-500">{error}</p>
          <p className="text-sm mt-1">Try refreshing the page, or search for a stock directly above.</p>
        </div>
      )}

      {/* Empty filter result */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-(--muted)">
          <SearchX className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No stocks match &quot;{filter}&quot;</p>
          <p className="text-sm mt-1">Try a different name or symbol, or use the search bar above.</p>
        </div>
      )}

      {/* Card grid */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {visible.map(s => {
              const trend = TREND_CONFIG[s.trend] ?? TREND_CONFIG.NEUTRAL;
              const TrendIcon = trend.icon;
              const up = s.changePercent >= 0;
              return (
                <Link
                  key={s.symbol}
                  href={`/analysis/${s.symbol}`}
                  className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-(--foreground) truncate">{s.symbol}</p>
                      <p className="text-xs text-(--muted) truncate">{s.name}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trend.className}`}>
                      <TrendIcon className="w-3 h-3" />
                      {trend.label}
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-mono text-lg font-semibold text-(--foreground)">{formatINR(s.price)}</p>
                      <p className={`text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
                        {up ? '▲' : '▼'} {formatPercent(Math.abs(s.changePercent))}
                      </p>
                    </div>
                    <span className="text-xs text-(--muted)">RSI {s.rsi.toFixed(0)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-(--surface-border)">
                    <span className="text-xs text-(--muted) truncate">{s.sector}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      Analyze <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="px-5 py-2.5 rounded-xl glass-card glass-card-hover text-sm font-medium text-(--foreground) hover:text-emerald transition-colors"
              >
                Load more companies
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
