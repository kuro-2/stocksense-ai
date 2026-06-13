'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, Bell, Loader2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import type { SearchResult } from '@/types/stock';

interface AlertItem {
  id: string;
  symbol: string;
  stockName: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export default function AlertsPage() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState('');
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts');
      if (res.status === 401) { setUnauthorized(true); return; }
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAlerts(); }, []);

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !targetPrice) return;
    setAdding(true);
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: selected.symbol,
        stockName: selected.name,
        condition,
        targetPrice: Number(targetPrice),
      }),
    });
    setSelected(null);
    setQuery('');
    setTargetPrice('');
    setAdding(false);
    fetchAlerts();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (unauthorized) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-(--muted)">
        <p className="font-medium mb-2">Please log in to manage price alerts</p>
        <Link href="/login" className="text-emerald font-medium hover:underline">Go to login</Link>
      </div>
    );
  }

  const activeAlerts = items.filter(a => a.isActive);
  const triggeredAlerts = items.filter(a => !a.isActive);

  return (
    <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-6 h-6 text-emerald" />
          <h1 className="font-display text-2xl font-bold text-(--foreground)">Price Alerts</h1>
        </div>
        <p className="text-sm text-(--muted) mb-6">
          Get notified by email when a stock crosses your target price.
        </p>

        <form onSubmit={handleAdd} className="glass-card rounded-xl p-4 mb-6 flex flex-wrap items-end gap-3">
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
            <label className="block text-xs font-medium text-(--muted) mb-1">Condition</label>
            <select
              value={condition} onChange={e => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
              className="border border-(--surface-border) rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-emerald"
            >
              <option value="ABOVE">Goes above</option>
              <option value="BELOW">Goes below</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-1">Target Price (₹)</label>
            <input
              type="number" min={0} step={0.05} value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
              required placeholder="0.00"
              className="border border-(--surface-border) rounded-lg px-3 py-2 text-sm w-32 bg-transparent focus:outline-none focus:border-emerald"
            />
          </div>
          <button
            type="submit" disabled={adding || !selected || !targetPrice}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {adding && <Loader2 className="w-3 h-3 animate-spin" />} <Plus className="w-4 h-4" /> Add Alert
          </button>
        </form>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-(--muted)">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No price alerts yet</p>
            <p className="text-sm mt-1">Add one above to get notified when a stock hits your target</p>
          </div>
        )}

        {!loading && activeAlerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-(--muted) mb-2">Active</h2>
            <div className="glass-card rounded-xl overflow-hidden divide-y divide-(--surface-border)">
              {activeAlerts.map(a => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-semibold text-(--foreground)">{a.symbol}</p>
                    <p className="text-xs text-(--muted)">{a.stockName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="info">
                      {a.condition === 'ABOVE' ? '≥' : '≤'} {formatINR(a.targetPrice)}
                    </Badge>
                    <button
                      onClick={() => handleRemove(a.id)}
                      className="p-1.5 text-(--muted) hover:text-red-500 transition-colors rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && triggeredAlerts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-(--muted) mb-2">Triggered</h2>
            <div className="glass-card rounded-xl overflow-hidden divide-y divide-(--surface-border)">
              {triggeredAlerts.map(a => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3 opacity-70">
                  <div>
                    <p className="font-semibold text-(--foreground)">{a.symbol}</p>
                    <p className="text-xs text-(--muted)">{a.stockName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral">
                      {a.condition === 'ABOVE' ? '≥' : '≤'} {formatINR(a.targetPrice)} — Triggered
                    </Badge>
                    <button
                      onClick={() => handleRemove(a.id)}
                      className="p-1.5 text-(--muted) hover:text-red-500 transition-colors rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
