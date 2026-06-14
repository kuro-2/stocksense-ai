import { NextResponse } from 'next/server';
import { fetchBulkBlockDeals } from '@/lib/nse';

export const dynamic = 'force-dynamic';

// GET /api/market/deals — recent bulk and block deals
export async function GET() {
  try {
    const deals = await fetchBulkBlockDeals();
    return NextResponse.json({ deals });
  } catch (error) {
    console.error('Bulk/block deals error:', error);
    return NextResponse.json({ deals: [], error: 'Bulk/block deal data temporarily unavailable' });
  }
}
