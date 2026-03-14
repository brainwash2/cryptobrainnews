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
