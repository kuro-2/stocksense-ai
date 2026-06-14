import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote, getHistory } from '@/lib/yahoo-finance';
import { calculateRSI, calculateSMA } from '@/lib/technical';
import { classifyMarketCap } from '@/lib/screenerUniverse';
import type { MarketCap, Trend } from '@/types/stock';

export const dynamic = 'force-dynamic';

interface CompareResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  rsi: number;
  sma20: number;
  sma50: number;
  sma200: number;
  trend: Trend;
  sector: string;
  marketCap: MarketCap;
  week52High: number;
  week52Low: number;
  recommendation: string | null;
  confidence: string | null;
}

async function buildCompareResult(symbol: string): Promise<CompareResult> {
  const [quote, history] = await Promise.all([getQuote(symbol), getHistory(symbol, '1y')]);
  if (!quote?.regularMarketPrice) throw new Error(`No data for ${symbol}`);

  const closes = (history as Array<{ close: number }>).map(h => h.close).filter(Boolean);
  const rsi = calculateRSI(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  const price = quote.regularMarketPrice as number;

  let trend: Trend = 'NEUTRAL';
  if (price > sma50 && sma50 > sma200) trend = 'BULLISH';
  else if (price < sma50 && sma50 < sma200) trend = 'BEARISH';

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let recent = null;
  try {
    recent = await prisma.analysis.findFirst({
      where: { symbol: symbol.toUpperCase(), generatedAt: { gte: since } },
      orderBy: { generatedAt: 'desc' },
      select: { recommendation: true, confidence: true },
    });
  } catch {
    // ignore lookup failures
  }

  return {
    symbol: symbol.toUpperCase(),
    name: (quote.longName ?? quote.shortName ?? symbol) as string,
    price,
    changePercent: (quote.regularMarketChangePercent ?? 0) as number,
    rsi,
    sma20,
    sma50,
    sma200,
    trend,
    sector: (quote.sector ?? 'Unknown') as string,
    marketCap: classifyMarketCap((quote.marketCap ?? 0) as number),
    week52High: (quote.fiftyTwoWeekHigh ?? 0) as number,
    week52Low: (quote.fiftyTwoWeekLow ?? 0) as number,
    recommendation: recent?.recommendation ?? null,
    confidence: recent?.confidence ?? null,
  };
}

// POST /api/compare — side-by-side comparison of 2-4 stocks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const symbols: unknown = body?.symbols;

    if (!Array.isArray(symbols) || symbols.length < 2 || symbols.length > 4) {
      return NextResponse.json({ error: 'Provide between 2 and 4 symbols', code: 'INVALID_INPUT' }, { status: 400 });
    }

    const uniqueSymbols = Array.from(new Set(symbols.map(s => String(s).toUpperCase().trim()))).filter(Boolean);

    const settled = await Promise.allSettled(uniqueSymbols.map(buildCompareResult));

    const results: CompareResult[] = [];
    const errors: { symbol: string; error: string }[] = [];

    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') results.push(r.value);
      else errors.push({ symbol: uniqueSymbols[i], error: 'Failed to fetch data' });
    });

    return NextResponse.json({ results, errors });
  } catch (error) {
    console.error('Compare POST error:', error);
    return NextResponse.json({ error: 'Comparison failed', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
