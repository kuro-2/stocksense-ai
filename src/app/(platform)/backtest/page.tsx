'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Loader2, History as HistoryIcon, TrendingDown, TrendingUp, Activity, Check } from 'lucide-react';
import { formatPercent, cn } from '@/lib/utils';
import { StockAutocompleteInput } from '@/components/stock/StockAutocompleteInput';
import type { SearchResult } from '@/types/stock';
import type { BacktestStrategy, BacktestResult } from '@/lib/backtest';

const STRATEGY_OPTIONS: { value: BacktestStrategy; icon: typeof TrendingDown; title: string; description: string }[] = [
  {
    value: 'RSI_REVERSAL',
    icon: TrendingDown,
    title: 'Buy Low, Sell High',
    description: 'Buy when the stock drops a lot (oversold) and sell when it recovers.',
  },
  {
    value: 'SMA_CROSSOVER',
    icon: TrendingUp,
    title: 'Trend Following',
    description: 'Buy when a fast moving average crosses above a slow one (uptrend).',
  },
  {
    value: 'BOLLINGER_BOUNCE',
    icon: Activity,
    title: 'Bounce Trading',
    description: 'Buy when price drops to a normal low band and sell when it bounces back.',
  },
];

const PERIOD_OPTIONS = ['6mo', '1y', '2y'] as const;

export default function BacktestPage() {
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [strategy, setStrategy] = useState<BacktestStrategy>('RSI_REVERSAL');
  const [period, setPeriod] = useState<typeof PERIOD_OPTIONS[number]>('1y');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(BacktestResult & { symbol: string }) | null>(null);

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

        <div className="mb-6">
          <h2 className="text-sm font-medium text-(--muted) mb-3">Pick a strategy to test</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STRATEGY_OPTIONS.map(s => {
              const Icon = s.icon;
              const active = strategy === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStrategy(s.value)}
                  className={cn(
                    'text-left glass-card rounded-xl p-4 border-2 transition-colors',
                    active ? 'border-emerald' : 'border-transparent glass-card-hover'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-emerald" />
                    {active && <Check className="w-4 h-4 text-emerald" />}
                  </div>
                  <p className="font-semibold text-(--foreground) text-sm mb-1">{s.title}</p>
                  <p className="text-xs text-(--muted) leading-relaxed">&quot;{s.description}&quot;</p>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={runBacktest} className="glass-card rounded-xl p-4 mb-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-(--muted) mb-1">Stock</label>
            <StockAutocompleteInput
              selected={selected}
              onSelect={setSelected}
              placeholder="Search stock..."
            />
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
