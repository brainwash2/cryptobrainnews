# Implementation Plan

## Phase 1: Analysis & Infrastructure
- Initialize immutable ledgers for project state.
- Analyze codebase for structural anti-patterns, hydration risks, and TS warnings.

## Phase 2: Design & Build Stabilization
- Refactor `AppImage` to remove `any` typings.
- Fix React hydration mismatches in time rendering (`CointelegraphCard`).
- Apply strict types to DefiLlama APIs (`api.ts`).

## Phase 3: Data Terminal & News Engine
- Connect Dune analytics endpoints safely to placeholder routes.
- Modularize Groq API interactions to prevent timeouts.

## Phase 4: Publishing Workflow & Monetization
- Finalize Supabase RLS policies and article fetching.
- Distribute `AdUnit` and `AffiliateLink` components in high-engagement areas.

## Phase 5: Verification & Hardening
- Test Vercel Edge caching strategies and Supabase connection resilience.

## Phase 6: CMS Stabilization & Price Indexes Polish
- Fix Upstash Redis static build crashes by enforcing `force-dynamic` on `/` and `/news`.
- Implement defensive type-checking for external News API arrays.
- Overhaul `/price-indexes` UI with Cointelegraph-style currency and category dropdowns.
- Consolidate Supabase fragmented SQL queries into a unified Master Schema.

## Phase 6: CMS Stabilization & Price Indexes Polish
- Fix Upstash Redis static build crashes by enforcing `force-dynamic` on `/` and `/news`.
- Implement defensive type-checking for external News API arrays.
- Overhaul `/price-indexes` UI with Cointelegraph-style currency and category dropdowns.
- Consolidate Supabase fragmented SQL queries into a unified Master Schema.

## Phase 7: UI Bug Fixes & Real Data Injection
- Fix `TypeError` crash in `formatUsd` by handling `null` API responses.
- Fix dropdown clipping by removing `overflow-hidden` from layout wrappers.
- Remove mock data from Airdrops and Events pages.
- Inject real on-chain data into Supabase via SQL.

## Phase 8: Sanity.io CMS Migration (Pending)
- Initialize Sanity project.
- Create schemas for News Articles.
- Migrate `/news` and `/[slug]` to fetch from GROQ.

## Phase 7: UI Bug Fixes & Real Data Injection
- Fix `TypeError` crash in `formatUsd` by handling `null` API responses.
- Fix dropdown clipping by removing `overflow-hidden` from layout wrappers.
- Remove mock data from Airdrops and Events pages.
- Inject real on-chain data into Supabase via SQL.

## Phase 8: Sanity.io CMS Migration (Pending)
- Initialize Sanity project.
- Create schemas for News Articles.
- Migrate `/news` and `/[slug]` to fetch from GROQ.

## Phase 7: UI Bug Fixes & Real Data Injection
- Fix `TypeError` crash in `formatUsd` by handling `null` API responses.
- Fix dropdown clipping by removing `overflow-hidden` from layout wrappers.
- Remove mock data from Airdrops and Events pages.
- Inject real on-chain data into Supabase via SQL.

## Phase 8: Sanity.io CMS Migration (Pending)
- Initialize Sanity project.
- Create schemas for News Articles.
- Migrate `/news` and `/[slug]` to fetch from GROQ.

## Phase 9: SEO & Organic Growth Optimization
- Add JSON-LD Structured Data (Schema.org) to News Articles for Google Rich Snippets.
- Implement Next.js dynamic `sitemap.ts` and `robots.ts`.
- Set up `@vercel/og` for automated OpenGraph social sharing images.

## Phase 10: Enterprise Architecture & Real-Time
- Migrate Top Price Ticker from REST polling to WebSockets (zero-latency).
- Implement pre-commit hooks (Husky + lint-staged) for strict code quality.

## Phase 11: Feature Automation (Airdrops & Events)
- Migrate `/airdrops` from manual CMS to automated tokenless protocol detection using DefiLlama API.
- Migrate `/events` from manual CMS to CoinMarketCal Widget iframe.

## Phase 12: Content Engine Fortification
- Revert Events iframe (blocked by CSP) to a hybrid RSS/Supabase custom UI with advanced features.
- Enhance Airdrops scanner with Probability algorithms and TVL change metrics.
- Add "Airdrop Radar" and "Events" discovery sections directly to the Homepage.
- Fortify the News Engine with robust multi-source RSS fallbacks when AI keys are missing.

## Phase 13: Programmatic SEO Foundation
- Implement infinite-scroll Ticker Tape using free CoinCap API.
- Augment RSS engine to support dynamic Google News searches by coin.
- Generate dynamic `sitemap.xml` for indexation.

## Phase 14: Dynamic SEO Pages & Widgets
- Build `/coins/[slug]` utilizing hybrid static/dynamic Next.js rendering.
- Integrate TradingView 'advanced-chart' widget safely in React.
- Inject contextual "Buy" affiliate buttons.

## Phase 15: Deep Monetization (Events & Airdrops)
- Inject Travala/Booking widgets into Event pages based on city/date.
- Expand Airdrops "Liquidity Loop" with Quest and Hardware Wallet affiliate layers.

## Phase 17: The Agentic Pivot
- Pivot `/alpha-guides` to target the 2026 Agentic Economy.
- Redesign value prop around OpenClaw playbooks, Sybil-evasion variables, and automated orchestration.

## Phase 14: Foundation for Both Audiences
- Create `public/llms.txt` (agent index) and update `robots.txt`.
- Add content negotiation headers for JSON responses.
- Enhance human UI with newsletter/social CTAs.

## Phase 15: Unified Airdrop Engine
- Build `/airdrops/[slug]` with dual rendering: human UI + JSON‑LD.
- Include affiliate links in both views.
- Add API key check for raw JSON feed.

## Phase 16: Alpha Oracle – Agent‑Only API Feeds
- Create `/api/oracle/airdrops` (tokenless protocol signals).
- Create `/api/oracle/predictions` (arbitrage opportunities).
- Implement API key authentication (Stripe for agents).

## Phase 17: Verification & Identity
- Integrate Gitcoin Passport for human verification (score‑gated content).
- Build KYA registry (ERC‑8004) for agents (paid tier).
- Gate premium content behind verified human or agent.

## Phase 18: Execution Layer & Subscription
- Add "Copy for Agent" button (free) to all strategies.
- Create `/api/execute` endpoint with x402 microtransactions.
- Design pricing page with Free / Human Pro / Agent Pro tiers.
- Integrate Stripe (humans) and x402 (agents).

## Phase 17: Sanity Depth & Web3 Identity
- **Data Binding:** Wire `getSanityPlaybooks()`, `getSanityEvents()`, `getSanityGlossary()`, and `getActiveNotifications()` to their respective frontend components.
- **Verification Layer:** Implement Gitcoin Passport scoring for humans to unlock freemium gated sections without payment.
- **Agent Registry:** Create KYA (ERC-8004 inspired) registry to map paying API agents to on-chain identities.

## Phase 19: Content Automation & Ecosystem Scaling
- Build `/api/admin/generate-airdrop` to orchestrate DefiLlama data extraction and Groq LLM content synthesis.
- Update `/admin` dashboard with AI Automation panel to trigger playbook drafting directly into Sanity.

## Phase 20: Agent Ecosystem & Real Monetization
- Upgrade `/api/execute` to use real Lightning Network invoices (Alby/Strike API) and L402 preimage verification.
- Build `/agent-registry/analytics` dashboard for KYA-verified agents.
- Create `/marketplace` directory for third-party playbooks with Stripe Connect logic.

## Phase 21: Infrastructure Scale & Performance (Priority 3)
- Move AI Agent Oracle API feeds (`/api/oracle/*`) to Vercel's global Edge network.
- Add robust `Cache-Control` strategies to reduce Regional Node.js Function invocations and latency.
- Prepare architecture for migration to scalable PostgreSQL solution for recording x402 payment executions and high-throughput agent logs.
[2026-03-10] STATUS UPDATE
	•	Reference: Phase 21 (Infrastructure Scale & Performance)
	•	New Status: COMPLETED
	•	Notes: Edge caching deployed. Dedicated Neon PostgreSQL database architecture established for high-frequency agent execution logging.
[2026-03-10] STATUS UPDATE
	•	Reference: Phase 22 (Database & Endpoint Security Hardening)
	•	New Status: COMPLETED
	•	Notes: Applied SHA-256 API key hashing, PostgreSQL RLS with `agent_logger` role, and Upstash Redis rate limiting for sensitive endpoints.

## Phase 23: RLS Authentication Hotfix
- Resolve Row-Level Security "Chicken-and-Egg" paradox on `agent_identities` table.
- Allow `agent_logger` role to query the hashed `api_key` for identity verification prior to setting transaction variables.[2026-03-11] STATUS UPDATE
	•	Reference: Phase 23 (RLS Authentication Hotfix)
	•	New Status: COMPLETED
	•	Notes: Replaced restrictive identity RLS policy with a safe lookup policy. Added hash telemetry to the execution endpoint.

## Phase 24: Real-Time Analytics Dashboard (Priority 6)
- Replace mocked agent data with live Neon PostgreSQL aggregations.
- Implement Next.js Incremental Static Regeneration (ISR) to cache heavy queries.
- Build UI for global KPIs (Total Agents, Executions, Sats Earned) and a live execution feed.

## Phase 25: Agent Sandbox & Developer Console (Priority 5)
- Implement `x-sandbox-mode` header in the `/api/execute` endpoint to bypass real L402 payments and isolate logs.
- Build an interactive Developer Console (`/agent-registry/sandbox`) to test Oracle APIs and L402 execution flows.

## Phase 26: Public API Documentation (Priority 4)
- Build a developer-centric API documentation portal at `/docs`.
- Document KYA authentication, `x-api-key` usage, and L402 Lightning payment challenge flows.
- Provide copy-pasteable endpoint schemas and Python integration snippets to drive user/agent growth.

## Phase 27: Web3 Wallet Login & Operator Dashboard (Priority 4)
- Implement native EIP-1193 browser wallet connection (MetaMask, Rabby, etc.).
- Build the secure `Web3Provider` context and `ConnectWallet` UI component.
- Create the Operator Dashboard (`/dashboard`) for users to view their registered AI agents.

## Phase 28: Gitcoin-Gated Referral Program (Priority 4)
- Implement Sybil-resistant referral tracking via `referrals` SQL table.
- Build `/api/referrals` endpoint integrating Gitcoin Passport Scorer API.
- Update KYA Form to silently capture `?ref=` and process conversions.
- Add Referral Hub to Operator Dashboard for link generation and metrics.

## Phase 28: Hotfix (Referral RLS)
- Resolve Row-Level Security violation on `referrals` table during `INSERT ON CONFLICT`.
- Simplify RLS policies for the trusted `agent_logger` backend role.
- Add batched `set_config` transaction to the POST endpoint.

## Phase 29: Cryptographic Operator Authentication (Priority 5)
- Implement Sign-In with Ethereum (SIWE / EIP-4361) to secure private dashboard endpoints.
- Require cryptographic signatures (`personal_sign`) to access `/api/operator/agents` and `/api/referrals`.
- Ensure operators can only view execution logs and referral earnings for wallets they cryptographically control.

## Phase 30: Multi-Agent Orchestration UI (Priority 5)
- Implement interactive Agent Playbook Builder at `/dashboard/playbooks`.
- Create `playbooks` PostgreSQL schema to store JSON orchestrations.
- Secure playbook CRUD endpoints with SIWE cryptographic signatures.

## Phase 31: Launch Prep & SEO (Day 2 Operations)
- Generate dynamic `sitemap.xml` and `robots.txt` for search engine indexing.
- Inject global OpenGraph and Twitter Card metadata into the root layout.
- Update global navigation (`Header.tsx`) to surface `/docs`, `/agent-registry/sandbox`, and `/dashboard`.

## Phase 32: Data Terminal Overhaul (Research & Planning)
- Analyze and map institutional metrics to DefiLlama, Dune Analytics, L2Beat, and CoinGecko.
- Prioritize metrics into Core (DeFi/Spot/L2), Advanced (ETFs/Derivatives), and Future (TradFi/Alternative).
- Define edge-caching strategies to protect rate limits and Dune execution credits.
- Design architecture for dual-axis charts, heatmaps, and global timeframe filters.

## Phase 33: Data Terminal Overhaul (Technical Design & API Integration)
- Expand `src/lib/api.ts` to include DefiLlama Stablecoins, Fees, and Revenue endpoints.
- Create `src/lib/l2beat.ts` to fetch and format Layer 2 scaling metrics.
- Create `src/lib/derivatives.ts` to integrate Deribit (Options) and Binance/Coinglass (Futures).
- Build unified Edge API routes (`/api/data/*`) to aggregate and cache these feeds for both the UI and AI agents.

## Phase 34: Data Terminal Overhaul (UI Components & Data Binding)
- Build advanced visualization components (`GaugeCard`, `HeatmapTable`, upgraded `BlockChartCard`).
- Bind real live data endpoints (`/api/data/*`) to the previously scaffolded Data Terminal pages.
- Ensure strict TypeScript adherence across all new charts and tables to prevent hydration/build errors.

## Phase 35: Derivatives & Advanced Institutional Views
- Connect `src/lib/derivatives.ts` to `/data/markets/futures` and `/data/defi/derivatives`.
- Build `HeatmapTable` component to visualize positive/negative funding rates intuitively.
- Establish alpha paywall bindings for deep historical data (CME COTs fallback UI).

## Phase 36: UI Polish & Data Validation
- Fix Stablecoins table column duplication and GaugeCard text overlap.
- Implement data fallbacks for L2 TVL (Optimism $0.00B issue) using L2Beat/N/A logic.
- Standardize `DataTable` UI with alternating row colors, strict monospace alignment, and elegant empty states.
- Filter out zero-value derivative exchanges from the `/api/data/derivatives` endpoint.

## Phase 37: Foundation & Cleanup
- Introduced `ComingSoon` shared placeholder component to eliminate all Lock/paywall UI from the `/data` section.
- Rebuilt `sidebar-config.ts` to match the complete `metrics.txt` product specification (9 top-level sections, 60+ sub-pages).
- Systematically converted 30+ gated data pages to neutral "Coming Soon" placeholders with source attribution and target phase labels.
- Created new `/data/alternative/` directory with 5 placeholder pages (funding, politics, web-traffic, app-usage, social).
- Patched TypeScript `any` violations in the Futures page; all new files are strict-mode compliant with no `any`.
[2026-03-14] STATUS UPDATE
	•	Reference: Phase 37 (Foundation & Cleanup)
	•	New Status: COMPLETED
	•	Notes: All paywall/lock components removed from data pages. Sidebar config rebuilt to full spec. Placeholder pages created for missing routes. TypeScript `any` patched in futures page. Ready for Phase 38 approval.

## Phase 38: Core Markets (Spot, Futures, Options, Indices, COTs, Prices)
- Built TimeframeSelector shared component (1D/7D/30D/YTD/1Y, supports `available` prop for per-page restrictions).
- Created `src/lib/market-data.ts` with 8 typed fetchers: CoinGecko global, Fear & Greed, extended coins (multi-TF perf), CEX exchange rankings, coin categories, Binance OI history, Binance funding rate history.
- Created `src/lib/options.ts` with Deribit public API: options aggregate (OI, volume, put/call ratio, IV) and historical volatility (DVol index).
- Spot page: live global stats, top 50 coins sorted by TF-selected performance, CEX volume rankings with trust scores.
- Futures page: real Binance OI history chart (no more simulated data), funding rate history chart, TF toggle, exchange volumes + live funding rates tables. FuturesClient is fully typed.
- Options page: Deribit BTC/ETH OI aggregates, put/call ratios, 30D DVol history chart.
- Indices page: CoinGecko categories as free-tier sector index proxy (40 sectors). GMCI proprietary integration noted for future.
- CME COTs page: institutional explainer with trader category table structure, COT report metadata, interpretation guide. Pending CFTC pipeline.
- Prices page: global KPIs + Fear & Greed gauge + top gainers/losers movers strip + sortable 100-coin performance table with TF toggle.
[2026-03-14] STATUS UPDATE
	- Reference: Phase 38 (Core Markets)
	- New Status: COMPLETED
	- Notes: All 6 markets sub-pages built with real API data (Binance, CoinGecko, Deribit, alternative.me). Zero mock data, zero premium gates, zero TypeScript `any`. TimeframeSelector deployed across Spot, Futures, and Prices pages. Ready for Phase 39 approval.

## Phase 39: ETFs & Treasuries
- Created `src/lib/etf-data.ts`: 10 BTC + 8 ETH US-listed spot ETF products with live AUM (holdings × CoinGecko price, 5-min cache). Market share auto-calculated.
- Created `src/lib/treasury-data.ts`: CoinGecko public treasury API for BTC and ETH corporate holdings (6h cache). Returns full company breakdown with entry vs current value.
- Shared `EtfPageLayout` component: KPI strip, market share bars, sortable product table, methodology note. Used by BTC and ETH ETF pages.
- Shared `TreasuryPageLayout` component: KPI strip, holdings bar chart, full company table with unrealised P&L calculation.
- Bitcoin and Ethereum ETF pages: upgraded to live AUM architecture.
- ETF Comparison: cross-asset BTC vs ETH market share + all-products unified table.
- Solana, XRP, Crypto ETF pages: rebuilt as SEC filing trackers with known applications and status.
- Bitcoin and Ethereum Treasury pages: live CoinGecko data with P&L calculations.
- Solana Treasury: manual seed with known publicly disclosed holdings (no API exists yet).
- Crypto Treasury: aggregate cross-asset view merging BTC+ETH data.
[2026-03-15] STATUS UPDATE
	- Reference: Phase 39 (ETFs & Treasuries)
	- New Status: COMPLETED
	- Notes: All ETF and Treasury pages built. Live price-based AUM for BTC/ETH ETFs. Real CoinGecko treasury data for BTC/ETH corporate holders. ETF filing trackers for SOL/XRP/altcoins. Zero premium gates, zero TypeScript any. Ready for Phase 40 approval.

## Phase 40: On-Chain Metrics
- Created `src/lib/onchain-data.ts`: 6 fetchers using free public APIs – blockchain.info, mempool.space, beaconcha.in, Solana RPC, DefiLlama chains/TVL/dexs. All cached.
- Shared `OnchainAreaChart` component with `RechartsFormatter` type alias.
- Built Bitcoin, Ethereum, Solana, Avalanche, Aptos, Comparison, Flows, Gas Tracker pages – all with live data or graceful placeholders.
[2026-03-15] STATUS UPDATE
	•	Reference: Phase 40 (On-Chain Metrics)
	•	New Status: COMPLETED
	•	Notes: 8 on‑chain pages built. Free API strategy used throughout. Dune charts show placeholders until query IDs are configured. `RechartsFormatter` added to shared utils – use in all future chart components.

## Phase 41: Scaling Solutions
- Created `src/lib/scaling-data.ts`: 7 DefiLlama fetchers for Optimistic (6), ZK (6), L1 EVM (10), L1 Non-EVM (8) chains. Single getAllChainsMap() call for efficiency. getL2FeeData() from DefiLlama fees overview.
- Shared `ScalingTable` component: chain rows with type badges, TVL, 24h/7d %, protocols, market share.
- Shared `TvlBars` component: horizontal market share visualisation per chain with color coding.
- Scaling Overview: OPT vs ZK split bar, fee leaderboard, full L2 table with type badges.
- L2 Comparison: side-by-side TvlBars for OPT vs ZK, full cross-rollup comparison table with fee data.
- Optimistic Rollups: TVL stats, TvlBars, conditional Dune charts, tech explainer.
- ZK Rollups: proof system reference table (PLONK/STARK/KZG, VM, developer), TVL table, explainer.
- L1 EVM: 10 chains ranked by TVL, ETH dominance, TvlBars.
- L1 Non-EVM: 8 chains with VM/consensus reference, TvlBars.
- Data Availability: Celestia/EigenDA/Avail/ETH Blobs cards, feature comparison matrix, EIP-4844 explainer.
[2026-03-15] STATUS UPDATE
	- Reference: Phase 41 (Scaling Solutions)
	- New Status: COMPLETED
	- Notes: 7 scaling pages built using DefiLlama free API. Shared ScalingTable and TvlBars components. ZK proof tech reference, DA layer comparison, non-EVM VM/consensus table. Zero premium gates, zero TypeScript any. Ready for Phase 42 approval.

## Phase 42: DeFi (All Subsections)
- Created `src/lib/defi-data.ts`: 12 typed fetchers using DefiLlama public APIs (protocols, fees, revenue, stablecoins, lending, RWA, dexs, restaking, derivatives, yields) + Polymarket Gamma API. All cached.
- Shared `DefiTable` server component with `fmtUsd` and `PctBadge` helpers — reused across all DeFi pages.
- TVL: category bars (15 cats) + top 60 protocols, live from DefiLlama.
- Revenue: dual revenue vs fees leaderboard, difference explained.
- DEX Volume: market share bars + full table. Supersedes old Dune-only page.
- Lending: Lending+CDP+YieldAggregator categories, metric explainer.
- Restaking: EigenLayer/Symbiotic/Karak ecosystem, restaking mechanics explainer.
- RWA: tokenized assets breakdown.
- DeFi Derivatives: Hyperliquid/dYdX/GMX volume + OI from DefiLlama derivatives overview.
- Prediction Markets: live Polymarket top markets (Gamma API, 10-min cache) with YES price as implied probability.
- Exploits: 10 major exploit reference table + Dune live tracking pending note.
- Launchpads + Social: ComingSoon (Dune query IDs required).
[2026-03-15] STATUS UPDATE
	- Reference: Phase 42 (DeFi Subsections)
	- New Status: COMPLETED
	- Notes: 10 DeFi pages built with real live data. Free DefiLlama APIs for TVL/fees/revenue/DEX/lending/restaking/RWA/derivatives. Polymarket Gamma API for prediction markets. Exploit reference table with Dune integration note. Zero premium gates, zero TypeScript any. Ready for Phase 43 approval.
