export interface MarketSymbol {
  symbol: string;
  yahoo: string;
  name: string;
}

// Major indices — analyzed like a stock but without market cap / P/E / sector
export const INDICES: MarketSymbol[] = [
  { symbol: 'NIFTY50', yahoo: '^NSEI', name: 'Nifty 50' },
  { symbol: 'BANKNIFTY', yahoo: '^NSEBANK', name: 'Nifty Bank' },
  { symbol: 'SENSEX', yahoo: '^BSESN', name: 'Sensex' },
  { symbol: 'INDIAVIX', yahoo: '^INDIAVIX', name: 'India VIX' },
];

// Sector indices — for the "Markets" / sector-rotation view
export const SECTOR_INDICES: MarketSymbol[] = [
  { symbol: 'NIFTYIT', yahoo: '^CNXIT', name: 'Nifty IT' },
  { symbol: 'NIFTYAUTO', yahoo: '^CNXAUTO', name: 'Nifty Auto' },
  { symbol: 'NIFTYPHARMA', yahoo: '^CNXPHARMA', name: 'Nifty Pharma' },
  { symbol: 'NIFTYFMCG', yahoo: '^CNXFMCG', name: 'Nifty FMCG' },
  { symbol: 'NIFTYMETAL', yahoo: '^CNXMETAL', name: 'Nifty Metal' },
  { symbol: 'NIFTYREALTY', yahoo: '^CNXREALTY', name: 'Nifty Realty' },
  { symbol: 'NIFTYENERGY', yahoo: '^CNXENERGY', name: 'Nifty Energy' },
];

const ALL_MARKET_SYMBOLS = [...INDICES, ...SECTOR_INDICES];

// Returns the Yahoo Finance symbol to use for a given app symbol.
// Indices/sector indices use their raw Yahoo ticker (e.g. ^NSEI); everything else gets ".NS".
export function resolveYahooSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  const found = ALL_MARKET_SYMBOLS.find(m => m.symbol === upper);
  if (found) return found.yahoo;
  return `${upper}.NS`;
}

export function isIndexSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  return ALL_MARKET_SYMBOLS.some(m => m.symbol === upper);
}

export function getMarketSymbolInfo(symbol: string): MarketSymbol | undefined {
  const upper = symbol.toUpperCase();
  return ALL_MARKET_SYMBOLS.find(m => m.symbol === upper);
}

// Nifty 50 constituents (NSE symbols, no suffix) — used by the Screener
export const NIFTY50_SYMBOLS: string[] = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'BHARTIARTL', 'ITC', 'LT',
  'KOTAKBANK', 'SBIN', 'HINDUNILVR', 'AXISBANK', 'BAJFINANCE', 'MARUTI', 'M&M',
  'SUNPHARMA', 'TATAMOTORS', 'HCLTECH', 'ULTRACEMCO', 'TITAN', 'ADANIENT',
  'ADANIPORTS', 'ASIANPAINT', 'BAJAJFINSV', 'WIPRO', 'NESTLEIND', 'NTPC',
  'POWERGRID', 'JSWSTEEL', 'TATASTEEL', 'GRASIM', 'HINDALCO', 'TECHM', 'CIPLA',
  'DRREDDY', 'EICHERMOT', 'BRITANNIA', 'COALINDIA', 'BPCL', 'ONGC', 'TATACONSUM',
  'APOLLOHOSP', 'DIVISLAB', 'HEROMOTOCO', 'INDUSINDBK', 'BAJAJ-AUTO', 'SBILIFE',
  'HDFCLIFE', 'SHRIRAMFIN', 'TRENT',
];

// NSE F&O-eligible stocks beyond the Nifty 50 (Nifty Next 50 / Nifty 100 / other
// liquid large & mid caps with listed equity-derivative contracts). Used to
// decide whether the F&O Strategy Builder should be offered at all — this is a
// static list so it works even when the live NSE option-chain endpoint is
// unreachable. Not exhaustive, but covers the vast majority of stocks users
// are likely to search for.
export const ADDITIONAL_FNO_SYMBOLS: string[] = [
  'ABB', 'ABCAPITAL', 'ABFRL', 'ACC', 'ALKEM', 'AMBUJACEM', 'ANGELONE', 'APLAPOLLO',
  'ASHOKLEY', 'ASTRAL', 'AUBANK', 'AUROPHARMA', 'BALKRISIND', 'BANDHANBNK',
  'BANKBARODA', 'BANKINDIA', 'BERGEPAINT', 'BHARATFORG', 'BHEL', 'BIOCON',
  'BOSCHLTD', 'BSE', 'CAMS', 'CANBK', 'CANFINHOME', 'CDSL', 'CGPOWER', 'CHAMBLFERT',
  'CHOLAFIN', 'COFORGE', 'COLPAL', 'CONCOR', 'COROMANDEL', 'CROMPTON', 'CUMMINSIND',
  'CYIENT', 'DABUR', 'DALBHARAT', 'DELHIVERY', 'DIXON', 'DLF', 'DMART', 'ESCORTS',
  'EXIDEIND', 'FEDERALBNK', 'GAIL', 'GLENMARK', 'GMRINFRA', 'GNFC', 'GODREJCP',
  'GODREJPROP', 'GRANULES', 'GUJGASLTD', 'HAL', 'HAVELLS', 'HDFCAMC', 'HFCL',
  'HINDCOPPER', 'HINDPETRO', 'HUDCO', 'ICICIGI', 'ICICIPRULI', 'IDEA', 'IDFCFIRSTB',
  'IEX', 'IGL', 'INDHOTEL', 'INDIACEM', 'INDIAMART', 'INDIGO', 'INDUSTOWER', 'IOC',
  'IRB', 'IRCTC', 'IRFC', 'JINDALSTEL', 'JKCEMENT', 'JSWENERGY', 'JUBLFOOD',
  'KALYANKJIL', 'KEI', 'LALPATHLAB', 'LAURUSLABS', 'LICHSGFIN', 'LICI', 'LODHA',
  'LTF', 'LTIM', 'LTTS', 'LUPIN', 'M&MFIN', 'MANAPPURAM', 'MARICO', 'MAXHEALTH',
  'MAZDOCK', 'MCX', 'METROPOLIS', 'MFSL', 'MGL', 'MOTHERSON', 'MPHASIS', 'MRF',
  'MUTHOOTFIN', 'NATIONALUM', 'NAUKRI', 'NBCC', 'NCC', 'NHPC', 'NMDC', 'NYKAA',
  'OBEROIRLTY', 'OFSS', 'OIL', 'PAGEIND', 'PATANJALI', 'PAYTM', 'PEL', 'PERSISTENT',
  'PETRONET', 'PFC', 'PIDILITIND', 'PIIND', 'PNB', 'PNBHOUSING', 'POLICYBZR',
  'POLYCAB', 'PRESTIGE', 'RAMCOCEM', 'RBLBANK', 'RECLTD', 'RVNL', 'SAIL', 'SBICARD',
  'SHREECEM', 'SIEMENS', 'SJVN', 'SOLARINDS', 'SONACOMS', 'SRF', 'STAR',
  'SUNDARMFIN', 'SUPREMEIND', 'SUZLON', 'SYNGENE', 'TATACHEM', 'TATACOMM',
  'TATAELXSI', 'TATAPOWER', 'TIINDIA', 'TORNTPHARM', 'TORNTPOWER', 'TVSMOTOR',
  'UBL', 'UNIONBANK', 'UNITDSPR', 'UPL', 'VEDL', 'VOLTAS', 'WHIRLPOOL', 'YESBANK',
  'ZEEL', 'ZOMATO', 'ZYDUSLIFE',
];

const FNO_ELIGIBLE_SYMBOLS = new Set([...NIFTY50_SYMBOLS, ...ADDITIONAL_FNO_SYMBOLS]);

// Index symbols (from INDICES above) that have their own listed F&O contracts.
const FNO_ELIGIBLE_INDICES = new Set(['NIFTY50', 'BANKNIFTY']);

// Whether `symbol` has listed F&O (futures & options) contracts on the NSE.
// This is a static check — it stays correct even when the live NSE
// option-chain endpoint is temporarily unreachable.
export function isFnoEligible(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  if (isIndexSymbol(upper)) return FNO_ELIGIBLE_INDICES.has(upper);
  return FNO_ELIGIBLE_SYMBOLS.has(upper);
}
