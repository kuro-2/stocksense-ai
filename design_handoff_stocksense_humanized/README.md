# Handoff: StockSense AI — Humanized Redesign

## Overview
This package redesigns the StockSense AI product (an AI stock-analysis tool for Indian
NSE/BSE markets) to feel warmer, more editorial, and less "AI-generated." It covers two
surfaces:

1. **Marketing site** (dark theme) — Home / How It Works / Features / Who It's For / Get Started + FAQ, all on one scrolling page.
2. **In-app dashboard** (light theme) — an **Analysis** (stock search) view and an interactive **Price Alerts** view, inside a collapsible sidebar shell.

The redesign replaces the old look (heavy mint-green gradients, rows of identical bordered
cards, cold blue-grey neutrals, generic icon chips) with: warm olive-charcoal / ivory-paper
neutrals, a serif display face for editorial hierarchy, oversized index numbers + hairline
rules instead of uniform card grids, friendlier copy, and tasteful motion.

## About the Design Files
The files in this bundle are **design references created in HTML/CSS/JS** — prototypes that
demonstrate the intended look, layout, and behavior. **They are not production code to ship
as-is.** The task is to **recreate these designs in StockSense's actual codebase**, using its
established framework, component library, routing, and data layer. If there is no existing
front-end environment yet, pick the most appropriate framework (e.g. React + a CSS solution)
and implement there.

In particular, do NOT ship as part of the product:
- The **Tweaks panel** (`tweaks-panel.jsx`, `assets/tweaks-app.jsx`, `#tweak-root`, and the
  React/Babel CDN script tags). That panel is a *design-exploration tool* that lets a reviewer
  toggle the variations described below. In production you pick ONE set of values and bake them
  in as your design tokens. The panel is included only so you can see the options.
- The mock data objects (`STOCKS`, `PRICES`, `POP`) — replace with real API data.
- The `html.anim-ok` / rAF paint-gating and `setTimeout` reveal fallbacks — these guard against
  a throttled preview iframe. In a real app, a standard IntersectionObserver reveal (or your
  framework's animation lib) is fine.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, and interactions are final and
intentional. Recreate the UI pixel-faithfully using the codebase's existing libraries/patterns.
Exact token values are listed under **Design Tokens** below; the same values also live as CSS
custom properties at the top of `assets/base.css`.

## Chosen Direction (important)
The prototype exposes two layout directions via the Tweaks panel — **Editorial** and
**Modular** — controlled by a `data-layout` attribute on `<html>`. **Ship the `Editorial`
direction as the default** (it is the primary intent of this redesign). The Modular variant is
a card-grid fallback; only implement it too if you want a runtime toggle. Likewise the panel
exposes accent color (default **emerald `#1f9d6b`**), font pairing (default **Editorial** =
Spectral + Hanken Grotesk), density (default **Regular**), and motion (default **Subtle**).
Use those defaults as your single source of truth unless told otherwise.

---

## Screens / Views

### 1. Marketing — Navigation bar
- **Layout:** Sticky top bar, 66px tall, max content width 1160px centered with ~40px inline
  padding. Flex row: logo (left) · in-page nav links · right cluster (theme toggle icon button,
  "Dashboard" primary button, "Log out" text).
- **Behavior:** Transparent with `backdrop-filter: blur(14px)` over the dark background; a
  1px bottom hairline (`--line`) fades in once the page is scrolled > 8px. Active section link
  gets a 2px accent underline; active state updates on scroll (scroll-spy). Nav links hidden
  below 880px (mobile would need a menu — not designed here).
- **Logo:** 30px rounded-square mark (accent-soft bg, accent stroke, a small up-trend
  glyph) + "StockSense AI" in the serif display face, 19px, weight 600.

### 2. Marketing — Hero
- **Layout:** Two columns `1.05fr / 0.95fr`, ~72px gap, vertically centered. Collapses to one
  column below 960px. Left = copy, right = live "read" card.
- **Left column, top to bottom:**
  - **Badge pill:** accent-soft background, mono 12px uppercase, a 6px pulsing accent dot, text "Powered by Claude AI · always free".
  - **H1:** serif display, `clamp(40px, 6.1vw, 78px)`, weight 500, line-height 1.0, letter-spacing −0.025em. Copy: "A confusing pile of charts, turned into one *clear read.*" — the words "clear read." are italic and accent-colored (`--accent-bright`).
  - **Lede:** 17–20px, `--ink-soft`, max 60ch. Copy: "Search any NSE or BSE stock and get a plain-English buy, sell, or hold call — with the technicals, F&O ideas, and risks that back it up. No jargon. Under fifteen seconds."
  - **Search bar:** pill, 1px border, `--panel` bg; focus ring = accent border + 4px accent-soft glow. Magnifier icon + text input ("Try 'RELIANCE', 'HDFC Bank', 'TCS'…") + inline "Analyze" primary button. Pressing Enter matches a known symbol and updates the read card.
  - **"Or jump straight in":** mono label + a wrap of chip buttons (one per popular stock). Clicking a chip renders that stock in the read card.
- **Right column — "read" card (the signature live element):**
  - Rounded 22px panel, subtle top-right accent radial glow, soft shadow.
  - **Top row:** ticker (serif 26px) + two tag pills (exchange, sector) on the left; price (mono 22px) and % change (mono 13px, green `up` / red `down`) right-aligned.
  - **Sparkline:** inline SVG, ~76px tall, accent stroke 2.5px with a gradient area fill. On load the line "draws" in (stroke-dashoffset 0→full over 1.4s) and the fill fades in.
  - **Verdict strip:** accent-soft rounded box — big serif verdict word ("BUY"/"HOLD"/"SELL", red for SELL), a sub-label, and a right-aligned "confidence NN%".
  - **Three KV columns:** Target (green), Stop loss (red), RSI(14) — mono values.
  - **Behavior:** Auto-cycles through ~8 stocks every 3.8s with a 200ms cross-fade (`.read-fade.swap` → opacity 0 then swap content). Auto-cycle pauses once the user clicks a chip or focuses the search. All values come from the mock `STOCKS` map — wire to a real quote+recommendation endpoint.

### 3. Marketing — Stats strip
- Four-column grid; each stat = serif number (`clamp(30px,3.4vw,44px)`) with a mono uppercase
  label beneath, divided by left hairlines. Values count up from 0 over ~900ms (ease-out cubic)
  when scrolled into view. Content: "50+ Nifty 50 stocks covered", "<15s From search to insight",
  "10+ Technical indicators", "100% Free, always". Two columns below 760px.

### 4. Marketing — How It Works (4 steps)
- **Editorial layout:** vertical list; each row = `84px / 1fr` grid. Left = oversized serif
  step number ("01"–"04") in accent color. Right = title (serif 26px) + description
  (`--ink-soft`, 15.5px). Rows separated by top hairlines; on hover the row nudges right 10px.
- **Modular layout (alt):** 4-up card grid; each card shows an icon glyph (42px accent-soft
  rounded square) + title + description; lifts 4px on hover.
- Section heading: mono eyebrow "How it works" + serif title "Hard data first. AI judgement
  second." + sub. Steps: 01 Live market data · 02 Local technicals · 03 AI reasoning · 04 One
  clear page (full copy in `Marketing.html`).

### 5. Marketing — Features (6 items)
- Same Editorial-list ↔ Modular-grid switch (grid is 3 columns). Items: AI recommendations ·
  Real technical analysis · F&O strategy ideas · News, summarised · Paper portfolio · Price
  alerts. Each has an icon glyph (used in Modular), title, description. Followed by a soft
  "See a live example →" button linking to the app.

### 6. Marketing — Who It's For
- Two-column split. Left = eyebrow + serif title ("Whether you're just starting out, or
  refining a real strategy.") + sub + ghost button. Right = checklist of 4 items, each a 26px
  accent-soft rounded tick square + text with a bold lead-in.

### 7. Marketing — Get Started + FAQ
- **CTA band:** large rounded (28px) panel, gradient panel bg, top accent radial glow, centered.
  Serif H2 "Make sense of the market today.", sub, primary + ghost buttons.
- **Disclaimer:** amber-tinted (`rgba(213,168,74,…)`) rounded box with a warning triangle icon —
  SEBI educational-tool disclaimer. Keep this copy verbatim (compliance).
- **FAQ:** accordion. Each item = serif question (20px) + chevron that rotates 180° and turns
  accent when open; answer height animates `max-height` 0 ↔ scrollHeight over 0.35s. First item
  open by default. 6 Q&As (free? · Demat needed? · is this advice? · coverage · accuracy · how
  alerts work) — full copy in file.

### 8. Marketing — Footer
- 4-column grid (`1.6fr 1fr 1fr 1fr`): brand + about blurb · Explore links · Platform links ·
  Legal links. Below, a hairline-topped fine-print legal/SEBI block + copyright. Keep legal copy
  verbatim.

### 9. App — Sidebar shell
- **Layout:** `grid-template-columns: 256px 1fr`; sidebar collapses to 76px (icons only) via the
  bottom collapse button, animated over 0.28s. Sidebar is `position: sticky; height: 100vh`,
  `--panel` bg, 1px right hairline. Hidden below 720px.
- **Contents:** brand (links to marketing site) · nav list (Dashboard, Analysis, Watchlist,
  Portfolio, Markets, Screener, Alerts, Backtest) · footer with avatar + collapse toggle.
- **Nav item:** 11px padding, 11px radius, icon + label; hover = `--panel-2` bg; active =
  accent-soft bg + accent-deep text + weight 600. Only **Analysis** and **Alerts** are wired in
  the prototype; the rest are placeholders pointing at Analysis.

### 10. App — Topbar
- Sticky, blurred over the ivory bg, 1px bottom hairline. Left = pill search ("Search any
  NSE/BSE stock…", focus ring like hero). Right = history icon button, theme icon button, and a
  user pill (accent avatar "R" + truncated email + chevron).

### 11. App — Analysis view
- **Editorial layout:** left-aligned. Badge ("Powered by Claude AI") + big serif headline
  "Search any stock, get a *clear read.*" (clear read = italic accent) + sub + a large pill
  search (icon + input + "Analyze" primary button, focus ring).
- **Modular layout (alt):** the same content centered inside a gradient hero card.
- **Popular right now:** serif label + a wrap of stock chips; clicking shows an "Analyzing
  {SYM}…" toast.
- **Your recent reads:** 3-column grid of small cards — symbol (serif) + verdict pill
  (buy=accent-soft / hold=grey / sell=red), price + change, sector + relative time. Cards lift on
  hover. (Static demo content; wire to real history.)

### 12. App — Price Alerts view (interactive)
- **Header:** 40px accent-soft icon square + serif H1 "Price Alerts" + sub.
- **Add form:** rounded panel, grid `1.6fr 1fr 1fr auto` (Stock input · Condition select
  [Goes above / Drops below] · Target price number · "Add alert" primary button). Inputs:
  11–13px padding, 11px radius, 1.5px border, accent focus ring. On add: parses symbol, looks up
  a mock live price, defaults target to ±8% if blank, prepends to the list, clears the price
  field, shows a confirmation toast. Collapses to 2 columns below 720px.
- **Alert card:** grid `auto 1fr auto auto` — 44px accent-soft symbol badge · name (serif) +
  condition/live-price (mono) · progress bar (160px, animated gradient fill showing progress
  toward target, with "now ₹… / NN%" labels) · right-aligned Target KV · delete button (turns
  red on hover, removes the alert + toast). Two seed alerts shown.
- **Empty state:** shown when no alerts — dashed-border panel, 64px accent-soft bell icon, serif
  "No alerts watching yet" + prompt.
- **Toast:** bottom-center dark pill with accent check icon; slides up + fades in for ~2.4s.

---

## Interactions & Behavior
- **Cross-navigation:** marketing "Dashboard" button + app sidebar brand link the two surfaces.
- **In-app view routing:** `#analysis` / `#alerts` hash; sidebar clicks swap the visible
  `<section class="view">` and the active nav item. Boot view read from the URL hash.
- **Reveal-on-scroll:** elements with `.reveal` fade + translate up (22px) into place, staggered
  via a `--rd` delay var. In production, use IntersectionObserver (threshold ~0.12) or your
  animation lib; the prototype's rAF gate + `setTimeout` safety net are preview-only guards.
- **Count-up stats**, **sparkline draw-in**, **read-card auto-cycle**, **FAQ accordion**,
  **sidebar collapse**, **toasts**, **alert add/remove + progress fill** — all described per
  screen above.
- **Focus rings:** every text input/select uses accent border + 4px accent-soft glow on focus.
- **Hover:** buttons translate up 2px; cards lift 4px and gain a shadow; editorial rows nudge
  right.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` zeroes the motion multiplier and
  reveal duration — honor this.
- **Responsive:** breakpoints at 960 / 900 / 880 / 760 / 720 / 640 / 560px (see CSS). A mobile
  nav/menu for the marketing site and a mobile sidebar drawer for the app are NOT designed —
  flag if you need them.

## State Management
- **Marketing:** scroll position (nav state + scroll-spy), which stock is in the read card,
  auto-cycle index + paused flag, open FAQ item. All ephemeral/UI-only.
- **App:** active view (analysis/alerts; persist in URL hash), sidebar collapsed boolean, alerts
  array `[{ sym, cond:'above'|'below', target:Number, price:Number }]`, toast message/visibility.
- **Data fetching (to wire):** stock quote + 90-day history (price, %chg, 52w, mcap, P/E),
  locally-computed technicals (RSI, SMA 20/50/200, support/resistance, trend), AI recommendation
  (verdict, target, stop, timeframe, confidence, F&O idea, risks), news summaries, popular list,
  user's recent reads, and alert CRUD + the price-watch/email backend.

## Design Tokens
All defined as CSS custom properties at the top of `assets/base.css`. Defaults:

**Accent (emerald — default of 4 options):**
- `--accent` `#1f9d6b` · `--accent-bright` `#2fc98c` · `--accent-deep` `#0f6e49`
- `--accent-soft` `rgba(47,201,140,0.14)` · `--accent-ink` `#05130d` (text on accent fills)
- Alt accents available in the panel (optional): saffron `#cf8a2e`, indigo `#5b6ee0`, coral `#e2674c`.

**Dark theme (marketing):**
- bg `#11140f` · bg-2 `#161a13` · panel `#1b1f18` · panel-2 `#20251d`
- line `rgba(232,226,205,0.10)` · line-2 `rgba(232,226,205,0.16)`
- ink `#f1ede0` · ink-soft `#cdc8b8` · ink-mute `#8f8c7e`
- shadow `0 24px 60px -28px rgba(0,0,0,0.7)`

**Light theme (app):**
- bg `#f6f4ec` · bg-2 `#efece1` · panel `#fffefb` · panel-2 `#faf8f1`
- line `rgba(40,46,34,0.10)` · line-2 `rgba(40,46,34,0.16)`
- ink `#20241a` · ink-soft `#4f5446` · ink-mute `#898d7d`
- shadow `0 22px 50px -30px rgba(40,46,34,0.35)`

**Down/negative color:** `#e8765a` (dark) / `#b5462c` (light).

**Typography (default "Editorial" pairing):**
- Display/serif: **Spectral** (Google Fonts), weights 400/500/600, italic available.
- Body/sans: **Hanken Grotesk** (Google Fonts), 400/500/600/700.
- Mono: **JetBrains Mono**, 400/500 (eyebrows, tags, numbers, labels).
- Alt pairings in panel (optional): "Modern" = Schibsted Grotesk (sans for both, heavier weights,
  tighter tracking, no italics); "Warm" = Newsreader + Hanken Grotesk.
- Scale highlights: display `clamp(40px,6.4vw,86px)` / section title `clamp(30px,3.8vw,50px)` /
  lede 17–20px / body 15.5–16px / eyebrow 12px mono uppercase tracked 0.18em. Headings weight
  500, letter-spacing −0.01 to −0.025em.

**Spacing scale (density-aware, multiplier `--dm`, default 1):**
- s1 4 · s2 8 · s3 12 · s4 16 · s5 24 · s6 32 · s7 48 · s8 72 · s9 104 · s10 150 (px × `--dm`).
- Compact `--dm` 0.82, Comfy 1.16.

**Radii:** `--radius` 18px · `--radius-sm` 11px · pills 999px · large panels 22–28px.

**Max content width:** `--maxw` 1160px.

**Motion:** multiplier `--mo` (subtle 1, lively 1.35, off 0); reveal duration 0.8s; common
easing `cubic-bezier(.2,.7,.3,1)`; hovers ~0.18–0.22s.

## Assets
- **No raster images or external asset files.** All icons are inline SVG (stroke-based, ~2px,
  rounded caps/joins — Lucide-like). Reuse your codebase's existing icon set to match.
- **Fonts** load from Google Fonts (Spectral, Hanken Grotesk, Schibsted Grotesk, Newsreader,
  JetBrains Mono) — see the `<link>` in each HTML head. Self-host or use your font pipeline as
  preferred.
- **Logo mark** is a small inline SVG up-trend glyph — replace with the real StockSense logo.

## Files
In this bundle (all are design references):
- `Marketing.html` — the dark marketing page (structure + all copy + interaction JS).
- `App.html` — the light in-app dashboard (Analysis + Alerts + sidebar shell).
- `assets/base.css` — **the design system**: tokens, themes, typography, buttons, chips, badges,
  cards, reveal system. Start here; this is the source of truth for tokens.
- `assets/marketing.css` — marketing-page layout + the Editorial/Modular switch.
- `assets/app.css` — sidebar shell, topbar, Analysis + Alerts views.
- `tweaks-panel.jsx`, `assets/tweaks-app.jsx` — **design-tool only, do not ship.** They power the
  variation toggles (layout/accent/font/density/motion) for review. Pick the defaults above and
  drop these.

## Implementation Notes
- Treat `assets/base.css` tokens as the canonical design system and map them onto your app's
  theming approach (CSS vars, Tailwind config, styled-system, etc.).
- The Editorial ↔ Modular and other variations are driven by `data-*` attributes on `<html>` +
  CSS that keys off them — a clean pattern if you DO want runtime theming, but not required.
  Default to Editorial / emerald / Spectral+Hanken / Regular / Subtle.
- Replace all mock data and the preview-only animation guards (`anim-ok`, `setTimeout` reveal
  fallbacks) with real data and a standard IntersectionObserver / your animation library.
- Keep the SEBI disclaimer and footer legal copy verbatim — it's compliance text.
