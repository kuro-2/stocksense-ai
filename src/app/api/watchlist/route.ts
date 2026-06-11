import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote } from '@/lib/yahoo-finance';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/watchlist — returns watchlist with live prices
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = user.id;

  try {
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
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ error: 'Failed to load watchlist', code: 'DB_ERROR' }, { status: 500 });
  }
}

// POST /api/watchlist — add stock
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = user.id;

  const { symbol, stockName, notes } = await req.json();
  if (!symbol || !stockName) {
    return NextResponse.json({ error: 'symbol and stockName required' }, { status: 400 });
  }

  try {
    const item = await prisma.watchlistItem.upsert({
      where: { userId_symbol: { userId, symbol: symbol.toUpperCase() } },
      create: { userId, symbol: symbol.toUpperCase(), stockName, notes },
      update: { notes },
    });

    return NextResponse.json({ id: item.id, message: 'Added to watchlist' });
  } catch (error) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist', code: 'DB_ERROR' }, { status: 500 });
  }
}
