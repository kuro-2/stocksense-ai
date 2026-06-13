import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getHistory } from '@/lib/yahoo-finance';
import { calculateRSI, calculateSMA, findSupportResistance, getRSIInterpretation } from '@/lib/technical';
import { analyzeStock, getLiveNews } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { isIndexSymbol, getMarketSymbolInfo } from '@/lib/markets';
import type { AnalysisResult } from '@/types/stock';

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

    const [quote, history] = await Promise.all([
      getQuote(symbol),
      getHistory(symbol, '3mo'),
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

    const isIndex = isIndexSymbol(symbol);
    const marketInfo = getMarketSymbolInfo(symbol);

    const mktCap = quote.marketCap ?? 0;
    const marketCapCategory = isIndex ? null :
      mktCap > 200_000_000_000 ? 'LARGE_CAP' :
      mktCap > 50_000_000_000 ? 'MID_CAP' : 'SMALL_CAP';

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
    };

    // Reuse a recent AI verdict for this symbol to avoid burning the Gemini
    // daily quota on near-identical re-analyses. Price/technicals above are
    // always computed fresh; only the AI commentary and news are cached.
    const CACHE_WINDOW_MS = 15 * 60 * 1000;
    const cached = await prisma.analysis.findFirst({
      where: { symbol, generatedAt: { gte: new Date(Date.now() - CACHE_WINDOW_MS) } },
      orderBy: { generatedAt: 'desc' },
    });

    const aiResult: Partial<AnalysisResult> = cached?.rawAiResponse
      ? (cached.rawAiResponse as Partial<AnalysisResult>)
      : await analyzeStock(analysisInput);
    const user = await getAuthUser();

    let newsHighlights = aiResult.newsHighlights ?? [];
    let newsSource: 'live' | 'ai' = 'ai';
    if (cached) {
      newsHighlights = cached.newsHighlights;
    } else {
      const liveNews = await getLiveNews(analysisInput.stockName, symbol);
      if (liveNews && liveNews.length > 0) {
        newsHighlights = liveNews;
        newsSource = 'live';
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
            rawAiResponse: aiResult,
          },
        })).id;

    return NextResponse.json({ ...fullResult, analysisId });

  } catch (error: unknown) {
    console.error('Analysis error:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Not Found') || msg.includes('No fundamentals') || msg.includes('404')) {
      return NextResponse.json({ error: 'Stock not found', code: 'STOCK_NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Analysis failed, please retry', code: 'AI_FAILED' }, { status: 500 });
  }
}
