import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote } from '@/lib/yahoo-finance';
import { getMarketOutlook } from '@/lib/gemini';
import { sendEmail } from '@/lib/email';
import { INDICES } from '@/lib/markets';
import { formatINR, formatPercent } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET /api/digest — send a daily market outlook + watchlist summary email to all users with a watchlist.
// Intended to be called by a scheduled cron job (e.g. once a day before market open).
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  const cronHeader = req.headers.get('x-cron-secret');
  const authorized =
    cronSecret &&
    (authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    // Fetch index quotes for the shared market outlook
    const indexQuotes = await Promise.allSettled(
      INDICES.map(async idx => {
        const q = await getQuote(idx.symbol);
        return { name: idx.name, price: q.regularMarketPrice as number, changePercent: (q.regularMarketChangePercent ?? 0) as number };
      })
    );
    const indices = indexQuotes
      .filter((r): r is PromiseFulfilledResult<{ name: string; price: number; changePercent: number }> => r.status === 'fulfilled')
      .map(r => r.value);

    const outlook = indices.length > 0
      ? await getMarketOutlook(indices)
      : 'Market outlook is temporarily unavailable today.';

    const indexRows = indices
      .map(i => `<tr><td style="padding:4px 12px;">${i.name}</td><td style="padding:4px 12px;text-align:right;font-family:monospace;">${i.price.toLocaleString('en-IN')}</td><td style="padding:4px 12px;text-align:right;color:${i.changePercent >= 0 ? '#16a34a' : '#dc2626'};">${formatPercent(i.changePercent)}</td></tr>`)
      .join('');

    // Find users with at least one watchlist item
    const users = await prisma.user.findMany({
      where: { watchlist: { some: {} } },
      select: { id: true, email: true, watchlist: { select: { symbol: true, stockName: true } } },
    });

    let sentCount = 0;

    for (const user of users) {
      try {
        const watchlistRows = await Promise.allSettled(
          user.watchlist.map(async item => {
            const q = await getQuote(item.symbol);
            return {
              symbol: item.symbol,
              stockName: item.stockName,
              price: q.regularMarketPrice as number,
              changePercent: (q.regularMarketChangePercent ?? 0) as number,
            };
          })
        );

        const rows = watchlistRows
          .filter((r): r is PromiseFulfilledResult<{ symbol: string; stockName: string; price: number; changePercent: number }> => r.status === 'fulfilled')
          .map(r => r.value);

        const watchlistHtml = rows
          .map(r => `<tr><td style="padding:4px 12px;">${r.symbol} — ${r.stockName}</td><td style="padding:4px 12px;text-align:right;font-family:monospace;">${formatINR(r.price)}</td><td style="padding:4px 12px;text-align:right;color:${r.changePercent >= 0 ? '#16a34a' : '#dc2626'};">${formatPercent(r.changePercent)}</td></tr>`)
          .join('');

        const html = `
          <h2>Good morning! Here's your StockSense AI daily digest</h2>
          <p>${outlook}</p>
          <h3>Major Indices</h3>
          <table style="border-collapse:collapse;width:100%;">${indexRows}</table>
          ${rows.length > 0 ? `<h3>Your Watchlist</h3><table style="border-collapse:collapse;width:100%;">${watchlistHtml}</table>` : ''}
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">This is an automated market update, not investment advice. Please do your own research before trading.</p>
        `;

        await sendEmail({
          to: user.email,
          subject: "Your StockSense AI Daily Digest",
          html,
        });
        sentCount++;
      } catch (err) {
        console.error(`Digest failed for user ${user.id}:`, err);
      }
    }

    return NextResponse.json({ usersNotified: sentCount, totalUsers: users.length });
  } catch (error) {
    console.error('Digest error:', error);
    return NextResponse.json({ error: 'Failed to send digest', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
