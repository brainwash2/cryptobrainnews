# Master Prompt – Phase B: New Free APIs

You are a Senior Architect and Full‑Stack Engineer for the CryptoBrainNews Data Terminal. You excel at integrating third‑party free APIs, handling authentication, caching, and building TypeScript‑first data pages with Recharts/TradingView.

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

## 3. Data Sources (existing free stack + new Phase B APIs)
**Already live:** CoinGecko, DefiLlama, blockchain.info, mempool.space, beaconcha.in, Etherscan, Solana RPC, Bybit v5, Deribit, Dune, Polymarket Gamma, Wikipedia REST, CFTC, BlackRock/Grayscale, Alchemy NFT, Magic Eden.
**New in Phase B:** Flipside Crypto, CoinGlass, Token Terminal, LunarCrush, IntoTheBlock (scraped), Spot On Chain, DefiLlama /unlocks.

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

## 6. Today's Task – Phase B (New Free APIs)
Generate ALL code for the following seven integrations. Output each file with a path comment, separated by ==========.

1. **Flipside Crypto** – Create `src/lib/flipside.ts` with `getFlipsideData(sql, ttlSeconds)`. Add `FLIPSIDE_API_KEY` to `.env.example`. Replace ComingSoon stubs at `/data/defi/social` (DeSo) with live Flipside queries. Add a “Flipside” data tab on `/data/onchain/comparison`.

2. **CoinGlass** – Create `src/lib/coinglass.ts` with `getCoinGlassLiquidations(limit)` and `getExchangeOI()`. Add `COINGLASS_API_KEY` to `.env.example`. Integrate live liquidations data into `/data/markets/futures` (add CoinGlass source badge next to Bybit). Create new sub‑page `/data/markets/liquidations` with a ranked table (exchange, 24h long liq, 24h short liq, total) and a timeline chart.

3. **Token Terminal** – Create `src/lib/token-terminal.ts` with `getProtocolRevenue()`. Add `TOKEN_TERMINAL_API_KEY` to `.env.example`. Enhance `/data/defi/revenue` with a “P/E” column, annualised fees, and a comparison table vs DefiLlama. Mark source as “Token Terminal”.

4. **LunarCrush** – Create `src/lib/lunarcrush.ts` with `getSocialSentiment(coinId)`. Add `LUNARCRUSH_API_KEY` to `.env.example`. Replace the “Planned” state on `/data/alternative/social` with live metrics: social volume bars, bullish/bearish sentiment per coin. Cache 1 hour.

5. **IntoTheBlock** – Create `src/lib/intotheblock.ts` with `getIntoTheBlockSnapshot()`. (No API key – scraping, moderate legal risk.) Add a new section to `/data/onchain/bitcoin` and `/data/onchain/ethereum` showing “MVRV Ratio”, “Concentration”, “In/Out of the Money”. Mark as “Third‑Party Snapshot — data refreshed manually”. Fallback to seed when scraping fails.

6. **Spot On Chain** – Create `src/lib/spotonchain.ts` with `getWhaleAlerts()`. Add `SPOTONCHAIN_API_KEY` to `.env.example`. Enrich `/data/defi/whale-watch` with tagged entity data (exchange, VC, protocol treasury). Keep existing Etherscan + Spot On Chain sources side‑by‑side.

7. **DefiLlama /unlocks** – Extend `src/lib/defi-data.ts` with `getNextUnlocks()`. No API key required. Create new page `/data/defi/token-unlocks` with a table: token, amount, % of supply, date. Include a “Next 30 Days” filter.

## 7. Output Format
Deliver code as ready‑to‑use TypeScript/React files.
Start each file with // src/path/to/file.ts
Separate files with a line containing exactly ==========
No markdown fences, no extra commentary. Ensure every new file compiles with `npx tsc --noEmit`.
