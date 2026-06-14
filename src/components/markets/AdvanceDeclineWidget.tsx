'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Activity } from 'lucide-react';

interface AdvanceDeclineData {
  advances: number;
  declines: number;
  unchanged: number;
}

export function AdvanceDeclineWidget() {
  const [data, setData] = useState<AdvanceDeclineData | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/screener')
      .then(res => res.json())
      .then(json => {
        if (!active) return;
        const results: { changePercent: number }[] = json.results ?? [];
        const advances = results.filter(r => r.changePercent > 0).length;
        const declines = results.filter(r => r.changePercent < 0).length;
        const unchanged = results.length - advances - declines;
        setData({ advances, declines, unchanged });
      })
      .catch(() => { if (active) setData(null); });
    return () => { active = false; };
  }, []);

  if (!data) return null;

  const total = data.advances + data.declines + data.unchanged || 1;
  const advancesPct = (data.advances / total) * 100;
  const declinesPct = (data.declines / total) * 100;
  const unchangedPct = 100 - advancesPct - declinesPct;

  const breadthLabel = data.advances > data.declines ? 'Bullish breadth' : data.declines > data.advances ? 'Bearish breadth' : 'Neutral breadth';

  return (
    <Card>
      <h3 className="font-semibold text-(--foreground) mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Market Breadth (Nifty 50)
      </h3>
      <div className="flex h-3 w-full rounded-full overflow-hidden mb-2">
        {advancesPct > 0 && <div className="bg-green-500" style={{ width: `${advancesPct}%` }} />}
        {unchangedPct > 0 && <div className="bg-slate-300" style={{ width: `${unchangedPct}%` }} />}
        {declinesPct > 0 && <div className="bg-red-500" style={{ width: `${declinesPct}%` }} />}
      </div>
      <p className="text-sm text-(--muted)">
        {data.advances} Advances · {data.unchanged} Unchanged · {data.declines} Declines
        <span className="block text-xs mt-1 font-medium text-(--foreground)">{breadthLabel}</span>
      </p>
    </Card>
  );
}
