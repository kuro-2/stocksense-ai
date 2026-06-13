'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { RecommendationCard } from '@/components/stock/RecommendationCard';
import { TechnicalPanel } from '@/components/stock/TechnicalPanel';
import { FnOPanel } from '@/components/stock/FnOPanel';
import { NewsPanel } from '@/components/stock/NewsPanel';
import { RiskPanel } from '@/components/stock/RiskPanel';
import { PriceChart } from '@/components/stock/PriceChart';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { AnalysisSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OptionChainTable } from '@/components/stock/OptionChainTable';
import { formatINR, formatPercent } from '@/lib/utils';
import type { AnalysisResult, OHLCVPoint } from '@/types/stock';
import type { OptionChainResult } from '@/lib/nse';

const LOADING_MESSAGES = [
  'Fetching live price data...',
  'Calculating technical indicators...',
  'Searching recent news...',
  'AI is analyzing...',
  'Building your recommendation...',
];

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = String(params.symbol).toUpperCase();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [chartData, setChartData] = useState<OHLCVPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [optionChain, setOptionChain] = useState<OptionChainResult | null>(null);
  const [optionChainLoading, setOptionChainLoading] = useState(false);
  const [optionChainError, setOptionChainError] = useState<string | null>(null);

  const loadOptionChain = useCallback(async () => {
    setOptionChainLoading(true);
    setOptionChainError(null);
    try {
      const res = await fetch(`/api/stock/${symbol}/options`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Option chain unavailable');
      setOptionChain(data);
    } catch (e: unknown) {
      setOptionChainError(e instanceof Error ? e.message : 'Option chain temporarily unavailable');
    } finally {
      setOptionChainLoading(false);
    }
  }, [symbol]);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    // Rotate loading messages
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2500);

    try {
      const [analyzeRes, historyRes] = await Promise.allSettled([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        }),
        fetch(`/api/stock/${symbol}/history?period=3mo`),
      ]);

      if (analyzeRes.status === 'fulfilled') {
        const data = await analyzeRes.value.json();
        if (!analyzeRes.value.ok) {
          throw new Error(data.error ?? 'Analysis failed');
        }
        setAnalysis(data);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const histData = await historyRes.value.json();
        setChartData(histData.data ?? []);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  return (
    <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--foreground) mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Stock header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-display text-2xl font-bold text-(--foreground)">
                {analysis?.stockName ?? symbol}
              </h1>
              <Badge variant="info">{symbol}</Badge>
              <Badge variant="neutral">NSE</Badge>
              {analysis?.sector && <Badge variant="neutral">{analysis.sector}</Badge>}
              {analysis?.marketCap && (
                <Badge variant="neutral">
                  {analysis.marketCap.replace('_', ' ')}
                </Badge>
              )}
            </div>
            {analysis && (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-(--foreground)">
                  {formatINR(analysis.currentPrice)}
                </span>
                <span className={`text-lg font-semibold ${analysis.changeDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.changeDirection === 'up' ? '▲' : '▼'} {formatPercent(Math.abs(analysis.changePercent))}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-2 text-sm bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Re-analyze
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-3 glass-card text-emerald px-5 py-3 rounded-xl">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">{loadingMsg}</span>
              </div>
            </div>
            <AnalysisSkeleton />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-700 font-medium mb-3">{error}</p>
              <button
                onClick={runAnalysis}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Analysis result */}
        {!loading && analysis && (
          <div className="space-y-4">
            <RecommendationCard analysis={analysis} />

            {/* Summary & reasoning */}
            <Card>
              <h3 className="font-semibold text-(--foreground) mb-2">AI Analysis</h3>
              <p className="text-(--foreground) text-sm leading-relaxed mb-3">{analysis.summary}</p>
              <p className="text-(--muted) text-sm leading-relaxed">{analysis.reasoning}</p>
            </Card>

            {/* Chart */}
            {chartData.length > 0 && (
              <Card className="p-3">
                <h3 className="font-semibold text-(--foreground) mb-3 px-1">Price Chart (3 months)</h3>
                <PriceChart data={chartData} support={analysis.support} resistance={analysis.resistance} />
                <div className="flex gap-4 mt-2 px-1 text-xs text-(--muted)">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Support ₹{analysis.support}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Resistance ₹{analysis.resistance}</span>
                </div>
              </Card>
            )}

            <TechnicalPanel analysis={analysis} />
            <FnOPanel analysis={analysis} />

            {/* Option chain (lazy-loaded) */}
            {optionChain ? (
              <OptionChainTable data={optionChain} />
            ) : (
              <Card>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold text-(--foreground)">Option Chain</h3>
                    {optionChainError ? (
                      <p className="text-sm text-red-600 mt-1">{optionChainError}</p>
                    ) : (
                      <p className="text-sm text-(--muted) mt-1">View live CE/PE open interest, PCR, and max pain for the nearest expiry.</p>
                    )}
                  </div>
                  <button
                    onClick={loadOptionChain}
                    disabled={optionChainLoading}
                    className="flex items-center gap-2 text-sm bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {optionChainLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {optionChainError ? 'Retry' : 'Load Option Chain'}
                  </button>
                </div>
              </Card>
            )}
            <NewsPanel highlights={analysis.newsHighlights} source={analysis.newsSource} />
            <RiskPanel risks={analysis.risks} />
            <Disclaimer />
          </div>
        )}
    </div>
  );
}
