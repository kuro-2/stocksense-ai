import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type { AnalysisResult } from '@/types/stock';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

const SYSTEM_PROMPT = `You are an expert Indian stock market analyst
specializing in NSE/BSE equities and Futures & Options. You provide
specific, data-driven investment recommendations for Indian retail investors.

You will receive pre-computed technical data about a stock. Use your
general knowledge of the company, sector, and market conditions.

CRITICAL: Your response must be ONLY a valid JSON object.
No markdown, no explanation, no preamble, no backticks.
Start your response directly with { and end with }.

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
  "foTips": "specific F&O tip in plain language a beginner can understand",
  "foExpiry": "nearest monthly expiry date string or null",
  "foStrike": nearest round number strike price or null,
  "risks": ["risk 1", "risk 2", "risk 3"],
  "newsHighlights": ["headline 1", "headline 2"],
  "trend": "BULLISH or BEARISH or NEUTRAL"
}

Guidelines:
- targetPrice should be realistic, within 15-20% of current price for BUY
- stopLoss should be 5-8% below current price for BUY recommendations
- Recommend AVOID_FO for volatile stocks, mid/small caps, or uncertain situations
- Explain F&O tips in plain language, a beginner must understand it
- Be honest about risks, do not oversell any stock`;

interface RetryInfo {
  '@type': string;
  retryDelay?: string;
}

function getRetryDelayMs(error: unknown, fallbackMs: number): number {
  const details = (error as { errorDetails?: RetryInfo[] }).errorDetails;
  const retryInfo = details?.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
  const seconds = retryInfo?.retryDelay ? parseFloat(retryInfo.retryDelay) : NaN;
  return Number.isFinite(seconds) ? seconds * 1000 : fallbackMs;
}

async function generateWithRetry(model: GenerativeModel, prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const status = (error as { status?: number }).status;
      if ((status === 503 || status === 429) && attempt < retries) {
        const delayMs = getRetryDelayMs(error, 1000 * (attempt + 1));
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
}

export async function analyzeStock(input: AnalysisInput): Promise<Partial<AnalysisResult>> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = `
Analyze this NSE stock for investment:

Company: ${input.stockName} (${input.symbol})
Current Price: ₹${input.currentPrice}
Today's Change: ${input.changePercent > 0 ? '+' : ''}${input.changePercent.toFixed(2)}%
52-Week High: ₹${input.week52High} | 52-Week Low: ₹${input.week52Low}
Market Cap: ₹${(input.marketCap / 10000000).toFixed(0)} Crore
P/E Ratio: ${input.pe ?? 'N/A'}
Sector: ${input.sector}

TECHNICAL INDICATORS (pre-computed):
RSI (14): ${input.rsi} — ${input.rsiInterpretation}
20-Day SMA: ₹${input.sma20} | 50-Day SMA: ₹${input.sma50} | 200-Day SMA: ₹${input.sma200}
Price vs 200 SMA: ${input.currentPrice > input.sma200 ? 'ABOVE (bullish)' : 'BELOW (bearish)'}
Support: ₹${input.support} | Resistance: ₹${input.resistance}

Based on your general knowledge of this company, recent earnings trends,
and sector outlook, provide your full analysis.
`.trim();

  const text = await generateWithRetry(model, prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Gemini raw response:', text);
    throw new Error('No JSON found in Gemini response');
  }

  return JSON.parse(jsonMatch[0]) as Partial<AnalysisResult>;
}
