import { NextResponse } from 'next/server';
import { getScreenerUniverse } from '@/lib/screenerUniverse';

export const dynamic = 'force-dynamic';

// GET /api/market/movers — stocks near their 52-week high/low
export async function GET() {
  try {
    const universe = await getScreenerUniverse();

    const withDistances = universe
      .filter(s => s.week52High > 0 && s.week52Low > 0)
      .map(s => ({
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        changePercent: s.changePercent,
        week52High: s.week52High,
        week52Low: s.week52Low,
        distanceFromHighPercent: ((s.week52High - s.price) / s.week52High) * 100,
        distanceFromLowPercent: ((s.price - s.week52Low) / s.week52Low) * 100,
      }));

    const nearHigh = withDistances
      .filter(s => s.distanceFromHighPercent <= 2)
      .sort((a, b) => a.distanceFromHighPercent - b.distanceFromHighPercent);

    const nearLow = withDistances
      .filter(s => s.distanceFromLowPercent <= 2)
      .sort((a, b) => a.distanceFromLowPercent - b.distanceFromLowPercent);

    return NextResponse.json({ nearHigh, nearLow, total: universe.length });
  } catch (error) {
    console.error('Movers error:', error);
    return NextResponse.json({ nearHigh: [], nearLow: [], total: 0, error: 'Movers data temporarily unavailable' });
  }
}
