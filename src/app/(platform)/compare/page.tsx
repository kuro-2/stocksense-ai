'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Loader2, GitCompare, Plus, X } from 'lucide-react';
import { formatINR, formatPercent, RECO_CONFIG } from '@/lib/utils';

function getInitialSymbols(raw: string | null): string[] {
  if (!raw) return ['RELIANCE', 'TCS'];
  const parsed = raw.split(',').map(s => s.trim().toUpperCase());
  while (parsed.length < 2) parsed.push('');
  return parsed.slice(0, 4);
}

interface CompareResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  rsi: number;
  sma20: number;
  sma50: number;
  sma200: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sector: string;
  marketCap: 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP';
  week52High: number;
  week52Low: number;
  recommendation: keyof typeof RECO_CONFIG | null;
  confidence: string | null;
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageContent />
    </Suspense>
  );
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const [symbols, setSymbols] = useState<string[]>(() => getInitialSymbols(searchParams.get('symbols')));
  const [results, setResults] = useState<CompareResult[]>([]);
  const [errors, setErrors] = useState<{ symbol: string; error: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  function updateSymbol(index: number, value: string) {
    setSymbols(prev => prev.map((s, i) => (i === index ? value.toUpperCase() : s)));
  }

  function addSymbol() {
    if (symbols.length < 4) setSymbols(prev => [...prev, '']);
  }

  function removeSymbol(index: number) {
    if (symbols.length > 2) setSymbols(prev => prev.filter((_, i) => i !== index));
  }

  async function runCompare() {
    const cleaned = symbols.map(s => s.trim()).filter(Boolean);
    if (cleaned.length < 2) {
      setError('Enter at least 2 symbols to compare');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: cleaned }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setResults(data.results ?? []);
      setErrors(data.errors ?? []);
      setHasRun(true);
    } catch {
      setError('Failed to compare stocks');
    } finally {
      setLoading(false);
    }
  }

  const rows: { label: string; render: (r: CompareResult) => React.ReactNode }[] = [
    { label: 'Price', render: r => <span className="font-mono">{formatINR(r.price)}</span> },
    {
      label: 'Change',
      render: r => (
        <span className={r.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
          {r.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(r.changePercent))}
        </span>
      ),
    },
    { label: 'RSI (14)', render: r => <span className="font-mono">{r.rsi.toFixed(1)}</span> },
    { label: 'SMA 20', render: r => <span className="font-mono">{formatINR(r.sma20)}</span> },
    { label: 'SMA 50', render: r => <span className="font-mono">{formatINR(r.sma50)}</span> },
    { label: 'SMA 200', render: r => <span className="font-mono">{formatINR(r.sma200)}</span> },
    {
      label: 'Trend',
      render: r => (
        <Badge variant={r.trend === 'BULLISH' ? 'success' : r.trend === 'BEARISH' ? 'danger' : 'neutral'}>
          {r.trend}
        </Badge>
      ),
    },
    { label: 'Sector', render: r => <span className="text-(--muted)">{r.sector}</span> },
    { label: 'Market Cap', render: r => <Badge variant="neutral">{r.marketCap.replace('_', ' ')}</Badge> },
    { label: '52W High', render: r => <span className="font-mono">{formatINR(r.week52High)}</span> },
    { label: '52W Low', render: r => <span className="font-mono">{formatINR(r.week52Low)}</span> },
    {
      label: 'Recommendation',
      render: r => {
        const reco = r.recommendation ? RECO_CONFIG[r.recommendation] : null;
        return reco ? (
          <Badge className={`${reco.bgClass} ${reco.textClass} ${reco.borderClass}`}>{reco.label}</Badge>
        ) : (
          <span className="text-(--muted) text-xs">No recent analysis</span>
        );
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <GitCompare className="w-6 h-6 text-emerald" />
        <h1 className="font-display text-2xl font-bold text-(--foreground)">Compare Stocks</h1>
      </div>
      <p className="text-sm text-(--muted) mb-6">
        Compare up to 4 stocks side-by-side across price, technicals, and AI recommendations.
      </p>

      <form
        onSubmit={e => { e.preventDefault(); runCompare(); }}
        className="glass-card rounded-xl p-4 mb-6 flex flex-wrap items-end gap-3"
      >
        {symbols.map((symbol, i) => (
          <div key={i} className="flex items-center gap-1">
            <div>
              <label className="block text-xs font-medium text-(--muted) mb-1">Stock {i + 1}</label>
              <input
                type="text"
                value={symbol}
                onChange={e => updateSymbol(i, e.target.value)}
                placeholder="e.g. RELIANCE"
                className="border border-(--surface-border) rounded-lg px-3 py-2 text-sm w-32 bg-transparent focus:outline-none focus:border-emerald uppercase"
              />
            </div>
            {symbols.length > 2 && (
              <button
                type="button"
                onClick={() => removeSymbol(i)}
                className="p-1.5 mt-5 rounded-lg text-(--muted) hover:text-red-500 hover:bg-(--surface-hover) transition-colors"
                aria-label="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {symbols.length < 4 && (
          <button
            type="button"
            onClick={addSymbol}
            className="flex items-center gap-1 px-3 py-2 mb-0.5 rounded-lg text-sm text-emerald hover:bg-(--surface-hover) transition-colors"
          >
            <Plus className="w-4 h-4" /> Add stock
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />} Compare
        </button>
      </form>

      {error && <div className="text-center py-6 text-red-600">{error}</div>}

      {errors.length > 0 && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          Could not fetch data for: {errors.map(e => e.symbol).join(', ')}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {!loading && hasRun && results.length === 0 && !error && (
        <div className="text-center py-16 text-(--muted)">
          <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No data available for the selected stocks</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Metric</th>
                {results.map(r => (
                  <th key={r.symbol} className="text-left px-4 py-3 font-medium text-slate-500">
                    <Link href={`/analysis/${r.symbol}`} className="hover:text-emerald transition-colors">
                      <p className="font-semibold text-slate-900">{r.symbol}</p>
                      <p className="text-xs text-slate-400 font-normal truncate max-w-[140px]">{r.name}</p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => (
                <tr key={row.label} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-500">{row.label}</td>
                  {results.map(r => (
                    <td key={r.symbol} className="px-4 py-3">{row.render(r)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
