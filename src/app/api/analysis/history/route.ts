import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/analysis/history — returns the current user's past analyses
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: user.id },
      orderBy: { generatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        symbol: true,
        stockName: true,
        sector: true,
        recommendation: true,
        confidence: true,
        priceAtAnalysis: true,
        changePercent: true,
        targetPrice: true,
        stopLoss: true,
        timeframe: true,
        trend: true,
        foStrategy: true,
        generatedAt: true,
      },
    });

    return NextResponse.json({
      items: analyses.map(a => ({ ...a, generatedAt: a.generatedAt.toISOString() })),
    });
  } catch (error) {
    console.error('Analysis history GET error:', error);
    return NextResponse.json({ error: 'Failed to load analysis history', code: 'DB_ERROR' }, { status: 500 });
  }
}
