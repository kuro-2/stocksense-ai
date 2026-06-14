'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Users } from 'lucide-react';

interface SentimentData {
  totalAnalyses: number;
  bullishPercent: number;
  bearishPercent: number;
  neutralPercent: number;
  sufficientData: boolean;
}

interface CommunitySentimentProps {
  symbol: string;
}

export function CommunitySentiment({ symbol }: CommunitySentimentProps) {
  const [data, setData] = useState<SentimentData | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/analysis/sentiment/${symbol}`)
      .then(res => res.json())
      .then(d => { if (active) setData(d); })
      .catch(() => { if (active) setData(null); });
    return () => { active = false; };
  }, [symbol]);

  if (!data) return null;

  return (
    <Card>
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Community Sentiment
      </h3>
      {!data.sufficientData ? (
        <p className="text-sm text-(--muted)">Not enough community data yet — check back after more investors have analyzed this stock.</p>
      ) : (
        <>
          <div className="flex h-3 w-full rounded-full overflow-hidden mb-2">
            {data.bullishPercent > 0 && <div className="bg-green-500" style={{ width: `${data.bullishPercent}%` }} />}
            {data.neutralPercent > 0 && <div className="bg-slate-300" style={{ width: `${data.neutralPercent}%` }} />}
            {data.bearishPercent > 0 && <div className="bg-red-500" style={{ width: `${data.bearishPercent}%` }} />}
          </div>
          <p className="text-sm text-(--muted)">
            {data.bullishPercent}% Bullish · {data.neutralPercent}% Neutral · {data.bearishPercent}% Bearish
            <span className="block text-xs mt-1">Based on {data.totalAnalyses} analyses in the last 30 days</span>
          </p>
        </>
      )}
    </Card>
  );
}
