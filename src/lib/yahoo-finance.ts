import YahooFinance from 'yahoo-finance2';
import { prisma } from './prisma';

const yahooFinance = new YahooFinance();

const CACHE_DURATION = {
  quote: 15,
  history: 24 * 60,
};

async function getCached(symbol: string, dataType: string) {
  try {
    const cached = await prisma.stockCache.findUnique({
      where: { symbol_exchange_dataType: { symbol, exchange: 'NSE', dataType } },
    });
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }
  } catch {
    // Cache miss is fine
  }
  return null;
}

async function setCache(symbol: string, dataType: string, data: unknown, durationMinutes: number) {
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  try {
    await prisma.stockCache.upsert({
      where: { symbol_exchange_dataType: { symbol, exchange: 'NSE', dataType } },
      create: { symbol, exchange: 'NSE', dataType, data: data as never, expiresAt },
      update: { data: data as never, expiresAt, fetchedAt: new Date() },
    });
  } catch {
    // Cache write failure is non-fatal
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getQuote(symbol: string): Promise<Record<string, any>> {
  const cacheKey = 'quote';
  const cached = await getCached(symbol, cacheKey);
  if (cached) return cached as Record<string, unknown>;

  const quote = await yahooFinance.quote(`${symbol}.NS`);
  await setCache(symbol, cacheKey, quote, CACHE_DURATION.quote);
  return quote;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getHistory(symbol: string, period: '1mo' | '3mo' | '6mo' | '1y'): Promise<Record<string, any>[]> {
  const cacheKey = `history_${period}`;
  const cached = await getCached(symbol, cacheKey);
  if (cached) return cached as Record<string, unknown>[];

  const periodMap: Record<string, number> = { '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365 };
  const days = periodMap[period];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await yahooFinance.chart(`${symbol}.NS`, {
    period1: startDate,
    period2: new Date(),
    interval: '1d',
  });

  const history = result.quotes
    .filter(q => q.close != null)
    .map(q => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));

  await setCache(symbol, cacheKey, history, CACHE_DURATION.history);
  return history;
}

export async function searchStocks(query: string): Promise<{ symbol: string; name: string; exchange: string }[]> {
  const results = await yahooFinance.search(query);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quotes: any[] = results?.quotes ?? [];
  return quotes
    .filter((q: Record<string, unknown>) => q['quoteType'] === 'EQUITY' && (q['exchange'] === 'NSE' || q['exchange'] === 'BSE'))
    .slice(0, 10)
    .map((q: Record<string, unknown>) => ({
      symbol: String(q['symbol'] ?? '').replace('.NS', '').replace('.BO', ''),
      name: String(q['longname'] ?? q['shortname'] ?? ''),
      exchange: String(q['exchange'] ?? 'NSE'),
    }));
}
