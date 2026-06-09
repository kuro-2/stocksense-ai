import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult } from '@/types/stock';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface AnalysisInput {
  stockName: string;
  symbol: string;
  currentPrice: number;
  changePercent: number;
  week52High: number;
  week52Low: number;
  marketCap: number;
  pe: number | null;
  rsi: number;
  rsiInterpretation: string;
  support: number;
  resistance: number;
  sma20: number;
  sma50: number;
  sma200: number;
  sector: string;
}

const SYSTEM_PROMPT = `You are an expert Indian stock market analyst specializing in NSE/BSE equities and Futures & Options. You provide specific, data-driven investment recommendations.

You will receive pre-computed technical data about a stock. Use the web search tool to find:
1. Recent news (last 7 days) about this company
2. Analyst ratings or price targets if available
3. Recent earnings or major events

After searching, synthesize everything into a structured JSON response.

CRITICAL: Your response must be ONLY a valid JSON object. No markdown, no explanation, no preamble. Start your response with { and end with }.

JSON Schema:
{
  "stockName": "full official company name",
  "symbol": "NSE symbol without .NS",
  "exchange": "NSE",
  "sector": "sector name",
  "marketCap": "LARGE_CAP or MID_CAP or SMALL_CAP",
  "recommendation": "STRONG_BUY or BUY or HOLD or SELL or STRONG_SELL",
  "confidence": "HIGH or MEDIUM or LOW",
  "targetPrice": number,
  "stopLoss": number,
  "timeframe": "e.g. 3-6 months",
  "summary": "2-3 sentence executive summary for a beginner investor",
  "reasoning": "3-4 sentence detailed analysis mentioning specific data points",
  "foStrategy": "BUY_CALL or BUY_PUT or SELL_CALL or SELL_PUT or AVOID_FO",
  "foTips": "specific F&O tip mentioning strike, expiry, current premium",
  "foExpiry": "date string or null",
  "foStrike": number or null,
  "risks": ["risk 1", "risk 2", "risk 3"],
  "newsHighlights": ["headline 1", "headline 2"],
  "trend": "BULLISH or BEARISH or NEUTRAL"
}

Guidelines:
- targetPrice should be realistic (within 15-20% of current price for BUY)
- stopLoss should be 5-8% below current price for BUY recommendations
- Recommend AVOID_FO for high-risk, mid/small caps, or volatile situations
- Explain F&O tips in plain language a beginner can understand
- Be honest about risks — don't oversell`;

export async function analyzeStock(input: AnalysisInput): Promise<Partial<AnalysisResult>> {
  const userMessage = `Analyze this NSE stock for investment:

Company: ${input.stockName} (${input.symbol})
Current Price: ₹${input.currentPrice}
Today's Change: ${input.changePercent > 0 ? '+' : ''}${input.changePercent.toFixed(2)}%
52-Week High: ₹${input.week52High} | 52-Week Low: ₹${input.week52Low}
Market Cap: ₹${(input.marketCap / 10000000).toFixed(0)} Crore
P/E Ratio: ${input.pe ?? 'N/A'}
Sector: ${input.sector}

TECHNICAL INDICATORS (already computed):
RSI (14): ${input.rsi} — ${input.rsiInterpretation}
20-Day SMA: ₹${input.sma20} | 50-Day SMA: ₹${input.sma50} | 200-Day SMA: ₹${input.sma200}
Price vs 200 SMA: ${input.currentPrice > input.sma200 ? 'ABOVE (bullish)' : 'BELOW (bearish)'}
Support: ₹${input.support} | Resistance: ₹${input.resistance}

Please search for recent news and analyst commentary, then provide your complete analysis.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlocks = response.content.filter(b => b.type === 'text');
  const lastText = textBlocks[textBlocks.length - 1];
  if (!lastText || lastText.type !== 'text') {
    throw new Error('No text response from AI');
  }

  const jsonMatch = lastText.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in AI response');

  return JSON.parse(jsonMatch[0]) as Partial<AnalysisResult>;
}
