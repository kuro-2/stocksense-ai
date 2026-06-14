import { prisma } from '@/lib/prisma';
import { getQuote, getHistory } from '@/lib/yahoo-finance';
import { calculateRSI, calculateSMA } from '@/lib/technical';
import { NIFTY50_SYMBOLS } from '@/lib/markets';
import type { MarketCap } from '@/types/stock';

const UNIVERSE_SYMBOL = '__UNIVERSE__';
const UNIVERSE_DATA_TYPE = 'screener_universe';
const UNIVERSE_TTL_MIN = 15;

export interface ScreenerStock {
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
  marketCap: MarketCap;
  week52High: number;
  week52Low: number;
}

export function classifyMarketCap(mktCap: number): MarketCap {
  if (mktCap > 200_000_000_000) return 'LARGE_CAP';
  if (mktCap > 50_000_000_000) return 'MID_CAP';
  return 'SMALL_CAP';
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
        marketCap: classifyMarketCap((quote.marketCap ?? 0) as number),
        week52High: (quote.fiftyTwoWeekHigh ?? 0) as number,
        week52Low: (quote.fiftyTwoWeekLow ?? 0) as number,
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ScreenerStock> => r.status === 'fulfilled')
    .map(r => r.value);
}

export async function getScreenerUniverse(): Promise<ScreenerStock[]> {
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
