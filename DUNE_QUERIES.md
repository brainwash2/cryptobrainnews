# CryptoBrainNews — Dune Analytics Query Library
# ════════════════════════════════════════════════

## INSTRUCTIONS
1. Go to https://dune.com/queries and create a new query for each entry below.
2. Paste the SQL, test it, save it.
3. Note the Query ID from the URL (e.g., dune.com/queries/XXXXXX).
4. Update src/lib/dune.ts QUERY_IDS with the real IDs.

---

## Q1: DAILY_DEX_VOLUME
-- Returns: daily aggregated DEX volume across all chains
-- Table: dex.trades (Spellbook curated)
-- Parameters: {{days}} (number, default: 30)

```sql
SELECT
  DATE_TRUNC('day', block_date) AS day,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS trade_count
FROM dex.trades
WHERE block_date >= CURRENT_DATE - INTERVAL '{{days}}' DAY
  AND amount_usd > 0
GROUP BY 1
ORDER BY 1
```

---

## Q2: TOP_DEX_BY_VOLUME
-- Returns: top DEX projects by 7d volume

```sql
SELECT
  project,
  SUM(amount_usd) AS volume_7d,
  COUNT(*) AS trade_count
FROM dex.trades
WHERE block_date >= CURRENT_DATE - INTERVAL '7' DAY
  AND amount_usd > 0
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20
```

---

## Q3: WHALE_TRANSFERS
-- Returns: large ERC20 transfers > $500K in last 24h
-- Table: erc20_ethereum.evt_Transfer + prices.usd

```sql
SELECT
  t.evt_block_time AS block_time,
  t."from" AS sender,
  t."to" AS receiver,
  tok.symbol AS token_symbol,
  CAST(t.value AS DOUBLE) / POW(10, tok.decimals) AS amount,
  (CAST(t.value AS DOUBLE) / POW(10, tok.decimals)) * p.price AS usd_value,
  t.evt_tx_hash AS tx_hash,
  'ethereum' AS chain
FROM erc20_ethereum.evt_Transfer t
JOIN tokens.erc20 tok
  ON tok.contract_address = t.contract_address
  AND tok.blockchain = 'ethereum'
JOIN prices.usd_latest p
  ON p.contract_address = t.contract_address
  AND p.blockchain = 'ethereum'
WHERE t.evt_block_time >= NOW() - INTERVAL '24' HOUR
  AND (CAST(t.value AS DOUBLE) / POW(10, tok.decimals)) * p.price > 500000
ORDER BY usd_value DESC
LIMIT 100
```

---

## Q4: LARGE_DEX_SWAPS
-- Returns: DEX swaps > $100K in last 24h

```sql
SELECT
  block_time,
  project,
  token_sold_symbol AS token_a_symbol,
  token_bought_symbol AS token_b_symbol,
  token_sold_amount AS token_a_amount,
  token_bought_amount AS token_b_amount,
  amount_usd AS usd_amount,
  tx_hash
FROM dex.trades
WHERE block_date >= CURRENT_DATE - INTERVAL '1' DAY
  AND amount_usd > 100000
ORDER BY amount_usd DESC
LIMIT 200
```

---

## Q5: STABLECOIN_SUPPLY
-- Returns: daily supply of major stablecoins

```sql
SELECT
  DATE_TRUNC('day', day) AS day,
  symbol,
  SUM(amount) AS total_supply,
  blockchain AS chain
FROM tokens.transfers
WHERE symbol IN ('USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX')
  AND day >= CURRENT_DATE - INTERVAL '30' DAY
GROUP BY 1, 2, 4
ORDER BY 1, 2
```

Note: For stablecoin supply, DefiLlama's API may be more reliable.
Consider using the existing getStablecoinData() from api.ts as primary.

---

## Q6: ETH_ACTIVE_ADDRESSES
-- Parameters: {{days}} (number, default: 30)

```sql
SELECT
  DATE_TRUNC('day', block_time) AS day,
  COUNT(DISTINCT "from") AS active_addresses,
  'ethereum' AS chain
FROM ethereum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' DAY
GROUP BY 1
ORDER BY 1
```

---

## Q7: ETH_DAILY_TX
-- Parameters: {{days}} (number, default: 30)

```sql
SELECT
  DATE_TRUNC('day', block_time) AS day,
  COUNT(*) AS tx_count,
  'ethereum' AS chain
FROM ethereum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' DAY
GROUP BY 1
ORDER BY 1
```

---

## Q8: ETH_GAS_METRICS
-- Parameters: {{days}} (number, default: 30)

```sql
SELECT
  DATE_TRUNC('day', block_time) AS day,
  AVG(gas_price / 1e9) AS avg_gas_price_gwei,
  APPROX_PERCENTILE(gas_price / 1e9, 0.5) AS median_gas_price_gwei,
  SUM(gas_used) AS total_gas_used
FROM ethereum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' DAY
GROUP BY 1
ORDER BY 1
```

---

## Q9: CEX_NET_FLOWS
-- Tracks flows to/from known CEX addresses
-- Parameters: {{days}} (number, default: 7)

```sql
WITH cex_addresses AS (
  SELECT address, name
  FROM labels.all
  WHERE category = 'exchange'
    AND blockchain = 'ethereum'
),
flows AS (
  SELECT
    DATE_TRUNC('day', t.evt_block_time) AS day,
    tok.symbol AS token_symbol,
    SUM(CASE WHEN cex.address = t."to" THEN
      (CAST(t.value AS DOUBLE) / POW(10, tok.decimals)) * p.price
      ELSE 0 END) AS inflow_usd,
    SUM(CASE WHEN cex.address = t."from" THEN
      (CAST(t.value AS DOUBLE) / POW(10, tok.decimals)) * p.price
      ELSE 0 END) AS outflow_usd
  FROM erc20_ethereum.evt_Transfer t
  JOIN cex_addresses cex
    ON cex.address = t."to" OR cex.address = t."from"
  JOIN tokens.erc20 tok
    ON tok.contract_address = t.contract_address
    AND tok.blockchain = 'ethereum'
  JOIN prices.usd_latest p
    ON p.contract_address = t.contract_address
    AND p.blockchain = 'ethereum'
  WHERE t.evt_block_time >= NOW() - INTERVAL '{{days}}' DAY
    AND tok.symbol IN ('USDT', 'USDC', 'ETH', 'WETH', 'WBTC')
  GROUP BY 1, 2
)
SELECT
  day,
  token_symbol,
  inflow_usd,
  outflow_usd,
  inflow_usd - outflow_usd AS net_flow_usd
FROM flows
ORDER BY day, token_symbol
```

---

## Q10: L2_METRICS
-- Parameters: {{days}} (number, default: 30)

```sql
SELECT
  DATE_TRUNC('day', block_time) AS day,
  'arbitrum' AS chain,
  COUNT(*) AS tx_count,
  COUNT(DISTINCT "from") AS active_addresses,
  0 AS tvl_usd
FROM arbitrum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' DAY
GROUP BY 1

UNION ALL

SELECT
  DATE_TRUNC('day', block_time) AS day,
  'optimism' AS chain,
  COUNT(*) AS tx_count,
  COUNT(DISTINCT "from") AS active_addresses,
  0 AS tvl_usd
FROM optimism.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' DAY
GROUP BY 1

ORDER BY day, chain
```

---

## Q11: NFT_SALES_VOLUME
-- Parameters: {{days}} (number, default: 30)

```sql
SELECT
  DATE_TRUNC('day', block_time) AS day,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS sales_count,
  platform AS marketplace
FROM nft.trades
WHERE block_time >= NOW() - INTERVAL '{{days}}' DAY
  AND amount_usd > 0
GROUP BY 1, 4
ORDER BY 1
```

---

## Q12: PROTOCOL_REVENUE
-- Top protocols by fee revenue (7d + 30d)

```sql
WITH recent AS (
  SELECT
    project,
    SUM(CASE WHEN block_date >= CURRENT_DATE - INTERVAL '7' DAY THEN amount_usd ELSE 0 END) AS revenue_7d,
    SUM(CASE WHEN block_date >= CURRENT_DATE - INTERVAL '30' DAY THEN amount_usd ELSE 0 END) AS revenue_30d
  FROM dex.trades
  WHERE block_date >= CURRENT_DATE - INTERVAL '30' DAY
    AND amount_usd > 0
  GROUP BY 1
)
SELECT
  project AS protocol,
  revenue_7d,
  revenue_30d
FROM recent
ORDER BY revenue_30d DESC
LIMIT 30
```

Note: This is an approximation using DEX volume as proxy.
For accurate protocol revenue, consider integrating fees.wtf or
Token Terminal API as a supplementary data source.

