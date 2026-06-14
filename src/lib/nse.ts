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

async function getCachedData<T>(symbol: string, dataType: string): Promise<T | null> {
  try {
    const cached = await prisma.stockCache.findUnique({
      where: { symbol_exchange_dataType: { symbol, exchange: 'NSE', dataType } },
    });
    if (cached && cached.expiresAt > new Date()) {
      return cached.data as unknown as T;
    }
  } catch {
    // cache miss is fine
  }
  return null;
}

async function setCachedData(symbol: string, dataType: string, data: unknown, ttlMinutes: number) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  try {
    await prisma.stockCache.upsert({
      where: { symbol_exchange_dataType: { symbol, exchange: 'NSE', dataType } },
      create: { symbol, exchange: 'NSE', dataType, data: data as never, expiresAt },
      update: { data: data as never, expiresAt, fetchedAt: new Date() },
    });
  } catch {
    // cache write failure is non-fatal
  }
}

export interface IpoEntry {
  symbol: string;
  companyName: string;
  series?: string;
  issueStartDate: string;
  issueEndDate: string;
  issueSize?: string;
  status: string;
}

export interface IpoListResult {
  active: IpoEntry[];
  upcoming: IpoEntry[];
  recent: IpoEntry[];
  fetchedAt: string;
}

const IPO_CACHE_KEY = '__IPO__';
const IPO_DATA_TYPE = 'ipo_list';
const IPO_TTL_MIN = 6 * 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseIpoEntry(raw: any): IpoEntry | null {
  const symbol = raw.symbol ?? raw.scriptCode ?? raw.series ?? '';
  const companyName = raw.companyName ?? raw.issuerName ?? raw.name ?? symbol;
  const issueStartDate = raw.issueStartDate ?? raw.startDate ?? raw.biddingStartDate ?? '';
  const issueEndDate = raw.issueEndDate ?? raw.endDate ?? raw.biddingEndDate ?? '';
  const status = (raw.status ?? raw.series ?? '').toString();
  if (!companyName) return null;
  return {
    symbol: symbol.toString(),
    companyName: companyName.toString(),
    series: raw.series?.toString(),
    issueStartDate: issueStartDate.toString(),
    issueEndDate: issueEndDate.toString(),
    issueSize: raw.issueSize?.toString(),
    status,
  };
}

export async function fetchIpoList(): Promise<IpoListResult> {
  const cached = await getCachedData<IpoListResult>(IPO_CACHE_KEY, IPO_DATA_TYPE);
  if (cached) return cached;

  const cookies = await getNseCookies();
  const res = await fetch('https://www.nseindia.com/api/all-upcoming-issues?category=ipo', {
    headers: {
      ...BROWSER_HEADERS,
      Cookie: cookies,
      Referer: 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo',
    },
  });

  if (!res.ok) {
    throw new Error(`NSE IPO list request failed: ${res.status}`);
  }

  const raw = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.rows ?? []);
  if (!rows.length) {
    throw new Error('NSE IPO list returned no data');
  }

  const now = Date.now();
  const active: IpoEntry[] = [];
  const upcoming: IpoEntry[] = [];
  const recent: IpoEntry[] = [];

  for (const r of rows) {
    const entry = parseIpoEntry(r);
    if (!entry) continue;

    const start = entry.issueStartDate ? new Date(entry.issueStartDate.split('-').reverse().join('-')).getTime() : NaN;
    const end = entry.issueEndDate ? new Date(entry.issueEndDate.split('-').reverse().join('-')).getTime() : NaN;
    const statusLower = entry.status.toLowerCase();

    if (statusLower.includes('active') || (!isNaN(start) && !isNaN(end) && now >= start && now <= end)) {
      active.push(entry);
    } else if (!isNaN(start) && start > now) {
      upcoming.push(entry);
    } else {
      recent.push(entry);
    }
  }

  if (!active.length && !upcoming.length && !recent.length) {
    throw new Error('NSE IPO list could not be parsed');
  }

  const result: IpoListResult = { active, upcoming, recent, fetchedAt: new Date().toISOString() };
  await setCachedData(IPO_CACHE_KEY, IPO_DATA_TYPE, result, IPO_TTL_MIN);
  return result;
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

export interface FiiDiiEntry {
  category: string; // 'FII' or 'DII'
  date: string;
  buyValue: number;
  sellValue: number;
  netValue: number;
}

const FIIDII_CACHE_KEY = '__FIIDII__';
const FIIDII_DATA_TYPE = 'fii_dii_activity';
const FIIDII_TTL_MIN = 60;

export async function fetchFiiDiiActivity(): Promise<FiiDiiEntry[]> {
  const cached = await getCachedData<FiiDiiEntry[]>(FIIDII_CACHE_KEY, FIIDII_DATA_TYPE);
  if (cached) return cached;

  const cookies = await getNseCookies();
  const res = await fetch('https://www.nseindia.com/api/fiidiiTradeReact', {
    headers: {
      ...BROWSER_HEADERS,
      Cookie: cookies,
      Referer: 'https://www.nseindia.com/reports/fii-dii',
    },
  });

  if (!res.ok) {
    throw new Error(`NSE FII/DII request failed: ${res.status}`);
  }

  const raw = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
  if (!rows.length) {
    throw new Error('NSE FII/DII returned no data');
  }

  const entries: FiiDiiEntry[] = rows.map(r => ({
    category: (r.category ?? r.fiiDii ?? '').toString(),
    date: (r.date ?? r.tradeDate ?? '').toString(),
    buyValue: Number(r.buyValue ?? r.grossPurchase ?? 0),
    sellValue: Number(r.sellValue ?? r.grossSales ?? 0),
    netValue: Number(r.netValue ?? r.netPurchaseSales ?? 0),
  })).filter(e => e.category);

  if (!entries.length) {
    throw new Error('NSE FII/DII could not be parsed');
  }

  await setCachedData(FIIDII_CACHE_KEY, FIIDII_DATA_TYPE, entries, FIIDII_TTL_MIN);
  return entries;
}

export interface EarningsEntry {
  symbol: string;
  companyName: string;
  date: string;
  purpose: string;
}

const EARNINGS_CACHE_KEY = '__EARNINGS__';
const EARNINGS_DATA_TYPE = 'earnings_calendar';
const EARNINGS_TTL_MIN = 6 * 60;

export async function fetchEarningsCalendar(): Promise<EarningsEntry[]> {
  const cached = await getCachedData<EarningsEntry[]>(EARNINGS_CACHE_KEY, EARNINGS_DATA_TYPE);
  if (cached) return cached;

  const cookies = await getNseCookies();
  const res = await fetch('https://www.nseindia.com/api/corporate-board-meetings?index=equities', {
    headers: {
      ...BROWSER_HEADERS,
      Cookie: cookies,
      Referer: 'https://www.nseindia.com/companies-listing/corporate-filings-board-meetings',
    },
  });

  if (!res.ok) {
    throw new Error(`NSE earnings calendar request failed: ${res.status}`);
  }

  const raw = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.rows ?? []);
  if (!rows.length) {
    throw new Error('NSE earnings calendar returned no data');
  }

  const entries: EarningsEntry[] = rows.map(r => ({
    symbol: (r.bm_symbol ?? r.symbol ?? '').toString(),
    companyName: (r.sm_name ?? r.bm_desc ?? r.companyName ?? r.bm_symbol ?? r.symbol ?? '').toString(),
    date: (r.bm_date ?? r.boardMeetingDate ?? r.date ?? '').toString(),
    purpose: (r.bm_purpose ?? r.purpose ?? '').toString(),
  })).filter(e => e.symbol && e.date);

  if (!entries.length) {
    throw new Error('NSE earnings calendar could not be parsed');
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));

  await setCachedData(EARNINGS_CACHE_KEY, EARNINGS_DATA_TYPE, entries, EARNINGS_TTL_MIN);
  return entries;
}

export interface BulkBlockDeal {
  symbol: string;
  clientName: string;
  dealType: string; // 'BUY' or 'SELL'
  quantity: number;
  price: number;
  date: string;
  dealCategory: 'bulk' | 'block';
}

const DEALS_CACHE_KEY = '__BULKDEALS__';
const DEALS_DATA_TYPE = 'bulk_block_deals';
const DEALS_TTL_MIN = 6 * 60;

function formatNseDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDealRows(rows: any[], category: 'bulk' | 'block'): BulkBlockDeal[] {
  return rows.map(r => ({
    symbol: (r.symbol ?? r.SYMBOL ?? '').toString(),
    clientName: (r.clientName ?? r.CLIENT_NAME ?? '').toString(),
    dealType: (r.buySell ?? r.BUY_SELL ?? '').toString().toUpperCase(),
    quantity: Number(r.quantityTraded ?? r.QUANTITY_TRADED ?? 0),
    price: Number(r.tradePrice ?? r.TRADE_PRICE ?? r.wAvgPrice ?? 0),
    date: (r.date ?? r.DATE ?? '').toString(),
    dealCategory: category,
  })).filter(d => d.symbol);
}

export async function fetchBulkBlockDeals(): Promise<BulkBlockDeal[]> {
  const cached = await getCachedData<BulkBlockDeal[]>(DEALS_CACHE_KEY, DEALS_DATA_TYPE);
  if (cached) return cached;

  const cookies = await getNseCookies();
  const to = new Date();
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fromStr = formatNseDate(from);
  const toStr = formatNseDate(to);

  const headers = {
    ...BROWSER_HEADERS,
    Cookie: cookies,
    Referer: 'https://www.nseindia.com/report-detail/display-bulk-and-block-deals',
  };

  const [bulkResult, blockResult] = await Promise.allSettled([
    fetch(`https://www.nseindia.com/api/historical/bulk-deals?from=${fromStr}&to=${toStr}`, { headers }).then(r => {
      if (!r.ok) throw new Error(`bulk-deals failed: ${r.status}`);
      return r.json();
    }),
    fetch(`https://www.nseindia.com/api/historical/block-deals?from=${fromStr}&to=${toStr}`, { headers }).then(r => {
      if (!r.ok) throw new Error(`block-deals failed: ${r.status}`);
      return r.json();
    }),
  ]);

  let deals: BulkBlockDeal[] = [];

  if (bulkResult.status === 'fulfilled') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = bulkResult.value?.data ?? bulkResult.value ?? [];
    if (Array.isArray(rows)) deals = deals.concat(parseDealRows(rows, 'bulk'));
  }

  if (blockResult.status === 'fulfilled') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = blockResult.value?.data ?? blockResult.value ?? [];
    if (Array.isArray(rows)) deals = deals.concat(parseDealRows(rows, 'block'));
  }

  if (bulkResult.status === 'rejected' && blockResult.status === 'rejected') {
    throw new Error('NSE bulk/block deals request failed');
  }

  if (!deals.length) {
    throw new Error('NSE bulk/block deals returned no data');
  }

  await setCachedData(DEALS_CACHE_KEY, DEALS_DATA_TYPE, deals, DEALS_TTL_MIN);
  return deals;
}
