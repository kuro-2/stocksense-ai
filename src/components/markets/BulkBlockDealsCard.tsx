'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Handshake } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface BulkBlockDeal {
  symbol: string;
  clientName: string;
  dealType: string;
  quantity: number;
  price: number;
  date: string;
  dealCategory: 'bulk' | 'block';
}

interface DealsData {
  deals: BulkBlockDeal[];
  error?: string;
}

export function BulkBlockDealsCard() {
  const [data, setData] = useState<DealsData | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/market/deals')
      .then(res => res.json())
      .then(json => { if (active) setData(json); })
      .catch(() => { if (active) setData({ deals: [], error: 'unavailable' }); });
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
        <Handshake className="w-4 h-4 text-emerald" />
        <h3 className="font-semibold text-(--foreground)">Bulk &amp; Block Deals</h3>
      </div>
      {data.deals.length === 0 ? (
        <p className="text-sm text-(--muted) px-4 py-6 text-center">Bulk/block deal data is temporarily unavailable.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-500">Stock</th>
                <th className="text-left px-4 py-2 font-medium text-slate-500">Client</th>
                <th className="text-center px-4 py-2 font-medium text-slate-500">Type</th>
                <th className="text-right px-4 py-2 font-medium text-slate-500">Qty</th>
                <th className="text-right px-4 py-2 font-medium text-slate-500">Price</th>
                <th className="text-center px-4 py-2 font-medium text-slate-500">Category</th>
                <th className="text-right px-4 py-2 font-medium text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.deals.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link href={`/analysis/${d.symbol}`} className="font-semibold text-slate-900 hover:text-emerald transition-colors">{d.symbol}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 truncate max-w-[160px]">{d.clientName}</td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant={d.dealType === 'BUY' ? 'success' : 'danger'}>{d.dealType || '—'}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">{d.quantity.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatINR(d.price)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant="neutral">{d.dealCategory}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right text-(--muted)">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
