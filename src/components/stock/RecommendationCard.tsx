import { RECO_CONFIG, formatINR, formatPercent } from '@/lib/utils';
import type { AnalysisResult } from '@/types/stock';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  analysis: AnalysisResult;
}

export function RecommendationCard({ analysis }: RecommendationCardProps) {
  const config = RECO_CONFIG[analysis.recommendation];
  const upsidePercent = analysis.currentPrice > 0
    ? ((analysis.targetPrice - analysis.currentPrice) / analysis.currentPrice) * 100
    : 0;
  const downsidePercent = analysis.currentPrice > 0
    ? ((analysis.stopLoss - analysis.currentPrice) / analysis.currentPrice) * 100
    : 0;
  const summaryPreview = analysis.summary.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

  return (
    <div className={cn('rounded-xl border-2 p-5', config.bgClass, config.borderClass)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={cn('text-2xl font-bold', config.textClass)}>{config.label}</span>
          <span className={cn('text-sm font-medium px-2 py-0.5 rounded', config.bgClass, config.textClass)}>
            {analysis.confidence} Confidence
          </span>
        </div>
        <span className={cn('text-sm font-medium px-3 py-1 rounded-full border', config.textClass, config.bgClass, config.borderClass)}>
          {analysis.trend}
        </span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed mb-4">{summaryPreview}</p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Entry Price</p>
          <p className="font-semibold text-slate-900">{formatINR(analysis.currentPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Target Price</p>
          <p className="font-semibold text-green-700">{formatINR(analysis.targetPrice)}</p>
          <p className="text-xs text-green-600">{formatPercent(upsidePercent)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Stop Loss</p>
          <p className="font-semibold text-red-600">{formatINR(analysis.stopLoss)}</p>
          <p className="text-xs text-red-600">{formatPercent(downsidePercent)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Timeframe: <span className="font-medium text-slate-700">{analysis.timeframe}</span></p>
    </div>
  );
}
