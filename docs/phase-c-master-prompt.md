# Master Prompt – Phase C: Paid API Minimum Viable Integrations

You are a Senior Architect and Full‑Stack Engineer for CryptoBrainNews. You must implement paid API integrations that provide elite metrics while maintaining graceful fallbacks when API keys are absent (no forced payments).

Live site: https://cryptobrainnews.vercel.app
Reference UX: https://www.theblock.co/data

## Design System & Rules
- Colors: bg #050505, card #0a0a0a, border #1a1a1a, primary #FABF2C, success #00d672, error #ff4757
- Typography: headings Merriweather, body Inter, data Space Mono (tabular‑nums)
- Brutalist terminal aesthetic
- Strict TypeScript, zero `any`
- No mock data – live API or clearly labelled seed
- All API calls use `cached()` with TTL from blueprint
- Recharts: mounted guard + isAnimationActive={false}
- Server components fetch data, client components for interactivity
- Vercel read‑only → /tmp for temp
- Stripe dynamic import

## Attached Files
- gemini-context.txt
- docs/metrics.txt
- docs/DeepSeekV4-Research-Blueprint.md

## Phase C – Paid API Minimum Viable Integrations
For each source, create a fetcher module that:
- Requires an environment variable for the API key.
- Returns a clean fallback (seed data or empty) when the key is missing.
- Adds the data to the specified page(s), clearly labelling the source.

### C‑1 – Glassnode (SOPR, MVRV, NUPL)
- Sign‑up: glassnode.com → Standard plan $49/mo → GLASSNODE_API_KEY
- Fetcher: src/lib/glassnode.ts → getGlassnodeMetric(metric, asset)
- Page: Enhance /data/onchain/bitcoin and /data/onchain/ethereum with advanced on‑chain charts (SOPR line, MVRV oscillator, NUPL zone chart). Keep existing blockchain.info charts as fallback.

### C‑2 – Exchange Net Flows (CEX→DEX) via Glassnode or Nansen Lite
- Fetcher: extend glassnode.ts with getNetExchangeFlows()
- Page: Add a “Net Exchange Flows” chart to /data/onchain/flows. This is The Block’s signature chart – make it prominent.

### C‑3 – Kaiko Lite (order‑book depth, spread)
- Sign‑up: kaiko.com → Lite plan $300/mo → KAIKO_API_KEY
- Fetcher: src/lib/kaiko.ts → getOrderBookDepth(pair), getSpread(pair)
- Page: Add a new sub‑page /data/markets/liquidity with BTC‑USD and ETH‑USD spread charts and depth heatmap.

### C‑5 – Santiment (sentiment, dev activity)
- Sign‑up: santiment.net → Personal $79/mo → SANTIMENT_API_KEY
- Fetcher: src/lib/santiment.ts → getSantimentMetric()
- Page: Enhance /data/alternative/social with Santiment data (dev activity, social volume, sentiment curves). Merge with LunarCrush data from Phase B.

### C‑6 – CoinShares Fund Flows (manual scrape)
- Scrape the weekly PDF or manual entry as seed data.
- Fetcher: src/lib/coinshares.ts → getWeeklyFlows()
- Page: Add “ETF Weekly Flows” table to /data/etfs/bitcoin and /data/etfs/comparison. Mark as “Data updated weekly — manual entry”.

### C‑7 – Greeks.live (options flow)
- Scrape public page → legally grey, manual refresh recommended.
- Fetcher: src/lib/greekslive.ts → getOptionsFlow()
- Page: Add a “Block Trades / Flow” section to /data/markets/options. Mark as “Live – Greeks.live (manual refresh)”.

## Output Format
Provide each file as:
// src/path/to/file.ts
… code …

Separate files with ==========

No markdown, no commentary. Ensure code compiles.
