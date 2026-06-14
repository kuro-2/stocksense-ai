import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BULLISH_RECOMMENDATIONS = ['STRONG_BUY', 'BUY'];
const BEARISH_RECOMMENDATIONS = ['SELL', 'STRONG_SELL'];

// GET /api/analysis/sentiment/[symbol] — community sentiment from past analyses
export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const analyses = await prisma.analysis.findMany({
      where: { symbol: symbol.toUpperCase(), generatedAt: { gte: since } },
      select: { recommendation: true },
    });

    const total = analyses.length;
    if (total === 0) {
      return NextResponse.json({ totalAnalyses: 0, bullishPercent: 0, bearishPercent: 0, neutralPercent: 0, sufficientData: false });
    }

    const bullish = analyses.filter(a => BULLISH_RECOMMENDATIONS.includes(a.recommendation)).length;
    const bearish = analyses.filter(a => BEARISH_RECOMMENDATIONS.includes(a.recommendation)).length;
    const neutral = total - bullish - bearish;

    return NextResponse.json({
      totalAnalyses: total,
      bullishPercent: Math.round((bullish / total) * 100),
      bearishPercent: Math.round((bearish / total) * 100),
      neutralPercent: Math.round((neutral / total) * 100),
      sufficientData: total >= 3,
    });
  } catch (error) {
    console.error('Sentiment error:', error);
    return NextResponse.json({ totalAnalyses: 0, bullishPercent: 0, bearishPercent: 0, neutralPercent: 0, sufficientData: false });
  }
}
