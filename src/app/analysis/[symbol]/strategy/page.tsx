'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { FnOStrategyBuilder } from '@/components/stock/FnOStrategyBuilder';

export default function StrategyBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = String(params.symbol).toUpperCase();

  const [spot, setSpot] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/stock/${symbol}/quote`);
        if (!res.ok) throw new Error('Failed to load quote');
        const data = await res.json();
        setSpot(data.currentPrice);
      } catch {
        setError('Could not load the current price for this symbol.');
      } finally {
        setLoading(false);
      }
    })();
  }, [symbol]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 text-red-600">{error}</div>
        )}

        {!loading && spot !== null && (
          <FnOStrategyBuilder symbol={symbol} spot={spot} />
        )}
      </div>
    </div>
  );
}
