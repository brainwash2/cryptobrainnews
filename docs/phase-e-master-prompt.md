# Master Prompt – Phase E: Chart & UX Standardisation (The Block Clone)

## Files Attached (read ALL of them)

- gemini-context.txt (full codebase snapshot)
- docs/metrics.txt (complete product specification)
- docs/DUNE_QUERIES.md (Dune query IDs and SQL sketches)

You are a Senior Frontend Architect for CryptoBrainNews.
We are upgrading our Next.js 16 crypto data terminal to match
the exact visual quality and UX of The Block's institutional dashboard.
The following design tokens and patterns are derived from a live audit
of https://www.theblock.co/data performed by our research partner Grok.

All new code must follow these rules strictly.

## Section 1 – Project Identity & Design System

**Project:** CryptoBrainNews (cryptobrainnews.vercel.app), an institutional crypto data terminal.
**Reference UX:** https://www.theblock.co/data (dark-themed, TradingView Lightweight Charts primary, Recharts only for gauges/pies).
**Tech stack:** Next.js 16 (App Router), TypeScript strict, Tailwind CSS, tradingview-lightweight-charts v5, Recharts (limited), Upstash Redis, `cached()` utility.

### Design Tokens (from Grok's exact audit – enforce strictly)

**Colors:**
  --background: #0a0a0a
  --foreground: #f8fafc
  --primary:       #22c55e   (green, used for up / success / active states)
  --primary-foreground: #0a0a0a
  --border:        #27272a
  --card:          #161616
  --card-foreground: #f8fafc
  --muted:         #27272a
  --muted-foreground: #a3a3a3
  --secondary:     #1a1a1a
  --success:       #22c55e
  --error:         #ef4444

**Typography:**
  Headings: font-sans (Inter/-apple-system), font-weight 600.
  Body labels: text-sm text-[#a3a3a3].
  Data values: font-mono (Space Mono), tabular-nums, text-[#f8fafc].

**Spacing & Effects:**
  Card padding: 24px (p-6).
  Border-radius: 16px (rounded-3xl) on all data cards.
  Card shadow (hover): shadow-xl shadow-black/10.
  Section gap: 32px (space-y-8 or gap-8).

**KPI Cards:**
  Compact horizontal layout.
  Label: small uppercase text-[#a3a3a3].
  Value: large bold text-[#f8fafc], 28-32px.
  Change badge (if trend prop): rounded-full pill, green/red background with white text + arrow icon (↑/↓).

**Timeframe Buttons (pill style):**
  Inactive: text-sm text-[#a3a3a3], hover text-[#f8fafc].
  Active: bg-[#27272a] text-white rounded-2xl px-4 py-1.5.
  Available: 1D | 7D | 30D | 90D | 1Y | YTD | ALL.
  Position: right-aligned above every chart.

**Tables:**
  Header: sticky (top: 0, bg #161616, z-10).
  Rows: alternating #1a1a1a / #161616.
  Hover: bg #27272a, smooth transition.
  Alignment: right-align numbers, left-align names/symbols.
  Sparkline columns: tiny inline TradingView sparkline (5-6px height, green/red).

**Loading states:** Card-shaped shimmer skeleton (gradient pulse #161616 → #27272a → #161616, faint grid lines).
**Error states:** Centered "Unable to load data" message + retry button with #22c55e accent.
**CSV/Export (Pro only):** Top‑right of each chart card (next to timeframe selector). Lucide Download icon, #a3a3a3, turns #22c55e on hover. Tooltip "Export CSV". Free users see a locked icon + "Upgrade to Pro" tooltip.

## Section 2 – Files to Modify (page by page, exact component names)

**Do NOT touch** any data fetcher (`dune.ts`, `defi-data.ts`, `api.ts`) or server component that calls them. Only client components that render charts are being upgraded.

**Shared components (modify):**
  `src/app/data/_components/TimeframeSelector.tsx`
  `src/app/data/_components/ChartSkeleton.tsx` (rename/create from existing)
  `src/app/data/_components/DataPageError.tsx`
  `src/app/data/_components/MetricCard.tsx`
  `src/components/monetization/ProChartWrapper.tsx` (create if missing)

**Page‑specific client components (modify):**
  `src/app/data/markets/spot/_components/SpotClient.tsx`
  `src/app/data/markets/futures/_components/FuturesClient.tsx`
  `src/app/data/onchain/bitcoin/_components/BitcoinChartsClient.tsx`
  `src/app/data/onchain/ethereum/_components/EthTvlClient.tsx`
  `src/app/data/onchain/solana/_components/SolanaChartsClient.tsx`
  `src/app/data/defi/tvl/_components/DeFiTvlClient.tsx`
  `src/app/data/defi/revenue/RevenueTrendClient.tsx`
  `src/app/data/stablecoins/usd/_components/StablecoinUsdClient.tsx`

**Globals:**
  `src/styles/globals.css` (set CSS custom properties, scrollbar, selection styles)

## Section 3 – Specific Chart Configurations Per Page

### 3.1 `/data/markets/spot/_components/SpotClient.tsx`
- **Chart 1 – Price area chart (BTC + ETH):** Already using TradingView Lightweight Charts. Ensure styling matches tokens. Keep existing `usePriceHistory()` hook.
- **Chart 2 – Top Movers bar chart:** Replace Recharts bar chart with Lightweight Histogram (vertical bars, green for positive, red for negative). Use data from the existing `sortedCoins` computed value.
- **Chart 3 – Market Cap Dominance bar chart:** Replace Recharts bar chart with Lightweight Histogram. Token colors: BTC #F7931A, ETH #627EEA, USDT #26A17B, BNB #F3BA2F, SOL #9945FF, USDC #2775CA, XRP #00AAE4, OTHERS #555555.
- **Chart 4 – Exchange Volume Dominance bar chart:** Replace Recharts bar chart with Lightweight Histogram. Keep gold color ramp.
- **TimeframeSelector:** Already present at two locations; restyle as pills.

### 3.2 `/data/markets/futures/_components/FuturesClient.tsx`
- **OI History chart (BTC+ETH):** Replace Recharts ComposedChart with Lightweight dual‑axis. Left axis: bar (OI in USD). Right axis: optional line overlay for price.
- **Funding rate area chart (BTC+ETH):** Replace Recharts AreaChart with Lightweight area chart (two series: BTC, ETH).
- **Liquidation table:** Keep existing table structure; ensure styling matches tokens.
- **TimeframeSelector:** Already present for OI chart.

### 3.3 `/data/onchain/bitcoin/_components/BitcoinChartsClient.tsx`
- **Replace all 6 Recharts area/bar charts** with Lightweight area charts:
  Active Addresses (area, orange), Daily Transactions (bar, gold), Hash Rate (area, green), Fees USD (area, red), Mempool Size (area, blue), Miner Revenue (area, teal).
- **UTXO Age Bands section:** Replace the static CSS bar visualization with a horizontal bar chart (Recharts horizontal BarChart is acceptable here since Lightweight doesn't support stacked horizontal bars easily). Use the existing UTXO_COLORS array.
- **TimeframeSelector:** Already present (7D/30D/90D); restyle as pills.

### 3.4 `/data/onchain/ethereum/_components/EthTvlClient.tsx`
- Replace Recharts AreaChart for TVL with Lightweight area chart (blue gradient).
- Ensure the latest TVL value and date range are displayed as per current layout.

### 3.5 `/data/onchain/solana/_components/SolanaChartsClient.tsx`
- Replace Recharts AreaChart for TPS with Lightweight area chart (purple).
- Replace Recharts AreaChart for TVL with Lightweight area chart (purple).

### 3.6 `/data/defi/tvl/_components/DeFiTvlClient.tsx`
- Replace Recharts AreaChart for Total DeFi TVL with Lightweight area chart (gold).
- Replace Recharts horizontal BarChart for TVL by Category with Lightweight Histogram (vertical bars, use CATEGORY_COLORS array). If vertical doesn't work for category labels, keep Recharts horizontal bar but style it consistently.

### 3.7 `/data/defi/revenue/RevenueTrendClient.tsx`
- Replace Recharts AreaChart with Lightweight dual‑area chart: Fees (gold) + Revenue (green).
- Keep the existing 30D/90D toggle buttons (restyle as pills).

### 3.8 `/data/stablecoins/usd/_components/StablecoinUsdClient.tsx`
- Peg Deviation gauges: keep existing GaugeCard (already good, just ensure token colors).
- Circulating supply horizontal bar chart: replace current Recharts BarChart with Lightweight Histogram (vertical bars). If horizontal is preferred, leave as Recharts but style with tokens.
- Table: keep existing, ensure alternating rows + sticky header.

**ALL client components:** Mount guard (useSyncExternalStore or useEffect + useState), isAnimationActive={false} on any remaining Recharts elements.

## Section 4 – Shared Component Updates

### 4.1 `src/app/data/_components/TimeframeSelector.tsx`
- Full rewrite to match The Block pill style (horizontal inline-flex group).
- Props keep the existing `value`, `onChange`, `available` array.
- Buttons: "1D", "7D", "30D", "90D", "1Y", "YTD", "ALL" (or subset from available).
- Active: bg-[#27272a] text-white rounded-2xl px-4 py-1.5 text-sm font-medium.
- Inactive: text-[#a3a3a3] hover:text-[#f8fafc] px-4 py-1.5 text-sm.
- Transition: transition-colors duration-200.

### 4.2 `src/app/data/_components/ChartSkeleton.tsx`
- Replace current animate-pulse rectangles with a shimmer card.
- Card: rounded-3xl bg-[#161616] p-6.
- Inside: faint horizontal grid lines (use a repeating-linear-gradient on a div).
- Animation: shimmer sweep (bg-gradient from #161616 via #27272a to #161616, animate-pulse).
- Props: `rows`, `charts`, `kpis` (keep existing API if already used; otherwise simplify to a single `height` prop).

### 4.3 `src/app/data/_components/DataPageError.tsx`
- Centered layout in a card.
- Icon: AlertTriangle from lucide-react, text-[#ef4444].
- Title: "Unable to load data" in text-[#f8fafc].
- Subtitle: error.message in text-[#a3a3a3] text-sm.
- Retry button: border border-[#27272a] text-[#a3a3a3] hover:text-[#f8fafc] hover:border-[#22c55e].

### 4.4 `src/app/data/_components/MetricCard.tsx`
- Add `trend` prop support (number).
- When trend is present, show a rounded-full pill: arrow ↑/↓ + percentage, green/red background.
- Layout: flex flex-col or flex-row with justify-between.

### 4.5 `src/components/monetization/ProChartWrapper.tsx` (create)
- Wraps children in a card.
- Detects Pro status from a prop `isPro` (passed from parent) or a React Context (use a simple context if needed; we'll wire it later).
- Top-right: if Pro, show Download icon button. If not Pro, show Lock icon.
- Download click: call `exportCSV(data, filename)` helper (defined in the component).
- Props: `title`, `data`, `filename`, `isPro`, `children`.

## Section 5 – Strict Rules

- TypeScript strict mode. No `any` types. Use `unknown` and type guards where needed.
- All Recharts components MUST use mounted guard (useSyncExternalStore or useState(true) in useEffect) and isAnimationActive={false}.
- Zero mock data — all numbers come from existing live data fetchers (already provided via props).
- No premium gating on data — ProChartWrapper only controls export button, never hides chart content.
- Do not modify any server component's data fetching logic.
- Do not change any API route or library file except `globals.css` and the listed shared components.
- All TradingView charts must clean up on unmount (chart.remove()) and handle resize (ResizeObserver).
- Keep existing `TvLightweightChart` wrapper and reuse it wherever possible; extend it if needed to support histogram or dual‑axis.
- No hardcoded colors — always reference the CSS variables or Tailwind classes.

## Output Format

Deliver code as ready‑to‑use TypeScript/React files.
Start each file with `// src/path/to/file.tsx`.
Separate files with a line containing exactly `==========`.
Include `mkdir -p` for any new directories.
No markdown fences, no extra commentary.
Ensure `npx tsc --noEmit` passes with zero errors.
