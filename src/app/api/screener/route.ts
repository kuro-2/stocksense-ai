import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRSIInterpretation } from '@/lib/technical';
import { getScreenerUniverse } from '@/lib/screenerUniverse';
import type { MarketCap } from '@/types/stock';

export const dynamic = 'force-dynamic';

interface ScreenerFilters {
  rsiMin?: number;
  rsiMax?: number;
  trend?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  aboveSma200?: boolean;
  sector?: string;
  marketCap?: MarketCap;
  near52WeekLow?: boolean;
}

async function runScreener(filters: ScreenerFilters) {
  const universe = await getScreenerUniverse();

  let filtered = universe;
  if (typeof filters.rsiMin === 'number') filtered = filtered.filter(s => s.rsi >= filters.rsiMin!);
  if (typeof filters.rsiMax === 'number') filtered = filtered.filter(s => s.rsi <= filters.rsiMax!);
  if (filters.trend) filtered = filtered.filter(s => s.trend === filters.trend);
  if (filters.aboveSma200) filtered = filtered.filter(s => s.price > s.sma200);
  if (filters.sector) filtered = filtered.filter(s => s.sector === filters.sector);
  if (filters.marketCap) filtered = filtered.filter(s => s.marketCap === filters.marketCap);
  if (filters.near52WeekLow) filtered = filtered.filter(s => s.week52Low > 0 && s.price <= s.week52Low * 1.1);

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
