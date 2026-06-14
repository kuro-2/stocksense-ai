import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = user.id;

  const { symbol, stockName, tradeType, instrumentType = 'EQUITY', quantity, price, notes } = await req.json();
  if (!symbol || !tradeType || !quantity || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    let portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({ data: { userId } });
    }

    const totalValue = quantity * price;

    if (tradeType === 'BUY' && portfolio.virtualCash < totalValue) {
      return NextResponse.json({
        error: 'Insufficient virtual cash',
        code: 'INSUFFICIENT_FUNDS',
        required: totalValue,
        available: portfolio.virtualCash,
      }, { status: 400 });
    }

    // Look up the existing position first so we can record realized P&L on the trade itself
    const existingPosition = await prisma.position.findUnique({
      where: { portfolioId_symbol_instrumentType: { portfolioId: portfolio.id, symbol: symbol.toUpperCase(), instrumentType } },
    });

    const realizedPnLForTrade = (tradeType === 'SELL' && existingPosition)
      ? (price - existingPosition.averageCost) * quantity
      : null;

    // Record trade
    const trade = await prisma.trade.create({
      data: {
        portfolioId: portfolio.id,
        symbol: symbol.toUpperCase(),
        stockName,
        tradeType,
        instrumentType,
        quantity,
        price,
        totalValue,
        notes,
        realizedPnLForTrade,
      },
    });

    // Update cash
    const cashDelta = tradeType === 'BUY' ? -totalValue : totalValue;
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { virtualCash: { increment: cashDelta } },
    });

    if (tradeType === 'BUY') {
      if (existingPosition) {
        const newQty = existingPosition.quantity + quantity;
        const newAvgCost = (existingPosition.averageCost * existingPosition.quantity + price * quantity) / newQty;
        await prisma.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: newQty,
            averageCost: newAvgCost,
            currentPrice: price,
            unrealizedPnL: (price - newAvgCost) * newQty,
          },
        });
      } else {
        await prisma.position.create({
          data: {
            portfolioId: portfolio.id,
            symbol: symbol.toUpperCase(),
            stockName,
            instrumentType,
            quantity,
            averageCost: price,
            currentPrice: price,
            unrealizedPnL: 0,
          },
        });
      }
    } else if (tradeType === 'SELL' && existingPosition) {
      const newQty = existingPosition.quantity - quantity;
      if (newQty <= 0) {
        await prisma.position.delete({ where: { id: existingPosition.id } });
      } else {
        await prisma.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: newQty,
            currentPrice: price,
            unrealizedPnL: (price - existingPosition.averageCost) * newQty,
            realizedPnL: { increment: realizedPnLForTrade ?? 0 },
          },
        });
      }
    }

    const updatedPortfolio = await prisma.portfolio.findUnique({ where: { id: portfolio.id } });

    return NextResponse.json({
      tradeId: trade.id,
      message: 'Trade executed',
      cashRemaining: updatedPortfolio?.virtualCash ?? 0,
      position: { symbol: symbol.toUpperCase(), quantity, averageCost: price },
    });
  } catch (error) {
    console.error('Trade error:', error);
    return NextResponse.json({ error: 'Failed to execute trade', code: 'DB_ERROR' }, { status: 500 });
  }
}
