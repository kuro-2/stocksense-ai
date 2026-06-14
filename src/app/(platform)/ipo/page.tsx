'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Rocket, Calendar, AlertCircle } from 'lucide-react';

interface IpoEntry {
  symbol: string;
  companyName: string;
  series?: string;
  issueStartDate: string;
  issueEndDate: string;
  issueSize?: string;
  status: string;
}

interface IpoListResponse {
  active: IpoEntry[];
  upcoming: IpoEntry[];
  recent: IpoEntry[];
  error?: string;
}

function IpoCard({ ipo, badgeVariant, badgeLabel }: { ipo: IpoEntry; badgeVariant: 'success' | 'info' | 'neutral'; badgeLabel: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-(--foreground)">{ipo.companyName}</p>
          {ipo.symbol && <p className="text-xs text-(--muted)">{ipo.symbol}</p>}
        </div>
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-(--muted)">
        <Calendar className="w-4 h-4" />
        <span>
          {ipo.issueStartDate || '—'} to {ipo.issueEndDate || '—'}
        </span>
      </div>
      {ipo.issueSize && <p className="text-sm text-(--muted) mt-1">Issue size: {ipo.issueSize}</p>}
    </div>
  );
}

export default function IpoTrackerPage() {
  const [data, setData] = useState<IpoListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ipo')
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({ active: [], upcoming: [], recent: [], error: 'IPO data temporarily unavailable' }))
      .finally(() => setLoading(false));
  }, []);

  const isEmpty = data && data.active.length === 0 && data.upcoming.length === 0 && data.recent.length === 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Rocket className="w-6 h-6 text-emerald" />
        <h1 className="font-display text-2xl font-bold text-(--foreground)">IPO Tracker</h1>
      </div>
      <p className="text-sm text-(--muted) mb-6">
        Track active, upcoming, and recently closed IPOs on the NSE.
      </p>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {!loading && isEmpty && (
        <div className="text-center py-16 text-(--muted)">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">IPO data temporarily unavailable</p>
          <p className="text-sm mt-1">NSE may be blocking automated access right now. Please check back later.</p>
        </div>
      )}

      {!loading && data && !isEmpty && (
        <div className="space-y-8">
          {data.active.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-(--foreground) mb-3">Active IPOs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.active.map(ipo => (
                  <IpoCard key={`${ipo.symbol}-${ipo.companyName}`} ipo={ipo} badgeVariant="success" badgeLabel="Open" />
                ))}
              </div>
            </section>
          )}

          {data.upcoming.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-(--foreground) mb-3">Upcoming IPOs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.upcoming.map(ipo => (
                  <IpoCard key={`${ipo.symbol}-${ipo.companyName}`} ipo={ipo} badgeVariant="info" badgeLabel="Upcoming" />
                ))}
              </div>
            </section>
          )}

          {data.recent.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-(--foreground) mb-3">Recently Closed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recent.map(ipo => (
                  <IpoCard key={`${ipo.symbol}-${ipo.companyName}`} ipo={ipo} badgeVariant="neutral" badgeLabel="Closed" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
