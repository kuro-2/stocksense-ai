import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { getQuote } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = user.id;

  const { symbol, stockName, tradeType, instrumentType = 'EQUITY', quantity, notes } = await req.json();
  if (!symbol || !stockName || (tradeType !== 'BUY' && tradeType !== 'SELL')) {
    return NextResponse.json({ error: 'Missing required fields', code: 'BAD_REQUEST' }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'quantity must be a positive integer', code: 'BAD_REQUEST' }, { status: 400 });
  }

  try {
    // Price is always the live market price — never trust a client-supplied price,
    // otherwise a user could fabricate gains or mint virtual cash via a fake trade.
    const quote = await getQuote(symbol);
    const price = quote?.regularMarketPrice;
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Could not fetch live price for symbol', code: 'STOCK_NOT_FOUND' }, { status: 404 });
    }

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

    // No short-selling: can't sell more than you hold (or sell what you don't hold at all).
    if (tradeType === 'SELL' && (!existingPosition || existingPosition.quantity < quantity)) {
      return NextResponse.json({
        error: 'Insufficient holdings to sell',
        code: 'INSUFFICIENT_HOLDINGS',
        held: existingPosition?.quantity ?? 0,
      }, { status: 400 });
    }

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
