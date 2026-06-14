'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Loader2, CalendarDays } from 'lucide-react';

interface EarningsEntry {
  symbol: string;
  companyName: string;
  date: string;
  purpose: string;
}

interface EarningsData {
  entries: EarningsEntry[];
  error?: string;
}

export function EarningsCalendarCard() {
  const [data, setData] = useState<EarningsData | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/market/earnings')
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
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-(--surface-border) flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-emerald" />
        <h3 className="font-semibold text-(--foreground)">Earnings &amp; Board Meetings</h3>
      </div>
      {data.entries.length === 0 ? (
        <p className="text-sm text-(--muted) px-4 py-6 text-center">Earnings calendar is temporarily unavailable.</p>
      ) : (
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto thin-scrollbar">
          {data.entries.map((e, i) => (
            <Link key={i} href={`/analysis/${e.symbol}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm">
              <div>
                <p className="font-semibold text-slate-900">{e.symbol}</p>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.purpose || e.companyName}</p>
              </div>
              <span className="text-xs text-(--muted)">{e.date}</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
