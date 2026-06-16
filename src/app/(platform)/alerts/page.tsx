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
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--s9) var(--s4)', textAlign: 'center' }}>
        <div className="empty">
          <div className="e-ic"><Bell width={30} height={30} /></div>
          <h3>Login required</h3>
          <p>Please log in to manage your price alerts.</p>
          <div style={{ marginTop: 'var(--s5)' }}>
            <Link href="/login" className="btn btn-primary">Go to login</Link>
          </div>
        </div>
      </div>
    );
  }

  const activeAlerts = items.filter(a => a.isActive);
  const triggeredAlerts = items.filter(a => !a.isActive);

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Page header */}
      <div className="view-head" style={{ marginBottom: 'var(--s6)' }}>
        <div>
          <div className="view-title">
            <span className="ic"><Bell width={21} height={21} /></span>
            <h1>Price Alerts</h1>
          </div>
          <p className="view-sub">Get notified by email when a stock crosses your target price.</p>
        </div>
      </div>

      {/* Add alert form */}
      <form onSubmit={handleAdd} className="alert-form" style={{ marginBottom: 'var(--s6)' }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s8) 0' }}>
          <Loader2 width={28} height={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="empty">
          <div className="e-ic"><Bell width={30} height={30} /></div>
          <h3>No price alerts yet</h3>
          <p>Add one above to get notified when a stock hits your target.</p>
        </div>
      )}

      {/* Active alerts */}
      {!loading && activeAlerts.length > 0 && (
        <div style={{ marginBottom: 'var(--s6)' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>Active</p>
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
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>Triggered</p>
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
