'use client';
import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Loader2, History as HistoryIcon } from 'lucide-react';
import { formatPercent } from '@/lib/utils';
import type { SearchResult } from '@/types/stock';
import type { BacktestStrategy, BacktestResult } from '@/lib/backtest';

const STRATEGY_OPTIONS: { value: BacktestStrategy; label: string }[] = [
  { value: 'RSI_REVERSAL', label: 'RSI Reversal (buy oversold, sell overbought)' },
  { value: 'SMA_CROSSOVER', label: 'SMA Crossover (golden/death cross)' },
  { value: 'BOLLINGER_BOUNCE', label: 'Bollinger Band Bounce' },
];

const PERIOD_OPTIONS = ['6mo', '1y', '2y'] as const;

export default function BacktestPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [strategy, setStrategy] = useState<BacktestStrategy>('RSI_REVERSAL');
  const [period, setPeriod] = useState<typeof PERIOD_OPTIONS[number]>('1y');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(BacktestResult & { symbol: string }) | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  async function runBacktest(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selected.symbol, strategy, period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Backtest failed');
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Backtest failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <HistoryIcon className="w-6 h-6 text-emerald" />
          <h1 className="font-display text-2xl font-bold text-(--foreground)">Strategy Backtesting</h1>
        </div>
        <p className="text-sm text-(--muted) mb-6">
          Test simple technical strategies against historical price data and compare against buy-and-hold.
        </p>

        <form onSubmit={runBacktest} className="glass-card rounded-xl p-4 mb-6 flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-(--muted) mb-1">Stock</label>
            <input
              type="text"
              value={selected ? `${selected.symbol} — ${selected.name}` : query}
              onChange={e => { setSelected(null); setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search stock..."
              className="border border-(--surface-border) rounded-lg px-3 py-2 text-sm w-full bg-transparent focus:outline-none focus:border-emerald"
            />
            {searchOpen && results.length > 0 && !selected && (
              <div className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {results.map(r => (
                  <button
                    key={`${r.exchange}:${r.symbol}`}
                    type="button"
                    onClick={() => { setSelected(r); setSearchOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-(--surface-hover) text-sm border-b border-(--surface-border) last:border-0"
                  >
                    <span className="font-semibold text-(--foreground)">{r.symbol}</span>
                    <span className="ml-2 text-(--muted)">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-1">Strategy</label>
            <select
              value={strategy} onChange={e => setStrategy(e.target.value as BacktestStrategy)}
              className="border border-(--surface-border) rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-emerald max-w-xs"
            >
              {STRATEGY_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-1">Period</label>
            <select
              value={period} onChange={e => setPeriod(e.target.value as typeof PERIOD_OPTIONS[number])}
              className="border border-(--surface-border) rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-emerald"
            >
              {PERIOD_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button
            type="submit" disabled={loading || !selected}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />} Run Backtest
          </button>
        </form>

        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="text-center">
                <p className="text-xs text-(--muted) mb-1">Strategy Return</p>
                <p className={`font-bold font-mono ${result.stats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(result.stats.totalReturn)}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-xs text-(--muted) mb-1">Buy & Hold Return</p>
                <p className={`font-bold font-mono ${result.stats.buyHoldReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(result.stats.buyHoldReturn)}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-xs text-(--muted) mb-1">Win Rate</p>
                <p className="font-bold font-mono text-(--foreground)">{result.stats.winRate}%</p>
              </Card>
              <Card className="text-center">
                <p className="text-xs text-(--muted) mb-1">Max Drawdown</p>
                <p className="font-bold font-mono text-red-600">-{result.stats.maxDrawdown}%</p>
              </Card>
            </div>

            <Card>
              <h3 className="font-semibold text-(--foreground) mb-3">Equity Curve ({result.stats.numTrades} trades)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={11} minTickGap={40} />
                    <YAxis fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Strategy" stroke="#3b82f6" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="buyHold" name="Buy & Hold" stroke="#94a3b8" dot={false} strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {result.trades.length > 0 && (
              <Card className="overflow-x-auto">
                <h3 className="font-semibold text-(--foreground) mb-3">Trades</h3>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-(--muted)">Entry</th>
                      <th className="text-left px-3 py-2 font-medium text-(--muted)">Exit</th>
                      <th className="text-right px-3 py-2 font-medium text-(--muted)">Entry Price</th>
                      <th className="text-right px-3 py-2 font-medium text-(--muted)">Exit Price</th>
                      <th className="text-right px-3 py-2 font-medium text-(--muted)">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.trades.map((t, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{t.entryDate}</td>
                        <td className="px-3 py-2">{t.exitDate}</td>
                        <td className="px-3 py-2 text-right font-mono">₹{t.entryPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-mono">₹{t.exitPrice.toFixed(2)}</td>
                        <td className={`px-3 py-2 text-right font-mono ${t.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(t.pnlPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}
    </div>
  );
}
