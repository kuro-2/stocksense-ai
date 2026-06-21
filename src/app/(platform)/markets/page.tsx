'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, BarChart3 } from 'lucide-react';
import { formatPercent } from '@/lib/utils';
import { INDICES, SECTOR_INDICES, type MarketSymbol } from '@/lib/markets';
import { Tabs } from '@/components/ui/Tabs';
import { AdvanceDeclineWidget } from '@/components/markets/AdvanceDeclineWidget';
import { SectorHeatmap } from '@/components/markets/SectorHeatmap';
import { MoversTab } from '@/components/markets/MoversTab';
import { MarketWidePcrCard } from '@/components/markets/MarketWidePcrCard';
import { FiiDiiCard } from '@/components/markets/FiiDiiCard';
import { EarningsCalendarCard } from '@/components/markets/EarningsCalendarCard';
import { BulkBlockDealsCard } from '@/components/markets/BulkBlockDealsCard';

interface QuoteData {
  symbol: string;
  currentPrice: number;
  changePercent: number;
  week52High: number;
  week52Low: number;
}

function vixInterpretation(value: number): { label: string; variant: 'success' | 'info' | 'warning' | 'danger' } {
  if (value < 13) return { label: 'Low', variant: 'success' };
  if (value <= 18) return { label: 'Normal', variant: 'info' };
  if (value <= 25) return { label: 'Elevated', variant: 'warning' };
  return { label: 'High', variant: 'danger' };
}

function Range52w({ low, high, current }: { low: number; high: number; current: number }) {
  if (!low || !high || high <= low) return null;
  const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-slate-200 relative overflow-hidden">
        <div className="h-full bg-emerald rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-(--muted) mt-1">
        <span>{low.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        <span>52W Range</span>
        <span>{high.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}

function MarketGrid({ title, items, quotes, loading }: { title: string; items: MarketSymbol[]; quotes: Record<string, QuoteData>; loading: boolean }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-lg font-semibold text-(--foreground) mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => {
          const q = quotes[item.symbol];
          const vix = item.symbol === 'INDIAVIX' && q ? vixInterpretation(q.currentPrice) : null;
          return (
            <Link key={item.symbol} href={`/analysis/${item.symbol}`}>
              <Card className="glass-card glass-card-hover cursor-pointer">
                <p className="text-sm font-semibold text-(--foreground)">{item.name}</p>
                <p className="text-xs text-(--muted) mb-2">{item.symbol}</p>
                {loading && !q ? (
                  <Loader2 className="w-4 h-4 animate-spin text-(--muted)" />
                ) : q ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-(--foreground) font-mono">
                        {q.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                      <span className={`text-sm font-semibold ${q.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {q.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(q.changePercent))}
                      </span>
                    </div>
                    {vix && <Badge variant={vix.variant} className="mt-2">{vix.label}</Badge>}
                    <Range52w low={q.week52Low} high={q.week52High} current={q.currentPrice} />
                  </>
                ) : (
                  <span className="text-sm text-(--muted)">Unavailable</span>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function OverviewTab({ quotes, loading }: { quotes: Record<string, QuoteData>; loading: boolean }) {
  return (
    <div>
      <MarketGrid title="Major Indices" items={INDICES} quotes={quotes} loading={loading} />
      <MarketGrid title="Sector Indices" items={SECTOR_INDICES} quotes={quotes} loading={loading} />
      <AdvanceDeclineWidget />
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold text-(--foreground) mb-3">Sector Heatmap</h2>
        <SectorHeatmap />
      </div>
    </div>
  );
}

function MoversDealsTab() {
  return (
    <div className="space-y-4">
      <MoversTab />
      <FiiDiiCard />
      <EarningsCalendarCard />
      <BulkBlockDealsCard />
    </div>
  );
}

function PcrSentimentTab() {
  return (
    <div className="space-y-4">
      <MarketWidePcrCard />
    </div>
  );
}

export default function MarketsPage() {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = [...INDICES, ...SECTOR_INDICES];
      const results = await Promise.allSettled(
        all.map(async item => {
          const res = await fetch(`/api/stock/${item.symbol}/quote`);
          if (!res.ok) throw new Error('not found');
          const data = await res.json();
          return {
            symbol: item.symbol,
            currentPrice: data.currentPrice,
            changePercent: data.changePercent,
            week52High: data.week52High ?? 0,
            week52Low: data.week52Low ?? 0,
          } as QuoteData;
        })
      );

      const map: Record<string, QuoteData> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[all[i].symbol] = r.value;
      });
      setQuotes(map);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6 text-emerald" />
          <h1 className="font-display text-2xl font-bold text-(--foreground)">Markets</h1>
        </div>
        <p className="text-sm text-(--muted) mb-6">
          Live indices and sector performance. Click any card for a full AI analysis &amp; F&amp;O outlook.
        </p>

        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', content: <OverviewTab quotes={quotes} loading={loading} /> },
            { id: 'movers-deals', label: 'Movers & Deals', content: <MoversDealsTab /> },
            { id: 'pcr-sentiment', label: 'PCR & Sentiment', content: <PcrSentimentTab /> },
          ]}
        />
    </div>
  );
}
