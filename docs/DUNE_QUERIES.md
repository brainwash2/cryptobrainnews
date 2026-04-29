# CryptoBrainNews — Dune Analytics Queries (Production)

Last updated: 29 April 2026 · 8 live queries · Free tier

**Dune account:** New account (post‑ban) on dune.com free tier.
**Safety rules:** 1 execution per 10 seconds · 24‑hour minimum cache · every function has a seed fallback.

---

## Live Queries (8)

All 8 queries are created on dune.com and wired into `src/lib/dune.ts`.
Query IDs are configured via environment variables (see `.env.example`).

---

### Query 1 — DAO Governance (Snapshot Proposals)

| Field | Value |
|-------|-------|
| **Dune ID** | `7400718` |
| **Environment variable** | `DUNE_DAO_GOVERNANCE_ID=7400718` |
| **dune.ts function** | `getDAOGovernance()` |
| **Seed rows** | 10 (Aave, Uniswap, Compound, MakerDAO, Arbitrum DAO, Optimism Collective) |
| **Refresh** | Every 24 hours |
| **Row limit** | 100 |

**Purpose:** Daily count of governance proposals per DAO from Snapshot off‑chain voting.

```sql
-- CBN — DAO Governance: Snapshot proposals (last 30 days)
SELECT
  DATE_TRUNC('day', FROM_UNIXTIME(created)) AS day,
  COUNT(*)                                  AS proposals_created,
  LOWER(space)                              AS dao
FROM dune.shot.dataset_proposals_view
WHERE FROM_UNIXTIME(created) >= NOW() - INTERVAL '30' day
GROUP BY 1, 3
ORDER BY 1 DESC, 2 DESC
LIMIT 100
```

**Expected columns:** `day` (date), `proposals_created` (integer), `dao` (string)

---

### Query 2 — NFT Top Collections by 7‑Day Volume (Cross‑Chain)

| Field | Value |
|-------|-------|
| **Dune ID** | `7400802` |
| **Environment variable** | `DUNE_NFT_COLLECTIONS_ID=7400802` |
| **dune.ts function** | `getNFTTopCollectionsByVolume()` |
| **Seed rows** | 8 (CryptoPunks, BAYC, Pudgy Penguins, Mad Lads, Chromie Squiggle, NodeMonkes, Azuki, Claynosaurz) |
| **Refresh** | Every 24 hours |
| **Row limit** | 50 |

**Purpose:** Cross‑chain NFT collection rankings by 7‑day USD volume. Filters out wash‑trade outliers (>$1M individual sales).

```sql
-- CBN — NFT Top Collections by 7d Volume (Cross‑Chain)
SELECT
  collection,
  blockchain,
  SUM(amount_usd)            AS volume_7d_usd,
  COUNT(*)                   AS trade_count,
  COUNT(DISTINCT seller)     AS unique_sellers,
  AVG(amount_usd)            AS avg_price_usd,
  MIN(amount_usd)            AS min_price_usd,
  MAX(amount_usd)            AS max_price_usd
FROM nft.trades
WHERE block_time >= NOW() - INTERVAL '7' day
  AND amount_usd > 0
  AND amount_usd < 1000000   -- filter outlier wash trades
GROUP BY 1, 2
HAVING SUM(amount_usd) > 50000
ORDER BY volume_7d_usd DESC
LIMIT 50
```

**Expected columns:** `collection` (string), `blockchain` (string), `volume_7d_usd` (numeric), `trade_count` (bigint), `unique_sellers` (bigint), `avg_price_usd` (numeric), `min_price_usd` (numeric), `max_price_usd` (numeric)

---

### Query 3 — DEX Liquidity Pools (Top 20 by 24h Volume)

| Field | Value |
|-------|-------|
| **Dune ID** | `7400811` |
| **Environment variable** | `DUNE_DEX_POOLS_ID=7400811` |
| **dune.ts function** | `getDEXLiquidityPools()` |
| **Seed rows** | 10 (Uniswap, PancakeSwap, Orca, Curve, Aerodrome, Raydium, dYdX, Balancer, Trader Joe) |
| **Refresh** | Every 12 hours |
| **Row limit** | 20 |

**Purpose:** Top 20 liquidity pools by 24‑hour USD volume with average swap size.

```sql
-- CBN — DEX Liquidity Pools: Top 20 by 24h Volume & Depth
SELECT
  project             AS dex,
  blockchain,
  token_bought_symbol AS token_a,
  token_sold_symbol   AS token_b,
  SUM(amount_usd)     AS volume_24h_usd,
  COUNT(*)            AS swap_count,
  AVG(amount_usd)     AS avg_swap_usd
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '24' hour
  AND amount_usd > 0
  AND amount_usd < 500000
GROUP BY 1, 2, 3, 4
ORDER BY 5 DESC
LIMIT 20
```

**Expected columns:** `dex` (string), `blockchain` (string), `token_a` (string), `token_b` (string), `volume_24h_usd` (numeric), `swap_count` (bigint), `avg_swap_usd` (numeric)

---

### Query 4 — Stablecoin Holder Distribution (USDT + USDC)

| Field | Value |
|-------|-------|
| **Dune ID** | `7400865` |
| **Environment variable** | `DUNE_STABLECOIN_HOLDERS_ID=7400865` |
| **dune.ts function** | `getStablecoinHolderDistribution()` |
| **Seed rows** | 10 (5 buckets × 2 contracts: USDT + USDC) |
| **Refresh** | Every 24 hours |
| **Row limit** | 10 |

**Purpose:** Distribution of USDT and USDC holders by balance bucket (0‑1K, 1K‑10K, 10K‑100K, 100K‑1M, 1M+). Ethereum only. 90‑day window for balance calculation.

```sql
-- CBN — Stablecoin Holders: USDT & USDC balance buckets
WITH balances AS (
  SELECT
    "to"         AS holder,
    contract_address,
    SUM(amount)  AS balance
  FROM tokens.transfers
  WHERE block_time >= NOW() - INTERVAL '90' day
    AND blockchain = 'ethereum'
    AND CAST(contract_address AS varchar) IN (
      '0xdac17f958d2ee523a2206206994597c13d831ec7',   -- USDT
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'    -- USDC
    )
  GROUP BY 1, 2
)
SELECT
  CAST(contract_address AS varchar) AS contract_address,
  CASE
    WHEN balance BETWEEN 0 AND 1000         THEN '0-1K'
    WHEN balance BETWEEN 1000 AND 10000     THEN '1K-10K'
    WHEN balance BETWEEN 10000 AND 100000   THEN '10K-100K'
    WHEN balance BETWEEN 100000 AND 1000000 THEN '100K-1M'
    ELSE '1M+'
  END                AS bucket,
  COUNT(*)           AS holder_count,
  SUM(balance)       AS total_balance
FROM balances
WHERE balance > 0
GROUP BY 1, 2
ORDER BY 1, 2
```

**Expected columns:** `contract_address` (string), `bucket` (string), `holder_count` (bigint), `total_balance` (numeric)

---

### Query 5 — Cross‑Chain Whale Transfers (>$1M)

| Field | Value |
|-------|-------|
| **Dune ID** | `7400911` |
| **Environment variable** | `DUNE_WHALES_ID=7400911` |
| **dune.ts function** | `getCrossChainWhaleTransfers()` |
| **Seed rows** | 8 (across Ethereum, Arbitrum, Base, Polygon, Solana, Optimism) |
| **Refresh** | Every 12 hours |
| **Row limit** | 200 |

**Purpose:** All token transfers exceeding $1M across 6 major blockchains in the past 7 days. Used for the `/data/defi/whale-watch` page.

```sql
-- CBN — Whale Transfers: Cross‑Chain, All > $1M (7 days)
SELECT
  block_time,
  blockchain,
  "from"            AS whale_address,
  "to"              AS recipient,
  contract_address,
  symbol,
  amount_usd
FROM tokens.transfers
WHERE block_time >= NOW() - INTERVAL '7' day
  AND amount_usd > 1000000
  AND blockchain IN ('ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'solana')
ORDER BY block_time DESC, amount_usd DESC
LIMIT 200
```

**Expected columns:** `block_time` (timestamp), `blockchain` (string), `whale_address` (string), `recipient` (string), `contract_address` (string), `symbol` (string), `amount_usd` (numeric)

---

### Query 6 — Protocol Daily Active Users (6 DeFi Protocols, 30‑Day)

| Field | Value |
|-------|-------|
| **Dune ID** | `7401328` |
| **Environment variable** | `DUNE_PROTOCOL_DAU_ID=7401328` |
| **dune.ts function** | `getProtocolDailyActiveUsers()` |
| **Seed rows** | 15 (Uniswap, PancakeSwap, Raydium, Orca, 1inch, Aerodrome, Curve across 3 days) |
| **Refresh** | Every 24 hours |
| **Row limit** | 500 |

**Purpose:** Daily active users for the top 6 DeFi protocols across Ethereum and Solana. Uses protocol‑specific Dune tables for accurate trader counts (not the generic `dex.trades` which can be slow on free tier).

```sql
-- CBN — Protocol DAU (Dune‑only, 6 protocols, 30‑day)
WITH dau AS (
  SELECT date_trunc('day', block_time) AS day, 'Uniswap V3' AS protocol, COUNT(DISTINCT tx_from) AS dau
  FROM uniswap_v3_ethereum.trades
  WHERE block_time >= NOW() - INTERVAL '30' day
  GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'PancakeSwap' AS protocol, COUNT(DISTINCT tx_from) AS dau
  FROM pancakeswap.trades
  WHERE block_time >= NOW() - INTERVAL '30' day
  GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'Raydium' AS protocol, COUNT(DISTINCT trader_id) AS dau
  FROM dex_solana.trades
  WHERE block_time >= NOW() - INTERVAL '30' day AND project = 'raydium'
  GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'Orca' AS protocol, COUNT(DISTINCT trader_id) AS dau
  FROM dex_solana.trades
  WHERE block_time >= NOW() - INTERVAL '30' day AND project = 'orca'
  GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'Aerodrome' AS protocol, COUNT(DISTINCT tx_from) AS dau
  FROM aerodrome.trades
  WHERE block_time >= NOW() - INTERVAL '30' day
  GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'SushiSwap' AS protocol, COUNT(DISTINCT tx_from) AS dau
  FROM sushiswap.trades
  WHERE block_time >= NOW() - INTERVAL '30' day
  GROUP BY 1
)
SELECT day, protocol, SUM(dau) AS dau
FROM dau
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC
LIMIT 500
```

**Expected columns:** `day` (date), `protocol` (string), `dau` (bigint)

---

### Query 7 — Top Token Pairs (24h Volume, 6 DEXs)

| Field | Value |
|-------|-------|
| **Dune ID** | `7401393` |
| **Environment variable** | `DUNE_TOP_PAIRS_ID=7401393` |
| **dune.ts function** | `getTopTokenPairs()` |
| **Seed rows** | 10 (WETH/USDC, WBTC/USDC, SOL/USDC, USDC/USDT, WETH/USDT, WBNB/USDT, ARB/USDC, LINK/USDC, AVAX/USDC, PEPE/WETH) |
| **Refresh** | Every 12 hours |
| **Row limit** | 20 |

**Purpose:** Top 20 token pairs by 24‑hour USD volume across 6 major DEXs (Uniswap V3, PancakeSwap, Raydium, Orca, Aerodrome, SushiSwap). Uses protocol‑specific tables for fast execution on free tier.

```sql
-- CBN — Top Token Pairs (Dune‑only, protocol‑specific tables, 24h)
WITH pairs AS (
  SELECT token_bought_symbol AS buy_token, token_sold_symbol AS sell_token, 'Uniswap V3' AS dex,
         SUM(amount_usd) AS volume_24h_usd
  FROM uniswap_v3_ethereum.trades
  WHERE block_time >= NOW() - INTERVAL '24' hour AND amount_usd > 0
  GROUP BY 1, 2

  UNION ALL

  SELECT token_bought_symbol, token_sold_symbol, 'PancakeSwap',
         SUM(amount_usd)
  FROM pancakeswap.trades
  WHERE block_time >= NOW() - INTERVAL '24' hour AND amount_usd > 0
  GROUP BY 1, 2

  UNION ALL

  SELECT token_bought_symbol, token_sold_symbol, 'Raydium',
         SUM(amount_usd)
  FROM dex_solana.trades
  WHERE block_time >= NOW() - INTERVAL '24' hour AND amount_usd > 0 AND project = 'raydium'
  GROUP BY 1, 2

  UNION ALL

  SELECT token_bought_symbol, token_sold_symbol, 'Orca',
         SUM(amount_usd)
  FROM dex_solana.trades
  WHERE block_time >= NOW() - INTERVAL '24' hour AND amount_usd > 0 AND project = 'orca'
  GROUP BY 1, 2

  UNION ALL

  SELECT token_bought_symbol, token_sold_symbol, 'Aerodrome',
         SUM(amount_usd)
  FROM aerodrome.trades
  WHERE block_time >= NOW() - INTERVAL '24' hour AND amount_usd > 0
  GROUP BY 1, 2

  UNION ALL

  SELECT token_bought_symbol, token_sold_symbol, 'SushiSwap',
         SUM(amount_usd)
  FROM sushiswap.trades
  WHERE block_time >= NOW() - INTERVAL '24' hour AND amount_usd > 0
  GROUP BY 1, 2
)
SELECT buy_token, sell_token, dex, SUM(volume_24h_usd) AS volume_24h_usd
FROM pairs
GROUP BY 1, 2, 3
HAVING SUM(volume_24h_usd) > 50000
ORDER BY 4 DESC
LIMIT 20
```

**Expected columns:** `buy_token` (string), `sell_token` (string), `dex` (string), `volume_24h_usd` (numeric)

---

### Query 8 — L2 Active Addresses Comparison (5 Chains)

| Field | Value |
|-------|-------|
| **Dune ID** | `7401413` |
| **Environment variable** | `DUNE_L2_ACTIVE_ID=7401413` |
| **dune.ts function** | `getL2ActiveAddressesComparison()` |
| **Seed rows** | 15 (Arbitrum, Optimism, Base, zkSync, Scroll across 3 days) |
| **Refresh** | Every 24 hours |
| **Row limit** | 500 |

**Purpose:** Daily active addresses across 5 major Layer‑2 chains: Arbitrum, Optimism, Base, zkSync, and Scroll. Uses chain‑specific transaction tables with 30‑day lookback.

```sql
-- CBN — L2 Active Addresses Comparison (30‑day, 5 chains)
SELECT day, chain, active_addresses FROM (
  SELECT date_trunc('day', block_time) AS day, 'arbitrum' AS chain, COUNT(DISTINCT "from") AS active_addresses
  FROM arbitrum.transactions WHERE block_time >= NOW() - INTERVAL '30' day GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'optimism' AS chain, COUNT(DISTINCT "from") AS active_addresses
  FROM optimism.transactions WHERE block_time >= NOW() - INTERVAL '30' day GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'base' AS chain, COUNT(DISTINCT "from") AS active_addresses
  FROM base.transactions WHERE block_time >= NOW() - INTERVAL '30' day GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'zksync' AS chain, COUNT(DISTINCT "from") AS active_addresses
  FROM zksync.transactions WHERE block_time >= NOW() - INTERVAL '30' day GROUP BY 1

  UNION ALL

  SELECT date_trunc('day', block_time) AS day, 'scroll' AS chain, COUNT(DISTINCT "from") AS active_addresses
  FROM scroll.transactions WHERE block_time >= NOW() - INTERVAL '30' day GROUP BY 1
) combined
ORDER BY 1 DESC, 2
LIMIT 500
```

**Expected columns:** `day` (date), `chain` (string), `active_addresses` (bigint)

---

## Functions NOT Backed by Live Dune Queries

These functions exist in `src/lib/dune.ts` but use **seed data only**. They are either handled by better free alternatives or awaiting query creation.

| Function | Status | Alternative |
|----------|--------|-------------|
| `getCEXvsDEXVolumeRatio()` | **Seed only** | DefiLlama `/overview/dexs` is the preferred source for DEX aggregate volume. The seed array provides 8 reference rows. No Dune query ID is configured. |
| `getNextUnlocks()` | **Re‑exported from `defi-data.ts`** | Uses DefiLlama `/unlocks` endpoint (free, no API key). No Dune dependency. |

---

## Removed Stub Queries

The following 16 queries from the old `DUNE_QUERIES.md` have been removed from production. They were either placeholders with stub SQL (`SELECT CURRENT_DATE`) or replaced by REST APIs (blockchain.info, Etherscan, DefiLlama).

| Old Query | What Replaced It |
|-----------|-----------------|
| BTC Active Addresses | `blockchain.info/charts/n-unique-addresses` in `src/lib/onchain-data.ts` |
| BTC Daily Transactions | `blockchain.info/charts/n-transactions` |
| ETH Active Addresses | `Etherscan stats API` in `src/lib/onchain-extended.ts` |
| ETH Daily Transactions & Gas | `Etherscan` + `cloudflare-eth.com` RPC |
| SOL Daily Transactions | `Solana RPC getRecentPerformanceSamples` |
| SOL Daily Fees | Solana RPC (fee data unavailable on free tier) |
| Stablecoin Supply & Dominance | `DefiLlama stablecoins.llama.fi` in `src/lib/defi-data.ts` |
| DEX Daily Volumes by Protocol | `DefiLlama /overview/dexs` in `src/lib/defi-data.ts` |
| DEX Volumes by Blockchain | DefiLlama |
| L2 Gas Fees Comparison | Public L2 RPC endpoints in `src/lib/onchain-extended.ts` |
| NFT Daily Volumes | Alchemy + Magic Eden APIs in `src/lib/nft-data.ts` |
| NFT Sales by Blockchain | Alchemy + Magic Eden |
| CEX‑to‑DEX Volume Comparison | DefiLlama + CoinGecko (see above) |
| Uniswap DAO Governance (old stub) | Replaced by Query 1 (Snapshot proposals via Dune ID 7400718) |
| General DAO Activity (old stub) | Replaced by Query 1 |
| Token Swap Volume by Token Pair (old stub) | Replaced by Query 7 (Dune ID 7401393) |

---

## Dune Safety Rules (from the Blueprint)

Every live query follows these rules to prevent a second ban:

| Rule | Implementation |
|------|---------------|
| Max call rate | 1 query execution per 10 seconds (6/min) |
| Cache duration | 24 hours minimum (`DUNE_TTL = 86400` in `dune.ts`) |
| Testing protocol | SQL tested in Dune web editor before wiring to codebase |
| Timeout guard | `AbortSignal.timeout(45_000)` on every fetch |
| Fallback | Every function returns seed data when API key is missing, fetch fails, or query returns 0 rows |
| Query complexity | All queries use `LIMIT` and daily aggregation. Max ~50K rows scanned |
| Monitoring | Execution counts tracked in Upstash Redis: `dune:counter:{queryId}:{date}` |

---

## Environment Variable Reference

```bash
# .env.local or Vercel Environment Variables
DUNE_API_KEY=your_dune_api_key_here

# Individual query IDs (optional — seed fallback used when unset)
DUNE_DAO_GOVERNANCE_ID=7400718
DUNE_NFT_COLLECTIONS_ID=7400802
DUNE_DEX_POOLS_ID=7400811
DUNE_STABLECOIN_HOLDERS_ID=7400865
DUNE_WHALES_ID=7400911
DUNE_PROTOCOL_DAU_ID=7401328
DUNE_TOP_PAIRS_ID=7401393
DUNE_L2_ACTIVE_ID=7401413
```

Setting `DUNE_API_KEY` enables live execution. Each query ID env var is optional — when missing, the function serves seed data and logs a notice.
