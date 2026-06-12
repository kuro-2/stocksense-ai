import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote, getHistory } from '@/lib/yahoo-finance';
import { calculateRSI, calculateSMA, getRSIInterpretation } from '@/lib/technical';
import { NIFTY50_SYMBOLS } from '@/lib/markets';

export const dynamic = 'force-dynamic';

const UNIVERSE_SYMBOL = '__UNIVERSE__';
const UNIVERSE_DATA_TYPE = 'screener_universe';
const UNIVERSE_TTL_MIN = 15;

interface ScreenerStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  rsi: number;
  sma20: number;
  sma50: number;
  sma200: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sector: string;
}

async function buildUniverse(): Promise<ScreenerStock[]> {
  const results = await Promise.allSettled(
    NIFTY50_SYMBOLS.map(async (symbol): Promise<ScreenerStock> => {
      const [quote, history] = await Promise.all([getQuote(symbol), getHistory(symbol, '1y')]);
      if (!quote?.regularMarketPrice) throw new Error('no quote');

      const closes = (history as Array<{ close: number }>).map(h => h.close).filter(Boolean);
      const rsi = calculateRSI(closes);
      const sma20 = calculateSMA(closes, 20);
      const sma50 = calculateSMA(closes, 50);
      const sma200 = calculateSMA(closes, 200);
      const price = quote.regularMarketPrice as number;

      let trend: ScreenerStock['trend'] = 'NEUTRAL';
      if (price > sma50 && sma50 > sma200) trend = 'BULLISH';
      else if (price < sma50 && sma50 < sma200) trend = 'BEARISH';

      return {
        symbol,
        name: (quote.longName ?? quote.shortName ?? symbol) as string,
        price,
        changePercent: (quote.regularMarketChangePercent ?? 0) as number,
        rsi,
        sma20,
        sma50,
        sma200,
        trend,
        sector: (quote.sector ?? 'Unknown') as string,
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ScreenerStock> => r.status === 'fulfilled')
    .map(r => r.value);
}

async function getUniverse(): Promise<ScreenerStock[]> {
  const cacheKey = { symbol_exchange_dataType: { symbol: UNIVERSE_SYMBOL, exchange: 'NSE', dataType: UNIVERSE_DATA_TYPE } };

  try {
    const cached = await prisma.stockCache.findUnique({ where: cacheKey });
    if (cached && cached.expiresAt > new Date()) {
      return cached.data as unknown as ScreenerStock[];
    }
  } catch {
    // cache miss is fine
  }

  const universe = await buildUniverse();
  const expiresAt = new Date(Date.now() + UNIVERSE_TTL_MIN * 60 * 1000);

  try {
    await prisma.stockCache.upsert({
      where: cacheKey,
      create: { symbol: UNIVERSE_SYMBOL, exchange: 'NSE', dataType: UNIVERSE_DATA_TYPE, data: universe as never, expiresAt },
      update: { data: universe as never, expiresAt, fetchedAt: new Date() },
    });
  } catch {
    // cache write failure is non-fatal
  }

  return universe;
}

interface ScreenerFilters {
  rsiMin?: number;
  rsiMax?: number;
  trend?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  aboveSma200?: boolean;
  sector?: string;
}

async function runScreener(filters: ScreenerFilters) {
  const universe = await getUniverse();

  let filtered = universe;
  if (typeof filters.rsiMin === 'number') filtered = filtered.filter(s => s.rsi >= filters.rsiMin!);
  if (typeof filters.rsiMax === 'number') filtered = filtered.filter(s => s.rsi <= filters.rsiMax!);
  if (filters.trend) filtered = filtered.filter(s => s.trend === filters.trend);
  if (filters.aboveSma200) filtered = filtered.filter(s => s.price > s.sma200);
  if (filters.sector) filtered = filtered.filter(s => s.sector === filters.sector);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const enriched = await Promise.all(
    filtered.map(async s => {
      let recent = null;
      try {
        recent = await prisma.analysis.findFirst({
          where: { symbol: s.symbol, generatedAt: { gte: since } },
          orderBy: { generatedAt: 'desc' },
          select: { recommendation: true, confidence: true },
        });
      } catch {
        // ignore lookup failures
      }
      return {
        ...s,
        rsiInterpretation: getRSIInterpretation(s.rsi),
        recommendation: recent?.recommendation ?? null,
        confidence: recent?.confidence ?? null,
      };
    })
  );

  const sectors = Array.from(new Set(universe.map(s => s.sector))).sort();

  return { count: enriched.length, total: universe.length, sectors, results: enriched };
}

// POST /api/screener — filter the Nifty 50 universe by technical criteria
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as ScreenerFilters;
    const data = await runScreener(body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Screener POST error:', error);
    return NextResponse.json({ error: 'Screener failed', code: 'SERVER_ERROR' }, { status: 500 });
  }
}

// GET /api/screener — unfiltered universe snapshot
export async function GET() {
  try {
    const data = await runScreener({});
    return NextResponse.json(data);
  } catch (error) {
    console.error('Screener GET error:', error);
    return NextResponse.json({ error: 'Screener failed', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
