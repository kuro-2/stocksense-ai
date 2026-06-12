import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/alerts — list the user's price alerts
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      items: alerts.map(a => ({
        id: a.id,
        symbol: a.symbol,
        stockName: a.stockName,
        condition: a.condition,
        targetPrice: a.targetPrice,
        isActive: a.isActive,
        triggeredAt: a.triggeredAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Alerts GET error:', error);
    return NextResponse.json({ error: 'Failed to load alerts', code: 'DB_ERROR' }, { status: 500 });
  }
}

// POST /api/alerts — create a new price alert
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { symbol, stockName, condition, targetPrice } = await req.json();
  if (!symbol || !stockName || !condition || typeof targetPrice !== 'number') {
    return NextResponse.json({ error: 'symbol, stockName, condition and targetPrice required', code: 'BAD_REQUEST' }, { status: 400 });
  }
  if (condition !== 'ABOVE' && condition !== 'BELOW') {
    return NextResponse.json({ error: 'condition must be ABOVE or BELOW', code: 'BAD_REQUEST' }, { status: 400 });
  }

  try {
    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        symbol: symbol.toUpperCase(),
        stockName,
        condition,
        targetPrice,
      },
    });

    return NextResponse.json({ id: alert.id, message: 'Alert created' });
  } catch (error) {
    console.error('Alerts POST error:', error);
    return NextResponse.json({ error: 'Failed to create alert', code: 'DB_ERROR' }, { status: 500 });
  }
}
