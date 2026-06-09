'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Plus, Trash2, TrendingUp, Loader2 } from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/utils';

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
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addSymbol, setAddSymbol] = useState('');
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  async function fetchWatchlist() {
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        headers: { 'x-user-id': 'demo-user' },
      });
      if (res.status === 401) { router.push('/login'); return; }
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
    if (!addSymbol || !addName) return;
    setAdding(true);
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
      body: JSON.stringify({ symbol: addSymbol.toUpperCase(), stockName: addName }),
    });
    setAddSymbol(''); setAddName(''); setShowAdd(false); setAdding(false);
    fetchWatchlist();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/watchlist/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'demo-user' },
    });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Watchlist{items.length > 0 && <span className="text-slate-400 font-normal text-lg ml-2">({items.length} stocks)</span>}
          </h1>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex gap-3 flex-wrap">
            <input
              type="text" value={addSymbol} onChange={e => setAddSymbol(e.target.value)}
              placeholder="Symbol (e.g. RELIANCE)" required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px] focus:outline-none focus:border-blue-400"
            />
            <input
              type="text" value={addName} onChange={e => setAddName(e.target.value)}
              placeholder="Company name" required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit" disabled={adding}
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
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
    </div>
  );
}
