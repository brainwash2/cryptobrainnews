# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Batch 22 – DeFi Revenue Breakdown ✅

## Current Goal

Enhance the Revenue page with a revenue efficiency leaderboard

### Batch 22 — Unit 1: DeFi Revenue Efficiency Leaderboard ✅
- `src/app/data/defi/revenue/page.tsx` updated (zero new API calls):
  - `getTopProtocolsByTvl(200)` added to existing `Promise.all` (same cached endpoint, no new network call)
  - `ratioColor(pct)` — `≥10%` green, `1–10%` amber, `<1%` grey
  - `interface EfficiencyRow { name; category; rev24h; tvl; ratio; chains }` — ratio = `(rev24h / tvl) * 100`
  - `tvlMap = new Map(tvlProtocols.map(p => [p.name.toLowerCase(), p.tvl]))` — case-insensitive join key
  - `efficiencyRows` — join revenues→TVL, filter `tvl > 0 && rev24h > 0`, sort by ratio desc, slice 20
  - 3-KPI grid: Most Efficient Protocol (ratio + name) / Total Protocol Revenue 24h / Matched Protocols count
  - `DefiTable` efficiency table: Protocol / 24h Revenue (green) / TVL (blue) / Rev/TVL Ratio (color-tiered, 2dp if ≥1%, 4dp if <1%) / Category
  - Ratio tier key strip (3 swatches)
  - Section placed between Revenue Leaderboard and Fees Leaderboard
- TypeScript: 0 errors (`tsc --skipLibCheck`)

## Completed Batch 21 ✅ — Token Unlocks

### Batch 21 — Unit 1: Token Unlock Calendar / Vesting Events Scanner ✅
- `src/app/data/defi/token-unlocks/page.tsx` updated (zero new API calls — all data from existing `getNextUnlocks()` call):
  - `fmtDate(iso, opts?)` helper added — `toLocaleDateString("en-US", ...)` with optional opts
  - `type Impact = "High" | "Medium" | "Low"`; `impactTier(pct)` — `>1.0%` High (red), `0.1–1.0%` Medium (amber), `<0.1%` Low (grey); `impactColor()` / `impactBorder()` helpers
  - `HighImpactLeaderboard` server component: props `{ next30d, sorted, total30d, isLive }`:
    - `nextEvent = sorted[0]` (chronologically closest across all unlocks)
    - `largestIn30d` = `next30d.reduce(best by amountUsd)`
    - `leaderboard = [...next30d].sort((a,b) => (b.pctOfSupply??0) - (a.pctOfSupply??0))` — % of supply descending
    - 3-KPI grid: Next Unlock (date + token + amount) / Largest Unlock 30d (USD + token + date) / Total Value 30d (USD + event count)
    - Ranked table: # / Token / Amount / % of Supply (colored span) / Value (USD) / Date / Impact badge — 7 columns; `const as` type assertion on tier legend for strict literal inference
    - Impact tier key strip (3 swatches)
  - Section placed between existing "Next 30 Days" table and "All Upcoming Unlocks" table
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 20 ✅ — DeFi Yield Opportunities

### Batch 20 — Unit 1: DeFi Stablecoin Yield Scanner ✅
- `src/app/data/defi/yields/page.tsx` updated:
  - `getTopYieldPools(200)` imported from `@/lib/defi-data`; `DefiTable`, `fmtUsd` imported from `../_components/DefiTable`
  - `Promise.all([getTopYields(), getTopYieldPools(200)])` — both run in parallel; zero new API calls
  - `apyColor(v)` — `≥15%` green, `≥5%` amber, `<5%` grey
  - `riskTier(tvl)` — `>$10M` Established (green), `$1M–$10M` New (amber), `<$1M` Unverified (grey); returns `{ label, color, border }`
  - `StablecoinScanner` server component: filters `stablecoin === true`, sorts by APY desc, slices top 25
  - 3-KPI grid: Top Stablecoin APY (with protocol/asset/chain attribution) / Stable Pools Count / Median Pool TVL (middle element of TVL-sorted array)
  - `DefiTable` ranked table: Protocol / Chain / Asset / APY (color-coded) / TVL / Risk Tier badge (inline `border` span colored by tier)
  - Risk tier key legend strip (three swatches with TVL descriptions)
  - Section placed between existing MetricCard KPI strip and existing full yields table; existing table wrapped in a heading for visual separation
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 19 ✅ — DeFi Lending Rates

### Batch 19 — Unit 1: DeFi Lending Rates Leaderboard ✅
- `src/lib/defi-data.ts` updated:
  - `interface LendingRate` added: `{ protocol; chain; asset; supplyApy; borrowApy: number | null; tvlUsd }`
  - `getLendingRates(limit = 20)` — `cached('defi:lending-rates:${limit}', ..., 3600)`; fetches `https://yields.llama.fi/pools` (existing known-good endpoint); filters to rows with `apyBorrow !== null && tvlUsd > 1_000_000`; sorts by TVL descending; maps to `LendingRate[]`
  - Reuses existing `safeFetch` helper; `import 'server-only'` already at top of file
- `src/app/data/defi/lending/page.tsx` updated:
  - `getLendingRates` imported alongside `getLendingProtocols`; both fetched via `Promise.all`
  - `fmtApy(v)` helper — formats APY to 2 dp with `%` or `—` for null
  - `supplyApyColor(v)` — green tiers at 3/8/15%; `borrowApyColor(v)` — amber/orange/red tiers at 5/10/20%
  - `LendingRatesTable` server component: 3-KPI grid (Top Supply APY / Highest Borrow APY / Markets Tracked, with protocol+asset+chain attribution); `DefiTable` ranked leaderboard with columns: Protocol / Chain / Asset / Supply APY (green) / Borrow APY (red gradient) / TVL (blue)
  - Section placed between existing KPI strip and TVL protocols table
  - Glossary extended with Supply APY and Borrow APY entries
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 18 ✅ — Mempool Congestion

### Batch 18 — Unit 1: Bitcoin Mempool Congestion Gauge ✅
- `src/app/data/onchain/bitcoin/_components/MempoolCongestionGauge.tsx` **created** (`"use client"`):
  - Props: `{ mempoolData: RawPoint[]; feeData: RawPoint[] }` — both arrays already fetched in page, zero new API calls
  - `useMemo` for all derivations; `useSyncExternalStore` SSR hydration guard
  - `zoneFromMb(mb)` → `"Low" | "Moderate" | "High" | "Critical"`; `zoneColor()` / `zoneSub()` helpers
  - `GAUGE_MAX_MB = 400`; `needleDeg = (clamp(mb, 0, 400) / 400) * 180 - 90` — matches established gauge pattern
  - 4-zone CSS semicircular gauge: `rounded-t-full border-[12px] border-[#1a1a1a]` ring; 4 zone labels (L/M/H/Cr); needle `origin-bottom rotate(needleDeg)` with pivot dot; dynamic color from `zoneColor(zone)`
  - 3-KPI grid (inside right panel): Level / Mempool Size (MB) / Daily Fees (USD with 30d % change)
  - Recharts `AreaChart` 90-day mempool bytes; `tickFormatter` converts to MB; dynamic `stopColor` from `zoneColor`; three `ReferenceLine`s at 50/150/300 MB with matching zone colors
  - Zone legend strip + interpretation footnote (fees in USD total, not sat/vB — data limitation noted)
  - 5 min cache already satisfied by `fetchBtcChart("mempool-size", 90)` and `fetchBtcChart("transaction-fees-usd", 90)` which use `{ next: { revalidate: 300 } }`
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `import MempoolCongestionGauge` added
  - `<MempoolCongestionGauge mempoolData={mempoolData} feeData={feeData} />` rendered below `<MinerCapitulationChart />`, above `<HashRateTrendChart />`
  - Glossary entry added for Mempool Congestion
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 17 ✅ — Miner Capitulation

### Batch 17 — Unit 1: Bitcoin Miner Capitulation / Hash Ribbon Tracker ✅
- `src/app/data/onchain/bitcoin/_components/MinerCapitulationChart.tsx` **created** (`"use client"`):
  - Props: `{ data: { date: string; value: number }[] }` — raw `hashData` passed from page (zero new API calls)
  - `useMemo` for all EMA computation + signal derivation; `useSyncExternalStore` SSR hydration guard
  - `computeEma(values, period)` — standard EMA formula `k = 2/(period+1)`; seeds from first data point
  - `toEh(ghPerSec)` — converts blockchain.info GH/s values to EH/s for display
  - Signal determination: ratio = ema30/ema60; <0.998 → Capitulation (red); >1.002 → Recovery (green); else Neutral (amber)
  - Crossover detection: iterates `built[]` finding sign-flip of `(ema30 − ema60)`; each crossover date gets a `ReferenceLine` with `✕` label
  - 3-KPI grid: Signal status (color-coded) / 30d EMA in EH/s / 60d EMA in EH/s + spread
  - Recharts `ComposedChart` with two `Line`s: 30d EMA amber solid (strokeWidth=2) + 60d EMA white dashed; `Legend` auto-generated; `isAnimationActive={false}`
  - Interpretation key strip with inline swatch legend
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `import MinerCapitulationChart` added
  - `{hashData.length > 0 && <MinerCapitulationChart data={hashData} />}` rendered below `<LthSupplyChart />`, above `<HashRateTrendChart />`
  - Glossary entry added for Miner Capitulation
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 16 ✅ — LTH Supply

### Batch 16 — Unit 1: Bitcoin LTH Supply Tracker ✅
- `src/app/data/onchain/bitcoin/_components/LthSupplyChart.tsx` **created** (`"use client"`):
  - Props: `{ points: { date: string; value: number }[]; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - 3-KPI grid: LTH Supply % / 30-Day Trend (▲ Accumulation green / ▼ Distribution red) / 30-Day Change in percentage points
  - Recharts `AreaChart` 90-day % trend; area + stroke color dynamically green (rising) or red (falling); `ReferenceLine` at 30-day-ago level; `isAnimationActive={false}`
  - YAxis `tickFormatter` in `%`; interpretation key strip (rising = supply contraction; falling = late-cycle signal)
  - Custom `LthTooltip` with per-point `% of supply` label
- `src/app/data/onchain/bitcoin/page.tsx` updated (zero new API calls):
  - `interface LthSupplyData` added
  - `generateLthSupplySeed()` — 90-point rising seed: 72.0% → 74.5% (+2.5 pp linear trend + ±0.4 pp sine noise); reflects late-cycle accumulation profile; `Math.round(...* 100) / 100` for clean 2-dp values
  - `import LthSupplyChart` added
  - `lthSupplyData = generateLthSupplySeed()` called inline in `BitcoinData` (sync, no new Promise.all slot)
  - `<LthSupplyChart points={lthSupplyData.points} source={lthSupplyData.source} />` rendered below `<ExchangeReserveChart />`, above `<HashRateTrendChart />`
  - Glossary entry added for LTH Supply
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 15 ✅ — Exchange Reserve

### Batch 15 — Unit 1: Bitcoin Exchange Reserve Tracker ✅
- `src/app/data/onchain/bitcoin/_components/ExchangeReserveChart.tsx` **created** (`"use client"`):
  - Props: `{ points: { date: string; value: number }[]; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - `fmtBtc()` / `fmtChange()` helpers (K/M suffixes with sign)
  - 3-KPI grid: Current Reserve / 30-Day Change (green for outflow, red for inflow) / 30-Day % Change
  - Recharts `AreaChart` 90-day reserve trend; area color flips green (declining/accumulation) or red (rising/sell pressure) based on 30d direction; `ReferenceLine` at 30-day-ago level; `isAnimationActive={false}`
  - YAxis `tickFormatter` in K BTC; interpretation key strip (falling = bullish, rising = bearish)
- `src/app/data/onchain/bitcoin/page.tsx` updated (zero new API calls — no free exchange reserve endpoint exists):
  - `interface ExchangeReserveData` added
  - `generateExchangeReserveSeed()` — 90-point declining seed: base 2,350,000 BTC with −700 BTC/day linear trend + ±9,000 BTC sine noise; ends ~2,287,000 BTC (late-cycle accumulation profile)
  - `import ExchangeReserveChart` added
  - `exchReserveData = generateExchangeReserveSeed()` called inline in `BitcoinData` (sync, no Promise.all slot needed)
  - `<ExchangeReserveChart points={exchReserveData.points} source={exchReserveData.source} />` rendered below `<ThermocapGauge />`, above `<HashRateTrendChart />`
  - Glossary entry added for Exchange Reserve
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 14 ✅ — Thermocap Multiple

### Batch 14 — Unit 1: Bitcoin Thermocap Multiple Tracker ✅
- `src/app/data/onchain/bitcoin/_components/ThermocapGauge.tsx` **created** (`"use client"`):
  - Props: `{ multiple: number; points: { date: string; value: number }[]; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - `tcColor(v)` / `tcZoneLabel(v)` — 4 historically-calibrated zones: Undervalued (<5×) green, Fair Value (5–15×) amber, Overvalued (15–30×) orange, Extreme (>30×) red
  - CSS semi-circular gauge — display range `[0, 50×]`; needle = `(multiple / 50) * 180 − 90`; 4 zone labels (UV/FV/OV/EX) around arc; pivot dot
  - Recharts `AreaChart` 90-day history; `isAnimationActive={false}`; amber gradient fill; 3 `ReferenceLine` zone boundaries at 5×/15×/30× (color-coded); YAxis `tickFormatter` appends `×`
  - Zone legend strip (4 items); Live vs Seed badge
- `src/app/data/onchain/bitcoin/page.tsx` updated (zero new API calls):
  - `import ThermocapGauge` added
  - `THERMOCAP_BASE = 80_000_000_000` — estimated $80B cumulative miner revenue prior to last 90 days
  - `priceByDate` Map built from `s2fPriceHistory` (date → price)
  - `sortedRev` — `minerRevData` sorted ascending by date
  - Running loop: `runningThermocap += rev.value`; for each day with matching price, pushes `{ date, value: marketCap / runningThermocap }` to `thermocapPoints`
  - `currentThermocap` = final `runningThermocap` after all 90 days
  - `currentTcMultiple` = `(s2fCurrentPrice × 19,700,000) / currentThermocap` (seed fallback `22.5`)
  - `tcPoints` — uses `thermocapPoints` if non-empty, else constant-multiple fallback across `s2fPriceHistory`
  - `tcSource` = `s2fPriceSource`
  - `<ThermocapGauge multiple={currentTcMultiple} points={tcPoints} source={tcSource} />` rendered below `<RealizedPriceChart />`, above `<HashRateTrendChart />`
  - Glossary entry added for Thermocap Multiple
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 13 ✅ — Realized Price

### Batch 13 — Unit 1: Bitcoin Realized Price Tracker ✅
- `src/app/data/onchain/bitcoin/_components/RealizedPriceChart.tsx` **created** (`"use client"`):
  - Props: `{ points: { date: string; price: number; realized: number }[]; currentPrice: number; currentRealized: number; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - `fmtUsd()` helper ($K/$M); custom `RealizedTooltip` for dual lines
  - 3-KPI card: BTC Price / Realized Price / % vs Realized (green if above, red if below)
  - Recharts `ComposedChart` single Y-axis (auto-range covering both lines); amber solid (BTC price) + #888 dashed (Realized Price); `isAnimationActive={false}`; `Legend` with color-coded labels
  - Footnote explaining bear-market accumulation signal
- `src/app/data/onchain/bitcoin/page.tsx` updated (zero new API calls):
  - `import RealizedPriceChart` added
  - `mvrvByDate` Map built from existing `mvrvPoints` (date → mvrv value)
  - `realizedPricePoints` = `s2fPriceHistory.flatMap()` joining on date, computing `realized = Math.round(price / mvrv)`
  - `currentRealized = Math.round(s2fCurrentPrice / currentMvrv)` (seed fallback `/2.20`)
  - `realizedPoints` — uses joined array if non-empty, else falls back to applying constant `currentMvrv` across all price history points
  - `realizedSource` = `"live"` if either `s2fPriceSource` or `mvrvSource` is live, else `"seed"`
  - `<RealizedPriceChart points={realizedPoints} currentPrice={s2fCurrentPrice} currentRealized={currentRealized} source={realizedSource} />` rendered below `<S2fChart />`, above `<HashRateTrendChart />`
  - Glossary entry added for Realized Price
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 12 ✅ — Stock‑to‑Flow Model

### Batch 12 — Unit 1: Bitcoin Stock‑to‑Flow (S2F) Model Tracker ✅
- `src/app/data/onchain/bitcoin/_components/S2fChart.tsx` **created** (`"use client"`):
  - Props: `{ priceHistory: { date: string; price: number }[]; currentPrice: number; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - Pure-computed S2F constants (no API): `CIRCULATING_SUPPLY = 19_700_000`, `ANNUAL_ISSUANCE = 164_250`, `S2F_RATIO ≈ 119.94`, `MODEL_PRICE = S2F³ × $0.40 ≈ $690K`
  - 4-KPI grid: S2F Ratio / Model Price / Current BTC Price / % vs Model (color-coded green/red)
  - Recharts `ComposedChart` dual-YAxis: left = actual BTC price (auto-scale), right = S2F model (±5% domain so flat line sits centered); amber solid + muted dashed lines; `isAnimationActive={false}`
  - `fmtUsd()` helper for $K/$M formatting; custom `PriceTooltip`
  - Footnote: issuance, supply, constant-between-halvings caveat
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `interface BtcPriceHistory` added: `{ points: { date: string; price: number }[]; source: "live" | "seed" }`
  - `generateBtcPriceSeed()` — 90-point sine-wave series ~$96K (range $90K–$102K) as deterministic fallback
  - `fetchBtcPriceHistory()` — CoinGecko `market_chart?days=90&interval=daily`; maps `[ts, price]` pairs; `next: { revalidate: 3600 }`; seed fallback on error
  - `import S2fChart` added; 15th Promise.all slot; `s2fPriceHistory` / `s2fCurrentPrice` / `s2fPriceSource` derived
  - `<S2fChart priceHistory={...} currentPrice={...} source={...} />` rendered below `<PuellGauge />`, above `<HashRateTrendChart />`
  - Glossary entry added for Stock‑to‑Flow (S2F)
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 11 ✅ — Puell Multiple

### Batch 11 — Unit 1: Bitcoin Puell Multiple Tracker ✅
- `src/app/data/onchain/bitcoin/_components/PuellGauge.tsx` **created** (`"use client"`):
  - Props: `{ puell: number; points: { date: string; value: number }[]; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - `puellColor(v)` / `puellZoneLabel(v)` — 4 zones: Undervalued (<0.5) green, Fair Value (0.5–1.0) amber, Overvalued (1.0–2.0) orange, Extreme (>2.0) red
  - CSS semi-circular gauge — display range `[0, 4]`; needle = `(puell / 4) * 180 − 90`; 4 zone labels (UV/FV/OV/EX) around arc; pivot dot
  - Recharts `AreaChart` 90-day history; `isAnimationActive={false}`; amber gradient fill; 3 `ReferenceLine` zone boundaries at 0.5 / 1.0 / 2.0 (color-coded)
  - YAxis domain `[0, 3]`; Zone legend strip (4 items); Live vs Seed badge
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `interface PuellResult` added: `{ points: { date: string; value: number }[]; source: "live" | "seed" }`
  - `generatePuellSeed()` — 90-point sine-wave series centered on 0.85 (range 0.55–1.15) as deterministic fallback
  - `fetchPuellMultiple()` — fetches `blockchain.info/charts/miners-revenue?timespan=365days`; computes SMA365 over all returned points; maps last-90 to Puell = `daily / SMA365`; gracefully returns seed on any error; `next: { revalidate: 86_400 }`
  - `import PuellGauge from "./_components/PuellGauge"` added
  - `fetchPuellMultiple()` added as 14th element in `Promise.all` (with `.catch(() => generatePuellSeed())`)
  - `puellPoints` / `currentPuell` (fallback `0.85`) / `puellSource` derived
  - `<PuellGauge puell={currentPuell} points={puellPoints} source={puellSource} />` rendered below `<NuplGauge />`, above `<HashRateTrendChart />`
  - "About These Metrics" glossary updated with Puell Multiple entry
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 10 ✅ — NUPL Cycle Indicator

### Batch 10 — Unit 1: Bitcoin NUPL Cycle Indicator ✅
- `src/app/data/onchain/bitcoin/_components/NuplGauge.tsx` **created** (`"use client"`):
  - Props: `{ nupl: number; points: { date: string; value: number }[]; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - `nuplColor(v)` / `nuplZoneLabel(v)` — 5 zones by threshold: Capitulation (<0) red, Hope (0–0.25) orange, Optimism (0.25–0.50) amber, Belief (0.50–0.75) light green, Euphoria (≥0.75) green
  - CSS semi-circular gauge — display range `[-0.5, 1.0]`; needle = `((nupl + 0.5) / 1.5) * 180 − 90`; 5 zone labels (CAP/HOPE/OPT/BLF/EUP) positioned around arc; pivot dot
  - Recharts `AreaChart` 90-day NUPL history; `isAnimationActive={false}`; amber gradient fill; 4 `ReferenceLine` zone boundaries at 0 / 0.25 / 0.50 / 0.75 (color-coded)
  - YAxis domain `[-0.5, 1.0]`; tick formatter `v.toFixed(2)`
  - Zone legend strip (5 items); Live vs Seed source badge
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `import NuplGauge from "./_components/NuplGauge"` added
  - `getGlassnodeMetric("nupl", "BTC", "24h", 90)` added as 13th element in `Promise.all` (with `.catch(() => null)`)
  - `nuplPoints` mapped from `GlassnodePoint[]` (`.t` → ISO date, `.v` → value)
  - `currentNupl` = last point value, fallback `0.55` (seed — Belief zone)
  - `nuplSource` = `nuplTs?.source ?? "seed"`
  - `<NuplGauge nupl={currentNupl} points={nuplPoints} source={nuplSource} />` rendered immediately below `<MvrvGauge />`, above `<HashRateTrendChart />`
  - "About These Metrics" glossary updated with NUPL entry
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 9 ✅ — Advanced Metrics (MVRV Ratio)

### Batch 9 — Unit 1: Bitcoin MVRV Ratio + Zone Gauge ✅
- `src/app/data/onchain/bitcoin/_components/MvrvGauge.tsx` **created** (`"use client"`):
  - Props: `{ mvrv: number; points: { date: string; value: number }[]; source: "live" | "seed" }`
  - `useSyncExternalStore` SSR hydration guard (`mounted`)
  - `mvrvColor(v)` / `mvrvZoneLabel(v)` pure fns mapping 5 zones by thresholds
  - CSS semi-circular gauge (mirrors FearGreedWidget pattern): `rounded-t-full border-[12px]`, 5 zone labels (EU/U/FV/OV/EO), color needle at `(mvrv / 6) * 180 - 90` degrees, pivot dot
  - Recharts `AreaChart` 90-day MVRV history with `isAnimationActive={false}`, 4 `ReferenceLine` zone boundaries (1.0/1.5/3.0/4.5), amber gradient fill
  - Zone legend strip (5 items: color dot + range + label)
  - Live vs Seed source badge
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `import { getGlassnodeMetric } from "@/lib/glassnode"` added
  - `import MvrvGauge from "./_components/MvrvGauge"` added
  - `getGlassnodeMetric("mvrv", "BTC", "24h", 90)` added as 12th element in `Promise.all` (with `.catch(() => null)`)
  - `mvrvPoints` mapped from `GlassnodePoint[]` (`.t` → ISO date, `.v` → value)
  - `currentMvrv` = last point value, fallback `2.20` (seed midpoint)
  - `mvrvSource` = `mvrvTs?.source ?? "seed"`
  - `<MvrvGauge mvrv={currentMvrv} points={mvrvPoints} source={mvrvSource} />` rendered immediately after `<FearGreedWidget />`
  - "About These Metrics" glossary updated with MVRV Ratio entry
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 8 ✅ — Full Metric Parity (final push)

## Current Goal (Previous)

Implement the next 5 high-impact metrics using only free APIs

### Batch 8 — Unit 1: BTC Miner Revenue Breakdown ✅
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - No new fetch — derives from existing `feeData` (transaction-fees-usd) + `minerRevData` (miners-revenue) arrays
  - IIFE in JSX: last-30 data points sorted and sliced; `totalFees / totalRev * 100` → `feePct`; `100 - feePct` → `subPct`
  - New `"BTC Miner Revenue Breakdown — 30 Day Average"` section (conditional on `totalRev > 0`) with 3 KPI cards:
    - Fee/Subsidy Ratio (fees% / subsidy%)
    - Fee Revenue (30D Avg daily in USD)
    - Subsidy Revenue (30D Avg daily in USD)
  - Source note: blockchain.info/charts/transaction-fees-usd + miners-revenue · Cached 30 min

### Batch 8 — Unit 2: ETH Burn Rate Tracker ✅
- `src/app/data/onchain/ethereum/page.tsx` updated:
  - `EthBurnStats` interface added (`totalBurned`, `dailyAvgBurn`, `source`)
  - `EIP1559_TIMESTAMP` constant (Aug 5 2021 = 1628121600000ms)
  - `fetchEthBurnStats()` — `cached('eth:burn:stats:v1', ..., 3600)`:
    - If `ETHERSCAN_API_KEY` present: fetches `stats/ethburned`, computes `totalBurned / daysSinceEIP1559`
    - Seed fallback: 4,420,000 ETH total at avg / days since EIP-1559
  - `burnStats` added as 6th element in `Promise.allSettled`
  - `ethBurn` derived from settled result
  - New `"ETH Burn Rate Tracker"` section (conditional on `ethBurn`) with 4 KPI cards:
    - Total ETH Burned (M ETH cumulative)
    - Daily Burn Rate (ETH/day, lifetime avg)
    - USD Value Burned (at current ETH price)
    - Data Source (live Etherscan or estimate badge)

### Batch 8 — Unit 3: Solana Validator Count & Nakamoto Coefficient ✅
- `src/app/data/onchain/solana/page.tsx` updated:
  - `import { cached } from '@/lib/cache'` added
  - `SolVoteAccount` and `SolValidatorStats` interfaces added
  - `fetchSolValidators()` — `cached('sol:validators:v1', ..., 300)`:
    - Calls Solana mainnet RPC `getVoteAccounts`
    - `activeCount` = `current.length` (non-delinquent)
    - Nakamoto coefficient = min validators to exceed 33.3% of total activated stake (sorted desc)
  - `validatorStats` added as 4th element in `Promise.allSettled`
  - `valStats` derived; new `"Validator Decentralization"` section (conditional) with 4 KPI cards:
    - Active Validators (non-delinquent)
    - Nakamoto Coefficient (color-coded: ≥30 green, ≥15 amber, <15 red)
    - Total Stake (in lamports / 1e9)
    - Decentralization label (High/Medium/Low)

### Batch 8 — Unit 4: Global Crypto Fear & Greed Historical Chart ✅
- `src/app/data/markets/prices/page.tsx` updated:
  - `fetchFngHistory()` limit changed from `90` → `365` (fetches full 365D from alternative.me)
- `src/app/data/markets/prices/_components/PricesClient.tsx` updated:
  - `fngRange: 90 | 365` state added (default 90)
  - 90D/365D toggle button strip added to F&G section header (amber active style)
  - Section title updated dynamically: `"Fear & Greed Index — {fngRange}D History"`
  - IIFE computes `sliced = fngRange === 365 ? fngHistory : fngHistory.slice(-90)` and passes to `AreaChart`
  - Date footer updated to use `sliced[0]` / `sliced[sliced.length-1]`

### Batch 8 — Unit 5: DeFi TVL by Chain Leaderboard ✅
- `src/app/data/defi/tvl/page.tsx` updated:
  - `import { cached } from '@/lib/cache'` added
  - `ChainTvlRow` interface added (`name`, `tvl`, `change_1d`, `change_7d`, `protocols`, `tokenSymbol?`)
  - `fetchChainTvlLeaderboard()` — `cached('defi:chain:tvl:leaderboard:v1', ..., 3600)`:
    - Fetches `api.llama.fi/v2/chains`
    - Filters `tvl > 0`, sorts desc by TVL, slices top 10
  - `chainLeaderboard` added as 5th element in `Promise.all`
  - New `"TVL by Chain — Top 10 Leaderboard"` section (conditional) with full table:
    - Columns: Rank, Chain, TVL (amber), 7D % (green/red), 1D %, Protocols count

- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 7 ✅ — Full Metric Parity (continued)

### Batch 7 — Unit 1: CME BTC Futures OI (CFTC) ✅
- `src/app/data/markets/futures/page.tsx` updated:
  - `import { cached } from '@/lib/cache'` added
  - `CmeBtcOI` interface added (`current`, `prev`, `reportDate`, `source`)
  - `CME_BTC_OI_REFERENCE` fallback constant (Q1 2026 snapshot)
  - `fetchCmeBtcOI()` added — `cached('cme:btc:oi:v1', ..., 86400)` fetching 2 latest BTC rows from CFTC Socrata API, extracting `open_interest_all` for current + prev week OI
  - `cmeBtcOI` added as 6th element in `Promise.all`
  - `oiChange`, `oiTrend`, `oiTrendClr` derived (7-day WoW % change with ▲/▼ arrows)
  - New **"CME BTC Futures — Open Interest"** section added above existing Bybit OI strip: 4 KPI cards — Current OI, 7-Day Change (▲/▼), Report Date, Sentiment; live/reference badge

### Batch 7 — Unit 2: ETH Gas Historical Trend Chart ✅
- `src/app/data/onchain/gas/_components/GasHistoryChart.tsx` created ("use client"):
  - Props: `data: GasHistoryPoint[]` (`date: string`, `gwei: number`)
  - `useSyncExternalStore` for SSR-safe hydration guard
  - `useState<7 | 30>` for 7D/30D timeframe selector
  - Recharts `AreaChart` with `isAnimationActive={false}`, blue gradient fill, `CartesianGrid`, `XAxis`/`YAxis`, `Tooltip`
  - 3 derived KPIs above chart: Latest, N-day Avg, vs Avg (▲/▼ %)
- `src/app/data/onchain/gas/page.tsx` updated:
  - `ETHERSCAN_KEY` from `process.env.ETHERSCAN_API_KEY`
  - `fetchEthGasHistory()` added — `cached('eth:gas:history:30d', ..., 3600)`, hits Etherscan `stats/dailyavggasprice` when key present; 30-point seed fallback when no key
  - `gasHistory` added to `Promise.all` (3rd element)
  - `<GasHistoryChart data={gasHistory} />` rendered below multi-chain fee reference table

### Batch 7 — Unit 3: Cross-Chain Bridge Volume (DefiLlama) ✅
- `src/app/data/onchain/flows/page.tsx` updated:
  - `import { cached }` added
  - `BridgeEntry` interface added (`name`, `displayName`, `volume24h`, `volume7d`)
  - `fetchBridgeVolume()` added — `cached('bridges:vol:24h:v1', ..., 3600)` fetching `api.llama.fi/bridges`, sorting by `lastDailyVolume` descending, returning top 5 + total
  - `bridgeData` added to `Promise.all` (3rd element, replacing sequential await)
  - New **"Cross-Chain Bridge Volume"** section added (conditionally rendered when `total24h > 0`): 3 KPI cards (total 24h, bridges tracked, leader) + top-5 bridge table with rank, name, 24h/7d vol, share

### Batch 7 — Unit 4: BTC New Addresses 30D Sum ✅
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - No new fetch — derives from existing `addrData` (`n-unique-addresses`, 90 days)
  - IIFE in JSX: sorts `addrData`, slices last 30 points, sums → `sum30`; slices last 7 vs prev 7 → `trend7` (7-day WoW % change, ▲/▼)
  - New **"New Addresses (30D)"** `StatCard` added as 6th card in chart-derived KPI grid
  - KPI grid updated `grid-cols-2 lg:grid-cols-5` → `grid-cols-2 lg:grid-cols-6`

### Batch 7 — Unit 5: NFT Market Volume ✅
- `src/app/data/nfts/volume/page.tsx` updated:
  - `getTopCollections` added to imports from `@/lib/nft-data`
  - `collections` added to `Promise.all` (2nd element) alongside `chainVolumes`
  - `collVol24h` = sum of `volume24hUsd` across all collections
  - `collVol7dAvg` = sum of `volume7dUsd` / 7 (daily average proxy for "yesterday")
  - `collTrend` = `(collVol24h - collVol7dAvg) / collVol7dAvg * 100`
  - `liveCount` / `hasLive` derived for dynamic source badge
  - Source badge upgraded: shows live count when Alchemy key present
  - New **"Total NFT Market — 24h Volume"** section added (before chain bar chart): 4 KPI cards — 24h Vol (Collections), vs 7D Daily Avg (▲/▼), 24h Vol (Chains), 7D Vol; duplicate chain-bars section removed
- TypeScript: 0 errors (`npx tsc --noEmit`)

### Batch 6 — Unit 1: ETH Staking Stats (beaconcha.in) ✅
- `src/app/data/onchain/ethereum/page.tsx` refactored:
  - `import { cached } from '@/lib/cache'` added
  - `getEthStakingStats()` function added — wraps `beaconcha.in/api/v1/epoch/latest` in `cached('eth:staking:v1', ..., 300)`
  - `export const revalidate` changed 1800 → 300
  - Dedicated **"ETH Staking Stats"** section added (`border-l-2 border-[#3b82f6]`): 4 KPI cards in `grid-cols-2 lg:grid-cols-4` — ETH Staked, Validator Count, Staking APR (%), % ETH Staked
  - Main KPI grid reduced to 4 non-staking cards: ETH Price, Avg Gas, DeFi TVL, ETH Burned
  - `beaconR` inline fetch removed; staking data now flows through `getEthStakingStats()` via `Promise.allSettled`

### Batch 6 — Unit 2: BTC Lightning Network Capacity (mempool.space) ✅
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `import { cached } from '@/lib/cache'` added
  - `LightningStats` interface added (`channel_count`, `total_capacity`, `node_count`)
  - `fetchLightningStats()` added — `cached('btc:lightning:stats', ..., 300)` wrapping `mempool.space/api/v1/lightning/statistics/latest`
  - `lnStats` added to `Promise.all` (11th element)
  - New **"⚡ Lightning Network"** section added above FearGreedWidget: 4 KPI cards — LN Capacity (BTC), Open Channels, Network Nodes, Avg Channel Size

### Batch 6 — Unit 3: DeFi Exploits Leaderboard ✅
- `src/app/data/defi/exploits/page.tsx` updated:
  - `MAJOR_EXPLOITS` array re-sorted by `amount` descending (Ronin → Poly → BNB → Wormhole → Mixin → Euler → Nomad → Beanstalk → Curve → Radiant)
  - `RANK_COLORS` map added (gold #1, silver #2, bronze #3)
  - Table renamed "DeFi Exploits Leaderboard — Ranked by Losses"
  - **Rank column (#)** added as first column with colour-coded rank badges
  - Table footer updated to reflect ranked ordering

### Batch 6 — Unit 4: Hyperliquid Perps Volume ✅
- `src/app/data/defi/derivatives/page.tsx` updated:
  - `import { cached } from '@/lib/cache'` added
  - `HLAssetCtx` interface added (`dayNtlVlm?: string`)
  - `fetchHyperliquidVolume()` added — `cached('hyperliquid:vol:24h', ..., 300)` POSTing `{"type":"metaAndAssetCtxs"}` to `api.hyperliquid.xyz/info`, sums `dayNtlVlm` across all assets
  - `hlVol` added to `Promise.all` alongside `getDerivativesProtocols()`
  - New **"Hyperliquid Perps — Live Volume"** section added (conditionally rendered): 2 cards — Hyperliquid 24h Volume + HL Share of DefiLlama Total

### Batch 6 — Unit 5: Stablecoin Velocity ✅
- `src/lib/defi-data.ts` updated:
  - `getGlobalDexVolume24h()` added — `cached('defi:dex:vol24h:global', ..., 1800)` fetching DefiLlama `/overview/dexs` and returning `total24h`
- `src/app/data/stablecoins/usd/page.tsx` updated:
  - `getGlobalDexVolume24h` added to imports
  - `dexVol24h` added to `Promise.all` (4th element)
  - `velocity = (dexVol24h / totalSupply) * 100` computed (daily DEX on-chain volume ÷ total USD stablecoin supply)
  - KPI grid expanded 4 → 5 cards (`grid-cols-2 lg:grid-cols-5`): **"Velocity (Daily)"** card added, colour-coded green/amber/grey
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 5 ✅ — Full Metric Parity (The Block comparison)

### Batch 5 — Unit 1: Metric Analysis ✅
5 metrics proposed and approved.

### Batch 5 — Unit 2: BTC Hash Rate Trend Chart ✅
- New `src/app/data/onchain/bitcoin/_components/HashRateTrendChart.tsx` — `"use client"` Recharts `AreaChart`, `isAnimationActive={false}`, `useSyncExternalStore` mount guard, `ChartSkeleton` fallback, gradient fill, custom `HashRateTooltip`
- `src/app/data/onchain/bitcoin/page.tsx` updated:
  - `fetchBtcVolatility()` added (CoinGecko 35-day price history → 30-day annualized realized vol)
  - `btcVol` added to `Promise.all`
  - Chart-derived KPI strip expanded from 4 → 5 cards (`grid-cols-2 lg:grid-cols-5`): "30D Realized Vol" card added (Unit 5)
  - `hashChange30d` + `currentEh` computed server-side from `hashData` array
  - New "Hash Rate Trend (30-Day)" section renders `<HashRateTrendChart>` after FearGreedWidget

### Batch 5 — Unit 3: DEX-to-CEX Volume Ratio ✅
- `src/app/data/defi/dex-volume/page.tsx` updated:
  - `getGlobalMarketData()` imported and added to `Promise.all`
  - CEX 24h vol computed as `globalData.total_volume.usd − total24h_dex`
  - New "DEX vs. Centralised Exchange Market Share" section: 3 KPI cards (DEX 24h / CEX 24h / DEX%) + visual ratio bar

### Batch 5 — Unit 4: Stablecoin Supply by Blockchain ✅
- `getStablecoinsByChain()` already existed in `src/lib/defi-data.ts` (cached 3600s, returns top 8 chains)
- New `src/app/data/defi/stablecoins/_components/StablecoinChainChart.tsx` — `"use client"` Recharts horizontal `BarChart`, chain-specific colour map (Ethereum/Tron/BSC/Solana/etc.), `LabelList` share %, `isAnimationActive={false}`, `useSyncExternalStore` mount guard
- `src/app/data/defi/stablecoins/page.tsx` updated: converted to async, fetches `getStablecoinsByChain()`, renders `<StablecoinChainChart>` between KPI cards and the full table

### Batch 5 — Unit 5: BTC Annualized 30D Realized Volatility ✅
- Implemented inside Unit 2 (same page). `fetchBtcVolatility()` fetches CoinGecko 35-day daily prices, computes σ_daily × √365 × 100. Result shown as 5th KPI card with colour-coded risk level (green/amber/red).

### Batch 5 — Unit 6: Protocol Revenue Leaderboard with Chain Badges + 30d Column ✅
- `src/lib/defi-data.ts` updated:
  - `FeeProtocol` interface gains `chains: string[]` and `total30d: number | null`
  - `getProtocolFees()` and `getProtocolRevenue()` updated to parse `chains` and `total30d` from the DefiLlama API response
- `src/app/data/defi/revenue/page.tsx` updated:
  - `ChainBadge` component added with per-chain colour map (Ethereum/Solana/BSC/Arbitrum/Optimism/etc.)
  - Leaderboard columns updated: Protocol | Chain | 24h | 7d | **30d** | 24h % (replaces Category + All Time)
  - Both Revenue and Fee leaderboards use the new columns
- TypeScript: 0 errors (`npx tsc --noEmit`)

## Completed Batch 4 ✅ — Metric Expansion (ALL 4 UNITS DONE)

### Unit 4 — Protocol Dominance Breakdown Chart (DeFi TVL page)
- `getTvlByCategory()` already existed in `src/lib/defi-data.ts` (cached 3600s, returns top 15 categories with `{ category, tvl, share }`) — no new lib function required
- New `src/app/data/defi/tvl/_components/DefiCategoryPieChart.tsx` — `"use client"` Recharts donut `PieChart` (`innerRadius="52%"` `outerRadius="78%"`), top 9 categories + "Others" bucket, `isAnimationActive={false}`, `useSyncExternalStore` mount guard, `ChartSkeleton` fallback, `CustomTooltip` showing category/TVL/share, 2-column legend grid (colored dot + name + TVL + share %)
- `src/app/data/defi/tvl/page.tsx` updated:
  - Imports `DefiCategoryPieChart`
  - New "Protocol Dominance Breakdown" section inserted between KPI strip and existing `DeFiTvlClient` — `bg-[#0a0a0a] border border-[#1a1a1a]` card with `FABF2C` left-border heading
- TypeScript: 0 errors
- `npm run build` — Bus error (Replit free-tier container OOM during Next.js production compile; environment constraint, not a code issue)

### Unit 3 — 7-day TVL Sparklines in Top 5 L2 Cards
- `slug` + `llamaSlug` fields added to `Layer2TVLEntry` interface in `src/lib/scaling-data.ts` — `slug` is the catalogue identifier, `llamaSlug` is the actual DefiLlama chain name (e.g. `'OP Mainnet'`) for use with the historicalChainTvl API
- `getLayer2TVL()` updated to populate both fields from the chainMap (`live?.name ?? c.slug`)
- New `src/app/data/scaling/_components/L2Sparkline.tsx` — `"use client"` Recharts `LineChart`, `ResponsiveContainer`, h-12, no axes/grid/dots, `isAnimationActive={false}`, `activeDot={false}`, `useSyncExternalStore` mount guard, fallback `<div className="h-12 bg-[#0d0d0d] rounded" />`
- `src/app/data/scaling/l2-comparison/page.tsx` updated:
  - Imports `L2Sparkline`, `getChainTvlSeries`, `TvlPoint`
  - After initial `Promise.all`, fetches 7-day sparkline data for each top-5 chain via `Promise.all(l2tvl.top5.map(c => getChainTvlSeries(c.llamaSlug, 7).catch(() => [])))`
  - `<L2Sparkline data={spark} color={chain.color} />` rendered inside each Top 5 card, between 24h change and market-share bar
- TypeScript: 0 errors

### Unit 2 — Layer 2 TVL + Top 5 L2s KPI Cards
- `Layer2TVLEntry` + `Layer2TVLSummary` interfaces added to `src/lib/scaling-data.ts`
- `getLayer2TVL()` added to `src/lib/scaling-data.ts` — calls `https://api.llama.fi/v2/chains` directly (bypasses `getAllChainsMap()` 3600s cache), filters OPTIMISTIC_CHAINS + ZK_CHAINS, returns `{ totalTvl, optTvl, zkTvl, top5, all }`, cached 300s (`scaling:layer2:tvl:300`)
- `src/app/data/scaling/l2-comparison/page.tsx` updated:
  - Imports `getLayer2TVL`, `Layer2TVLEntry`
  - `revalidate` changed from 3600 → 300
  - `getLayer2TVL()` added to `Promise.all`
  - New "Top Layer 2s — Live TVL" section added between Summary KPIs and TVL bars: 5-column grid of KPI cards, each showing rank badge, chain name + color dot, OPT/ZK type badge, TVL (chain-colored), 24h change (green/red), L2 market-share progress bar, protocol count
- TypeScript: 0 errors

### Unit 1 — Bitcoin Fear & Greed Index Widget
- `FearGreedPoint` interface + `getFearGreedHistory()` added to `src/lib/market-data.ts` — calls `https://api.alternative.me/fng/?limit=90`, returns 90-day `{date, value, classification}[]`, cached 300s (5 min) via `cached()`
- New `src/app/data/onchain/bitcoin/_components/FearGreedWidget.tsx` — gauge (semicircle + needle, 5-zone colour coding) + Recharts AreaChart, 30D/90D TimeframeSelector, `useSyncExternalStore` mount guard, `ChartSkeleton` fallback, `isAnimationActive={false}`, zone legend, custom FngTooltip
- `src/app/data/onchain/bitcoin/page.tsx` updated — `getFearGreedHistory()` added to Promise.all (`.catch(() => [])`), `<FearGreedWidget data={fngData} />` rendered between chart-derived KPI row and BitcoinChartsClient
- TypeScript: 0 errors

## Completed Batch 3

### Unit 1 — Stablecoin USDT/USDC 90-day Supply Trend Chart
- `getStablecoinTrendData()` in `src/lib/defi-data.ts` — fetches DefiLlama USDT (id=1) + USDC (id=3), returns 90-day `{date,usdt,usdc}[]` cached 1h
- `src/app/data/stablecoins/usd/_components/StablecoinTrendChart.tsx` — Recharts dual-line chart, USDT=#26A17B, USDC=#2775CA, `isAnimationActive={false}`, `useSyncExternalStore` mount guard
- `stablecoins/usd/page.tsx` wired: `getStablecoinTrendData()` in Promise.all, `<StablecoinTrendChart>` rendered above StablecoinUsdClient

### Unit 2 — Timeframe Selectors
- `StablecoinTrendChart` has built-in 7D/30D/90D TimeframeSelector (client-side slice)
- FuturesClient already had working 7D/30D TimeframeSelector (pre-existing)

### Unit 3 — High-Impact Metric Expansion
- `onchain/bitcoin/page.tsx`: Added 4 new KPI cards — Active Addresses (24h), Miner Revenue (24h), Daily Transactions, Tx Fees (24h) — derived from already-fetched blockchain.info chart arrays
- `defi-data.ts`: Added `getDefiTotalFees24h()` — calls DefiLlama `/overview/fees`, returns total24h, cached 1h
- `defi/tvl/page.tsx`: Replaced "Source" KPI with "DeFi Fees (24h)" from `getDefiTotalFees24h()`

### Unit 4 — CSS / Density
- `StablecoinUsdClient.tsx`: Added `overflow-x-auto` + `min-w-[720px]` to stablecoin table for mobile horizontal scroll

## Completed

### Session: Security & Pipeline Audit (pre-Batch 1)
- Verified all 8 audit items are correctly implemented:
  - `scripts/daily-article.ts` — Grok/DeepSeek/Gemini each try/caught; dead-letter → Redis
  - `src/lib/news/dedup.ts` — 3-layer dedup (URL SHA-256, title SHA-256, content SHA-256)
  - `src/lib/news/telegram.ts` — per-chat rate limit + Retry-After on 429
  - `src/app/api/newsletter/unsubscribe/route.ts` — GDPR compliant (no login, timestamp, Resend removal)
  - All 5 cron routes call `validateVercelCronAuth` as first line
  - `src/app/api/health/route.ts` — checks Redis/Sanity/Resend/Telegram/Stripe/RSS/pipeline with timeouts
  - `src/lib/monetisation/stripe.ts` — `isDuplicateEvent` via Redis SET NX
  - Zero `@supabase/*` imports
- Fixed gap: `scripts/daily-article.ts` was not passing `description` to any dedup call;
  now all 3 call sites (`isDuplicate`, `bulkCheck`, both `markSeen`) pass `item.description`.
- Created `src/types/declarations.d.ts` — silenced TS7016 errors for `lucide-react` and `@heroicons/react`.
- `npx tsc --noEmit` → 0 errors.

### Batch 1 – Unit 1: Fix `/api/health` endpoint
- **Status**: Already complete — no changes required.

### Batch 1 – Unit 2: Cron route guards
- **Status**: Already complete — no changes required.

### Batch 1 – Unit 3: Remove placeholder + FreshnessBadge
- Replaced "Archive Synchronizing..." static text with animated skeleton cards.
- Added `<FreshnessBadge ttlSeconds={300} />` to data layout — now present on all 80+ pages.

### Context & Workflow Files Created
- All 6 context files created and maintained.

### Batch 2 – Unit 1: Remove duplicate FreshnessBadge from 5 data pages
### Batch 2 – Unit 2: Telegram Redis-backed rate limiter
### Batch 2 – Unit 3: `pipeline:last-success` Redis write
### Batch 2 – Unit 4: Stablecoin/OI metric improvements

## In Progress

- Batch 6 Units 1–5 (implementation in progress)

## Next Up

Batch 7 – (awaiting instruction)

## Open Questions

- None.

## Architecture Decisions

- Dead-letter queue: Redis (`broadcast:dead:<channel>`) — never filesystem `/tmp`.
- Dedup: 3-layer (URL + title + content SHA-256), 7-day TTL in Redis.
- Stripe idempotency: Redis SET NX, 7-day TTL.
- Cron auth: `validateVercelCronAuth` (Authorization: Bearer) — matches Vercel Cron format.
- Newsletter unsubscribes: Neon `updated_at = NOW()` + Resend audience removal.

## Session Notes

- Stack: Next.js 14, Upstash Redis, Sanity CMS, Resend, Stripe, Telegram Bot API, Neon PostgreSQL.
- `src/types/declarations.d.ts` declares `lucide-react` and `@heroicons/react` to silence TS7016.
- `tsconfig.json` uses `moduleResolution: bundler`.
- Dev server exits after "✓ Starting..." in Replit sandbox — pre-existing environment issue,
  not caused by any code changes. `npx tsc --noEmit` is the canonical verification method.
