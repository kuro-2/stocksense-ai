'use client';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MessageCircle, Send, Mic, Loader2 } from 'lucide-react';
import type { AnalysisResult } from '@/types/stock';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  analysis: AnalysisResult;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;

export function ChatPanel({ analysis }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
      const SpeechRecognitionImpl = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (SpeechRecognitionImpl) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognitionImpl();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript ?? '';
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        };
        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
      }
    });
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: analysis.symbol,
          context: {
            stockName: analysis.stockName,
            summary: analysis.summary,
            recommendation: analysis.recommendation,
            currentPrice: analysis.currentPrice,
          },
          history: newMessages,
          question,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer ?? 'Sorry, something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that question right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        Ask a follow-up question
      </h3>

      {messages.length > 0 && (
        <div className="space-y-2 mb-3 max-h-80 overflow-y-auto thin-scrollbar">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-emerald/10 text-emerald-900 ml-auto'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="text-sm rounded-lg px-3 py-2 bg-slate-50 text-slate-500 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={e => { e.preventDefault(); sendMessage(); }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about ${analysis.symbol}...`}
          className="flex-1 border border-(--surface-border) rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-emerald"
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors ${listening ? 'bg-red-50 text-red-600' : 'text-(--muted) hover:text-emerald hover:bg-(--surface-hover)'}`}
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-1 bg-gradient-to-r from-emerald to-emerald-light text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </Card>
  );
}
