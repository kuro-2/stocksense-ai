import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuote } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

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
  });
}
