interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function calculateRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(0, diff)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(0, -diff)) / period;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 10) / 10;
}

export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] ?? 0;
  const slice = data.slice(-period);
  return Math.round((slice.reduce((a, b) => a + b, 0) / period) * 100) / 100;
}

export function calculateEMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] ?? 0;
  const k = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return Math.round(ema * 100) / 100;
}

export function calculateBollingerBands(closes: number[], period = 20): { upper: number; middle: number; lower: number } {
  const middle = calculateSMA(closes, period);
  const slice = closes.slice(-period);
  const variance = slice.reduce((sum, v) => sum + Math.pow(v - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  return {
    upper: Math.round((middle + 2 * stdDev) * 100) / 100,
    middle,
    lower: Math.round((middle - 2 * stdDev) * 100) / 100,
  };
}

export function findSupportResistance(ohlcv: OHLCV[]): { support: number; resistance: number } {
  const recent = ohlcv.slice(-30);
  const lows = recent.map(d => d.low);
  const highs = recent.map(d => d.high);
  return {
    support: Math.round(Math.min(...lows) * 100) / 100,
    resistance: Math.round(Math.max(...highs) * 100) / 100,
  };
}

export function getRSIInterpretation(rsi: number): string {
  if (rsi >= 70) return 'Overbought — consider waiting for a dip';
  if (rsi <= 30) return 'Oversold — potential buying opportunity';
  if (rsi >= 60) return 'Bullish momentum';
  if (rsi <= 40) return 'Bearish pressure';
  return 'Neutral — balanced buying and selling';
}
