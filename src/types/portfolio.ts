export interface Position {
  symbol: string;
  stockName: string;
  exchange: string;
  instrumentType: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface Trade {
  id: string;
  symbol: string;
  stockName: string;
  tradeType: 'BUY' | 'SELL';
  instrumentType: string;
  quantity: number;
  price: number;
  totalValue: number;
  executedAt: string;
  notes?: string;
}

export interface PortfolioSummary {
  portfolioId: string;
  virtualCash: number;
  totalInvested: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
  positions: Position[];
}

export interface TradeInput {
  symbol: string;
  stockName: string;
  tradeType: 'BUY' | 'SELL';
  instrumentType: string;
  quantity: number;
  price: number;
  notes?: string;
}
