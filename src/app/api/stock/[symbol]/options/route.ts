import { NextRequest, NextResponse } from 'next/server';
import { fetchOptionChain } from '@/lib/nse';
import { isIndexSymbol } from '@/lib/markets';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const cleanSymbol = symbol.toUpperCase().replace(/\s+/g, '').replace('.NS', '').replace('.BO', '');

  try {
    const data = await fetchOptionChain(cleanSymbol, isIndexSymbol(cleanSymbol));
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Option chain error for ${cleanSymbol}:`, error);
    return NextResponse.json(
      { error: 'Option chain temporarily unavailable', code: 'OPTION_CHAIN_UNAVAILABLE' },
      { status: 503 }
    );
  }
}
