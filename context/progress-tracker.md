# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Batch 30 – Deep Multi-Part Audit ✅

## Current Goal

Full live-site audit of all data terminal pages, news pipeline, and newsletter — identify and fix all crash-level bugs.

---

### Batch 30 — Audit Pass: Critical Bug Fixes ✅

**Files changed:**

| File | Change |
|------|--------|
| `src/app/news/page.tsx` | Guard `hero.url` with `?? ''` before `.startsWith('http')` — was crashing entire /news page |
| `src/app/news/[id]/page.tsx` | Guard `rel.url` with `?? ''` in related articles links |
| `src/components/news/NewsTickerBar.tsx` | Guard `a.url` with `?? ''` — was crashing the ticker on any article without a URL |
| `src/app/bookmarks/_components/BookmarksClient.tsx` | Guard `article.url` with `?? ''` |
| `src/app/page.tsx` | Guard `hero.url` with `?? ''` on homepage hero link |
| `src/app/data/defi/tvl/_components/DeFiTvlClient.tsx` | Replace `CategoryHistogram` (used `cat.category` as lightweight-charts `time` field — rejected for non-date strings like "CEX") with plain React `CategoryBars` component |
| `src/lib/news/newsletter.ts` | Remove `{{email}}` placeholder from unsubscribe link (was never replaced per-recipient in batch-send architecture) |
| `src/lib/derivatives.ts` | Wrap `trade_volume_24h_btc` and `open_interest_btc` in `Number()` — CoinGecko returns them as strings at runtime, causing JS string concatenation in the futures volume reduce |

#### Critical Bugs Fixed

1. **`/news` WIRE INTERRUPTED crash** — `hero.url` undefined → `hero.url.startsWith('http')` TypeError. Fixed across 5 call sites: `/news/page.tsx`, `/news/[id]/page.tsx`, `NewsTickerBar.tsx`, `BookmarksClient.tsx`, `app/page.tsx`.
2. **`/data/defi/tvl` "Invalid date string=CEX"** — `CategoryHistogram` fed `cat.category` (e.g. "CEX", "Dex", "Lending") as the `time` field to lightweight-charts HistogramSeries. lightweight-charts requires valid ISO date strings for its time scale. Fixed by replacing with a pure React `CategoryBars` component (horizontal bar chart) that needs no time axis.
3. **Newsletter unsubscribe `{{email}}` placeholder** — `buildHTML()` received `_recipients: string[]` but never substituted `{{email}}` in the per-batch unsubscribe URL. Batch-send sends one email to multiple recipients simultaneously, so per-recipient personalisation is impossible without individual sends. Fixed by using the bare `UNSUBSCRIBE_BASE` URL.
4. **Futures volume display `0288982.04112468.12 BTC`** — CoinGecko `/derivatives/exchanges` returns `trade_volume_24h_btc` and `open_interest_btc` as strings at runtime despite the type annotation. `reduce((s, e) => s + e.volume24h)` became string concatenation. Fixed with `Number()` coercion at the mapping stage.

#### Pages Audited — Status

| Page | Status |
|------|--------|
| `/news` | FIXED (was crashing — hero.url undefined) |
| `/data/markets/spot` | ✅ Live data |
| `/data/markets/futures` | ✅ Fixed volume display |
| `/data/markets/options` | ✅ Live data (Deribit) |
| `/data/markets/companies` | ✅ Live data (CoinGecko) |
| `/data/markets/indices` | ✅ |
| `/data/markets/exchange-tokens` | ✅ |
| `/data/etfs/bitcoin` | ✅ Live AUM data |
| `/data/onchain/bitcoin` | ✅ Live (blockchain.info + mempool.space) |
| `/data/onchain/ethereum` | ✅ Live (beaconcha.in + DefiLlama) |
| `/data/onchain/bridge-flows` | ✅ Live (DefiLlama) |
| `/data/onchain/gas` | ✅ Live (Arbitrum/OP/Base RPCs) |
| `/data/onchain/flows` | ✅ Live (DEX proxy via DefiLlama; Glassnode key needed for true CEX) |
| `/data/scaling` | ✅ Live L2 TVL |
| `/data/defi/tvl` | FIXED (was crashing — CategoryHistogram invalid time) |
| `/data/defi/lending` | ✅ Live (DefiLlama) |
| `/data/defi/yields` | ✅ Live (DefiLlama) |
| `/data/defi/revenue` | ✅ Live (DefiLlama) |
| `/data/defi/liquidation-heatmap` | ✅ Live |
| `/data/defi/restaking` | ✅ Live |
| `/data/defi/rwa` | ✅ Live |
| `/data/defi/exploits` | ✅ Curated reference data |
| `/data/defi/dex-volume` | ✅ Live |
| `/data/defi/large-swaps` | ✅ Live (Dune) |
| `/data/defi/derivatives` | ✅ Live (Hyperliquid) |
| `/data/defi/whale-watch` | ✅ Structure correct (needs ETHERSCAN_API_KEY env) |
| `/data/defi/token-unlocks` | ✅ Structure correct (DefiLlama endpoint needs config) |
| `/data/defi/launchpads` | ⏳ ComingSoon stub |
| `/data/nfts/volume` | ✅ Live |
| `/data/governance` | ✅ Live (Tally/Snapshot seed data) |
| `/data/alternative/funding` | ✅ Reference Q1 2026 data |
| `/data/alternative/social` | ✅ Live (ApeWisdom + Santiment) |
| `/data/alternative/app-usage` | ✅ Reference data |
| `/data/stablecoins/usd` | ⚠️ Loading skeleton (slow API) |
| `/data/markets/volumes` | ⏳ ComingSoon stub |
| `/data/stablecoins/non-usd` | ⏳ ComingSoon stub |
| `/data/stablecoins/non-fiat` | ⏳ ComingSoon stub |

#### Sidebar Navigation — Verified Clean
- All sidebar hrefs cross-checked against actual page directories
- No broken links in `src/lib/sidebar-config.ts`
- Governance is at `/data/governance` (standalone, not under DeFi) — correct

**TypeScript:** `npx tsc --noEmit --skipLibCheck` — zero errors.
