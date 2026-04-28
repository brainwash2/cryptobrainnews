# Master Prompt – Phase D: Dune SQL Rewrites & Final Page Wiring

You are a Senior Architect and Full‑Stack Engineer for the CryptoBrainNews Data Terminal. Your task is to rewrite all Dune SQL queries from stubs to real SQL, wire them into pages, and replace every remaining ComingSoon placeholder with live data.

## 1. Project Identity
- Live site: https://cryptobrainnews.vercel.app
- GitHub: https://github.com/brainwash2/cryptobrainnews
- Reference UX: https://www.theblock.co/data
- The terminal contains 9 sections and 60+ sub‑pages covering crypto markets, on‑chain data, DeFi, NFTs, and alternative metrics.

## 2. Design System (strictly enforce)
- Background: #050505  Card/Surface: #0a0a0a  Border: #1a1a1a
- Primary accent: #FABF2C (gold)  Success: #00d672  Error: #ff4757
- Heading font: Merriweather (serif)  Body: Inter (sans-serif)
- Data font: Space Mono (monospace) – always use tabular‑nums
- Brutalist / terminal aesthetic: uppercase labels, wide tracking,
  sharp borders, no rounded corners on data panels.

## 3. Data Sources (existing free stack + Dune)
**Already live:** CoinGecko, DefiLlama, blockchain.info, mempool.space, beaconcha.in, Etherscan, Solana RPC, Bybit v5, Deribit, Dune, Polymarket Gamma, Wikipedia REST, CFTC, BlackRock/Grayscale, Alchemy NFT, Magic Eden.
**Dune Analytics:** We have 24 query stubs with IDs in `docs/DUNE_QUERIES.md`. All queries require real SQL written by you. **Safety rules are critical:** we were previously banned from Dune's free tier, so every query must be designed for minimal execution cost.

## 4. Project Rules (NEVER break these)
- Zero mock data. Live API or clearly labeled seed fallback.
- Zero premium gates.
- STRICT TypeScript. No `any`.
- All API calls use `cached()` with appropriate TTL (see blueprint).
- Recharts: mounted guard + isAnimationActive={false}.
- Server components fetch data; client components handle interactivity.
- Vercel is read‑only → /tmp for temp writes.
- TvLightweightChart data must be deduplicated by time.
- Do NOT inline event handlers in server components.
- Do NOT export metadata from 'use client' files.
- Stripe import must be dynamic.

## 5. Dune Safety Plan (MUST FOLLOW)
- Maximum call rate: 1 query execution per 10 seconds (6/min).
- Cache duration: 24 hours minimum for ALL Dune query results.
- Every Dune‑powered chart must have a static reference seed fallback.
- NEVER show a spinner or empty state on Dune failure – show seed data.
- Wrap every getDuneQuery() call in AbortSignal.timeout(45_000).
- Track Dune execution counts in Upstash Redis: `dune:counter:{queryId}:{date}`.
- Alert if any query exceeds 5 executions/day.

## 6. Files Attached (read ALL of them)
- gemini-context.txt (full codebase snapshot)
- docs/metrics.txt (complete product specification)
- docs/DUNE_QUERIES.md (Dune query IDs and SQL sketches)
- docs/DeepSeekV4-Research-Blueprint.md (the master plan)

## 7. Today's Task – Phase D (Dune SQL Rewrites & Final Page Wiring)
Generate ALL code for the following 10 Dune queries and their associated page updates. Output each file with a path comment, separated by ==========.

For each query you must:
- Update `src/lib/dune.ts` with the correct SQL (using Dune's query IDs as defined in DUNE_QUERIES.md).
- Wire the query results into the appropriate page(s).
- Replace any ComingSoon stubs with real charts/tables.
- Include a static seed fallback.
- Track execution counts in Redis.

1. **DAO Governance (Q20/Q22)** → `/data/governance`
   Replace the ComingSoon state with live governance proposals/votes from Tally & Snapshot.

2. **NFT Top Collections by Weekly Volume (Q15)** → `/data/nfts/volume`
   Replace static seed data with live cross‑chain NFT sales rankings.

3. **DEX Liquidity Pools (Q18)** → `/data/defi/dex-volume`
   Add a new "Top Pools" sub‑section with pool depth and volume data.

4. **Stablecoin Holder Distribution (Q9)** → `/data/stablecoins/usd`
   Add a new chart showing USDT/USDC holder distribution by balance buckets.

5. **Whale Transfers Cross‑Chain (Q7)** → `/data/defi/whale-watch`
   Replace the Etherscan‑only view with cross‑chain whale data across 20+ chains.

6. **Protocol Daily Active Users (Q19)** → `/data/defi/tvl` or new `/data/defi/users`
   Add a DAU chart for the top 15 DeFi protocols.

7. **Token Swap Pairs (Q24)** → `/data/defi/dex-volume`
   Add a new "Top Pairs" sub‑section showing which token pairs dominate DEX activity.

8. **L2 Active Addresses (Q13)** → `/data/scaling/l2-comparison`
   Add active address comparison across 7 L2 chains.

9. **CEX‑to‑DEX Volume Ratio (Q23)** → `/data/onchain/flows`
   Add a CEX vs DEX volume overlay chart (combine with CoinGecko CEX data).

10. **Token Unlocks (new Dune ID, or DefiLlama /unlocks from Phase B)** → `/data/defi/token-unlocks`
    Create a new page showing upcoming token unlocks for the next 30 days.

Also complete all remaining ComingSoon pages that cannot be filled by Dune:
- `/data/markets/volumes` – Exchange volume rankings (use existing CoinGecko data if possible, or detailed reference table)
- `/data/defi/launchpads` – Pump.fun revenue, graduated tokens (reference table with attribution)
- `/data/defi/social` – friend.tech, Farcaster (reference table if Phase B not yet done)
- `/data/nfts/gaming` – Gaming NFT volume (reference table with attribution)
- `/data/alternative/social` – Twitter/Reddit/YouTube metrics (reference table if Phase B not yet done)

For each, either replace with a live free API or provide a detailed reference table with attribution and a note about future data sources.

## 8. Output Format
Deliver code as ready‑to‑use TypeScript/React files.
Start each file with // src/path/to/file.ts
Separate files with a line containing exactly ==========
No markdown fences, no extra commentary. Ensure every new file compiles with `npx tsc --noEmit`.
