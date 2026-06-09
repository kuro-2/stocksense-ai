import { Card } from '@/components/ui/Card';
import { formatINR } from '@/lib/utils';
import type { AnalysisResult } from '@/types/stock';

interface TechnicalPanelProps {
  analysis: AnalysisResult;
}

export function TechnicalPanel({ analysis }: TechnicalPanelProps) {
  const rsiColor =
    analysis.rsi >= 70 ? 'text-red-600' :
    analysis.rsi <= 30 ? 'text-green-600' :
    'text-amber-600';

  return (
    <Card>
      <h3 className="font-semibold text-slate-900 mb-3">Technical Levels</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500">Support</p>
          <p className="font-semibold text-green-700">{formatINR(analysis.support)}</p>
        </div>
        <div>
          <p className="text-slate-500">Resistance</p>
          <p className="font-semibold text-red-600">{formatINR(analysis.resistance)}</p>
        </div>
        <div>
          <p className="text-slate-500">RSI (14)</p>
          <p className={`font-semibold ${rsiColor}`}>{analysis.rsi}</p>
          <p className="text-xs text-slate-400 mt-0.5">{analysis.rsiInterpretation}</p>
        </div>
        <div>
          <p className="text-slate-500">Trend</p>
          <p className={`font-semibold ${
            analysis.trend === 'BULLISH' ? 'text-green-600' :
            analysis.trend === 'BEARISH' ? 'text-red-600' : 'text-amber-600'
          }`}>{analysis.trend}</p>
        </div>
        <div>
          <p className="text-slate-500">20-Day SMA</p>
          <p className="font-medium text-slate-800">{formatINR(analysis.sma20)}</p>
        </div>
        <div>
          <p className="text-slate-500">50-Day SMA</p>
          <p className="font-medium text-slate-800">{formatINR(analysis.sma50)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-500">200-Day SMA</p>
          <p className="font-medium text-slate-800">
            {formatINR(analysis.sma200)}{' '}
            <span className={`text-xs ${analysis.currentPrice > analysis.sma200 ? 'text-green-600' : 'text-red-600'}`}>
              ({analysis.currentPrice > analysis.sma200 ? 'Price above — bullish' : 'Price below — bearish'})
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}
