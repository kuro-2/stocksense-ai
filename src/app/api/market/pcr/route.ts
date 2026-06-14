import { NextResponse } from 'next/server';
import { fetchOptionChain } from '@/lib/nse';

export const dynamic = 'force-dynamic';

interface PcrSummary {
  pcr: number;
  maxPain: number;
  underlyingValue: number;
  expiryDate: string;
}

// GET /api/market/pcr — market-wide PCR/max-pain for NIFTY and BANKNIFTY
export async function GET() {
  const [niftyResult, bankniftyResult] = await Promise.allSettled([
    fetchOptionChain('NIFTY', true),
    fetchOptionChain('BANKNIFTY', true),
  ]);

  const toSummary = (r: PromiseSettledResult<Awaited<ReturnType<typeof fetchOptionChain>>>): PcrSummary | null => {
    if (r.status !== 'fulfilled') return null;
    const { pcr, maxPain, underlyingValue, expiryDate } = r.value;
    return { pcr, maxPain, underlyingValue, expiryDate };
  };

  return NextResponse.json({
    nifty: toSummary(niftyResult),
    banknifty: toSummary(bankniftyResult),
  });
}
