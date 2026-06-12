'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Filter, SearchX } from 'lucide-react';
import { formatINR, formatPercent, RECO_CONFIG } from '@/lib/utils';

interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  rsi: number;
  rsiInterpretation: string;
  sma20: number;
  sma50: number;
  sma200: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sector: string;
  recommendation: keyof typeof RECO_CONFIG | null;
  confidence: string | null;
}

const TREND_OPTIONS = ['ANY', 'BULLISH', 'BEARISH', 'NEUTRAL'] as const;

export default function ScreenerPage() {
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rsiMin, setRsiMin] = useState('');
  const [rsiMax, setRsiMax] = useState('');
  const [trend, setTrend] = useState<typeof TREND_OPTIONS[number]>('ANY');
  const [aboveSma200, setAboveSma200] = useState(false);

  async function runScreener() {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (rsiMin !== '') body.rsiMin = Number(rsiMin);
      if (rsiMax !== '') body.rsiMax = Number(rsiMax);
      if (trend !== 'ANY') body.trend = trend;
      if (aboveSma200) body.aboveSma200 = true;

      const res = await fetch('/api/screener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Failed to run screener');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runScreener(); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Stock Screener</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Filter the Nifty 50 universe by technical indicators (RSI, trend, SMA position).
        </p>

        <form
          onSubmit={e => { e.preventDefault(); runScreener(); }}
          className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">RSI Min</label>
            <input
              type="number" min={0} max={100} value={rsiMin} onChange={e => setRsiMin(e.target.value)}
              placeholder="0" className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">RSI Max</label>
            <input
              type="number" min={0} max={100} value={rsiMax} onChange={e => setRsiMax(e.target.value)}
              placeholder="100" className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Trend</label>
            <select
              value={trend} onChange={e => setTrend(e.target.value as typeof TREND_OPTIONS[number])}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              {TREND_OPTIONS.map(t => <option key={t} value={t}>{t === 'ANY' ? 'Any' : t}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 pb-2">
            <input type="checkbox" checked={aboveSma200} onChange={e => setAboveSma200(e.target.checked)} className="rounded" />
            Above 200-day SMA
          </label>
          <button
            type="submit" disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />} Run Screener
          </button>
        </form>

        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="text-sm text-slate-500 mb-3">
              {results.length} of {total} stocks match your filters
            </p>

            {results.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <SearchX className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No stocks match these filters</p>
                <p className="text-sm mt-1">Try widening the RSI range or removing filters</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Stock</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">Price</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">Change</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">RSI</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-500">Trend</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map(r => {
                      const reco = r.recommendation ? RECO_CONFIG[r.recommendation] : null;
                      return (
                        <tr key={r.symbol} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{r.symbol}</p>
                            <p className="text-xs text-slate-400">{r.name}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900 font-mono">
                            {formatINR(r.price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={r.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {r.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(r.changePercent))}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700">{r.rsi.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={r.trend === 'BULLISH' ? 'success' : r.trend === 'BEARISH' ? 'danger' : 'neutral'}>
                              {r.trend}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {reco ? (
                              <Badge className={`${reco.bgClass} ${reco.textClass} ${reco.borderClass}`}>{reco.label}</Badge>
                            ) : (
                              <Link
                                href={`/analysis/${r.symbol}`}
                                className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                              >
                                Analyze
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
