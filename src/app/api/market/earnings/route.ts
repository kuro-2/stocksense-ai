import { NextResponse } from 'next/server';
import { fetchEarningsCalendar } from '@/lib/nse';

export const dynamic = 'force-dynamic';

// GET /api/market/earnings — upcoming corporate board meetings / earnings calendar
export async function GET() {
  try {
    const entries = await fetchEarningsCalendar();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Earnings calendar error:', error);
    return NextResponse.json({ entries: [], error: 'Earnings calendar temporarily unavailable' });
  }
}
