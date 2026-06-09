import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    const quote = await getQuote(symbol.toUpperCase());
    if (!quote?.regularMarketPrice) {
      return NextResponse.json({ error: 'Stock not found', code: 'STOCK_NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      name: quote.longName ?? quote.shortName ?? symbol,
      exchange: 'NSE',
      currentPrice: quote.regularMarketPrice,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      open: quote.regularMarketOpen ?? 0,
      high: quote.regularMarketDayHigh ?? 0,
      low: quote.regularMarketDayLow ?? 0,
      previousClose: quote.regularMarketPreviousClose ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap ?? 0,
      pe: quote.trailingPE ?? null,
      week52High: quote.fiftyTwoWeekHigh ?? 0,
      week52Low: quote.fiftyTwoWeekLow ?? 0,
      sector: quote.sector ?? 'Unknown',
      industry: quote.industry ?? 'Unknown',
      fetchedAt: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json({ error: 'Stock not found', code: 'STOCK_NOT_FOUND' }, { status: 404 });
  }
}
