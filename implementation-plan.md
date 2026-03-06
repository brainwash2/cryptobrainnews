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
