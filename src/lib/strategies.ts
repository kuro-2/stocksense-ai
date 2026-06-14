import type { OptionChainStrike } from '@/lib/nse';

export type LegType = 'CE' | 'PE';
export type LegPosition = 'BUY' | 'SELL';

export interface Leg {
  type: LegType;
  position: LegPosition;
  strike: number;
  premium: number;
  qty: number;
}

export interface StrategyTemplate {
  name: string;
  description: string;
  build: (spot: number, strikeStep: number) => Leg[];
}

function roundToStep(price: number, step: number): number {
  return Math.round(price / step) * step;
}

export function getStrikeStep(spot: number): number {
  if (spot >= 10000) return 100;
  if (spot >= 1000) return 50;
  if (spot >= 100) return 10;
  return 5;
}

export const STRATEGY_TEMPLATES: Record<string, StrategyTemplate> = {
  LONG_CALL: {
    name: 'Long Call',
    description: 'Buy a call option. Unlimited upside, limited downside (premium paid). Bullish view.',
    build: (spot, step) => [
      { type: 'CE', position: 'BUY', strike: roundToStep(spot, step), premium: 0, qty: 1 },
    ],
  },
  LONG_PUT: {
    name: 'Long Put',
    description: 'Buy a put option. Profits if price falls. Limited downside (premium paid). Bearish view.',
    build: (spot, step) => [
      { type: 'PE', position: 'BUY', strike: roundToStep(spot, step), premium: 0, qty: 1 },
    ],
  },
  COVERED_CALL: {
    name: 'Covered Call',
    description: 'Sell a call against shares you own (modeled here as just the option leg). Generates income in a flat/mildly bullish market.',
    build: (spot, step) => [
      { type: 'CE', position: 'SELL', strike: roundToStep(spot + step, step), premium: 0, qty: 1 },
    ],
  },
  CASH_SECURED_PUT: {
    name: 'Cash-Secured Put',
    description: 'Sell a put with cash set aside to buy shares if assigned. Generates income, bullish/neutral view.',
    build: (spot, step) => [
      { type: 'PE', position: 'SELL', strike: roundToStep(spot - step, step), premium: 0, qty: 1 },
    ],
  },
  BULL_CALL_SPREAD: {
    name: 'Bull Call Spread',
    description: 'Buy a lower-strike call and sell a higher-strike call. Limited risk, limited reward. Moderately bullish.',
    build: (spot, step) => [
      { type: 'CE', position: 'BUY', strike: roundToStep(spot, step), premium: 0, qty: 1 },
      { type: 'CE', position: 'SELL', strike: roundToStep(spot + 2 * step, step), premium: 0, qty: 1 },
    ],
  },
  BEAR_PUT_SPREAD: {
    name: 'Bear Put Spread',
    description: 'Buy a higher-strike put and sell a lower-strike put. Limited risk, limited reward. Moderately bearish.',
    build: (spot, step) => [
      { type: 'PE', position: 'BUY', strike: roundToStep(spot, step), premium: 0, qty: 1 },
      { type: 'PE', position: 'SELL', strike: roundToStep(spot - 2 * step, step), premium: 0, qty: 1 },
    ],
  },
  STRADDLE: {
    name: 'Long Straddle',
    description: 'Buy a call and a put at the same strike. Profits from a big move in either direction. Best before high-volatility events.',
    build: (spot, step) => [
      { type: 'CE', position: 'BUY', strike: roundToStep(spot, step), premium: 0, qty: 1 },
      { type: 'PE', position: 'BUY', strike: roundToStep(spot, step), premium: 0, qty: 1 },
    ],
  },
  PROTECTIVE_PUT: {
    name: 'Protective Put',
    description: 'Buy a put to hedge an existing long stock position (modeled here as just the option leg). Insurance against a price drop.',
    build: (spot, step) => [
      { type: 'PE', position: 'BUY', strike: roundToStep(spot - step, step), premium: 0, qty: 1 },
    ],
  },
};

export interface PayoffPoint {
  price: number;
  pnl: number;
}

export interface PayoffResult {
  points: PayoffPoint[];
  maxProfit: number;
  maxLoss: number;
  breakevens: number[];
}

function legPayoffAtExpiry(leg: Leg, price: number): number {
  const intrinsic = leg.type === 'CE' ? Math.max(0, price - leg.strike) : Math.max(0, leg.strike - price);
  const directionMultiplier = leg.position === 'BUY' ? 1 : -1;
  const premiumFlow = leg.position === 'BUY' ? -leg.premium : leg.premium;
  return (intrinsic * directionMultiplier + premiumFlow) * leg.qty;
}

export function computePayoff(legs: Leg[], priceRange: number[], lotSize: number): PayoffResult {
  const points: PayoffPoint[] = priceRange.map(price => {
    const pnl = legs.reduce((sum, leg) => sum + legPayoffAtExpiry(leg, price), 0) * lotSize;
    return { price, pnl };
  });

  const pnls = points.map(p => p.pnl);
  const maxProfit = Math.max(...pnls);
  const maxLoss = Math.min(...pnls);

  const breakevens: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    if (curr.pnl === 0) {
      // Only the edges of a zero-pnl plateau are breakevens (common when premium is 0,
      // e.g. an unfilled Long Call/Put leg has pnl === 0 across a whole price range).
      const prevNonZero = i > 0 && points[i - 1].pnl !== 0;
      const nextNonZero = i < points.length - 1 && points[i + 1].pnl !== 0;
      if (prevNonZero || nextNonZero) breakevens.push(curr.price);
      continue;
    }
    if (i === 0) continue;
    const prev = points[i - 1];
    if ((prev.pnl < 0 && curr.pnl > 0) || (prev.pnl > 0 && curr.pnl < 0)) {
      // Linear interpolation between the two points
      const ratio = Math.abs(prev.pnl) / (Math.abs(prev.pnl) + Math.abs(curr.pnl));
      breakevens.push(Math.round(prev.price + ratio * (curr.price - prev.price)));
    }
  }

  const uniqueBreakevens = [...new Set(breakevens)].sort((a, b) => a - b);

  return { points, maxProfit, maxLoss, breakevens: uniqueBreakevens };
}

/** Finds the live premium (LTP) for a given strike/type from a live option chain, using the nearest available strike if there's no exact match. Returns 0 if no chain data is available. */
export function findPremium(strikes: OptionChainStrike[] | undefined, strike: number, type: LegType): number {
  if (!strikes || strikes.length === 0) return 0;

  let closest = strikes[0];
  let closestDiff = Math.abs(closest.strikePrice - strike);
  for (const s of strikes) {
    const diff = Math.abs(s.strikePrice - strike);
    if (diff < closestDiff) {
      closest = s;
      closestDiff = diff;
    }
  }

  const side = type === 'CE' ? closest.ce : closest.pe;
  return side ? side.ltp : 0;
}

export function generatePriceRange(spot: number, step: number, steps = 20): number[] {
  const range: number[] = [];
  const increment = step / 2;
  for (let i = -steps; i <= steps; i++) {
    range.push(Math.round(spot + i * increment));
  }
  return range.filter(p => p > 0);
}
