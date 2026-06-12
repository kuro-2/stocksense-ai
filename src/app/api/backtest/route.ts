import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/lib/yahoo-finance';
import { runBacktest, type BacktestStrategy, type BacktestParams } from '@/lib/backtest';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const VALID_STRATEGIES: BacktestStrategy[] = ['RSI_REVERSAL', 'SMA_CROSSOVER', 'BOLLINGER_BOUNCE'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, strategy, params, period } = body as {
      symbol?: string;
      strategy?: BacktestStrategy;
      params?: BacktestParams;
      period?: '6mo' | '1y' | '2y';
    };

    if (!symbol || !strategy) {
      return NextResponse.json({ error: 'symbol and strategy required', code: 'BAD_REQUEST' }, { status: 400 });
    }
    if (!VALID_STRATEGIES.includes(strategy)) {
      return NextResponse.json({ error: 'Invalid strategy', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const cleanSymbol = symbol.toUpperCase().replace(/\s+/g, '').replace('.NS', '').replace('.BO', '');
    const history = await getHistory(cleanSymbol, period ?? '1y');

    const ohlcv = (history as Array<{ date: Date | string; open: number; high: number; low: number; close: number; volume: number }>)
      .filter(h => h.close != null)
      .map(h => ({
        date: (h.date instanceof Date ? h.date.toISOString() : String(h.date)).split('T')[0],
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close,
        volume: h.volume,
      }));

    if (ohlcv.length < 60) {
      return NextResponse.json({ error: 'Not enough price history to run a backtest', code: 'INSUFFICIENT_DATA' }, { status: 400 });
    }

    const result = runBacktest(ohlcv, strategy, params ?? {});
    return NextResponse.json({ symbol: cleanSymbol, strategy, period: period ?? '1y', ...result });
  } catch (error) {
    console.error('Backtest error:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Not Found') || msg.includes('No fundamentals') || msg.includes('404')) {
      return NextResponse.json({ error: 'Stock not found', code: 'STOCK_NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Backtest failed', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
