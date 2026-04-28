# Master Prompt – Phase C: Paid API Minimum Viable Integrations

You are a Senior Architect and Full‑Stack Engineer for CryptoBrainNews. You must implement paid API integrations that provide elite metrics while maintaining graceful fallbacks when API keys are absent (no forced payments).

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

## 3. Data Sources (existing free stack + new Phase C APIs)
**Already live:** CoinGecko, DefiLlama, blockchain.info, mempool.space, beaconcha.in, Etherscan, Solana RPC, Bybit v5, Deribit, Dune, Polymarket Gamma, Wikipedia REST, CFTC, BlackRock/Grayscale, Alchemy NFT, Magic Eden.
**New in Phase C (paid, with graceful fallback when key missing):** Glassnode, Nansen Lite/Glassnode (exchange flows), Kaiko Lite, Santiment, CoinShares (manual scrape), Greeks.live (manual scrape).

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

## 5. Files Attached (read ALL of them)
- gemini-context.txt (full codebase snapshot)
- docs/metrics.txt (complete product specification)
- docs/DeepSeekV4-Research-Blueprint.md (the master plan)

## 6. Today's Task – Phase C (Paid API Minimum Viable Integrations)
For each source, create a fetcher module that:
- Requires an environment variable for the API key.
- Returns a clean fallback (seed data or empty) when the key is missing.
- Adds the data to the specified page(s), clearly labelling the source.

Generate ALL code for the following six integrations. Output each file with a path comment, separated by ==========.

1. **Glassnode (SOPR, MVRV, NUPL)**
   - Sign‑up: glassnode.com → Standard plan $49/mo → GLASSNODE_API_KEY
   - Fetcher: `src/lib/glassnode.ts` → `getGlassnodeMetric(metric, asset)`
   - Page: Enhance `/data/onchain/bitcoin` and `/data/onchain/ethereum` with advanced on‑chain charts (SOPR line, MVRV oscillator, NUPL zone chart). Keep existing blockchain.info charts as fallback. Add `GLASSNODE_API_KEY` to `.env.example`.

2. **Exchange Net Flows (CEX→DEX) via Glassnode or Nansen Lite**
   - Fetcher: extend `glassnode.ts` with `getNetExchangeFlows()`
   - Page: Add a “Net Exchange Flows” chart to `/data/onchain/flows`. This is The Block’s signature chart – make it prominent.

3. **Kaiko Lite (order‑book depth, spread)**
   - Sign‑up: kaiko.com → Lite plan $300/mo → KAIKO_API_KEY
   - Fetcher: `src/lib/kaiko.ts` → `getOrderBookDepth(pair)`, `getSpread(pair)`
   - Page: Add a new sub‑page `/data/markets/liquidity` with BTC‑USD and ETH‑USD spread charts and depth heatmap. Add `KAIKO_API_KEY` to `.env.example`.

4. **Santiment (sentiment, dev activity)**
   - Sign‑up: santiment.net → Personal $79/mo → SANTIMENT_API_KEY
   - Fetcher: `src/lib/santiment.ts` → `getSantimentMetric()`
   - Page: Enhance `/data/alternative/social` with Santiment data (dev activity, social volume, sentiment curves). Merge with LunarCrush data from Phase B. Add `SANTIMENT_API_KEY` to `.env.example`.

5. **CoinShares Fund Flows (manual scrape)**
   - Fetcher: `src/lib/coinshares.ts` → `getWeeklyFlows()`
   - Page: Add “ETF Weekly Flows” table to `/data/etfs/bitcoin` and `/data/etfs/comparison`. Mark as “Data updated weekly — manual entry”. Seed data when scrape fails.

6. **Greeks.live (options flow)**
   - Fetcher: `src/lib/greekslive.ts` → `getOptionsFlow()`
   - Page: Add a “Block Trades / Flow” section to `/data/markets/options`. Mark as “Live – Greeks.live (manual refresh)”. Fallback to seed data.

## 7. Output Format
Deliver code as ready‑to‑use TypeScript/React files.
Start each file with // src/path/to/file.ts
Separate files with a line containing exactly ==========
No markdown fences, no extra commentary. Ensure every new file compiles with `npx tsc --noEmit`.
