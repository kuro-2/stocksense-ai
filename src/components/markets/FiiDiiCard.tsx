'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2, Landmark } from 'lucide-react';
import { formatINRCompact } from '@/lib/utils';

interface FiiDiiEntry {
  category: string;
  date: string;
  buyValue: number;
  sellValue: number;
  netValue: number;
}

interface FiiDiiData {
  entries: FiiDiiEntry[];
  error?: string;
}

export function FiiDiiCard() {
  const [data, setData] = useState<FiiDiiData | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/market/fii-dii')
      .then(res => res.json())
      .then(json => { if (active) setData(json); })
      .catch(() => { if (active) setData({ entries: [], error: 'unavailable' }); });
    return () => { active = false; };
  }, []);

  if (!data) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold text-(--foreground) mb-3 flex items-center gap-2">
        <Landmark className="w-4 h-4" />
        FII / DII Activity
      </h3>
      {data.entries.length === 0 ? (
        <p className="text-sm text-(--muted)">FII/DII activity data is temporarily unavailable.</p>
      ) : (
        <div className="space-y-2">
          {data.entries.map((e, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0">
              <span className="font-medium text-(--foreground)">{e.category}{e.date ? ` (${e.date})` : ''}</span>
              <div className="flex gap-4 text-right">
                <span className="text-(--muted)">Buy: {formatINRCompact(e.buyValue)}</span>
                <span className="text-(--muted)">Sell: {formatINRCompact(e.sellValue)}</span>
                <span className={`font-semibold ${e.netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Net: {formatINRCompact(e.netValue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
