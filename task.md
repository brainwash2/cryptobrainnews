# CryptoBrainNews — Task Ledger (Active)

## News Pipeline
**Status:** Production – all 7 parts delivered.
- Daily pipeline: RSS → Groq → DeepSeek → Gemini → Sanity
- Telegram broadcast with retry queue
- Newsletter via Resend
- Social scheduler (X/Twitter threads)
- Pro gating (Stripe), affiliate links, sponsored slots
- Health checks, ops alerts, smoke tests
- **Pending:** none (pipeline maintenance only)

## Data Terminal — DeepSeek V4 Blueprint Refactor
**Current phase:** Phase A complete. Phases B, C, D pending.
All previous data‑terminal refactors (Phases 37‑45 etc.) are archived.
We follow only `docs/DeepSeekV4-Research-Blueprint.md`.

- [ ] Phase B: New free APIs (Flipside, CoinGlass, LunarCrush, Token Terminal, Spot On Chain, DefiLlama/unlocks)
- [ ] Phase C: Paid API min‑viable plan (Glassnode $49/mo, Kaiko $300/mo, Nansen Lite $99/mo, Santiment $79/mo)
- [ ] Phase D: Dune SQL rewrites (10 queries) + wire remaining ComingSoon pages

## Other Active
- [ ] Submit sitemap to Google Search Console
- [ ] End‑to‑end test Pro checkout flow (Stripe)
- [ ] Content cadence: publish 1 editorial/day, schedule 3 X/Twitter threads/week
- [ ] Mobile responsiveness pass on top 10 pages

## Data Terminal – Phase B (New Free APIs)
### Run ID: phase-b-new-apis — $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- [x] B‑1 Flipside Crypto: src/lib/flipside.ts, FLIPSIDE_API_KEY, /data/defi/social with seed fallback
- [x] B‑2 CoinGlass: src/lib/coinglass.ts, COINGLASS_API_KEY, new /data/markets/liquidations page
- [x] B‑3 Token Terminal: src/lib/token-terminal.ts, TOKEN_TERMINAL_API_KEY
- [x] B‑4 LunarCrush: src/lib/lunarcrush.ts, /data/alternative/social with seed fallback
- [x] B‑5 IntoTheBlock: src/lib/intotheblock.ts, MVRV/concentration seed
- [x] B‑6 Spot On Chain: src/lib/spotonchain.ts (deprecated; Zerion replacement deferred)
- [x] B‑7 DefiLlama /unlocks: extended defi-data.ts, new /data/defi/token-unlocks page

## Data Terminal – Phase C (Paid API Minimum Viable) ← ACTIVE
Status: Planning · Master prompt ready at docs/phase-c-master-prompt.md
Deferred from Phase B: Spot On Chain → Zerion whale alerts

## Data Terminal – Phase C (Paid API Minimum Viable — Completed, then replaced with free alternatives)
### Run ID: phase-c-free-replacements — $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- [x] Glassnode: seed only (SOPR/MVRV/NUPL — no free equivalent)
- [x] Kaiko: replaced with Hyperliquid (BTC/ETH) + Drift (SOL) — free public APIs
- [x] Santiment: free tier added (1,000 calls/month) + ApeWisdom (Reddit mentions)
- [x] CoinShares: manual seed ETF flows on Bitcoin ETFs + Comparison pages
- [x] Greeks.live: seed block trades on Options page
- [x] New /data/markets/liquidity page (Hyperliquid + Drift depth heatmap)
- [x] ESLint/TS fixes: OptionsClient (useSyncExternalStore, unknown, &apos;)

[YYYY-MM-DD] STATUS UPDATE
	•	Reference: Phase X (Task description)
	•	New Status: COMPLETED
	•	Notes: Brief notes on what was built.

[YYYY-MM-DD] STATUS UPDATE
	•	Reference: Phase X (Task description)
	•	New Status: COMPLETED
	•	Notes: Brief notes on what was built.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D (Live Dune SQL Integration)
	•	New Status: COMPLETED
	•	Notes: Replaced all 9 stub Dune functions with live API calls via dune.com. Uses 24‑hour Redis cache (cached()) and seed fallback arrays. No pages need changes — all existing consumers (governance, NFTs, whales, etc.) automatically gain live data once DUNE_API_KEY and per‑query IDs are set in .env.local. Dune execution count limited to 9 per day maximum, well under free‑tier limits.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D — Dune Query 2 (NFT Top Collections)
	•	New Status: COMPLETED
	•	Notes: Created Dune query 7400802 (nft.trades 7-day cross-chain volume). Wired to DUNE_NFT_COLLECTIONS_ID. /data/nfts/collections now serves live data with seed fallback.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D — Dune Query 3 (DEX Liquidity Pools)
	•	New Status: COMPLETED
	•	Notes: Created Dune query 7400811 (dex.trades 24h pool volume). Wired to DUNE_DEX_POOLS_ID. /data/defi/dex-volume now gains live pool data with seed fallback.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D — Dune Query 5 (Whale Transfers Cross‑Chain)
	•	New Status: COMPLETED
	•	Notes: Created Dune query 7400911 (tokens.transfers > $1M, 7‑day, 6 chains). Wired to DUNE_WHALES_ID. /data/defi/whale-watch now gains live cross‑chain whale data with seed fallback.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D — Dune Query 6 (Protocol DAU)
	•	New Status: COMPLETED
	•	Notes: Created Dune query 7401328 (6 protocol-specific .trades tables UNION). Wired to DUNE_PROTOCOL_DAU_ID. /data/defi/tvl now gains live DAU data with seed fallback.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D — Dune Query 7 (Top Token Pairs)
	•	New Status: COMPLETED
	•	Notes: Created Dune query 7401393 (protocol-specific .trades tables UNION for 24h top pairs). Wired to DUNE_TOP_PAIRS_ID. /data/defi/dex-volume now gains live top‑pairs data with seed fallback.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D — Dune Query 8 (L2 Active Addresses Comparison)
	•	New Status: COMPLETED
	•	Notes: Created Dune query 7401413 (5 chain‑specific transaction tables UNION). Wired to DUNE_L2_ACTIVE_ID. /data/scaling/l2-comparison now gains live address data with seed fallback.

[2026-04-29] STATUS UPDATE
	•	Reference: Phase D — DUNE_QUERIES.md finalised
	•	New Status: COMPLETED
	•	Notes: Replaced the old docs/DUNE_QUERIES.md with a production‑accurate version listing all 8 live queries with IDs, exact SQL, column names, and removed 16 stub queries. Added DUNE_API_KEY and all 8 query ID environment variables to the reference section. Documented which dune.ts functions remain seed‑only and why (getCEXvsDEXVolumeRatio uses DefiLlama; getNextUnlocks re‑exports from defi-data.ts).
