import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote } from '@/lib/yahoo-finance';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET /api/alerts/check — evaluate all active price alerts and notify users.
// Intended to be called by a scheduled cron job (e.g. every 15 minutes).
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get('x-cron-secret');
    if (header !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
  }

  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { isActive: true },
      include: { user: { select: { email: true } } },
    });

    let triggeredCount = 0;

    for (const alert of alerts) {
      try {
        const quote = await getQuote(alert.symbol);
        const price = quote?.regularMarketPrice;
        if (typeof price !== 'number') continue;

        const triggered =
          (alert.condition === 'ABOVE' && price >= alert.targetPrice) ||
          (alert.condition === 'BELOW' && price <= alert.targetPrice);

        if (!triggered) continue;

        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { isActive: false, triggeredAt: new Date() },
        });
        triggeredCount++;

        await sendEmail({
          to: alert.user.email,
          subject: `Price Alert: ${alert.symbol} is now ${alert.condition === 'ABOVE' ? 'above' : 'below'} ₹${alert.targetPrice}`,
          html: `
            <p>Your price alert for <strong>${alert.stockName} (${alert.symbol})</strong> has been triggered.</p>
            <p>Current price: <strong>₹${price.toLocaleString('en-IN')}</strong></p>
            <p>Condition: ${alert.symbol} ${alert.condition === 'ABOVE' ? '≥' : '≤'} ₹${alert.targetPrice}</p>
          `,
        });
      } catch (err) {
        console.error(`Alert check failed for ${alert.symbol}:`, err);
      }
    }

    return NextResponse.json({ checked: alerts.length, triggered: triggeredCount });
  } catch (error) {
    console.error('Alerts check error:', error);
    return NextResponse.json({ error: 'Failed to check alerts', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
