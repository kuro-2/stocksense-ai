import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown, Minus, HelpCircle, Landmark } from 'lucide-react';
import type { AnalysisResult } from '@/types/stock';

interface MutualFundEstimateCardProps {
  analysis: AnalysisResult;
}

const TREND_CONFIG = {
  increasing: { icon: TrendingUp, color: 'text-green-600' },
  decreasing: { icon: TrendingDown, color: 'text-red-600' },
  stable: { icon: Minus, color: 'text-slate-500' },
  unknown: { icon: HelpCircle, color: 'text-slate-400' },
};

export function MutualFundEstimateCard({ analysis }: MutualFundEstimateCardProps) {
  if (!analysis.mutualFundEstimate) return null;

  const { trendDescription, trendDirection } = analysis.mutualFundEstimate;
  const { icon: TrendIcon, color } = TREND_CONFIG[trendDirection] ?? TREND_CONFIG.unknown;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          Mutual Fund Holdings
        </h3>
        {analysis.mfDataSource === 'AI_ESTIMATE' && (
          <Badge variant="warning">AI Estimate — not live data</Badge>
        )}
      </div>
      <div className="flex items-start gap-2">
        <TrendIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
        <p className="text-sm text-slate-700">{trendDescription}</p>
      </div>
    </Card>
  );
}
