import { NextRequest, NextResponse } from 'next/server';
import { searchStocks } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  try {
    const results = await searchStocks(q);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] });
  }
}
