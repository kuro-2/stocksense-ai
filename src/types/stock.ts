export type Recommendation = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type Trend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export type FoStrategy = 'BUY_CALL' | 'BUY_PUT' | 'SELL_CALL' | 'SELL_PUT' | 'AVOID_FO';
export type MarketCap = 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP';

export interface AnalysisResult {
  analysisId: string;
  stockName: string;
  symbol: string;
  exchange: string;
  sector: string;
  marketCap: MarketCap;
  currentPrice: number;
  changePercent: number;
  changeDirection: 'up' | 'down';
  recommendation: Recommendation;
  confidence: Confidence;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  summary: string;
  reasoning: string;
  foStrategy: FoStrategy;
  foTips: string;
  foExpiry: string | null;
  foStrike: number | null;
  foDataSource?: 'NSE_LIVE' | 'AI_ESTIMATE';
  thetaWarning?: string | null;
  indiaVix?: number | null;
  pcr?: number | null;
  maxPain?: number | null;
  atmIV?: number | null;
  risks: string[];
  newsHighlights: string[];
  newsSource?: 'live' | 'ai';
  support: number;
  resistance: number;
  rsi: number;
  rsiInterpretation: string;
  trend: Trend;
  sma20: number;
  sma50: number;
  sma200: number;
  mutualFundEstimate?: {
    trendDescription: string;
    trendDirection: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  } | null;
  mfDataSource?: 'AI_ESTIMATE';
  generatedAt: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  pe: number | null;
  week52High: number;
  week52Low: number;
  sector: string;
  fetchedAt: string;
  cached: boolean;
}

export interface OHLCVPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}
