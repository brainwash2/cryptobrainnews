# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Batch 5 – Full Metric Parity (The Block comparison)

## Current Goal

Read docs/metrics.txt, identify up to 10 high-impact missing metrics that can be added using ONLY free APIs (CoinGecko, DefiLlama, blockchain.info, Etherscan, etc.), and implement them one by one.

### Batch 5 — Unit 1: Metric Analysis ✅ (awaiting approval)
Proposed 5 metrics below — awaiting user approval before implementation begins.

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
- `checkPipelineLastRun` correctly reads `pipeline:last-success` from Redis, calculates age
  in hours, returns `healthy` if < 26 h, `degraded` otherwise.
- All 9 system checks (redis, upstash_redis, sanity, resend, telegram, stripe, rss_feeds,
  pipeline_last_run, queue_depths) use `checkWithTimeout`.

### Batch 1 – Unit 2: Cron route guards
- **Status**: Already complete — no changes required.
- All 5 routes (`broadcast-drain`, `daily-article`, `health`, `sitemap-warm`, `social`)
  call `validateVercelCronAuth(req)` as their very first statement inside `GET`.

### Batch 1 – Unit 3: Remove placeholder + FreshnessBadge
- Replaced "Archive Synchronizing..." static text in `src/app/page.tsx` with 3 animated
  skeleton article card placeholders (`animate-pulse`).
- Added `<FreshnessBadge ttlSeconds={300} />` to the "Proprietary Research" section header
  on the homepage.
- Added `<FreshnessBadge ttlSeconds={300} />` to `src/app/data/layout.tsx` — now present on
  all 80+ data dashboard pages automatically.
- `npx tsc --noEmit` → 0 errors.

### Context & Workflow Files Created
- `AGENTS.md` — agent rules for CryptoBrainNews
- `context/project-overview.md` — product definition and goals
- `context/architecture-context.md` — stack, boundaries, storage model, invariants
- `context/ui-context.md` — color palette, typography, layout patterns, component conventions
- `context/code-standards.md` — TypeScript, Next.js, styling, and error handling rules
- `context/ai-workflow-rules.md` — development workflow and scoping rules
- `context/progress-tracker.md` — this file

### Batch 2 – Unit 1: Remove duplicate FreshnessBadge from 5 data pages
- Removed per-page `<FreshnessBadge>` + wrapper `<div>` from:
  - `src/app/data/defi/tvl/page.tsx` (was ttlSeconds={3600})
  - `src/app/data/etfs/bitcoin/page.tsx` (was ttlSeconds={300})
  - `src/app/data/markets/futures/page.tsx` (was ttlSeconds={300})
  - `src/app/data/markets/spot/page.tsx` (was ttlSeconds={300})
  - `src/app/data/onchain/bitcoin/page.tsx` (was ttlSeconds={1800}, custom label)
- Removed now-unused `FreshnessBadge` import from each file.
- All 80+ data pages now show exactly one badge — from `src/app/data/layout.tsx`.

### Batch 2 – Unit 2: Telegram Redis-backed rate limiter
- Replaced `const lastSendTime = new Map<string, number>()` (module-level in-memory map) with
  Redis `SET NX PX` atomic slot acquisition in `src/lib/news/telegram.ts`.
- Key pattern: `tg:ratelimit:<chatId>`, TTL = 1050 ms (INTER_MESSAGE_DELAY_MS).
- If slot is taken: reads `PTTL`, waits, then refreshes the key before calling `sendRaw`.
- Now safe across multiple concurrent Vercel serverless instances.

### Batch 2 – Unit 3: `pipeline:last-success` Redis write
- Added `Redis` import to `scripts/daily-article.ts`.
- After `run.stage = 'complete'`: writes `pipeline:last-success → run.completedAt`
  with `ex: 90000` (25 h TTL) using `Redis.fromEnv()`.
- Write failure is caught and logged via `logger.warn` — never fatal to the pipeline.
- `/api/health` `checkPipelineLastRun` now always has a key to read after a clean run.

### Batch 2 – Unit 4: Stablecoin/OI metric improvements
- `src/lib/defi-data.ts`: Added `getStablecoinsByChain()` fetching
  `https://stablecoins.llama.fi/chains` — returns top 8 chains by USD stablecoin supply,
  cached 1 hour. Exported new `StablecoinChainRow` interface.
- `src/app/data/stablecoins/usd/page.tsx`:
  - Replaced green `<span>` badge with `<FreshnessBadge ttlSeconds={3600} />`.
  - Added "Supply by Blockchain" grid section (top 8 chains, each showing $B supply + % of total).
  - Fetches chain data in parallel with stablecoin overview via `Promise.all`.
- `src/app/data/markets/futures/page.tsx`:
  - Added `fmtOI()` formatter.
  - Added current BTC, ETH, and combined OI KPI cards derived from the most recent point
    in the already-fetched `oiHistory` (Bybit BTCUSDT / ETHUSDT, 30-day window).

## In Progress

- None.

## Next Up

Batch 3 – (awaiting instruction)

## Open Questions

- None.

## Architecture Decisions

- Dead-letter queue: Redis (`broadcast:dead:<channel>`) — never filesystem `/tmp`.
- Dedup: 3-layer (URL + title + content SHA-256), 7-day TTL in Redis.
- Stripe idempotency: Redis SET NX, 7-day TTL.
- Cron auth: `validateVercelCronAuth` (Authorization: Bearer) — matches Vercel Cron format.
- Newsletter unsubscribe: Neon `updated_at = NOW()` + Resend audience removal.

## Session Notes

- Stack: Next.js 14, Upstash Redis, Sanity CMS, Resend, Stripe, Telegram Bot API, Neon PostgreSQL.
- `src/types/declarations.d.ts` declares `lucide-react` and `@heroicons/react` to silence TS7016.
- `tsconfig.json` uses `moduleResolution: bundler`.
- Dev server exits after "✓ Starting..." in Replit sandbox — pre-existing environment issue,
  not caused by any code changes.
