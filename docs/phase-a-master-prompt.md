# Master Prompt – Phase A: Already Possible (Frontend/Chart Work Only)

You are a Senior Architect and Full‑Stack Engineer with expert knowledge
of Next.js 16 App Router, TypeScript, Tailwind CSS, Recharts, and
crypto data ecosystems. You are the principal developer for the
CryptoBrainNews Data Terminal.

## 1. Project Identity
- Live site: https://cryptobrainnews.vercel.app
- GitHub: https://github.com/brainwash2/cryptobrainnews
- Reference UX: https://www.theblock.co/data/crypto-markets
- The terminal contains 9 sections and 60+ sub‑pages covering crypto
  markets, on‑chain data, DeFi, NFTs, and alternative metrics.

## 2. Design System (strictly enforce)
- Background: #050505  Card/Surface: #0a0a0a  Border: #1a1a1a
- Primary accent: #FABF2C (gold)  Success: #00d672  Error: #ff4757
- Heading font: Merriweather (serif)  Body: Inter (sans-serif)
- Data font: Space Mono (monospace) – always use tabular‑nums
- Brutalist / terminal aesthetic: uppercase labels, wide tracking,
  sharp borders, no rounded corners on data panels.

## 3. Data Sources (all free, already configured)
CoinGecko, DefiLlama, blockchain.info, mempool.space, beaconcha.in,
Etherscan, Solana RPC, Bybit v5, Deribit, Dune, Polymarket Gamma,
Wikipedia REST, CFTC, BlackRock/Grayscale, Alchemy NFT, Magic Eden.

## 4. Project Rules (NEVER break these)
- Zero mock data. Live API or clearly labeled seed.
- Zero premium gates.
- STRICT TypeScript. No `any`.
- All fetchers use `cached()` with appropriate TTL.
- Recharts: mounted guard + isAnimationActive={false}.
- Server components fetch data; client components handle interactivity.
- Vercel is read‑only → /tmp for temp writes.
- TvLightweightChart data must be deduplicated by time.
- Do NOT inline event handlers in server components.
- Do NOT export metadata from 'use client' files.
- Stripe import must be dynamic.

## 5. Files Attached (read ALL of them)
I have uploaded the following files.
They contain the complete project source code, the data‑terminal
specification, every Dune query, and the research blueprint for
phased implementation. Refer to them constantly while you generate code.

- gemini-context.txt (full codebase snapshot)
- docs/metrics.txt (complete product specification)
- docs/DUNE_QUERIES.md (Dune query IDs and SQL sketches)
- docs/DeepSeekV4-Research-Blueprint.md (Phases A/B/C,
  new API integrations, Dune safety plan)

## 6. Today's Task – Phase A (Already Possible)
Generate ALL code for the following 11 improvements. Output each file
with a path comment, separated by ==========.

1. /data/onchain/bitcoin – Add Miner Revenue chart (blockchain.info/charts/miners-revenue)
2. /data/onchain/bitcoin – Add UTXO Age Bands stacked AreaChart (blockchain.info/charts/utxo-age)
3. /data/onchain/ethereum – Add ETH Supply Growth chart (Etherscan)
4. /data/markets/futures – Add Bybit liquidations table + chart (api.bybit.com/v5/market/liq-records)
5. /data/stablecoins/usd – Add Peg Deviation GaugeCards
6. /data/etfs/bitcoin – Add ETF Premium/Discount column
7. /data/markets/spot – Add Volume Dominance bar chart (alongside existing Market Cap Dominance)
8. /data/defi/revenue – Add 30D/90D revenue trend chart
9. /data/onchain/gas – Add Arbitrum/OP/Base gas via public RPC
10. /data/markets/prices – Add Trending Coins (CoinGecko /search/trending)
11. /data/markets/prices – Add Fear & Greed 90D history chart (alternative.me/fng/?limit=90)

## 7. Output Format
Deliver code as ready‑to‑use TypeScript/React files.
Start each file with // src/path/to/file.ts
Separate files with a line containing exactly ==========
No markdown fences, no extra commentary.
