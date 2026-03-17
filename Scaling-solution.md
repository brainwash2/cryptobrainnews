# Scaling Solution – Research & Improvement Log

## Goal
Transform the CryptoBrainNews data section into a world‑class terminal rivaling The Block, Dune, and Token Terminal by refining data sources, visualization quality, real‑time accuracy, and overall reliability.

## Current Status (March 15, 2026)
- **Phases 1–40 complete**: core pages built with free APIs (CoinGecko, DefiLlama, mempool.space, beaconcha.in, Solana RPC, etc.).
- **Phase 41 (Scaling Solutions) implemented**, but the live site shows critical issues:
  - `/data/scaling`, `/data/scaling/l1-evm`, `/data/scaling/l1-non-evm`, `/data/scaling/data-availability` **crash with “Terminal Error”** – likely due to Dune query failures or missing fallbacks.
  - `/data/scaling/l2-comparison` displays numbers but has:
    - **Unit formatting errors** (e.g., `Base $4.198` missing “B”)
    - **Mis‑ordered values** (Starknet incorrectly showing $4.19B)
    - **Unbounded table** (rows numbered 1‑500+ with empty data)
  - `/data/scaling/optimistic` shows only one row (`Base`); columns `24h %`, `7d %`, `protocols`, `share` are empty.
  - `/data/scaling/zk` has similar missing columns and mis‑labeled networks.
- **Dune Analytics integration** placeholder IDs have been replaced, but the actual queries may not return the expected columns or are timing out.
- **Caching layer** (`cached` utility) still returns `null` on failure, causing blank UI – no stale‑while‑revalidate.
- **Error boundaries** show generic messages without recovery options.

## Immediate Hotfixes (Phase 42 – High Priority)
- [ ] **Verify Dune query IDs** – Cross‑check every ID in `src/lib/dune.ts` against the actual queries in the Dune dashboard. Ensure each query returns the columns our pages expect (e.g., `change_24h`, `change_7d`, `protocol_count`, `dominance_share`).
- [ ] **Add fallback data sources** for each chain (e.g., DefiLlama for TVL, public RPCs for basic metrics) so pages never crash completely.
- [ ] **Limit data rows** – Add `.slice(0, 50)` or proper pagination to the `l2-comparison` table.
- [ ] **Unit formatting** – Apply `formatNumber`/`formatUsd` consistently in `BlockChartCard` and `DataTable` (especially for TVL values).
- [ ] **Error boundaries** – Wrap each chart in a custom error boundary that shows a retry button and optionally stale cached data.
- [ ] **Fix data pivot logic** – Correct the mapping in `l2-comparison/page.tsx` to assign values to the correct chains.
- [ ] **Implement missing pages** – Add data fetching for `/data/scaling/l1-evm`, `/data/scaling/l1-non-evm`, `/data/scaling/data-availability` using either Dune or alternative sources.

## Pending Improvements (Longer‑Term)

### 1. Dune Queries – Production‑Ready Integration
- [ ] For each on‑chain page, create comprehensive Dune queries covering:
  - **Bitcoin**: active addresses, transactions, miner revenue, UTXO age.
  - **Ethereum**: burned ETH (EIP‑1559), gas usage, contract deployments.
  - **Solana**: fee breakdown, active signers, real‑time TPS.
  - **Avalanche**: C‑chain active addresses, subnet metrics.
  - **Aptos**: daily transactions, fees, active accounts.
  - **Flows**: whale transfers, exchange inflows/outflows.
- [ ] Use Dune's `cached` wrapper with long TTL (12‑24h) to conserve credits.
- [ ] Add `revalidate` tags for incremental updates.

### 2. Chart Quality & Interactivity
- [ ] Upgrade `OnchainAreaChart` to support dual‑axis (e.g., price + volume).
- [ ] Add time‑frame toggles (1D, 7D, 30D, 1Y) to all charts (reuse `TimeframeSelector`).
- [ ] Implement heatmaps for funding rates or liquidations.
- [ ] Add tooltip with more context (e.g., when hovering, show exact value + date).
- [ ] Smooth animations with `recharts` built‑in.

### 3. Data Source Expansion & Fallbacks
- [ ] Research free alternatives to Dune for chains not covered:
  - **Arbitrum/Optimism**: use public RPC or The Graph.
  - **Cosmos ecosystem**: use Mintscan API.
  - **Near**: use Near RPC.
- [ ] Integrate alternative sources for ETF flows (Farside Investors, but they lack free API – consider scraping).
- [ ] Add funding rate history from Coinglass (check free tier).
- [ ] For critical APIs, implement **multiple sources** and fallback order (e.g., if mempool.space fails, use blockchain.info; if beaconcha.in fails, use Etherscan).
- [ ] Maintain a **health check** for each external API to detect outages early and switch to stale cache or fallback.

### 4. Error Handling & Resilience (Critical)
- [ ] Enhance `cached` utility to serve **stale data** when a refresh fails (stale-while-revalidate). Store last successful value in Redis/memory with an expiry flag.
- [ ] Implement **exponential backoff** retry logic for transient failures.
- [ ] Add **graceful degradation**: if a specific metric is unavailable, show last known value + timestamp, or a human‑readable message like "Data temporarily unavailable – showing cached value".
- [ ] Improve error boundaries to display more informative messages without leaking sensitive details. Use the `digest` property to log errors to monitoring services (Sentry, Logtail).
- [ ] Add a **global status page** (e.g., `/status`) that shows the health of all external data sources.
- [ ] For server components, wrap fetches in `try/catch` and return a fallback shape (e.g., `{ error: true, staleData: cachedValue }`), then render a user‑friendly notice.

### 5. Performance Optimizations
- [ ] Implement `loading.tsx` skeletons for all pages (currently using `ChartSkeleton` – ensure it's consistent).
- [ ] Use `next/dynamic` for heavy charts to reduce bundle size.
- [ ] Add `SWR` or `react-query` for client‑side data refresh on tickers.

### 6. Premium / Agentic Enhancements
- [ ] Expose aggregated on‑chain data via Oracle API (`/api/oracle/onchain`).
- [ ] Create "whale watch" alerts (email/telegram) for large transactions.
- [ ] Build a dashboard for users to track their own addresses (requires authentication).

### 7. Monitoring & Observability
- [ ] Integrate a logging service (Sentry) to capture API failure rates.
- [ ] Set up **health checks** for each critical external API (e.g., using a cron job or serverless function).
- [ ] Create a **status dashboard** for internal use showing which data sources are up/down.

## How to Use This File
- Whenever you discover a new improvement or encounter a failure (like the recent scaling page errors), add it here.
- Before starting a new refactor phase, review this list and prioritize tasks based on impact.
- Share this file with your AI assistant to get implementation plans for the highest‑priority items.
- After each phase, update the "Current Status" section and check off completed tasks.

---

## Audit Findings – Phases 37‑41 (2026-03-16)

### Immediate Hotfixes (Phase 42 – High Priority)
- [ ] **Verify Dune query IDs for on‑chain pages** – Bitcoin, Ethereum, Solana, and L2 pages use Dune placeholders. Create production queries for active addresses, daily transactions, fees, etc., and update `src/lib/dune.ts`.
- [ ] **Add fallback data for Dune queries** – When a Dune query fails, serve data from secondary sources (e.g., blockchain.info for BTC, beaconcha.in for ETH, DefiLlama for TVL) so pages never show empty states or crash.
- [ ] **Fix unit formatting in scaling tables** – Use `formatUsd` consistently for TVL values (e.g., "Base $4.198B" instead of "$4.198"). Ensure all tables display numbers with correct suffixes (B/M/K).
- [ ] **Correct chain name mapping in L2 comparison** – `feeMap.get(c.name.toLowerCase())` fails when the name in `allL2s` (e.g., "OP Mainnet") differs from the fee protocol name (e.g., "optimism"). Use fuzzy matching or a manual mapping object.
- [ ] **Limit rows in L2 comparison table** – The table currently shows 500+ rows with empty data. Apply `.slice(0, 50)` to `allL2s` and ensure only active chains are displayed.
- [ ] **Restore missing columns in optimistic/zk pages** – Add `change1d`, `change7d`, `protocols`, and `share` columns to the tables; populate them from `getOptimisticRollups()` and `getZkRollups()`.
- [ ] **Add loading skeletons to all scaling pages** – Ensure each page has a `loading.tsx` using `ChartSkeleton` for consistency.
- [ ] **Wrap charts in error boundaries** – Prevent a single chart failure from crashing the entire page. Provide a retry button and show last‑known data if available.

### Pending Improvements (Longer‑Term)

#### Data Source Reliability & Expansion
- [ ] **Implement stale‑while‑revalidate in `cached` utility** – Store the last successful fetch in Redis/memory and return it when a refresh fails, with a timestamp indicating staleness.
- [ ] **Add secondary price sources** – If CoinGecko fails, fall back to CoinPaprika or CryptoCompare for prices, market caps, and volumes.
- [ ] **Integrate L2Beat API for scaling metrics** – Use L2Beat's official API (if available) alongside DefiLlama for more accurate L2 data (throughput, costs, stack details).
- [ ] **Add Coinglass for futures data** – Coinglass provides historical open interest, liquidations, and funding rates across multiple exchanges. Use their free tier or scrape.
- [ ] **Pull ETF flow data from Dune** – Create Dune queries for daily ETF flows (e.g., from Arkham or other datasets) and integrate into ETF pages.
- [ ] **Add on‑chain data for missing chains** – Avalanche and Aptos pages currently use only TVL. Add Dune queries for active addresses, transactions, fees, etc.

#### UI/UX Polish
- [ ] **Make all tables horizontally scrollable on mobile** – Ensure tables do not overflow the viewport; add a wrapper with `overflow-x-auto`.
- [ ] **Add time‑frame toggles to remaining charts** – Onchain area charts and scaling charts should support 7D/30D/YTD/1Y views (reuse `TimeframeSelector`).
- [ ] **Implement “Export to CSV” buttons** – Add a button next to each table that exports the displayed data as a CSV file.
- [ ] **Improve tooltip richness** – In charts, show additional context (e.g., date, exact value, % change) and use a consistent dark tooltip design.
- [ ] **Sticky table headers** – Ensure all data tables have sticky headers for easy scrolling.

#### Performance Optimizations
- [ ] **Lazy‑load charts below the fold** – Use `next/dynamic` with `ssr: false` for heavy chart components to reduce initial bundle size.
- [ ] **Optimize recharts imports** – Import only specific chart types (e.g., `import { AreaChart, Area } from 'recharts'`) to reduce bundle size.
- [ ] **Add `loading=lazy` to off‑screen images** – For coin logos in tables, add `loading="lazy"` to improve perceived performance.

#### New Features & Integrations
- [ ] **Build a “Watchlist” feature** – Allow authenticated users to save coins/chains and receive price/activity alerts via email or Telegram.
- [ ] **Add price alerts** – Let users set thresholds and get notified when price crosses.
- [ ] **Create a “Comparison” tool** – Overlay multiple chains’ TVL, transactions, or fees on a single chart.
- [ ] **Integrate The Graph for custom on‑chain queries** – Use subgraphs for real‑time DeFi data (e.g., Uniswap pools, lending positions).

### Web Scraping Candidates (for Claude 4.6 Sonnet)
The following data sources lack public APIs but can be scraped periodically:

- [ ] **Farside Investors ETF flows** – Scrape daily table from [farside.co.uk](https://farside.co.uk/) for Bitcoin/Ethereum ETF flow data.
- [ ] **GMCI indices** – If official index values are not available via API, scrape from their website.
- [ ] **CFTC Commitments of Traders (COT) reports** – Download and parse weekly CSV files from [cftc.gov](https://www.cftc.gov/MarketReports/CommitmentsofTraders/HistoricalViewable/index.htm).
- [ ] **SEC EDGAR filings** – Scrape 13F filings for ETF holdings and public company treasury updates (complex, but can be done with scheduled scripts).
- [ ] **Public company treasury disclosures** – Monitor press releases and filings for announcements of new crypto purchases; use news RSS or EDGAR.

### Observability & Monitoring
- [ ] **Add a `/status` endpoint** – Show health status of all external APIs (CoinGecko, DefiLlama, Dune, etc.) with last successful fetch timestamps.
- [ ] **Integrate Sentry for error tracking** – Log all fetch failures with context (API endpoint, error message) to identify recurring issues.
- [ ] **Set up cron‑based health checks** – Use a serverless function to periodically test critical endpoints and alert if they are down.

