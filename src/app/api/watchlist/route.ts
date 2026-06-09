import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

// GET /api/watchlist — returns watchlist with live prices
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { addedAt: 'desc' },
  });

  const enriched = await Promise.allSettled(
    items.map(async item => {
      try {
        const quote = await getQuote(item.symbol);
        return {
          id: item.id,
          symbol: item.symbol,
          stockName: item.stockName,
          exchange: item.exchange,
          currentPrice: quote?.regularMarketPrice ?? 0,
          changePercent: quote?.regularMarketChangePercent ?? 0,
          addedAt: item.addedAt.toISOString(),
          notes: item.notes,
        };
      } catch {
        return {
          id: item.id,
          symbol: item.symbol,
          stockName: item.stockName,
          exchange: item.exchange,
          currentPrice: 0,
          changePercent: 0,
          addedAt: item.addedAt.toISOString(),
          notes: item.notes,
        };
      }
    })
  );

  return NextResponse.json({
    items: enriched.map(r => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean),
  });
}

// POST /api/watchlist — add stock
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { symbol, stockName, notes } = await req.json();
  if (!symbol || !stockName) {
    return NextResponse.json({ error: 'symbol and stockName required' }, { status: 400 });
  }

  const item = await prisma.watchlistItem.upsert({
    where: { userId_symbol: { userId, symbol: symbol.toUpperCase() } },
    create: { userId, symbol: symbol.toUpperCase(), stockName, notes },
    update: { notes },
  });

  return NextResponse.json({ id: item.id, message: 'Added to watchlist' });
}
