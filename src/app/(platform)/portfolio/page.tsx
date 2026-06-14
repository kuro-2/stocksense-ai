'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2, TrendingUp, PieChart } from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/utils';
import { SectorAllocationChart } from '@/components/portfolio/SectorAllocationChart';
import type { PortfolioSummary, TradeInput } from '@/types/portfolio';

export default function PortfolioPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<TradeInput>({
    symbol: '', stockName: '', tradeType: 'BUY', instrumentType: 'EQUITY', quantity: 1, price: 0,
  });

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio/summary');
      if (res.status === 401) { setUnauthorized(true); return; }
      if (!res.ok) return;
      const data = await res.json();
      setSummary(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSummary(); }, []);

  async function handleTrade(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTradeError(null);
    setTradeSuccess(null);
    const res = await fetch('/api/portfolio/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setTradeError(data.error ?? 'Trade failed');
    } else {
      setTradeSuccess(`${form.tradeType} order executed! Cash remaining: ${formatINR(data.cashRemaining)}`);
      setShowTradeForm(false);
      fetchSummary();
    }
    setSubmitting(false);
  }

  const pnlColor = (v: number) => v >= 0 ? 'text-green-600' : 'text-red-600';

  if (unauthorized) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-(--muted)">
        <p className="font-medium mb-2">Please log in to view your portfolio</p>
        <Link href="/login" className="text-emerald font-medium hover:underline">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-(--foreground)">Paper Portfolio</h1>
          <button
            onClick={() => setShowTradeForm(v => !v)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-emerald/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> New Trade
          </button>
        </div>

        {tradeSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{tradeSuccess}</div>
        )}

        {/* Trade form */}
        {showTradeForm && (
          <form onSubmit={handleTrade} className="glass-card rounded-xl p-5 mb-5">
            <h3 className="font-semibold text-(--foreground) mb-4">Execute Paper Trade</h3>
            {tradeError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{tradeError}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Symbol</label>
                <input type="text" required value={form.symbol}
                  onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="RELIANCE"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Company Name</label>
                <input type="text" required value={form.stockName}
                  onChange={e => setForm(f => ({ ...f, stockName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Reliance Industries"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Trade Type</label>
                <select value={form.tradeType}
                  onChange={e => setForm(f => ({ ...f, tradeType: e.target.value as 'BUY' | 'SELL' }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                <input type="number" min={1} required value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
                <input type="number" min={0.01} step={0.01} required value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Enter price per share"
                />
              </div>
            </div>
            {form.quantity > 0 && form.price > 0 && (
              <p className="text-sm text-slate-500 mt-2">
                Total value: <span className="font-semibold text-slate-900">{formatINR(form.quantity * form.price)}</span>
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={submitting}
                className="bg-gradient-to-r from-emerald to-emerald-light text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-opacity"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Execute Trade
              </button>
              <button type="button" onClick={() => setShowTradeForm(false)}
                className="px-5 py-2 rounded-lg text-sm text-(--muted) glass-card glass-card-hover"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Virtual Cash', value: formatINR(summary.virtualCash), color: 'text-(--foreground)' },
                { label: 'Total Value', value: formatINR(summary.virtualCash + summary.currentValue), color: 'text-(--foreground)' },
                { label: 'Total P&L', value: `${summary.totalPnL >= 0 ? '+' : ''}${formatINR(summary.totalPnL)}`, sub: formatPercent(summary.totalPnLPercent), color: pnlColor(summary.totalPnL) },
                { label: 'Open Positions', value: String(summary.positions.length), color: 'text-(--foreground)' },
              ].map(card => (
                <div key={card.label} className="glass-card rounded-xl p-4">
                  <p className="text-xs text-(--muted) mb-1">{card.label}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                  {card.sub && <p className={`text-xs ${card.color}`}>{card.sub}</p>}
                </div>
              ))}
            </div>

            {/* Positions */}
            {summary.positions.length > 0 ? (
              <div className="glass-card rounded-xl overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-(--surface-border)">
                  <h3 className="font-semibold text-(--foreground)">Open Positions</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Stock</th>
                      <th className="text-right px-4 py-2.5 font-medium text-slate-500">Qty</th>
                      <th className="text-right px-4 py-2.5 font-medium text-slate-500">Avg Cost</th>
                      <th className="text-right px-4 py-2.5 font-medium text-slate-500">LTP</th>
                      <th className="text-right px-4 py-2.5 font-medium text-slate-500">P&L</th>
                      <th className="text-right px-4 py-2.5 font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.positions.map(pos => (
                      <tr key={pos.symbol} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{pos.symbol}</p>
                          <p className="text-xs text-slate-400">{pos.stockName}</p>
                        </td>
                        <td className="px-4 py-3 text-right">{pos.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatINR(pos.averageCost)}</td>
                        <td className="px-4 py-3 text-right">{formatINR(pos.currentPrice)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${pnlColor(pos.unrealizedPnL)}`}>
                          {pos.unrealizedPnL >= 0 ? '+' : ''}{formatINR(pos.unrealizedPnL)}
                          <span className="block text-xs">{formatPercent(pos.unrealizedPnLPercent)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/analysis/${pos.symbol}`}
                            className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                          >
                            Analyze
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-(--muted)">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No open positions</p>
                <p className="text-sm mt-1">Execute a paper trade to get started. You have {formatINR(summary.virtualCash)} virtual cash.</p>
              </div>
            )}

            {/* Portfolio Analytics */}
            <div className="glass-card rounded-xl p-4 mb-5">
              <h3 className="font-semibold text-(--foreground) mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald" />
                Portfolio Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectorAllocationChart sectorAllocation={summary.sectorAllocation} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 content-start">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">Total Realized P&amp;L</p>
                    <p className={`text-lg font-bold ${pnlColor(summary.totalRealizedPnL)}`}>
                      {summary.totalRealizedPnL >= 0 ? '+' : ''}{formatINR(summary.totalRealizedPnL)}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">Win Rate</p>
                    <p className="text-lg font-bold text-(--foreground)">
                      {summary.winRate === null ? 'N/A' : `${summary.winRate.toFixed(0)}%`}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">Closed Trades</p>
                    <p className="text-lg font-bold text-(--foreground)">{summary.totalSellTrades}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <p className="text-xs text-(--muted) text-center mt-6">
          ⚠️ This is a paper trading simulator. No real money is involved.
        </p>
    </div>
  );
}
