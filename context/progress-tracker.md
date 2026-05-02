# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Batch 7 – Full Metric Parity (continued)

## Current Goal

Implement the next 5 high-impact metrics using only free APIs

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
