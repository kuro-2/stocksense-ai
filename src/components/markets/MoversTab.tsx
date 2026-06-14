'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatINR, formatPercent } from '@/lib/utils';

interface MoverStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  week52High: number;
  week52Low: number;
  distanceFromHighPercent: number;
  distanceFromLowPercent: number;
}

interface MoversData {
  nearHigh: MoverStock[];
  nearLow: MoverStock[];
  total: number;
  error?: string;
}

function MoverRow({ stock, type }: { stock: MoverStock; type: 'high' | 'low' }) {
  return (
    <Link href={`/analysis/${stock.symbol}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
      <div>
        <p className="font-semibold text-slate-900">{stock.symbol}</p>
        <p className="text-xs text-slate-400 truncate max-w-[160px]">{stock.name}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-slate-900">{formatINR(stock.price)}</p>
        <p className={`text-xs ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercent(stock.changePercent)}
        </p>
      </div>
      <div className="text-right ml-4">
        <p className="text-xs text-(--muted)">
          {type === 'high' ? `${stock.distanceFromHighPercent.toFixed(1)}% from 52W high` : `${stock.distanceFromLowPercent.toFixed(1)}% from 52W low`}
        </p>
      </div>
    </Link>
  );
}

export function MoversTab() {
  const [data, setData] = useState<MoversData | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/market/movers')
      .then(res => res.json())
      .then(json => { if (active) setData(json); })
      .catch(() => { if (active) setData({ nearHigh: [], nearLow: [], total: 0, error: 'Movers data unavailable' }); });
    return () => { active = false; };
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (data.nearHigh.length === 0 && data.nearLow.length === 0) {
    return <p className="text-center py-16 text-(--muted)">No stocks are currently near their 52-week high or low.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-(--surface-border) flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <h3 className="font-semibold text-(--foreground)">Near 52-Week High</h3>
        </div>
        {data.nearHigh.length === 0 ? (
          <p className="text-sm text-(--muted) px-4 py-6 text-center">No stocks near their 52-week high</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.nearHigh.map(s => <MoverRow key={s.symbol} stock={s} type="high" />)}
          </div>
        )}
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-(--surface-border) flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <h3 className="font-semibold text-(--foreground)">Near 52-Week Low</h3>
        </div>
        {data.nearLow.length === 0 ? (
          <p className="text-sm text-(--muted) px-4 py-6 text-center">No stocks near their 52-week low</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.nearLow.map(s => <MoverRow key={s.symbol} stock={s} type="low" />)}
          </div>
        )}
      </Card>
    </div>
  );
}
