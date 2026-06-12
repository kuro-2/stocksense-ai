import { calculateRSI, calculateSMA, calculateBollingerBands } from './technical';

export type BacktestStrategy = 'RSI_REVERSAL' | 'SMA_CROSSOVER' | 'BOLLINGER_BOUNCE';

export interface BacktestOHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestParams {
  rsiBuyThreshold?: number;
  rsiSellThreshold?: number;
  smaShortPeriod?: number;
  smaLongPeriod?: number;
  bollingerPeriod?: number;
}

export interface BacktestTrade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  pnlPercent: number;
}

export interface EquityPoint {
  date: string;
  value: number;
  buyHold: number;
}

export interface BacktestStats {
  totalReturn: number;
  winRate: number;
  numTrades: number;
  maxDrawdown: number;
  buyHoldReturn: number;
}

export interface BacktestResult {
  equityCurve: EquityPoint[];
  trades: BacktestTrade[];
  stats: BacktestStats;
}

const DEFAULTS: Required<BacktestParams> = {
  rsiBuyThreshold: 30,
  rsiSellThreshold: 60,
  smaShortPeriod: 20,
  smaLongPeriod: 50,
  bollingerPeriod: 20,
};

function maxDrawdown(values: number[]): number {
  let peak = values[0] ?? 0;
  let maxDd = 0;
  for (const v of values) {
    if (v > peak) peak = v;
    const dd = peak > 0 ? ((peak - v) / peak) * 100 : 0;
    if (dd > maxDd) maxDd = dd;
  }
  return Math.round(maxDd * 100) / 100;
}

export function runBacktest(ohlcv: BacktestOHLCV[], strategy: BacktestStrategy, params: BacktestParams = {}): BacktestResult {
  const p = { ...DEFAULTS, ...params };
  const minWindow = strategy === 'SMA_CROSSOVER' ? p.smaLongPeriod + 1
    : strategy === 'BOLLINGER_BOUNCE' ? p.bollingerPeriod + 1
    : 16; // RSI needs period+1 closes

  const closes = ohlcv.map(d => d.close);
  const equityCurve: EquityPoint[] = [];
  const trades: BacktestTrade[] = [];

  let inPosition = false;
  let entryPrice = 0;
  let entryDate = '';
  let cash = 100; // starting "equity" units
  const startPrice = ohlcv[minWindow - 1]?.close ?? ohlcv[0]?.close ?? 1;

  for (let i = minWindow - 1; i < ohlcv.length; i++) {
    const window = closes.slice(0, i + 1);
    const price = ohlcv[i].close;
    const date = ohlcv[i].date;

    let buySignal = false;
    let sellSignal = false;

    if (strategy === 'RSI_REVERSAL') {
      const rsi = calculateRSI(window);
      if (!inPosition && rsi <= p.rsiBuyThreshold) buySignal = true;
      if (inPosition && rsi >= p.rsiSellThreshold) sellSignal = true;
    } else if (strategy === 'SMA_CROSSOVER') {
      const shortNow = calculateSMA(window, p.smaShortPeriod);
      const longNow = calculateSMA(window, p.smaLongPeriod);
      const prevWindow = closes.slice(0, i);
      const shortPrev = calculateSMA(prevWindow, p.smaShortPeriod);
      const longPrev = calculateSMA(prevWindow, p.smaLongPeriod);
      const goldenCross = shortPrev <= longPrev && shortNow > longNow;
      const deathCross = shortPrev >= longPrev && shortNow < longNow;
      if (!inPosition && goldenCross) buySignal = true;
      if (inPosition && deathCross) sellSignal = true;
    } else if (strategy === 'BOLLINGER_BOUNCE') {
      const bands = calculateBollingerBands(window, p.bollingerPeriod);
      if (!inPosition && price <= bands.lower) buySignal = true;
      if (inPosition && price >= bands.middle) sellSignal = true;
    }

    if (buySignal) {
      inPosition = true;
      entryPrice = price;
      entryDate = date;
    } else if (sellSignal && inPosition) {
      const pnlPercent = ((price - entryPrice) / entryPrice) * 100;
      cash *= 1 + pnlPercent / 100;
      trades.push({ entryDate, exitDate: date, entryPrice, exitPrice: price, pnlPercent: Math.round(pnlPercent * 100) / 100 });
      inPosition = false;
    }

    // mark-to-market equity value
    const currentValue = inPosition ? cash * (1 + (price - entryPrice) / entryPrice) : cash;
    const buyHoldValue = (price / startPrice) * 100;
    equityCurve.push({ date, value: Math.round(currentValue * 100) / 100, buyHold: Math.round(buyHoldValue * 100) / 100 });
  }

  // close any open position at the end using the last price
  if (inPosition) {
    const lastIdx = ohlcv.length - 1;
    const lastPrice = ohlcv[lastIdx].close;
    const pnlPercent = ((lastPrice - entryPrice) / entryPrice) * 100;
    cash *= 1 + pnlPercent / 100;
    trades.push({ entryDate, exitDate: ohlcv[lastIdx].date, entryPrice, exitPrice: lastPrice, pnlPercent: Math.round(pnlPercent * 100) / 100 });
  }

  const totalReturn = Math.round((cash - 100) * 100) / 100;
  const winningTrades = trades.filter(t => t.pnlPercent > 0).length;
  const winRate = trades.length > 0 ? Math.round((winningTrades / trades.length) * 1000) / 10 : 0;
  const buyHoldReturn = equityCurve.length > 0 ? Math.round((equityCurve[equityCurve.length - 1].buyHold - 100) * 100) / 100 : 0;

  return {
    equityCurve,
    trades,
    stats: {
      totalReturn,
      winRate,
      numTrades: trades.length,
      maxDrawdown: maxDrawdown(equityCurve.map(e => e.value)),
      buyHoldReturn,
    },
  };
}
