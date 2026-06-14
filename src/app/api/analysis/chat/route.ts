import { NextRequest, NextResponse } from 'next/server';
import { chatFollowUp } from '@/lib/gemini';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// POST /api/analysis/chat — stateless follow-up Q&A about a stock analysis
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { symbol, context, history, question } = body;

    if (!symbol || !context || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const trimmedQuestion = question.trim().slice(0, 500);
    const recentHistory: ChatMessage[] = Array.isArray(history)
      ? history.slice(-6).filter((m: unknown): m is ChatMessage =>
          !!m && typeof (m as ChatMessage).content === 'string' && ['user', 'assistant'].includes((m as ChatMessage).role)
        )
      : [];

    const answer = await chatFollowUp(
      {
        stockName: context.stockName ?? symbol,
        symbol,
        summary: context.summary ?? '',
        recommendation: context.recommendation ?? 'HOLD',
        currentPrice: context.currentPrice ?? 0,
      },
      recentHistory,
      trimmedQuestion
    );

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ answer: "Sorry, I couldn't process that question right now. Please try again in a moment." });
  }
}
