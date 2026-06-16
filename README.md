# StockSense AI

**AI-powered stock analysis for the Indian market — NSE & BSE, built for everyday investors.**

StockSense AI lets you search any Indian stock and instantly receive a Gemini-powered recommendation, full technical breakdown, F&O strategy ideas, and risk assessment — all in one place. No Bloomberg terminal required.

---

## Features

| Feature | Description |
|---|---|
| **AI Analysis** | Gemini AI generates Buy / Sell / Hold recommendations with confidence scores, price targets, and plain-English reasoning |
| **Technical Breakdown** | RSI, SMA 20/50/200, Bollinger Bands, MACD — auto-calculated with visual charts |
| **F&O Ideas** | Options strategy builder (straddle, strangle, spreads) with payoff visualisation |
| **Stock Screener** | Filter the Nifty 50 by trend, RSI range, market cap, and SMA position |
| **Stock Comparator** | Side-by-side comparison of up to 4 stocks across 12 metrics |
| **Markets Overview** | Live indices, sector heatmap, top movers, FII/DII data, PCR, earnings calendar |
| **Watchlist** | Save and track any NSE/BSE stock with live prices |
| **Paper Portfolio** | Practice trading with ₹10 lakh virtual cash — track positions and P&L |
| **IPO Tracker** | Active, upcoming, and recently closed NSE IPOs |
| **Price Alerts** | Email notifications when a stock crosses your target price |
| **Strategy Backtesting** | Test RSI Reversal, SMA Crossover, and Bollinger Bounce against historical data |
| **Analysis History** | Every AI analysis you run is saved and retrievable |

---

## Tech Stack

```
Frontend     Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Recharts · Lightweight Charts
Backend      Next.js API Routes · Prisma ORM · PostgreSQL (via Supabase)
AI           Google Gemini API (@google/generative-ai)
Data         Yahoo Finance (yahoo-finance2) · NSE unofficial API
Auth         Supabase Auth (email/password + OAuth ready)
Email        Resend
Deployment   Vercel
```

---

## Project Structure

```
stocksense-ai/
├── src/
│   ├── app/
│   │   ├── (platform)/          # Authenticated app shell
│   │   │   ├── analysis/        # AI analysis landing + [symbol] detail pages
│   │   │   ├── compare/         # Side-by-side stock comparator
│   │   │   ├── watchlist/       # Saved stocks
│   │   │   ├── portfolio/       # Paper trading
│   │   │   ├── markets/         # Indices, heatmap, movers, FII/DII
│   │   │   ├── screener/        # Technical stock screener
│   │   │   ├── ipo/             # IPO tracker
│   │   │   ├── alerts/          # Price alert management
│   │   │   ├── backtest/        # Strategy backtesting
│   │   │   ├── history/         # Analysis history
│   │   │   └── dashboard/       # Home dashboard
│   │   ├── api/                 # API route handlers
│   │   │   ├── analyze/         # AI analysis endpoint (Gemini + caching)
│   │   │   ├── stock/           # Quote, search, technical data
│   │   │   ├── screener/        # Screening engine
│   │   │   ├── compare/         # Multi-stock comparison
│   │   │   ├── backtest/        # Backtesting engine
│   │   │   ├── portfolio/       # Paper trading operations
│   │   │   ├── watchlist/       # Watchlist CRUD
│   │   │   ├── alerts/          # Alert CRUD + trigger check
│   │   │   └── ipo/             # IPO data from NSE
│   │   ├── login/ signup/       # Auth pages
│   │   └── layout.tsx           # Root layout (fonts, theme init)
│   ├── components/
│   │   ├── layout/              # Sidebar, Topbar, QuickSearch, ProfileMenu
│   │   ├── stock/               # Analysis panels (Technical, Risk, News, Chat, F&O)
│   │   ├── markets/             # Market widgets (Heatmap, Movers, FII/DII, etc.)
│   │   ├── portfolio/           # Sector allocation chart
│   │   ├── theme/               # ThemeProvider, ThemeToggle
│   │   └── ui/                  # Card, Badge, Skeleton, Reveal
│   ├── lib/
│   │   ├── gemini.ts            # Gemini AI client + prompt builder
│   │   ├── yahoo-finance.ts     # Yahoo Finance data fetcher
│   │   ├── nse.ts               # NSE unofficial API helpers
│   │   ├── technical.ts         # RSI, SMA, MACD, Bollinger calculations
│   │   ├── backtest.ts          # Strategy backtest engine
│   │   ├── fno.ts               # F&O strategy builder
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # Supabase auth helpers
│   │   └── utils.ts             # formatINR, formatPercent, RECO_CONFIG
│   └── types/                   # TypeScript types (stock, portfolio)
├── prisma/
│   └── schema.prisma            # Database schema
└── public/                      # Static assets, favicon, manifest
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- A [Resend](https://resend.com) API key (for price alert emails)

### 1. Clone & install

```bash
git clone https://github.com/your-username/stocksense-ai.git
cd stocksense-ai
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase connection string)
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Resend (email alerts)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=alerts@yourdomain.com

# App URL (used for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How AI Analysis Works

1. User searches a stock symbol (e.g. `RELIANCE`)
2. `/api/analyze` fetches live quote + technical indicators from Yahoo Finance
3. A structured prompt is sent to **Gemini** with price, RSI, SMAs, trend, sector, and F&O data
4. Gemini returns a structured response: recommendation, confidence, price target, risk level, catalysts, and a plain-English summary
5. Results are **cached globally for 15 minutes** per symbol — re-analyzing within that window returns the cached result without consuming quota
6. Each analysis is saved to the database for the user's history

### Usage limits

| User type | Limit | How it's enforced |
|---|---|---|
| Logged-out (anonymous) | 1 free analysis | `localStorage` flag on the client |
| Free account | 10 lifetime analyses | Server-side count check before each Gemini call |
| Unlimited (admin-granted) | Unlimited | `user_metadata.unlimited = true` in Supabase |

---

## Data Sources

| Data | Source |
|---|---|
| Stock quotes & historical prices | Yahoo Finance (`yahoo-finance2`) |
| NSE stock search & metadata | NSE India unofficial API |
| F&O chain data | NSE India |
| IPO listings | NSE India |
| FII/DII activity | NSE India |
| Technical indicators | Calculated in-house (`src/lib/technical.ts`) |

> **Note:** NSE's unofficial endpoints may occasionally be unavailable or rate-limited. The app degrades gracefully — Yahoo Finance handles the core data.

---

## Backtesting Strategies

| Strategy | Entry Signal | Exit Signal |
|---|---|---|
| **RSI Reversal** | RSI drops below 30 (oversold) | RSI rises above 70 (overbought) |
| **SMA Crossover** | Golden cross — SMA 20 crosses above SMA 50 | Death cross — SMA 20 crosses below SMA 50 |
| **Bollinger Band Bounce** | Price touches or breaks below lower band | Price touches or breaks above upper band |

Each backtest benchmarks the strategy return against a simple buy-and-hold over 6 months, 1 year, or 2 years, reporting total return, win rate, and max drawdown.

---

## Deployment

### Deploy to Vercel (recommended)

1. Push your repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` to the Vercel project settings
4. Click **Deploy**

### Build locally

```bash
npm run build
npm start
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
# 1. Fork & clone
git checkout -b feat/your-feature

# 2. Make changes, then
git commit -m "feat: add your feature"
git push origin feat/your-feature

# 3. Open a Pull Request
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Disclaimer

StockSense AI is for **educational and informational purposes only**. Nothing here constitutes financial advice. Always do your own research before making investment decisions. AI-generated recommendations are based on technical indicators and historical data — past performance does not guarantee future results.
