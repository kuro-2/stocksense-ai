'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';
import { Clock, Loader2 } from 'lucide-react';
import { formatINR, formatPercent, RECO_CONFIG } from '@/lib/utils';

interface HistoryItem {
  id: string;
  symbol: string;
  stockName: string;
  sector: string | null;
  recommendation: keyof typeof RECO_CONFIG;
  confidence: string;
  priceAtAnalysis: number;
  changePercent: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  trend: string;
  foStrategy: string;
  generatedAt: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/analysis/history');
        if (res.status === 401) { setUnauthorized(true); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load history');
        setItems(data.items ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
          <p className="font-medium mb-2">Please log in to view your analysis history</p>
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Analysis History{items.length > 0 && <span className="text-slate-400 font-normal text-lg ml-2">({items.length})</span>}
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No analyses yet</p>
            <p className="text-sm mt-1">Run a stock analysis to see it appear here</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Price</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500">Recommendation</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Target / SL</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const reco = RECO_CONFIG[item.recommendation] ?? RECO_CONFIG.HOLD;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{item.symbol}</p>
                        <p className="text-xs text-slate-400">{item.stockName}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-medium text-slate-900">{formatINR(item.priceAtAnalysis)}</p>
                        <p className={`text-xs ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(item.changePercent))}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-semibold ${reco.textClass}`}>{reco.label}</span>
                        <p className="text-xs text-slate-400">{item.confidence} confidence</p>
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        <p className="text-green-700 font-medium">{formatINR(item.targetPrice)}</p>
                        <p className="text-red-600 font-medium">{formatINR(item.stopLoss)}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500">
                        {new Date(item.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <br />
                        {new Date(item.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/analysis/${item.symbol}`}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          Re-analyze
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-4">
            <Badge variant="neutral">Showing your most recent {items.length} analyses</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
