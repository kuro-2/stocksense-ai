import { Navbar } from '@/components/layout/Navbar';
import { StockSearch } from '@/components/stock/StockSearch';
import Link from 'next/link';
import { TrendingUp, Search, Brain, LineChart } from 'lucide-react';

const POPULAR_STOCKS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'BAJFINANCE', 'WIPRO', 'ICICIBANK'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-8 h-8" />
            <span className="text-lg font-semibold opacity-90">Powered by Claude AI</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Analyze any Indian stock with AI
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Get instant AI-powered buy/sell recommendations, technical analysis, F&O strategies, and news — for any NSE/BSE stock.
          </p>
          <div className="flex justify-center">
            <StockSearch />
          </div>
        </div>
      </section>

      {/* Popular stocks */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm font-medium text-slate-500 mb-3">Popular stocks:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map(s => (
            <Link
              key={s}
              href={`/analysis/${s}`}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Search, title: '1. Search', desc: 'Type any NSE/BSE stock name or symbol' },
            { icon: Brain, title: '2. AI Analyzes', desc: 'Claude AI fetches live data, news, and computes technicals' },
            { icon: LineChart, title: '3. Get Insights', desc: 'See buy/sell recommendation with target and stop loss' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-slate-400 border-t border-slate-200 mt-4">
        <p>⚠️ StockSense AI is for educational purposes only. It is not SEBI-registered investment advice. Investments are subject to market risk. Please read all scheme related documents carefully.</p>
      </footer>
    </div>
  );
}
