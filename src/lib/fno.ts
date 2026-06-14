import { getQuote } from './yahoo-finance';
import { fetchOptionChain, type OptionChainResult } from './nse';
import { isFnoEligible } from './markets';
import type { FoStrategy, Recommendation, Trend } from '@/types/stock';

// NSE's option-chain API uses its own index symbols, which sometimes differ
// from the app's internal symbols (e.g. the Nifty 50 index is "NIFTY" on NSE).
const NSE_OPTION_CHAIN_SYMBOL: Record<string, string> = {
  NIFTY50: 'NIFTY',
};

export interface FnoMarketContext {
  hasFnO: boolean;
  optionChain: OptionChainResult | null;
  indiaVix: number | null;
  atmIV: number | null;
}

export async function getIndiaVix(): Promise<number | null> {
  try {
    const quote = await getQuote('INDIAVIX');
    const value = quote?.regularMarketPrice;
    return typeof value === 'number' ? Math.round(value * 100) / 100 : null;
  } catch {
    return null;
  }
}

function getAtmImpliedVolatility(chain: OptionChainResult): number | null {
  if (chain.strikes.length === 0) return null;
  const atm = chain.strikes.reduce((closest, s) =>
    Math.abs(s.strikePrice - chain.underlyingValue) < Math.abs(closest.strikePrice - chain.underlyingValue) ? s : closest
  );
  const ivs = [atm.ce?.iv, atm.pe?.iv].filter((v): v is number => typeof v === 'number' && v > 0);
  if (ivs.length === 0) return null;
  return Math.round((ivs.reduce((a, b) => a + b, 0) / ivs.length) * 100) / 100;
}

// Fetches the live NSE option chain (with PCR/max pain), India VIX, and the
// resulting ATM implied volatility for a symbol. `hasFnO` is determined from a
// static eligibility list (lib/markets.ts) so it stays correct even when NSE
// is temporarily unreachable — `optionChain` itself may still be null (live
// data unavailable), in which case the rest of the pipeline falls back to
// AI-estimated F&O guidance while still offering F&O strategies.
export async function getFnoMarketContext(symbol: string, isIndex: boolean): Promise<FnoMarketContext> {
  const nseSymbol = NSE_OPTION_CHAIN_SYMBOL[symbol] ?? symbol;

  const [optionChain, indiaVix] = await Promise.all([
    fetchOptionChain(nseSymbol, isIndex).catch(() => null),
    getIndiaVix(),
  ]);

  return {
    hasFnO: isFnoEligible(symbol),
    optionChain,
    indiaVix,
    atmIV: optionChain ? getAtmImpliedVolatility(optionChain) : null,
  };
}

export interface FnoPreFilter {
  allowedStrategies: FoStrategy[];
  candidateStrategy: FoStrategy;
  reason: string;
}

// Rule-based pre-filter: bounds what the AI is allowed to suggest, based on
// purely deterministic technicals (trend, RSI, India VIX) computed before the
// AI is even called. AVOID_FO is always an acceptable fallback.
export function preFilterFnoStrategy(params: {
  hasFnO: boolean;
  technicalTrend: Trend;
  rsi: number;
  indiaVix: number | null;
}): FnoPreFilter {
  const { hasFnO, technicalTrend, rsi, indiaVix } = params;

  if (!hasFnO) {
    return {
      allowedStrategies: ['AVOID_FO'],
      candidateStrategy: 'AVOID_FO',
      reason: 'This stock has no listed F&O contracts on the NSE.',
    };
  }

  const highVix = indiaVix !== null && indiaVix >= 18;
  const lowVix = indiaVix !== null && indiaVix < 13;
  const vixNote = highVix
    ? ' India VIX is elevated, so selling premium is favored over buying options.'
    : lowVix
    ? ' India VIX is low, so buying options is relatively cheap.'
    : '';

  if (technicalTrend === 'BULLISH' && rsi < 70) {
    return {
      allowedStrategies: ['BUY_CALL', 'SELL_PUT', 'AVOID_FO'],
      candidateStrategy: highVix ? 'SELL_PUT' : 'BUY_CALL',
      reason: `Trend is bullish with RSI ${rsi} (not overbought).${vixNote}`,
    };
  }

  if (technicalTrend === 'BEARISH' && rsi > 30) {
    return {
      allowedStrategies: ['BUY_PUT', 'SELL_CALL', 'AVOID_FO'],
      candidateStrategy: highVix ? 'SELL_CALL' : 'BUY_PUT',
      reason: `Trend is bearish with RSI ${rsi} (not oversold).${vixNote}`,
    };
  }

  if (rsi >= 70) {
    return {
      allowedStrategies: ['SELL_CALL', 'AVOID_FO'],
      candidateStrategy: 'SELL_CALL',
      reason: `RSI ${rsi} is overbought — buying calls is not supported here.${vixNote}`,
    };
  }

  if (rsi <= 30) {
    return {
      allowedStrategies: ['SELL_PUT', 'AVOID_FO'],
      candidateStrategy: 'SELL_PUT',
      reason: `RSI ${rsi} is oversold — buying puts is not supported here.${vixNote}`,
    };
  }

  return {
    allowedStrategies: ['SELL_CALL', 'SELL_PUT', 'AVOID_FO'],
    candidateStrategy: 'AVOID_FO',
    reason: `Trend is ${technicalTrend.toLowerCase()} with RSI ${rsi} — no clear directional edge for buying options.${vixNote}`,
  };
}

const BULLISH_FO: FoStrategy[] = ['BUY_CALL', 'SELL_PUT'];
const BEARISH_FO: FoStrategy[] = ['BUY_PUT', 'SELL_CALL'];

// Cross-checks the AI's equity recommendation against its F&O strategy —
// e.g. SELL equity + BUY_CALL options would be contradictory.
export function checkFnoConsistency(recommendation: Recommendation, foStrategy: FoStrategy): { consistent: boolean; reason?: string } {
  if (foStrategy === 'AVOID_FO') return { consistent: true };

  if ((recommendation === 'STRONG_SELL' || recommendation === 'SELL') && BULLISH_FO.includes(foStrategy)) {
    return { consistent: false, reason: `Equity recommendation is ${recommendation} but F&O strategy ${foStrategy} is bullish.` };
  }
  if ((recommendation === 'STRONG_BUY' || recommendation === 'BUY') && BEARISH_FO.includes(foStrategy)) {
    return { consistent: false, reason: `Equity recommendation is ${recommendation} but F&O strategy ${foStrategy} is bearish.` };
  }
  return { consistent: true };
}

// Picks a real strike + expiry from the live option chain instead of an
// AI-guessed round number. For option-buying strategies, the ATM strike gives
// the best balance of premium cost and delta. For premium-selling strategies,
// the strike with the highest OI on the relevant side marks a strong
// support/resistance level — a popular choice for writers.
export function selectStrikeAndExpiry(chain: OptionChainResult, foStrategy: FoStrategy): { strike: number; expiry: string } | null {
  if (chain.strikes.length === 0) return null;

  const atmStrike = chain.strikes.reduce((closest, s) =>
    Math.abs(s.strikePrice - chain.underlyingValue) < Math.abs(closest.strikePrice - chain.underlyingValue) ? s : closest
  ).strikePrice;

  let strike = atmStrike;

  if (foStrategy === 'SELL_CALL' || foStrategy === 'SELL_PUT') {
    const side = foStrategy === 'SELL_CALL' ? 'ce' : 'pe';
    const candidates = chain.strikes.filter(s => s[side] && s[side]!.oi > 0);
    if (candidates.length > 0) {
      strike = candidates.reduce((max, s) => (s[side]!.oi > max[side]!.oi ? s : max)).strikePrice;
    }
  }

  return { strike, expiry: chain.expiryDate };
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseNseDate(dateStr: string): Date | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = MONTHS[parts[1]];
  const year = parseInt(parts[2], 10);
  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null;
  return new Date(year, month, day);
}

// If an option-buying strategy is close to expiry, theta decay will erode its
// value fast — warn the user explicitly so they don't hold a buy that's only
// suitable for a very short-term move.
export function getThetaWarning(expiryDate: string, foStrategy: FoStrategy): string | null {
  if (foStrategy !== 'BUY_CALL' && foStrategy !== 'BUY_PUT') return null;

  const expiry = parseNseDate(expiryDate);
  if (!expiry) return null;

  const daysToExpiry = Math.ceil((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (daysToExpiry >= 0 && daysToExpiry < 5) {
    return `Only ${daysToExpiry} day(s) left to expiry — time decay (theta) will erode this option's value quickly. Only suitable for a strong, immediate price move in your favor.`;
  }
  return null;
}

export interface FnoFinalization {
  foStrategy: FoStrategy;
  foStrike: number | null;
  foExpiry: string | null;
  foTips: string;
  foDataSource: 'NSE_LIVE' | 'AI_ESTIMATE';
  thetaWarning: string | null;
}

// Combines the AI's suggestion with the rule-based pre-filter, the
// equity-vs-F&O consistency check, and real option-chain data to produce the
// final F&O recommendation shown to the user.
export function finalizeFnoRecommendation(params: {
  aiFoStrategy: FoStrategy;
  aiFoStrike: number | null;
  aiFoExpiry: string | null;
  aiFoTips: string;
  recommendation: Recommendation;
  fnoContext: FnoMarketContext;
  preFilter: FnoPreFilter;
}): FnoFinalization {
  const { aiFoStrategy, aiFoStrike, aiFoExpiry, aiFoTips, recommendation, fnoContext, preFilter } = params;

  if (!fnoContext.hasFnO) {
    return {
      foStrategy: 'AVOID_FO',
      foStrike: null,
      foExpiry: null,
      foTips: 'This stock does not have listed F&O contracts on the NSE — F&O is not available for this symbol.',
      foDataSource: 'AI_ESTIMATE',
      thetaWarning: null,
    };
  }

  let foStrategy = aiFoStrategy;
  let downgradeReason: string | null = null;

  if (!preFilter.allowedStrategies.includes(foStrategy)) {
    downgradeReason = `AI suggested ${aiFoStrategy}, but rule-based checks don't support it: ${preFilter.reason}`;
    foStrategy = 'AVOID_FO';
  } else {
    const consistency = checkFnoConsistency(recommendation, foStrategy);
    if (!consistency.consistent) {
      downgradeReason = consistency.reason ?? null;
      foStrategy = 'AVOID_FO';
    }
  }

  if (foStrategy === 'AVOID_FO') {
    return {
      foStrategy: 'AVOID_FO',
      foStrike: null,
      foExpiry: null,
      foTips: downgradeReason
        ? `Downgraded to AVOID_FO — ${downgradeReason}`
        : (aiFoTips || 'Avoid F&O for this stock right now — conditions are not favorable for a directional options trade.'),
      foDataSource: 'AI_ESTIMATE',
      thetaWarning: null,
    };
  }

  let foStrike = aiFoStrike;
  let foExpiry = aiFoExpiry;
  let foDataSource: 'NSE_LIVE' | 'AI_ESTIMATE' = 'AI_ESTIMATE';

  if (fnoContext.optionChain) {
    const picked = selectStrikeAndExpiry(fnoContext.optionChain, foStrategy);
    if (picked) {
      foStrike = picked.strike;
      foExpiry = picked.expiry;
      foDataSource = 'NSE_LIVE';
    }
  }

  const thetaWarning = foExpiry ? getThetaWarning(foExpiry, foStrategy) : null;

  return { foStrategy, foStrike, foExpiry, foTips: aiFoTips, foDataSource, thetaWarning };
}
