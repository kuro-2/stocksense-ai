import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const period = (req.nextUrl.searchParams.get('period') ?? '3mo') as '1mo' | '3mo' | '6mo' | '1y';

  try {
    const history = await getHistory(symbol.toUpperCase(), period);
    const data = (history as Array<{ date: Date; open: number; high: number; low: number; close: number; volume: number }>).map(h => ({
      date: h.date instanceof Date ? h.date.toISOString().split('T')[0] : String(h.date),
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.volume,
    }));
    return NextResponse.json({ symbol: symbol.toUpperCase(), period, interval: '1d', data });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Failed to fetch history', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
