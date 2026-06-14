import { NextResponse } from 'next/server';
import { fetchFiiDiiActivity } from '@/lib/nse';

export const dynamic = 'force-dynamic';

// GET /api/market/fii-dii — latest FII/DII cash market activity
export async function GET() {
  try {
    const entries = await fetchFiiDiiActivity();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('FII/DII error:', error);
    return NextResponse.json({ entries: [], error: 'FII/DII data temporarily unavailable' });
  }
}
