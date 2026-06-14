import { NextResponse } from 'next/server';
import { fetchIpoList } from '@/lib/nse';

export const dynamic = 'force-dynamic';

// GET /api/ipo — upcoming, active, and recent IPOs from NSE
export async function GET() {
  try {
    const data = await fetchIpoList();
    return NextResponse.json(data);
  } catch (error) {
    console.error('IPO list error:', error);
    return NextResponse.json({
      active: [],
      upcoming: [],
      recent: [],
      error: 'IPO data temporarily unavailable',
    });
  }
}
