

## `upgrade-data.md` – CryptoBrainNews Data Terminal: Complete Refactor Plan

### 1. Project Context & Current State

**CryptoBrainNews** is a production‑ready crypto intelligence platform built with Next.js 16, TypeScript, Tailwind CSS, and Neon PostgreSQL. The site is live at [cryptobrainnews.vercel.app](https://cryptobrainnews.vercel.app). We have completed 36 phases of development, resulting in:

- A solid core infrastructure with edge‑cached APIs, agent‑native features, and a brutalist/terminal design system.
- Partial data pages for **Stablecoins**, **Protocol Revenue**, **L2 Scaling**, and **Futures**.
- Reusable UI components (`DataTable`, `BlockChartCard`, `GaugeCard`, `MetricCard`, `DataSidebar`).
- Data pipelines via `src/lib/api.ts` (DefiLlama), `src/lib/derivatives.ts` (Binance, DefiLlama derivatives), `src/lib/l2beat.ts` (L2Beat/DefiLlama), and `src/lib/dune.ts` (Dune Analytics).

**Current Issues** (based on user feedback):
- Some pages (Stablecoins, Revenue) still have layout glitches, duplicate columns, and poor readability.
- The Futures page uses a simulated trend chart instead of real historical data.
- Many sections from the original vision (`metrics.txt`) are missing or incomplete (Options, ETFs, Treasuries, On‑Chain, etc.).
- Premium‑gating components (e.g., `AlphaGate`) are still present on some data pages – these must be removed.
- Overall polish does not yet meet institutional standards (Bloomberg terminal aesthetic).

### 2. Goals of This Refactor

- **No mock data** – every metric must come from a real, reliable API source.
- **Professional visual design** – dark, dense, information‑rich layout with clear typography, time‑frame toggles, and consistent spacing. Inspired by Bloomberg terminals but with a modern crypto twist.
- **Complete coverage** – implement all pages listed in `metrics.txt` (attached).
- **Remove premium gating** – strip all `AlphaGate` or paywall components from data pages; data should be fully accessible.
- **Strict TypeScript** – no `any`, no implicit `any`. Extend types as needed.
- **Edge‑cached APIs** – use the existing `cached` utility (Upstash Redis + memory) with appropriate TTLs.
- **Graceful error handling** – if an API fails, show a friendly empty state, not a crash.
- **Reuse existing components** – leverage `DataTable`, `BlockChartCard`, `GaugeCard`, `MetricCard`, `DataSidebar`. Extend them with new props if necessary.
- **Follow the established file structure** – new pages go under `src/app/data/[category]/[slug]/page.tsx`. Update `src/lib/sidebar-config.ts` accordingly.
- **Deliver as `cat` commands** – all code changes must be provided as exact `cat << 'EOF' > ...` blocks. Include immutable ledger updates (`task.md`, `implementation-plan.md`) with each phase.

### 3. Phased Implementation Plan

We will tackle the refactor in logical phases. For each phase, you will output the necessary `cat` commands, then append status updates to the ledgers. Wait for explicit approval before moving to the next phase.

---

#### Phase 37: Foundation & Cleanup

- **Remove premium gating** – delete all imports and usages of `AlphaGate` from existing data pages (`/data/defi/revenue`, `/data/defi/stablecoins`, `/data/scaling`, `/data/markets/futures`). If any page conditionally hides content behind a paywall, make it always visible.
- **Audit and fix TypeScript errors** in existing data modules (`api.ts`, `derivatives.ts`, `l2beat.ts`, `dune.ts`). Ensure all functions return proper types.
- **Update `src/lib/sidebar-config.ts`** to include all sections from `metrics.txt`. (The current sidebar config is in the attached codebase; you will extend it.)
- **Create placeholder pages** for missing top‑level sections (e.g., `/data/markets/spot`, `/data/etfs`, `/data/treasuries`, `/data/onchain`, `/data/scaling/l1-evm`, etc.). Each placeholder should have a simple "Coming Soon" message and use the existing layout. This ensures sidebar links work and the structure is ready for later phases.

---

#### Phase 38: Core Markets (Spot, Futures, Options, Indices, COTs, Prices)

- **Spot**: Build `/data/markets/spot/page.tsx` using CoinGecko and DefiLlama data. Include metrics from `metrics.txt` (global aggregate volumes, market structure, regional flows, exchange‑specific). Use `BlockChartCard` for volume charts and `DataTable` for exchange rankings.
- **Futures**: Upgrade the existing `/data/markets/futures/page.tsx` to use real historical data where possible (e.g., from Coinglass or Binance futures historical endpoints). If unavailable, keep the simulated trend but improve the disclaimer and add time‑frame toggles. Add missing metrics: open interest by asset, liquidations, funding rates by exchange.
- **Options**: Create `/data/markets/options/page.tsx` using Deribit API and CME options data. Show aggregated OI/volume, put/call ratio, implied volatility, and skew charts. Use `BlockChartCard` for volatility curves and `DataTable` for top options contracts.
- **Indices**: Create `/data/markets/indices/page.tsx` for GMCI indices (prices, performance). Source from CoinGecko or DefiLlama.
- **CME COTs**: Create `/data/markets/cme-cots/page.tsx` using CFTC data (may require parsing or a third‑party API; if too complex, use a placeholder with explanation).
- **Prices**: Create `/data/markets/prices/page.tsx` with market cap, dominance, fear & greed, and price performance tables. Use CoinGecko/DefiLlama.

For all pages, add time‑frame toggles (1D, 7D, 30D, YTD, 1Y) to charts. Ensure numbers are formatted consistently.

---

#### Phase 39: ETFs & Treasuries

- **Bitcoin ETFs**: Build `/data/etfs/bitcoin/page.tsx` using Dune Analytics or Farside Investors API. Show flows, AUM, market share, issuer data. Use `DataTable` for issuers, `BlockChartCard` for cumulative flows.
- **Ethereum ETFs**: Similar structure at `/data/etfs/ethereum`.
- **Solana ETFs**: `/data/etfs/solana` (if data available).
- **XRP ETFs**: `/data/etfs/xrp`.
- **Crypto ETFs**: `/data/etfs/crypto` for other assets (Dogecoin, Litecoin, etc.).
- **ETF Comparison**: `/data/etfs/comparison` with market share charts.
- **Bitcoin Treasuries**: `/data/treasuries/bitcoin` using CoinGecko's public companies API and DefiLlama. Show holdings, market caps, premium/discount.
- **Ethereum Treasuries**: Similar at `/data/treasuries/ethereum`.
- **Solana Treasuries**: `/data/treasuries/solana`.
- **Crypto Treasuries**: `/data/treasuries/crypto` with aggregated data.

---

#### Phase 40: On‑Chain Metrics

- **Bitcoin**: `/data/onchain/bitcoin` – transactions, active addresses, fees, miner revenue, hash rate, supply metrics, Runes/Ordinals. Use Dune Analytics queries (add to `dune.ts`). Cache heavily.
- **Ethereum**: `/data/onchain/ethereum` – burned ETH, transactions, active addresses, staking metrics, gas, contracts. Use Dune.
- **Solana**: `/data/onchain/solana` – transactions, active addresses, fees, REV, validators. Use Dune or Solana RPC.
- **Avalanche**: `/data/onchain/avalanche` – C‑chain activity, subnets. Use Dune.
- **Aptos**: `/data/onchain/aptos` – transactions, fees, active addresses. Use Dune.
- **Comparison**: `/data/onchain/comparison` – cross‑chain metrics (fees, active addresses, TPS, etc.). Use Dune.
- **Flows**: `/data/onchain/flows` – exchange inflows/outflows, whale transactions. Use Dune and Nansen if available.

---

#### Phase 41: Scaling Solutions

- **Overview**: `/data/scaling/page.tsx` (already exists) – enhance with more metrics: TVL by type, L1 data fees, blob metrics, etc.
- **Layer 1: EVM Blockchains**: `/data/scaling/l1-evm` – daily active addresses, transactions for chains like Ethereum, BNB, Avalanche C‑chain, Polygon. Use DefiLlama and Dune.
- **Layer 1: Non‑EVM Blockchains**: `/data/scaling/l1-non-evm` – Terra Classic, NEAR, XRP, Stellar, TON. Use available APIs.
- **Layer 2: Optimistic Rollups**: `/data/scaling/optimistic` – transactions, active addresses, fees for Arbitrum, Optimism, Base. Use Dune and L2Beat.
- **Layer 2: ZK Rollups**: `/data/scaling/zk` – Starknet, zkSync, Scroll, Linea. Use L2Beat and Dune.
- **Data Availability**: `/data/scaling/data-availability` – Celestia data posted, blob metrics, Manta Pacific. Use L2Beat and Celestia API.

---

#### Phase 42: DeFi (All Subsections)

- **Exchange (DEXs)**: `/data/defi/dex-volume` (already exists) – enhance with more metrics: aggregator share, new tokens, per‑chain DEX stats. Use DefiLlama.
- **Restaking**: `/data/defi/restaking` – EigenLayer TVL, deposits/withdrawals, restaker analysis. Use DefiLlama.
- **Lending**: `/data/defi/lending` – Aave, Compound, MakerDAO metrics: TVL, outstanding debt, rates, liquidations. Use DefiLlama.
- **Launchpads**: `/data/defi/launchpads` – Pump.fun, Solana launchpads: revenue, graduated tokens. Use Dune.
- **Prediction Markets**: `/data/defi/prediction` – Polymarket, Kalshi: volume, OI, active markets. Use Polymarket Gamma API and Kalshi API.
- **Derivatives**: `/data/defi/derivatives` – Hyperliquid, dYdX, GMX: volume, OI, liquidations. Use DefiLlama derivatives overview and Hyperliquid API.
- **RWA**: `/data/defi/rwa` – total RWA TVL by protocol, issuer, blockchain. Use DefiLlama.
- **Exploits**: `/data/defi/exploits` – stolen funds, largest exploits. Use Dune (e.g., `exploits` dataset).
- **Protocol Revenue**: `/data/defi/revenue` (already exists) – enhance with more protocols, category breakdowns.
- **Value Locked**: `/data/defi/tvl` (already exists) – enhance with category and chain breakdowns, liquid staking, wrapped assets.
- **Social (DeSo)**: `/data/defi/social` – friend.tech, Farcaster metrics. Use Dune.

---

#### Phase 43: NFTs & Alternative Metrics

- **NFT Overview**: `/data/nfts/page.tsx` – trade volume by chain, buyers/sellers, mints. Use Dune.
- **Art & Collectibles**: `/data/nfts/art` – top collections, floor prices, sales. Use Dune.
- **Gaming**: `/data/nfts/gaming` – gaming NFT volume, sales. Use Dune.
- **Marketplaces**: `/data/nfts/marketplaces` – monthly volume by marketplace, aggregator share. Use Dune.
- **Alternative Metrics**:
  - **Venture Funding**: `/data/alternative/funding` – RootData API (if free) or placeholder.
  - **Politics**: `/data/alternative/politics` – Crypto PAC data (if available).
  - **Web Traffic**: `/data/alternative/web-traffic` – Google Trends via unofficial API or placeholder.
  - **App Usage**: `/data/alternative/app-usage` – App Store rankings via Sensor Tower or placeholder.
  - **Social**: `/data/alternative/social` – Wikipedia pageviews, YouTube/Twitter metrics. Use placeholder with note.

---

#### Phase 44: Final Polish & Testing

- Review all pages for consistency: ensure all tables use the same styling, all charts have proper axis labels, all numbers are formatted identically.
- Add loading skeletons and error boundaries to each page.
- Ensure mobile responsiveness (the terminal should be usable on tablets/desktop; mobile can be limited but not broken).
- Run a full build (`npm run build`) and test all endpoints. Fix any TypeScript errors or runtime issues.
- Update the immutable ledgers with a final completion status.

### 4. Technical Standards & Notes

- **Data Sources**:
  - **DefiLlama**: TVL, yields, fees, revenue, stablecoins, derivatives overview. Use `https://api.llama.fi/...`.
  - **CoinGecko**: Prices, market cap, volume, categories, public companies treasury. Use free tier (rate limits: 10‑30 calls/min). Implement caching aggressively.
  - **Binance**: Funding rates, futures metrics via `https://fapi.binance.com/...`.
  - **Deribit**: Options data via `https://www.deribit.com/api/v2/...`.
  - **Dune Analytics**: Custom queries for on‑chain, ETFs, NFTs, etc. Add new query IDs to `dune.ts` and use `cached` with long TTLs (24h).
  - **L2Beat**: L2 scaling metrics via `https://l2beat.com/api/...` (if public) or fallback to DefiLlama chains.
  - **Polymarket**: Use Gamma API for prediction markets.
  - **Kalshi**: Use their public API.
  - **RootData** (venture): Check if free tier available; otherwise use placeholder.
- **Caching**: All fetches must use `cached(key, fn, ttl)`. Suggested TTLs:
  - Prices/funding rates: 5 min
  - TVL, volume, OI: 1 hour
  - Dune queries: 12‑24 hours
  - Static data (e.g., company lists): 1 day
- **TypeScript**: Add new interfaces to `src/lib/types.ts`. Use `export interface` and import them where needed. No `any`.
- **Component Extensions**:
  - `BlockChartCard` already supports `composed` type (dual‑axis). Use it for price+volume charts.
  - `DataTable` now accepts a `format` function that receives both value and row (for complex cells). Use this for asset+ticker columns.
  - `GaugeCard` is ready for dominance and sentiment metrics.
  - Create a new `TimeframeSelector` component (if needed) to toggle between 1D, 7D, 30D, YTD, 1Y. It should emit a value that can be used to filter data client‑side or trigger new fetches.
- **UI/Design**:
  - Background: `#050505`, card background: `#0a0a0a`, borders: `#1a1a1a`.
  - Primary accent: `#FABF2C` (gold), success: `#00d672` (green), error: `#ff4757` (red).
  - Fonts: `font-sans` for headings, `font-mono` for data.
  - All tables should have alternating row colors (`even:bg-[#080808] odd:bg-[#050505]`).
  - Use `tabular-nums` for numbers.
  - Keep the layout dense but not cluttered; aim for Bloomberg‑like information density.

### 5. Deliverables

For each phase, you must provide:

- One or more `cat` commands to create/overwrite files. Each command should be of the form:

  ```bash
  cat << 'EOF' > path/to/file
  ... file content ...
  EOF
  ```

- After the file commands, include ledger updates:

  ```bash
  cat << 'EOF' >> task.md
  [YYYY-MM-DD] STATUS UPDATE
  	•	Reference: Phase X (Task description)
  	•	New Status: COMPLETED
  	•	Notes: ...
  EOF
  ```

  and similarly for `implementation-plan.md` if needed.

- Wait for explicit approval (e.g., "go ahead", "approve", "proceed") before moving to the next phase.

### 6. Beginning with Phase 37

Now, review the attached files, especially `gemini-context.txt` and `metrics.txt`. Then provide the `cat` commands for **Phase 37: Foundation & Cleanup** as described above. I will execute them and then approve Phase 38.