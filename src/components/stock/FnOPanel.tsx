import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { AnalysisResult } from '@/types/stock';

interface FnOPanelProps {
  analysis: AnalysisResult;
}

const FO_STRATEGY_LABELS: Record<string, string> = {
  BUY_CALL: 'Buy Call Option',
  BUY_PUT: 'Buy Put Option',
  SELL_CALL: 'Sell Call Option (Covered)',
  SELL_PUT: 'Sell Put Option',
  AVOID_FO: 'Avoid F&O — Too Risky',
};

export function FnOPanel({ analysis }: FnOPanelProps) {
  const hasMarketData = analysis.indiaVix != null || analysis.pcr != null || analysis.maxPain != null || analysis.atmIV != null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-semibold text-slate-900">F&O Strategy</h3>
        {analysis.foDataSource === 'NSE_LIVE' && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live NSE option chain
          </span>
        )}
      </div>
      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>F&O trading carries very high risk. You can lose your entire investment. Only trade F&O if you fully understand the risks and can afford to lose the money.</p>
      </div>

      {hasMarketData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {analysis.indiaVix != null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-[11px] text-slate-500">India VIX</p>
              <p className="text-sm font-semibold text-slate-900">{analysis.indiaVix}</p>
            </div>
          )}
          {analysis.atmIV != null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-[11px] text-slate-500">ATM IV</p>
              <p className="text-sm font-semibold text-slate-900">{analysis.atmIV}%</p>
            </div>
          )}
          {analysis.pcr != null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-[11px] text-slate-500">PCR</p>
              <p className="text-sm font-semibold text-slate-900">{analysis.pcr}</p>
            </div>
          )}
          {analysis.maxPain != null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-[11px] text-slate-500">Max Pain</p>
              <p className="text-sm font-semibold text-slate-900">₹{analysis.maxPain}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Strategy:</span>
          <span className={`text-sm font-semibold ${analysis.foStrategy === 'AVOID_FO' ? 'text-red-600' : 'text-blue-700'}`}>
            {FO_STRATEGY_LABELS[analysis.foStrategy] ?? analysis.foStrategy}
          </span>
        </div>
        {analysis.foStrategy !== 'AVOID_FO' && (
          <>
            {analysis.foStrike && (
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500">Strike:</span>
                <span className="font-medium">₹{analysis.foStrike}</span>
              </div>
            )}
            {analysis.foExpiry && (
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500">Expiry:</span>
                <span className="font-medium">{analysis.foExpiry}</span>
              </div>
            )}
          </>
        )}
        {analysis.foTips && (
          <p className="text-sm text-slate-700 mt-2 p-3 bg-slate-50 rounded-lg">{analysis.foTips}</p>
        )}
        {analysis.thetaWarning && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{analysis.thetaWarning}</p>
          </div>
        )}
        <Link
          href={`/analysis/${analysis.symbol}/strategy`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
        >
          Build a custom strategy <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
