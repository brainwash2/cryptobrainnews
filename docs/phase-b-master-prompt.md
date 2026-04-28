# Master Prompt – Phase B: New Free APIs

You are a Senior Architect and Full‑Stack Engineer for the CryptoBrainNews Data Terminal. You excel at integrating third‑party free APIs, handling authentication, caching, and building TypeScript‑first data pages with Recharts/TradingView.

Live site: https://cryptobrainnews.vercel.app
Reference UX: https://www.theblock.co/data

## Design System & Rules
- Colors: bg #050505, card #0a0a0a, border #1a1a1a, primary #FABF2C, success #00d672, error #ff4757
- Typography: headings Merriweather, body Inter, data Space Mono (tabular‑nums)
- Brutalist terminal aesthetic: uppercase labels, sharp borders
- Strict TypeScript, zero `any`
- No mock data – live API or clearly labelled seed fallback
- All API calls use `cached()` with an appropriate TTL (see blueprint)
- Recharts: mounted guard + isAnimationActive={false}
- Server components fetch data, client components handle interactivity
- Vercel is read‑only → use /tmp for temp files
- Stripe import must be dynamic

## Attached Files
- gemini-context.txt (full codebase snapshot)
- docs/metrics.txt (product spec)
- docs/DeepSeekV4-Research-Blueprint.md (the master plan)

## Phase B – New Free APIs

Implement the following seven integrations. For each, you must:
- Create the fetcher function in src/lib/ (e.g., flipside.ts, coinglass.ts, etc.)
- Add any required environment variables (API key, etc.) to .env.example
- Build or update the destination page(s) with appropriate tables/charts
- Ensure every data panel has a clear source badge

### B‑1 – Flipside Crypto (broader chain coverage)
- Sign‑up: flipsidecrypto.com → API key → FLIPSIDE_API_KEY
- Fetcher: src/lib/flipside.ts → getFlipsideData(sql, ttlSeconds)
- Pages: Use as fallback/alternative for Dune queries where we lack SQL. Replace ComingSoon stubs at /data/defi/social (DeSo) and add a "Flipside" data tab on /data/onchain/comparison.

### B‑2 – CoinGlass (liquidations + OI rankings)
- Sign‑up: coinglass.com → free account → COINGLASS_API_KEY
- Fetcher: src/lib/coinglass.ts → getCoinGlassLiquidations(limit), getExchangeOI()
- Pages: Integrate live liquidations data into /data/markets/futures (add CoinGlass source next to Bybit), and create a new sub‑page /data/markets/liquidations with a ranked table and timeline chart.

### B‑3 – Token Terminal (protocol revenue/P/E)
- Sign‑up: tokenterminal.com → free account → TOKEN_TERMINAL_API_KEY
- Fetcher: src/lib/token‑terminal.ts → getProtocolRevenue()
- Page: Enhance /data/defi/revenue with Token Terminal data (add a “P/E” column, annualised fees, comparison table vs DefiLlama).

### B‑4 – LunarCrush (social sentiment)
- Sign‑up: lunarcrush.com/developers → LUNARCRUSH_API_KEY
- Fetcher: src/lib/lunarcrush.ts → getSocialSentiment(coinId)
- Page: Replace the “Planned” state on /data/alternative/social with live metrics (social volume, bullish/bearish sentiment bars). Cache 1 hour.

### B‑5 – IntoTheBlock (on‑chain indicators)
- No API key, scraping from public dashboard. Moderate legal risk.
- Fetcher: src/lib/intotheblock.ts → getIntoTheBlockSnapshot()
- Page: Add a new section to /data/onchain/bitcoin and /data/onchain/ethereum showing "MVRV Ratio", "Concentration", "In/Out of the Money". Mark as "Third‑Party Snapshot — data refreshed manually".

### B‑6 – Spot On Chain (whale alerts)
- Sign‑up: spotonchain.com → SPOTONCHAIN_API_KEY
- Fetcher: src/lib/spotonchain.ts → getWhaleAlerts()
- Page: Enrich /data/defi/whale-watch with tagged entity data (e.g., exchange, VC, protocol treasury). Keep existing Etherscan + Spot On Chain sources.

### B‑7 – DefiLlama /unlocks (token unlocks)
- No API key required.
- Fetcher: src/lib/unlocks.ts (or extend defi-data.ts) → getNextUnlocks()
- Page: Create new page /data/defi/token-unlocks (or replace the current stub). Include a table of upcoming unlocks with columns: token, amount, % of supply, date.

## Output Format
For each integration, provide the complete file(s) as:
// src/path/to/file.ts
… full code …

Separate files with a line exactly ==========

No markdown fences, no extra commentary. Ensure every new file compiles with `npx tsc --noEmit`.
