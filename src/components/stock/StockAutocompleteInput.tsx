'use client';
import { useEffect, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
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

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={selected ? `${selected.symbol} — ${selected.name}` : query}
        onChange={e => { onSelect({ symbol: '', name: '', exchange: '' }); setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className ?? 'w-full border border-(--surface-border) rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-emerald'}
      />
      {open && results.length > 0 && (!selected || !selected.symbol) && (
        <div className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {results.map(r => (
            <button
              key={`${r.exchange}:${r.symbol}`}
              type="button"
              onClick={() => { onSelect(r); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-(--surface-hover) text-sm border-b border-(--surface-border) last:border-0"
            >
              <span className="font-semibold text-(--foreground)">{r.symbol}</span>
              <span className="ml-2 text-(--muted)">{r.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
