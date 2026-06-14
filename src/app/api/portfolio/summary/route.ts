import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote } from '@/lib/yahoo-finance';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = user.id;

  try {
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { positions: true },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId },
        include: { positions: true },
      });
    }

    // Enrich positions with live prices
    const positions = await Promise.all(
      portfolio.positions.map(async pos => {
        try {
          const quote = await getQuote(pos.symbol);
          const currentPrice = quote?.regularMarketPrice ?? pos.currentPrice;
          const currentValue = currentPrice * pos.quantity;
          const investedValue = pos.averageCost * pos.quantity;
          const unrealizedPnL = currentValue - investedValue;
          const unrealizedPnLPercent = investedValue > 0 ? (unrealizedPnL / investedValue) * 100 : 0;
          return {
            symbol: pos.symbol,
            stockName: pos.stockName,
            exchange: pos.exchange,
            instrumentType: pos.instrumentType,
            sector: (quote?.sector ?? 'Unknown') as string,
            quantity: pos.quantity,
            averageCost: pos.averageCost,
            currentPrice,
            investedValue,
            currentValue,
            unrealizedPnL,
            unrealizedPnLPercent,
          };
        } catch {
          return {
            symbol: pos.symbol,
            stockName: pos.stockName,
            exchange: pos.exchange,
            instrumentType: pos.instrumentType,
            sector: 'Unknown',
            quantity: pos.quantity,
            averageCost: pos.averageCost,
            currentPrice: pos.currentPrice,
            investedValue: pos.averageCost * pos.quantity,
            currentValue: pos.currentPrice * pos.quantity,
            unrealizedPnL: pos.unrealizedPnL,
            unrealizedPnLPercent: pos.averageCost > 0 ? (pos.unrealizedPnL / (pos.averageCost * pos.quantity)) * 100 : 0,
          };
        }
      })
    );

    const totalInvested = positions.reduce((s, p) => s + p.investedValue, 0);
    const currentValue = positions.reduce((s, p) => s + p.currentValue, 0);
    const totalPnL = currentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    const sectorAllocation: Record<string, number> = {};
    for (const p of positions) {
      sectorAllocation[p.sector] = (sectorAllocation[p.sector] ?? 0) + p.currentValue;
    }

    // Closed-trade analytics from sell trades with recorded realized P&L
    const sellTrades = await prisma.trade.findMany({
      where: { portfolioId: portfolio.id, tradeType: 'SELL', realizedPnLForTrade: { not: null } },
      select: { realizedPnLForTrade: true },
    });
    const totalSellTrades = sellTrades.length;
    const totalRealizedPnL = sellTrades.reduce((s, t) => s + (t.realizedPnLForTrade ?? 0), 0);
    const winningTrades = sellTrades.filter(t => (t.realizedPnLForTrade ?? 0) > 0).length;
    const winRate = totalSellTrades > 0 ? (winningTrades / totalSellTrades) * 100 : null;

    return NextResponse.json({
      portfolioId: portfolio.id,
      virtualCash: portfolio.virtualCash,
      totalInvested,
      currentValue,
      totalPnL,
      totalPnLPercent,
      dayPnL: 0,
      dayPnLPercent: 0,
      positions,
      sectorAllocation,
      totalRealizedPnL,
      winRate,
      totalSellTrades,
    });
  } catch (error) {
    console.error('Portfolio summary error:', error);
    return NextResponse.json({ error: 'Failed to load portfolio', code: 'DB_ERROR' }, { status: 500 });
  }
}
