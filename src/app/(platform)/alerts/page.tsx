'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Bell, Loader2, CheckCircle } from 'lucide-react';
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
  const [toast, setToast] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

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
    showToast(`Alert set for ${selected.symbol}`);
    fetchAlerts();
  }

  async function handleRemove(id: string, symbol: string) {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
    showToast(`Alert for ${symbol} removed`);
  }

  if (unauthorized) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-(--muted)">
        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium mb-2">Please log in to manage your price alerts.</p>
        <Link href="/login" className="text-emerald font-medium hover:underline">Go to login</Link>
      </div>
    );
  }

  const activeAlerts = items.filter(a => a.isActive);
  const triggeredAlerts = items.filter(a => !a.isActive);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-6 h-6 text-emerald" />
        <h1 className="font-display text-2xl font-bold text-(--foreground)">Price Alerts</h1>
      </div>
      <p className="text-sm text-(--muted) mb-6">Get notified by email when a stock crosses your target price.</p>

      {/* Add alert form */}
      <form onSubmit={handleAdd} className="alert-form mb-8">
        <div className="alert-grid">
          {/* Stock search */}
          <div className="field" style={{ position: 'relative' }}>
            <label>Stock</label>
            <input
              type="text"
              value={selected ? `${selected.symbol} — ${selected.name}` : query}
              onChange={e => { setSelected(null); setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for a stock..."
            />
            {searchOpen && results.length > 0 && !selected && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: 'var(--panel)', border: '1px solid var(--line-2)',
                  borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', zIndex: 20,
                  maxHeight: 240, overflowY: 'auto',
                }}
                className="thin-scrollbar"
              >
                {results.map(r => (
                  <button
                    key={`${r.exchange}:${r.symbol}`}
                    type="button"
                    onClick={() => { setSelected(r); setSearchOpen(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '11px 14px',
                      borderBottom: '1px solid var(--line)', background: 'none', cursor: 'pointer',
                      transition: 'background 0.14s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--panel-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14 }}>{r.symbol}</span>
                    <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--ink-mute)' }}>{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Condition */}
          <div className="field">
            <label>Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value as 'ABOVE' | 'BELOW')}>
              <option value="ABOVE">Goes above</option>
              <option value="BELOW">Goes below</option>
            </select>
          </div>

          {/* Target price */}
          <div className="field">
            <label>Target Price (₹)</label>
            <input
              type="number" min={0} step={0.05} value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              required placeholder="0.00"
            />
          </div>

          {/* Submit */}
          <div className="af-add">
            <button
              type="submit"
              disabled={adding || !selected || !targetPrice}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: (adding || !selected || !targetPrice) ? 0.5 : 1 }}
            >
              {adding
                ? <Loader2 width={15} height={15} style={{ animation: 'spin 1s linear infinite' }} />
                : <Plus width={16} height={16} />
              }
              Add Alert
            </button>
          </div>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald" />
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-(--muted)">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No price alerts yet</p>
          <p className="text-sm mt-1">Add one above to get notified when a stock hits your target.</p>
        </div>
      )}

      {/* Active alerts */}
      {!loading && activeAlerts.length > 0 && (
        <div className="mb-8">
          <p className="eyebrow mb-3">Active</p>
          <div className="alerts-list">
            {activeAlerts.map(a => (
              <div key={a.id} className="alert-card">
                <div className="badge-sym">{a.symbol.slice(0, 4)}</div>
                <div>
                  <p className="ac-name">{a.symbol}</p>
                  <p className="ac-cond">{a.stockName} · {a.condition === 'ABOVE' ? 'Price goes above' : 'Price goes below'}</p>
                </div>
                <div className="ac-target">
                  <p className="k">Target</p>
                  <p className="v">{formatINR(a.targetPrice)}</p>
                </div>
                <button onClick={() => handleRemove(a.id, a.symbol)} className="ac-del" title="Remove alert">
                  <Trash2 width={17} height={17} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triggered alerts */}
      {!loading && triggeredAlerts.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Triggered</p>
          <div className="alerts-list">
            {triggeredAlerts.map(a => (
              <div key={a.id} className="alert-card" style={{ opacity: 0.65 }}>
                <div className="badge-sym" style={{ background: 'var(--bg-2)' }}>{a.symbol.slice(0, 4)}</div>
                <div>
                  <p className="ac-name">{a.symbol}</p>
                  <p className="ac-cond">{a.stockName} · {a.condition === 'ABOVE' ? '≥' : '≤'} {formatINR(a.targetPrice)} — Triggered</p>
                </div>
                <div className="ac-target">
                  <p className="k">Target</p>
                  <p className="v">{formatINR(a.targetPrice)}</p>
                </div>
                <button onClick={() => handleRemove(a.id, a.symbol)} className="ac-del" title="Remove alert">
                  <Trash2 width={17} height={17} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>
        <CheckCircle width={17} height={17} />
        {toast}
      </div>
    </div>
  );
}
