import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getHistory } from '@/lib/yahoo-finance';
import { calculateRSI, calculateSMA, findSupportResistance, getRSIInterpretation } from '@/lib/technical';
import { analyzeStock, getLiveNews, getMutualFundEstimate } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { isIndexSymbol, getMarketSymbolInfo } from '@/lib/markets';
import { getFnoMarketContext, preFilterFnoStrategy, finalizeFnoRecommendation } from '@/lib/fno';
import type { AnalysisResult, Trend } from '@/types/stock';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, symbol: inputSymbol } = body;

    if (!query && !inputSymbol) {
      return NextResponse.json({ error: 'Query required', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const symbol = (inputSymbol || query).toUpperCase().replace(/\s+/g, '').replace('.NS', '').replace('.BO', '');

    const isIndex = isIndexSymbol(symbol);

    const user = await getAuthUser();

    if (!user) {
      const ip = getClientIp(req);
      const allowed = await checkRateLimit(`analyze:${ip}`, 5, 60 * 60 * 1000);
      if (!allowed) {
        return NextResponse.json({
          error: 'Too many requests. Please sign in for continued access, or try again later.',
          code: 'RATE_LIMITED',
        }, { status: 429 });
      }
    }

    const [quote, history, fnoContext] = await Promise.all([
      getQuote(symbol),
      getHistory(symbol, '3mo'),
      getFnoMarketContext(symbol, isIndex),
    ]);

    if (!quote || !quote.regularMarketPrice) {
      return NextResponse.json({ error: 'Stock not found', code: 'STOCK_NOT_FOUND' }, { status: 404 });
    }

    const closes = (history as Array<{ close: number }>).map(h => h.close).filter(Boolean);
    const ohlcv = (history as Array<{ open: number; high: number; low: number; close: number; volume: number }>)
      .map(h => ({ open: h.open, high: h.high, low: h.low, close: h.close, volume: h.volume }))
      .filter(h => h.close);

    const rsi = calculateRSI(closes);
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const sma200 = calculateSMA(closes, 200);
    const { support, resistance } = findSupportResistance(ohlcv);

    const marketInfo = getMarketSymbolInfo(symbol);

    const mktCap = quote.marketCap ?? 0;
    const marketCapCategory = isIndex ? null :
      mktCap > 200_000_000_000 ? 'LARGE_CAP' :
      mktCap > 50_000_000_000 ? 'MID_CAP' : 'SMALL_CAP';

    // Deterministic technical trend (independent of the AI's own "trend" verdict)
    // used to bound the F&O strategies the AI is allowed to suggest.
    const technicalTrend: Trend =
      quote.regularMarketPrice > sma50 && sma50 >= sma200 ? 'BULLISH' :
      quote.regularMarketPrice < sma50 && sma50 <= sma200 ? 'BEARISH' :
      'NEUTRAL';

    const fnoPreFilter = preFilterFnoStrategy({
      hasFnO: fnoContext.hasFnO,
      technicalTrend,
      rsi,
      indiaVix: fnoContext.indiaVix,
    });

    const analysisInput = {
      stockName: isIndex ? (marketInfo?.name ?? symbol) : (quote.longName ?? quote.shortName ?? symbol),
      symbol,
      currentPrice: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent ?? 0,
      week52High: quote.fiftyTwoWeekHigh ?? 0,
      week52Low: quote.fiftyTwoWeekLow ?? 0,
      marketCap: mktCap,
      pe: quote.trailingPE ?? null,
      rsi,
      rsiInterpretation: getRSIInterpretation(rsi),
      support,
      resistance,
      sma20,
      sma50,
      sma200,
      sector: isIndex ? 'Index' : (quote.sector ?? 'Unknown'),
      isIndex,
      fno: {
        hasFnO: fnoContext.hasFnO,
        allowedStrategies: fnoPreFilter.allowedStrategies,
        candidateStrategy: fnoPreFilter.candidateStrategy,
        ruleReason: fnoPreFilter.reason,
        indiaVix: fnoContext.indiaVix,
        atmIV: fnoContext.atmIV,
        pcr: fnoContext.optionChain?.pcr ?? null,
        maxPain: fnoContext.optionChain?.maxPain ?? null,
        nearestExpiry: fnoContext.optionChain?.expiryDate ?? null,
      },
    };

    // Reuse a recent AI verdict for this symbol to avoid burning the Gemini
    // daily quota on near-identical re-analyses. Price/technicals above are
    // always computed fresh; only the AI commentary and news are cached.
    const CACHE_WINDOW_MS = 15 * 60 * 1000;
    const cached = await prisma.analysis.findFirst({
      where: { symbol, generatedAt: { gte: new Date(Date.now() - CACHE_WINDOW_MS) } },
      orderBy: { generatedAt: 'desc' },
    });

    // Usage limits: only checked when a real AI call is needed (cached results pass through)
    if (!cached) {
      if (!user) {
        // Anonymous: the client enforces the 1-use soft gate via localStorage.
        // No server-side check needed — we can't reliably identify anon users.
      } else {
        const isUnlimited = (user.user_metadata as Record<string, unknown> | undefined)?.unlimited === true;
        if (!isUnlimited) {
          const usageCount = await prisma.analysis.count({ where: { userId: user.id } });
          if (usageCount >= 10) {
            return NextResponse.json({
              error: "You've reached the 10 free AI analyses on your account. StockSense AI is completely free to run — to keep it that way for everyone, I can't offer unlimited access by default. If you'd like to continue, drop a note to rohan.sharma6004@gmail.com and I'll personally unlock full access for you.",
              code: 'LIMIT_REACHED',
            }, { status: 402 });
          }
        }
      }
    }

    const aiResult: Partial<AnalysisResult> = cached?.rawAiResponse
      ? (cached.rawAiResponse as Partial<AnalysisResult>)
      : await analyzeStock(analysisInput);

    // Post-process the AI's F&O suggestion (user already resolved above): enforce the rule-based bounds,
    // cross-check against the equity recommendation, and substitute real
    // strike/expiry data from the live NSE option chain where available.
    const fnoFinal = finalizeFnoRecommendation({
      aiFoStrategy: aiResult.foStrategy ?? 'AVOID_FO',
      aiFoStrike: aiResult.foStrike ?? null,
      aiFoExpiry: aiResult.foExpiry ?? null,
      aiFoTips: aiResult.foTips ?? '',
      recommendation: aiResult.recommendation ?? 'HOLD',
      fnoContext,
      preFilter: fnoPreFilter,
    });

    let newsHighlights = aiResult.newsHighlights ?? [];
    let newsSource: 'live' | 'ai' = 'ai';
    let mutualFundEstimate: Awaited<ReturnType<typeof getMutualFundEstimate>> = null;
    if (cached) {
      newsHighlights = cached.newsHighlights;
      const cachedRaw = cached.rawAiResponse as Partial<AnalysisResult> | null;
      mutualFundEstimate = cachedRaw?.mutualFundEstimate ?? null;
    } else {
      const [liveNewsResult, mfEstimateResult] = await Promise.allSettled([
        getLiveNews(analysisInput.stockName, symbol),
        isIndex ? Promise.resolve(null) : getMutualFundEstimate(analysisInput.stockName, symbol),
      ]);

      if (liveNewsResult.status === 'fulfilled' && liveNewsResult.value && liveNewsResult.value.length > 0) {
        newsHighlights = liveNewsResult.value;
        newsSource = 'live';
      }

      if (mfEstimateResult.status === 'fulfilled' && mfEstimateResult.value) {
        mutualFundEstimate = mfEstimateResult.value;
      }
    }

    const fullResult = {
      ...aiResult,
      symbol,
      currentPrice: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent ?? 0,
      changeDirection: ((quote.regularMarketChangePercent ?? 0) >= 0 ? 'up' : 'down') as 'up' | 'down',
      rsi,
      rsiInterpretation: getRSIInterpretation(rsi),
      support,
      resistance,
      sma20,
      sma50,
      sma200,
      newsHighlights,
      newsSource,
      foStrategy: fnoFinal.foStrategy,
      foStrike: fnoFinal.foStrike,
      foExpiry: fnoFinal.foExpiry,
      foTips: fnoFinal.foTips,
      foDataSource: fnoFinal.foDataSource,
      thetaWarning: fnoFinal.thetaWarning,
      indiaVix: fnoContext.indiaVix,
      pcr: fnoContext.optionChain?.pcr ?? null,
      maxPain: fnoContext.optionChain?.maxPain ?? null,
      atmIV: fnoContext.atmIV,
      mutualFundEstimate,
      mfDataSource: mutualFundEstimate ? ('AI_ESTIMATE' as const) : undefined,
      generatedAt: new Date().toISOString(),
    };

    const analysisId = cached
      ? cached.id
      : (await prisma.analysis.create({
          data: {
            userId: user?.id ?? null,
            symbol,
            stockName: fullResult.stockName ?? symbol,
            exchange: 'NSE',
            sector: fullResult.sector,
            marketCapCategory: marketCapCategory,
            priceAtAnalysis: fullResult.currentPrice,
            changePercent: fullResult.changePercent,
            recommendation: fullResult.recommendation ?? 'HOLD',
            confidence: fullResult.confidence ?? 'LOW',
            targetPrice: fullResult.targetPrice ?? fullResult.currentPrice,
            stopLoss: fullResult.stopLoss ?? fullResult.currentPrice * 0.95,
            timeframe: fullResult.timeframe ?? '3-6 months',
            summary: fullResult.summary ?? '',
            reasoning: fullResult.reasoning ?? '',
            risks: fullResult.risks ?? [],
            trend: fullResult.trend ?? 'NEUTRAL',
            rsiValue: fullResult.rsi,
            support: fullResult.support,
            resistance: fullResult.resistance,
            foStrategy: fullResult.foStrategy ?? 'AVOID_FO',
            foTips: fullResult.foTips,
            foExpiry: fullResult.foExpiry ?? null,
            foStrike: fullResult.foStrike ?? null,
            newsHighlights: fullResult.newsHighlights ?? [],
            rawAiResponse: { ...aiResult, mutualFundEstimate } as never,
          },
        })).id;

    return NextResponse.json({ ...fullResult, analysisId });

  } catch (error: unknown) {
    console.error('Analysis error:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Not Found') || msg.includes('No fundamentals') || msg.includes('404') || msg.includes('No data found') || msg.includes('delisted')) {
      return NextResponse.json({ error: 'Stock not found', code: 'STOCK_NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Analysis failed, please retry', code: 'AI_FAILED' }, { status: 500 });
  }
}
