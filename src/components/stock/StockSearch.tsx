'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import type { SearchResult } from '@/types/stock';

export function StockSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 120);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(symbol: string) {
    setOpen(false);
    setQuery('');
    router.push(`/analysis/${symbol}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && query.trim()) {
      handleSelect(query.trim().toUpperCase());
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <div className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 focus-within:border-emerald/50 transition-colors">
        {loading ? (
          <Loader2 className="w-5 h-5 text-(--muted) animate-spin flex-shrink-0" />
        ) : (
          <Search className="w-5 h-5 text-(--muted) flex-shrink-0" />
        )}
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stock (e.g. HDFC Bank, RELIANCE, TCS...)"
          className="flex-1 outline-none text-base bg-transparent text-(--foreground) placeholder-slate-400"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl shadow-lg z-50 overflow-hidden">
          {results.map(r => (
            <button
              key={`${r.exchange}:${r.symbol}`}
              onClick={() => handleSelect(r.symbol)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-(--surface-hover) text-left transition-colors border-b border-(--surface-border) last:border-0"
            >
              <div>
                <span className="font-semibold text-(--foreground)">{r.symbol}</span>
                <span className="ml-2 text-sm text-(--muted)">{r.name}</span>
              </div>
              <span className="text-xs text-(--muted) bg-(--surface-hover) px-2 py-0.5 rounded">{r.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
