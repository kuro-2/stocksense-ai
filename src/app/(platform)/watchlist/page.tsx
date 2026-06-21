'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, TrendingUp, Loader2 } from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/utils';
import { StockAutocompleteInput } from '@/components/stock/StockAutocompleteInput';
import type { SearchResult } from '@/types/stock';

interface WatchlistItem {
  id: string;
  symbol: string;
  stockName: string;
  currentPrice: number;
  changePercent: number;
  addedAt: string;
  notes?: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  async function fetchWatchlist() {
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist');
      if (res.status === 401) { setUnauthorized(true); return; }
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWatchlist(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStock?.symbol) return;
    setAdding(true);
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: selectedStock.symbol, stockName: selectedStock.name }),
    });
    setSelectedStock(null); setShowAdd(false); setAdding(false);
    fetchWatchlist();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (unauthorized) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-(--muted)">
        <p className="font-medium mb-2">Please log in to view your watchlist</p>
        <Link href="/login" className="text-emerald font-medium hover:underline">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-(--foreground)">
            Watchlist{items.length > 0 && <span className="text-(--muted) font-normal text-lg ml-2">({items.length} stocks)</span>}
          </h1>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-emerald/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="glass-card rounded-xl p-4 mb-4 flex gap-3 flex-wrap items-start">
            <div className="flex-1 min-w-[220px]">
              <StockAutocompleteInput
                selected={selectedStock}
                onSelect={setSelectedStock}
                placeholder="Search stock (e.g. RELIANCE)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              type="submit" disabled={adding || !selectedStock?.symbol}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {adding && <Loader2 className="w-3 h-3 animate-spin" />} Add
            </button>
          </form>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Your watchlist is empty</p>
            <p className="text-sm mt-1">Add stocks to track them here</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Change</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.symbol}</p>
                      <p className="text-xs text-slate-400">{item.stockName}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {item.currentPrice > 0 ? formatINR(item.currentPrice) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.currentPrice > 0 && (
                        <span className={item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(item.changePercent))}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/analysis/${item.symbol}`}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          Analyze
                        </Link>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
