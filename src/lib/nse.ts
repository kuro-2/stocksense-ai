import { prisma } from './prisma';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Accept: 'application/json, text/plain, */*',
};

const CACHE_DATA_TYPE = 'option_chain';
const CACHE_TTL_MIN = 5;

async function getCachedOptionChain(symbol: string): Promise<OptionChainResult | null> {
  try {
    const cached = await prisma.stockCache.findUnique({
      where: { symbol_exchange_dataType: { symbol, exchange: 'NSE', dataType: CACHE_DATA_TYPE } },
    });
    if (cached && cached.expiresAt > new Date()) {
      return cached.data as unknown as OptionChainResult;
    }
  } catch {
    // cache miss is fine
  }
  return null;
}

async function setCachedOptionChain(symbol: string, data: OptionChainResult) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_MIN * 60 * 1000);
  try {
    await prisma.stockCache.upsert({
      where: { symbol_exchange_dataType: { symbol, exchange: 'NSE', dataType: CACHE_DATA_TYPE } },
      create: { symbol, exchange: 'NSE', dataType: CACHE_DATA_TYPE, data: data as never, expiresAt },
      update: { data: data as never, expiresAt, fetchedAt: new Date() },
    });
  } catch {
    // cache write failure is non-fatal
  }
}

async function getNseCookies(): Promise<string> {
  const res = await fetch('https://www.nseindia.com', {
    headers: BROWSER_HEADERS,
  });
  const setCookie = res.headers.get('set-cookie') ?? '';
  // Multiple cookies may arrive concatenated; keep the raw header — Node's fetch
  // merges Set-Cookie into one comma-joined string, so split on ", " between cookie pairs.
  return setCookie
    .split(/,(?=\s*[a-zA-Z0-9_]+=)/)
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

interface RawOptionData {
  strikePrice: number;
  expiryDate: string;
  CE?: { openInterest: number; changeinOpenInterest: number; impliedVolatility: number; lastPrice: number };
  PE?: { openInterest: number; changeinOpenInterest: number; impliedVolatility: number; lastPrice: number };
}

interface RawOptionChainResponse {
  records: {
    underlyingValue: number;
    expiryDates: string[];
    data: RawOptionData[];
  };
}

export interface OptionChainStrike {
  strikePrice: number;
  ce: { oi: number; changeOi: number; iv: number; ltp: number } | null;
  pe: { oi: number; changeOi: number; iv: number; ltp: number } | null;
}

export interface OptionChainResult {
  symbol: string;
  underlyingValue: number;
  expiryDate: string;
  strikes: OptionChainStrike[];
  pcr: number;
  maxPain: number;
  fetchedAt: string;
}

function parseOptionChain(raw: RawOptionChainResponse, symbol: string): OptionChainResult {
  const nearestExpiry = raw.records.expiryDates[0];
  const rows = raw.records.data.filter(d => d.expiryDate === nearestExpiry);

  let totalCallOi = 0;
  let totalPutOi = 0;

  const strikes: OptionChainStrike[] = rows
    .map(row => {
      const ce = row.CE
        ? { oi: row.CE.openInterest, changeOi: row.CE.changeinOpenInterest, iv: row.CE.impliedVolatility, ltp: row.CE.lastPrice }
        : null;
      const pe = row.PE
        ? { oi: row.PE.openInterest, changeOi: row.PE.changeinOpenInterest, iv: row.PE.impliedVolatility, ltp: row.PE.lastPrice }
        : null;
      if (ce) totalCallOi += ce.oi;
      if (pe) totalPutOi += pe.oi;
      return { strikePrice: row.strikePrice, ce, pe };
    })
    .sort((a, b) => a.strikePrice - b.strikePrice);

  const pcr = totalCallOi > 0 ? Math.round((totalPutOi / totalCallOi) * 100) / 100 : 0;

  // Max pain: the strike where total option-writer loss (sum of ITM OI * intrinsic value) is minimized.
  let maxPain = strikes[0]?.strikePrice ?? 0;
  let minLoss = Infinity;
  for (const candidate of strikes) {
    let loss = 0;
    for (const s of strikes) {
      if (s.ce && candidate.strikePrice > s.strikePrice) {
        loss += (candidate.strikePrice - s.strikePrice) * s.ce.oi;
      }
      if (s.pe && candidate.strikePrice < s.strikePrice) {
        loss += (s.strikePrice - candidate.strikePrice) * s.pe.oi;
      }
    }
    if (loss < minLoss) {
      minLoss = loss;
      maxPain = candidate.strikePrice;
    }
  }

  return {
    symbol,
    underlyingValue: raw.records.underlyingValue,
    expiryDate: nearestExpiry,
    strikes,
    pcr,
    maxPain,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchOptionChain(symbol: string, isIndex: boolean): Promise<OptionChainResult> {
  const cached = await getCachedOptionChain(symbol);
  if (cached) return cached;

  const cookies = await getNseCookies();
  const endpoint = isIndex ? 'option-chain-indices' : 'option-chain-equities';
  const res = await fetch(`https://www.nseindia.com/api/${endpoint}?symbol=${encodeURIComponent(symbol)}`, {
    headers: {
      ...BROWSER_HEADERS,
      Cookie: cookies,
      Referer: 'https://www.nseindia.com/option-chain',
    },
  });

  if (!res.ok) {
    throw new Error(`NSE option chain request failed: ${res.status}`);
  }

  const raw = (await res.json()) as RawOptionChainResponse;
  if (!raw?.records?.data?.length) {
    throw new Error('NSE option chain returned no data');
  }

  const result = parseOptionChain(raw, symbol);
  await setCachedOptionChain(symbol, result);
  return result;
}
