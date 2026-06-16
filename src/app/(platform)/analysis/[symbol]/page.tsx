'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Loader2, Lock, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RecommendationCard } from '@/components/stock/RecommendationCard';
import { TechnicalPanel } from '@/components/stock/TechnicalPanel';
import { FnOPanel } from '@/components/stock/FnOPanel';
import { NewsPanel } from '@/components/stock/NewsPanel';
import { RiskPanel } from '@/components/stock/RiskPanel';
import { CommunitySentiment } from '@/components/stock/CommunitySentiment';
import { MutualFundEstimateCard } from '@/components/stock/MutualFundEstimateCard';
import { ChatPanel } from '@/components/stock/ChatPanel';
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
  const [limitReached, setLimitReached] = useState<{ source: 'anon' | 'user'; message: string } | null>(null);

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
    // Check usage limits before making any API call
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      // Logged-out: enforce 1-use soft gate via localStorage
      const anonUsed = typeof window !== 'undefined' && localStorage.getItem('ss_anon_used');
      if (anonUsed) {
        setLimitReached({
          source: 'anon',
          message: "You've used your 1 free AI analysis.",
        });
        return;
      }
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setLimitReached(null);

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
          if (data.code === 'LIMIT_REACHED') {
            setLimitReached({ source: 'user', message: data.error });
            return;
          }
          throw new Error(data.error ?? 'Analysis failed');
        }
        setAnalysis(data);
        // Mark anonymous usage after first successful analysis
        if (!currentUser && typeof window !== 'undefined') {
          localStorage.setItem('ss_anon_used', '1');
        }
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
            disabled={loading || !!limitReached}
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

        {/* Usage limit reached */}
        {!loading && limitReached && (
          <div style={{ padding: 'var(--s8) 0' }}>
            <div className="panel" style={{ maxWidth: 480, margin: '0 auto', padding: 'var(--s7)', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto var(--s5)' }}>
                {limitReached.source === 'anon' ? (
                  <Lock width={22} height={22} strokeWidth={2} />
                ) : (
                  <Sparkles width={22} height={22} strokeWidth={2} />
                )}
              </div>

              {limitReached.source === 'anon' ? (
                <>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', marginBottom: 'var(--s3)' }}>
                    You&apos;ve used your free analysis
                  </h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6, marginBottom: 'var(--s6)' }}>
                    Create a free account to unlock up to 10 AI analyses — no credit card, no catch.
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/signup" className="btn btn-primary" style={{ padding: '10px 22px' }}>
                      Create free account
                    </Link>
                    <Link href="/login" className="btn btn-ghost" style={{ padding: '10px 22px' }}>
                      Log in
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', marginBottom: 'var(--s3)' }}>
                    You&apos;ve reached your AI limit
                  </h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>
                    {limitReached.message}
                  </p>
                </>
              )}
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
            <MutualFundEstimateCard analysis={analysis} />
            <CommunitySentiment symbol={analysis.symbol} />
            <ChatPanel analysis={analysis} />
            <Disclaimer />
          </div>
        )}
    </div>
  );
}
