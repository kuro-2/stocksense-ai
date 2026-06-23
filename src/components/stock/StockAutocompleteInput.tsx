'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/types/stock';

interface StockAutocompleteInputProps {
  selected: SearchResult | null;
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function StockAutocompleteInput({ selected, onSelect, placeholder = 'Search stock...', className }: StockAutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 120);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const showDropdown = open && (!selected || !selected.symbol) && query.length >= 2;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={selected?.symbol ? `${selected.symbol} — ${selected.name}` : query}
          onChange={e => { onSelect({ symbol: '', name: '', exchange: '' }); setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn(
            className ?? 'w-full border border-(--surface-border) rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-emerald',
            'pr-8'
          )}
        />
        {loading && (!selected || !selected.symbol) && (
          <Loader2 className="w-4 h-4 animate-spin text-(--muted) absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map(r => (
              <button
                key={`${r.exchange}:${r.symbol}`}
                type="button"
                onClick={() => { onSelect(r); setQuery(''); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-(--surface-hover) text-sm border-b border-(--surface-border) last:border-0"
              >
                <span className="font-semibold text-(--foreground)">{r.symbol}</span>
                <span className="ml-2 text-(--muted)">{r.name}</span>
              </button>
            ))
          ) : !loading ? (
            <div className="px-3 py-2 text-sm text-(--muted)">No stocks found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
