'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Scale } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface PcrSummary {
  pcr: number;
  maxPain: number;
  underlyingValue: number;
  expiryDate: string;
}

interface PcrData {
  nifty: PcrSummary | null;
  banknifty: PcrSummary | null;
}

function PcrColumn({ title, data }: { title: string; data: PcrSummary | null }) {
  if (!data) {
    return (
      <div>
        <h4 className="font-semibold text-(--foreground) mb-2">{title}</h4>
        <p className="text-sm text-(--muted)">Unavailable</p>
      </div>
    );
  }

  const interpretation = data.pcr > 1 ? 'Put-heavy (bullish bias)' : data.pcr < 1 ? 'Call-heavy (bearish bias)' : 'Balanced';

  return (
    <div>
      <h4 className="font-semibold text-(--foreground) mb-2">{title}</h4>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-(--muted)">Underlying</span><span className="font-mono">{formatINR(data.underlyingValue)}</span></div>
        <div className="flex justify-between"><span className="text-(--muted)">PCR</span><span className="font-mono">{data.pcr}</span></div>
        <div className="flex justify-between"><span className="text-(--muted)">Max Pain</span><span className="font-mono">{formatINR(data.maxPain)}</span></div>
        <div className="flex justify-between"><span className="text-(--muted)">Expiry</span><span>{data.expiryDate}</span></div>
        <Badge variant={data.pcr > 1 ? 'success' : data.pcr < 1 ? 'danger' : 'neutral'} className="mt-1">{interpretation}</Badge>
      </div>
    </div>
  );
}

export function MarketWidePcrCard() {
  const [data, setData] = useState<PcrData | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/market/pcr')
      .then(res => res.json())
      .then(json => { if (active) setData(json); })
      .catch(() => { if (active) setData({ nifty: null, banknifty: null }); });
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

  if (!data.nifty && !data.banknifty) {
    return (
      <Card>
        <h3 className="font-semibold text-(--foreground) mb-2 flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Market-Wide PCR
        </h3>
        <p className="text-sm text-(--muted)">Option chain data is temporarily unavailable.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold text-(--foreground) mb-3 flex items-center gap-2">
        <Scale className="w-4 h-4" />
        Market-Wide PCR &amp; Max Pain
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PcrColumn title="NIFTY" data={data.nifty} />
        <PcrColumn title="BANK NIFTY" data={data.banknifty} />
      </div>
    </Card>
  );
}
