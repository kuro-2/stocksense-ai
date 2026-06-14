'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { formatPercent } from '@/lib/utils';

interface HeatmapStock {
  symbol: string;
  changePercent: number;
  sector: string;
}

function tileColor(changePercent: number): string {
  if (changePercent >= 2) return 'bg-green-600 text-white';
  if (changePercent >= 1) return 'bg-green-500 text-white';
  if (changePercent > 0) return 'bg-green-200 text-green-900';
  if (changePercent === 0) return 'bg-slate-200 text-slate-700';
  if (changePercent > -1) return 'bg-red-200 text-red-900';
  if (changePercent > -2) return 'bg-red-500 text-white';
  return 'bg-red-600 text-white';
}

export function SectorHeatmap() {
  const [stocks, setStocks] = useState<HeatmapStock[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/screener')
      .then(res => res.json())
      .then(json => { if (active) setStocks(json.results ?? []); })
      .catch(() => { if (active) setStocks([]); });
    return () => { active = false; };
  }, []);

  if (stocks === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const bySector = new Map<string, HeatmapStock[]>();
  for (const s of stocks) {
    const list = bySector.get(s.sector) ?? [];
    list.push(s);
    bySector.set(s.sector, list);
  }

  const sectors = Array.from(bySector.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  if (sectors.length === 0) {
    return <p className="text-center py-16 text-(--muted)">Heatmap data unavailable</p>;
  }

  return (
    <div className="space-y-6">
      {sectors.map(([sector, items]) => (
        <div key={sector}>
          <h3 className="font-display text-sm font-semibold text-(--foreground) mb-2">{sector}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {items.map(s => (
              <Link
                key={s.symbol}
                href={`/analysis/${s.symbol}`}
                className={`rounded-lg p-3 text-center transition-transform hover:scale-105 ${tileColor(s.changePercent)}`}
              >
                <p className="text-xs font-semibold">{s.symbol}</p>
                <p className="text-sm font-bold">{formatPercent(s.changePercent)}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
