import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type { AnalysisResult, FoStrategy } from '@/types/stock';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface FnoPromptContext {
  hasFnO: boolean;
  allowedStrategies: FoStrategy[];
  candidateStrategy: FoStrategy;
  ruleReason: string;
  indiaVix: number | null;
  atmIV: number | null;
  pcr: number | null;
  maxPain: number | null;
  nearestExpiry: string | null;
}

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
  isIndex?: boolean;
  fno?: FnoPromptContext;
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
- Be honest about risks, do not oversell any stock

F&O RULES (when F&O market data is provided in the prompt):
- foStrategy MUST be chosen from the "Allowed F&O strategies" list given in the prompt — AVOID_FO is always allowed
- Use India VIX, ATM implied volatility, PCR and Max Pain to justify your choice and to write foTips
- If "Allowed F&O strategies" is just AVOID_FO, you MUST set foStrategy to AVOID_FO, foStrike to null and foExpiry to null
- Check your foStrategy against your own "recommendation" — a SELL/STRONG_SELL equity recommendation must not pair with a bullish F&O strategy (BUY_CALL/SELL_PUT), and a BUY/STRONG_BUY recommendation must not pair with a bearish F&O strategy (BUY_PUT/SELL_CALL)`;

interface RetryInfo {
  '@type': string;
  retryDelay?: string;
  violations?: Array<{ quotaId?: string }>;
}

function getRetryDelayMs(error: unknown, fallbackMs: number): number {
  const details = (error as { errorDetails?: RetryInfo[] }).errorDetails;
  const retryInfo = details?.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
  const seconds = retryInfo?.retryDelay ? parseFloat(retryInfo.retryDelay) : NaN;
  return Number.isFinite(seconds) ? seconds * 1000 : fallbackMs;
}

// Daily quota exhaustion (PerDay) can't be fixed by retrying — only per-minute rate limits can.
function isDailyQuotaExhausted(error: unknown): boolean {
  const details = (error as { errorDetails?: RetryInfo[] }).errorDetails;
  const quotaFailure = details?.find(d => d['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure');
  return quotaFailure?.violations?.some(v => v.quotaId?.includes('PerDay')) ?? false;
}

async function generateWithRetry(model: GenerativeModel, prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 429 && isDailyQuotaExhausted(error)) throw error;
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

  const subject = input.isIndex
    ? `Analyze this Indian market index for trading/investment outlook:

Index: ${input.stockName} (${input.symbol})`
    : `Analyze this NSE stock for investment:

Company: ${input.stockName} (${input.symbol})`;

  const fundamentals = input.isIndex
    ? ''
    : `Market Cap: ₹${(input.marketCap / 10000000).toFixed(0)} Crore
P/E Ratio: ${input.pe ?? 'N/A'}
Sector: ${input.sector}
`;

  const closingNote = input.isIndex
    ? `This is an INDEX, not a single company — base "sector" on "Index", set marketCap to "LARGE_CAP",
and frame the F&O strategy in terms of index options (e.g. NIFTY/BANKNIFTY weekly/monthly options),
not single-stock options. Reasoning should focus on overall market breadth, FII/DII flows,
global cues, and macro factors rather than company fundamentals.`
    : `Based on your general knowledge of this company, recent earnings trends,
and sector outlook, provide your full analysis.`;

  const fno = input.fno;
  const fnoSection = !fno
    ? ''
    : !fno.hasFnO
    ? `

F&O MARKET DATA: This symbol has no listed F&O contracts on the NSE.
Allowed F&O strategies: AVOID_FO
You MUST set foStrategy to "AVOID_FO", foStrike to null and foExpiry to null.`
    : `

F&O MARKET DATA (live NSE option chain, nearest expiry ${fno.nearestExpiry ?? 'N/A'}):
India VIX: ${fno.indiaVix ?? 'N/A'}${fno.indiaVix !== null ? (fno.indiaVix >= 18 ? ' (elevated — favor premium-selling strategies)' : fno.indiaVix < 13 ? ' (low — option buying is relatively cheap)' : ' (normal)') : ''}
At-the-money Implied Volatility: ${fno.atmIV ?? 'N/A'}%
Put-Call Ratio (PCR): ${fno.pcr ?? 'N/A'}
Max Pain: ${fno.maxPain !== null ? `₹${fno.maxPain}` : 'N/A'}
Allowed F&O strategies: ${fno.allowedStrategies.join(', ')}
Rule-based suggestion: ${fno.candidateStrategy} — ${fno.ruleReason}

Choose foStrategy ONLY from the allowed list above. If you pick a strategy other than AVOID_FO, set foExpiry to "${fno.nearestExpiry}".`;

  const prompt = `
${subject}
Current Price: ₹${input.currentPrice}
Today's Change: ${input.changePercent > 0 ? '+' : ''}${input.changePercent.toFixed(2)}%
52-Week High: ₹${input.week52High} | 52-Week Low: ₹${input.week52Low}
${fundamentals}
TECHNICAL INDICATORS (pre-computed):
RSI (14): ${input.rsi} — ${input.rsiInterpretation}
20-Day SMA: ₹${input.sma20} | 50-Day SMA: ₹${input.sma50} | 200-Day SMA: ₹${input.sma200}
Price vs 200 SMA: ${input.currentPrice > input.sma200 ? 'ABOVE (bullish)' : 'BELOW (bearish)'}
Support: ₹${input.support} | Resistance: ₹${input.resistance}
${fnoSection}

${closingNote}
`.trim();

  const text = await generateWithRetry(model, prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Gemini raw response:', text);
    throw new Error('No JSON found in Gemini response');
  }

  return JSON.parse(jsonMatch[0]) as Partial<AnalysisResult>;
}

interface IndexQuote {
  name: string;
  price: number;
  changePercent: number;
}

export async function getMarketOutlook(indices: IndexQuote[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const summary = indices
    .map(i => `${i.name}: ${i.price.toLocaleString('en-IN')} (${i.changePercent > 0 ? '+' : ''}${i.changePercent.toFixed(2)}%)`)
    .join(', ');

  const prompt = `You are writing a short "today's market outlook" note for Indian retail investors.
Here is today's snapshot of major indices: ${summary}.
In 2-3 sentences, summarize the overall market mood and what investors should watch out for today. Plain language, no markdown, no JSON.`;

  try {
    const result = await generateWithRetry(model, prompt);
    return result.trim();
  } catch (error) {
    console.error('getMarketOutlook error:', error);
    return 'Market outlook is temporarily unavailable. Please check the latest index levels and news before making any decisions.';
  }
}

interface MutualFundEstimate {
  trendDescription: string;
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'unknown';
}

export async function getMutualFundEstimate(stockName: string, symbol: string): Promise<MutualFundEstimate | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      tools: [{ googleSearchRetrieval: {} }],
    });

    const prompt = `Search for recent information (last 1-2 months) about mutual fund holdings or institutional investment trends for ${stockName} (${symbol}) on the NSE India stock market. Based on what you find, respond with ONLY a JSON object: {"trendDescription": "1-2 sentence plain-language summary of mutual fund / institutional holding trends", "trendDirection": "increasing" or "decreasing" or "stable" or "unknown"}. If you cannot find specific information, set trendDirection to "unknown" and trendDescription to a brief generic note. Respond with ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed.trendDescription !== 'string') return null;
    if (!['increasing', 'decreasing', 'stable', 'unknown'].includes(parsed.trendDirection)) {
      parsed.trendDirection = 'unknown';
    }

    return parsed as MutualFundEstimate;
  } catch (error) {
    console.error('getMutualFundEstimate error:', error);
    return null;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  stockName: string;
  symbol: string;
  summary: string;
  recommendation: string;
  currentPrice: number;
}

export async function chatFollowUp(context: ChatContext, history: ChatMessage[], question: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const historyText = history
      .map(m => `${m.role === 'user' ? 'Investor' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `You are a helpful assistant for an Indian retail investor, answering follow-up questions about a stock analysis they just received.

Stock: ${context.stockName} (${context.symbol})
Current Price: ₹${context.currentPrice}
Recommendation: ${context.recommendation}
Analysis Summary: ${context.summary}

${historyText ? `Conversation so far:\n${historyText}\n` : ''}
Investor's question: ${question}

Answer in 2-4 sentences, plain language, no markdown. Stay focused on this stock and general investing education. Do not give guaranteed predictions.`;

    const result = await generateWithRetry(model, prompt);
    return result.trim();
  } catch (error) {
    console.error('chatFollowUp error:', error);
    return "Sorry, I couldn't process that question right now. Please try again in a moment.";
  }
}

export async function getLiveNews(stockName: string, symbol: string): Promise<string[] | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      tools: [{ googleSearchRetrieval: {} }],
    });

    const prompt = `Search for news from the last 7 days about ${stockName} (${symbol}) on the NSE India stock market. Return 2-4 short headlines as a JSON array of strings, e.g. ["headline 1", "headline 2"]. Respond with ONLY the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (!parsed.every(item => typeof item === 'string')) return null;

    return parsed as string[];
  } catch (error) {
    console.error('getLiveNews error:', error);
    return null;
  }
}
