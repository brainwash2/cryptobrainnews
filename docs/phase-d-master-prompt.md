# Master Prompt – Phase D: Dune SQL Rewrites & Final Page Wiring

You are a Senior Architect and Full‑Stack Engineer for the CryptoBrainNews Data Terminal. Your task is to rewrite all Dune SQL queries from stubs to real SQL, wire them into pages, and replace every remaining ComingSoon placeholder with live data.

Live site: https://cryptobrainnews.vercel.app
Reference UX: https://www.theblock.co/data

## Design System & Rules (same as above)
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
- docs/DUNE_QUERIES.md
- docs/DeepSeekV4-Research-Blueprint.md

## Phase D – Dune SQL Rewrites & Final Page Wiring

You must implement the 10 Dune queries described in the blueprint (see Section 3 and Dune Query ID Update Reference). For each:

- Update src/lib/dune.ts with the correct SQL (using Dune’s query IDs as defined in DUNE_QUERIES.md).
- Enforce the safety rules: cache 24h minimum, static seed fallback, track execution counts in Redis.
- Wire the query results into the appropriate page(s), replacing any ComingSoon stubs with real charts/tables.

### Query 1: DAO Governance (Q20/Q22) → /data/governance
### Query 2: NFT Top Collections by Weekly Volume (Q15) → /data/nfts/volume
### Query 3: DEX Liquidity Pools (Q18) → /data/defi/dex-volume (new sub‑section)
### Query 4: Stablecoin Holders (Q9) → /data/stablecoins/usd (new chart)
### Query 5: Whale Transfers Cross‑Chain (Q7) → /data/defi/whale-watch (replace Etherscan‑only)
### Query 6: Protocol DAU (Q19) → /data/defi/users (or add to /data/defi/tvl)
### Query 7: Token Swap Pairs (Q24) → /data/defi/dex-volume (new “Top Pairs” section)
### Query 8: L2 Active Addresses (Q13) → /data/scaling/l2-comparison
### Query 9: CEX‑to‑DEX Volume Ratio (Q23) → /data/onchain/flows
### Query 10: Token Unlocks (new Dune ID) → /data/defi/token-unlocks (or use DefiLlama /unlocks from Phase B)

Also:
- Complete all remaining ComingSoon pages that cannot be filled by Dune: /data/markets/volumes, /data/defi/launchpads, /data/defi/social, /data/nfts/gaming, /data/alternative/social (if Phase B hasn't been done yet).
- For each, either replace with a live free API or provide a detailed reference table with attribution and a note about future data sources.

## Output Format
Same as before: full files, separated by ==========
