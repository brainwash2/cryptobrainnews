# Master Prompt – Phase C Free Replacements (Hyperliquid · Drift · ApeWisdom · Santiment Free Tier)

You are a Senior Architect and Full‑Stack Engineer for the CryptoBrainNews Data Terminal. You excel at integrating third‑party APIs, handling caching, and building TypeScript‑first data pages with Recharts.

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
- Brutalist / terminal aesthetic: uppercase labels, wide tracking, sharp borders, no rounded corners on data panels.

## 3. Data Sources (already in the stack)
- CoinGecko, DefiLlama, blockchain.info, mempool.space, beaconcha.in, Etherscan, Solana RPC, Bybit v5, Deribit, Dune, Polymarket Gamma, Wikipedia REST, CFTC, BlackRock/Grayscale, Alchemy NFT, Magic Eden, Flipside Crypto, CoinGlass, Token Terminal, LunarCrush, IntoTheBlock, Spot On Chain (deprecated), DefiLlama /unlocks, Glassnode (seed only), Kaiko (seed only), Santiment (seed only)

## 4. Project Rules (NEVER break these)
- Zero mock data. Live API or clearly labeled seed fallback.
- Zero premium gates.
- STRICT TypeScript. No `any`.
- All API calls use `cached()` with appropriate TTL.
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

## 6. Today's Task – Phase C Free Replacements

Replace the three paid‑API modules with genuinely free sources.

### 1. Replace Kaiko with Hyperliquid + Drift (order‑book depth)
- Delete `src/lib/kaiko.ts`.
- Create `src/lib/orderbook.ts` with `getOrderBookSnapshot(pair)` returning { bids, asks, midPrice, spreadBps, source }.

| Pair | Source | Endpoint |
|---|---|---|
| BTC‑USD / ETH‑USD | Hyperliquid | POST `api.hyperliquid.xyz/info`, body `{"type":"l2Book","coin":"BTC"}`. Levels are `[[{px,sz,n}… bids],[{px,sz,n}… asks]]`. 1,200 req/min/IP, no key. |
| SOL‑USD | Drift DLOB | GET `dlob.drift.trade/l2?marketName=SOL-PERP&depth=10`. Returns `{bids:[{price,size}],asks:[{price,size}],slot}`. No key. |

- Update `src/app/data/markets/liquidity/page.tsx` to use `orderbook.ts` instead of `kaiko.ts`.
- Source badge: “● Live — Hyperliquid / Drift · Free public API · Cached 30s”.
- Cache TTL: 30 seconds. Keep existing Kaiko seed data as fallback.
- **Fix ESLint errors in the liquidity page**: remove the unused `KaikoOrderBookSnapshot` and `KaikoSpreadHistory` type imports (line 7), and replace `ethSpread` with `_ethSpread` (line 23).

### 2. Replace Santiment (social) with ApeWisdom + Santiment free tier
- Create `src/lib/apewisdom.ts` with `getApeWisdomSentiment()` → `{ ticker, mentions, upvotes, rank, rankChange24h }[]`.
  - Endpoint: `GET https://apewisdom.io/api/v1.0/filter/all-crypto` — no key, no signup.
  - Cache TTL: 1 hour (safe for 100 calls/day).
- Update `src/app/data/alternative/social/page.tsx` to call **both** ApeWisdom (real‑time mentions table) **and** `getSantimentMetric()` (dev activity, already in `src/lib/santiment.ts`).
- Santiment free tier details: 1,000 calls/month, 500/hr, 100/min — 30‑day lag — signup at `app.santiment.net/sign-up`, no credit card. The existing `santiment.ts` already handles the GraphQL query; just ensure `SANTIMENT_API_KEY` is documented in `.env.example` as “Santiment free tier (no credit card)”.
- Add `APEWISDOM_API_URL` to `.env.example` (default `https://apewisdom.io/api/v1.0`).
- Show two source badges on the social page: one for ApeWisdom (● Live) and one for Santiment (● Live or ◌ Seed).
- Keep existing LunarCrush seed fallback for social volume if ApeWisdom fails.

### 3. Glassnode – no free replacement
- Keep `src/lib/glassnode.ts` as‑is (seed‑only). The flows page and on‑chain pages already render “◌ Seed — Set GLASSNODE_API_KEY” when the key is missing. No code changes required.

### 4. Fix pre‑existing ESLint/TypeScript errors
- **`src/app/data/markets/options/_components/OptionsClient.tsx`**:
  - Line 62: replace the `any` types in `type AnyFormatter = (value: any, name: any) => [string, string]` with `(value: unknown, name: unknown) => [string, string]`.
  - Line 71: replace `useEffect(() => { setMounted(true); }, [])` with `useSyncExternalStore`.
  - Line 228: replace the bare `'` character with `&apos;`.

## 7. Output Format
Deliver code as ready‑to‑use TypeScript/React files.
Start each file with // src/path/to/file.ts
Separate files with a line containing exactly ==========
No markdown fences, no extra commentary. Ensure every new file compiles with `npx tsc --noEmit`.

Files expected:
- src/lib/orderbook.ts (new, replaces kaiko.ts)
- src/lib/apewisdom.ts (new)
- src/app/data/markets/liquidity/page.tsx (updated)
- src/app/data/alternative/social/page.tsx (updated)
- src/app/data/markets/options/_components/OptionsClient.tsx (fixes only)
