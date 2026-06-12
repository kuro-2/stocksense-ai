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
