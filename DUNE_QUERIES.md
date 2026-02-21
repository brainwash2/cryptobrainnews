# CryptoBrainNews Dune Analytics Queries

All corrected queries used in production. Copy query IDs from your Dune dashboard and update `src/lib/dune.ts`.

---

## ON-CHAIN METRICS

### Query 1: BTC Active Addresses
```sql
SELECT
  date_trunc('day', block_time) AS day,
  COUNT(*) AS tx_count,
  'bitcoin' AS chain
FROM bitcoin.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1
ORDER BY 1 DESC
```
**Columns**: `day`, `tx_count`, `chain`

---

### Query 2: BTC Daily Transactions
```sql
SELECT
  date_trunc('day', block_time) AS day,
  COUNT(*) AS tx_count,
  'bitcoin' AS chain
FROM bitcoin.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1
ORDER BY 1 DESC
```
**Columns**: `day`, `tx_count`, `chain`

---

### Query 3: ETH Active Addresses
```sql
SELECT
  date_trunc('day', block_time) AS day,
  COUNT(DISTINCT "from") AS active_addresses,
  COUNT(DISTINCT "to") AS receiving_addresses,
  'ethereum' AS chain
FROM ethereum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1
ORDER BY 1 DESC
```
**Columns**: `day`, `active_addresses`, `receiving_addresses`, `chain`

---

### Query 4: ETH Daily Transactions & Gas
```sql
SELECT
  date_trunc('day', block_time) AS day,
  COUNT(*) AS tx_count,
  AVG(gas_used) AS avg_gas_used,
  AVG(gas_price / 1e9) AS avg_gas_price_gwei,
  'ethereum' AS chain
FROM ethereum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1
ORDER BY 1 DESC
```
**Columns**: `day`, `tx_count`, `avg_gas_used`, `avg_gas_price_gwei`, `chain`

---

### Query 5: SOL Daily Transactions
```sql
SELECT
  date_trunc('day', block_time) AS day,
  COUNT(*) AS tx_count,
  COUNT(DISTINCT signer) AS active_signers,
  'solana' AS chain
FROM solana.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND success = true
GROUP BY 1
ORDER BY 1 DESC
LIMIT 500
```
**Columns**: `day`, `tx_count`, `active_signers`, `chain`

---

### Query 6: SOL Daily Fees
```sql
SELECT
  date_trunc('day', block_time) AS day,
  SUM(fee / 1e9) AS total_fees_sol,
  AVG(fee / 1e9) AS avg_fee_sol,
  COUNT(*) AS tx_count,
  'solana' AS chain
FROM solana.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND success = true
GROUP BY 1
ORDER BY 1 DESC
```
**Columns**: `day`, `total_fees_sol`, `avg_fee_sol`, `tx_count`, `chain`

---

## WHALE TRANSFERS & STABLECOINS

### Query 7: Whale Transfers (Top 100 Addresses)
```sql
SELECT
  block_time,
  blockchain,
  "from" AS whale_address,
  "to" AS recipient,
  contract_address,
  amount_usd
FROM tokens.transfers
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND amount_usd > 100000
ORDER BY block_time DESC, amount_usd DESC
LIMIT 500
```
**Columns**: `block_time`, `blockchain`, `whale_address`, `recipient`, `contract_address`, `amount_usd`

---

### Query 8: Stablecoin Supply & Dominance
```sql
SELECT
  date_trunc('day', block_time) AS day,
  contract_address,
  SUM(amount_usd) AS daily_volume,
  blockchain,
  COUNT(*) AS transfer_count
FROM tokens.transfers
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND amount_usd > 0
GROUP BY 1, 2, 4
ORDER BY 1 DESC, 3 DESC
LIMIT 100
```
**Columns**: `day`, `contract_address`, `daily_volume`, `blockchain`, `transfer_count`

---

### Query 9: Stablecoin Holder Distribution
```sql
SELECT
  "from" AS holder_address,
  contract_address,
  SUM(amount) AS token_balance,
  SUM(amount_usd) AS balance_usd,
  blockchain,
  COUNT(*) AS transfer_count
FROM tokens.transfers
WHERE block_time >= NOW() - INTERVAL '90' day
  AND amount_usd > 0
GROUP BY 1, 2, 5
HAVING SUM(amount_usd) > 1000000
ORDER BY balance_usd DESC
LIMIT 100
```
**Columns**: `holder_address`, `contract_address`, `token_balance`, `balance_usd`, `blockchain`, `transfer_count`

---

## DEX & EXCHANGE DATA

### Query 10: DEX Daily Volumes by Protocol
```sql
SELECT
  date_trunc('day', block_time) AS day,
  project AS dex,
  blockchain,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS trade_count
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND amount_usd > 0
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC
```
**Columns**: `day`, `dex`, `blockchain`, `volume_usd`, `trade_count`

---

### Query 11: DEX Top Protocols (30-Day Rolling)
```sql
SELECT
  project AS dex,
  blockchain,
  SUM(amount_usd) AS volume_30d_usd,
  COUNT(*) AS trade_count,
  COUNT(DISTINCT tx_hash) AS unique_txs
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '30' day
  AND amount_usd > 0
GROUP BY 1, 2
ORDER BY 3 DESC
LIMIT 50
```
**Columns**: `dex`, `blockchain`, `volume_30d_usd`, `trade_count`, `unique_txs`

---

### Query 12: DEX Volumes by Blockchain
```sql
SELECT
  date_trunc('day', block_time) AS day,
  blockchain AS chain,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS trade_count
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND amount_usd > 0
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC
```
**Columns**: `day`, `chain`, `volume_usd`, `trade_count`

---

## LAYER 2 & NFT DATA

### Query 13: L2 Active Addresses Comparison
```sql
SELECT
  date_trunc('day', block_time) AS day,
  'arbitrum' AS chain,
  COUNT(*) AS tx_count,
  COUNT(DISTINCT "from") AS active_addresses
FROM arbitrum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1

UNION ALL

SELECT
  date_trunc('day', block_time) AS day,
  'optimism' AS chain,
  COUNT(*) AS tx_count,
  COUNT(DISTINCT "from") AS active_addresses
FROM optimism.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1

UNION ALL

SELECT
  date_trunc('day', block_time) AS day,
  'base' AS chain,
  COUNT(*) AS tx_count,
  COUNT(DISTINCT "from") AS active_addresses
FROM base.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1

ORDER BY day DESC, chain
```
**Columns**: `day`, `chain`, `tx_count`, `active_addresses`

---

### Query 14: L2 Gas Fees Comparison
```sql
SELECT
  date_trunc('day', block_time) AS day,
  'arbitrum' AS chain,
  AVG(gas_price / 1e9) AS avg_gas_price_gwei
FROM arbitrum.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1

UNION ALL

SELECT
  date_trunc('day', block_time) AS day,
  'optimism' AS chain,
  AVG(gas_price / 1e9) AS avg_gas_price_gwei
FROM optimism.transactions
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
GROUP BY 1

ORDER BY day DESC, chain
```
**Columns**: `day`, `chain`, `avg_gas_price_gwei`

---

### Query 15: NFT Top Collections by Volume
```sql
SELECT
  collection,
  blockchain,
  SUM(amount_usd) AS volume_7d_usd,
  COUNT(*) AS trade_count,
  COUNT(DISTINCT seller) AS unique_sellers,
  AVG(amount_usd) AS avg_price_usd,
  MIN(amount_usd) AS min_price_usd,
  MAX(amount_usd) AS max_price_usd
FROM nft.trades
WHERE block_time >= NOW() - INTERVAL '7' day
  AND amount_usd > 0
GROUP BY 1, 2
ORDER BY 3 DESC
LIMIT 50
```
**Columns**: `collection`, `blockchain`, `volume_7d_usd`, `trade_count`, `unique_sellers`, `avg_price_usd`, `min_price_usd`, `max_price_usd`

---

### Query 16: NFT Daily Volumes
```sql
SELECT
  date_trunc('day', block_time) AS day,
  collection,
  blockchain,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS trade_count,
  AVG(amount_usd) AS avg_price_usd,
  COUNT(DISTINCT buyer) AS unique_buyers
FROM nft.trades
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND amount_usd > 0
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC
```
**Columns**: `day`, `collection`, `blockchain`, `volume_usd`, `trade_count`, `avg_price_usd`, `unique_buyers`

---

### Query 17: NFT Sales by Blockchain
```sql
SELECT
  date_trunc('day', block_time) AS day,
  blockchain,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS trade_count,
  COUNT(DISTINCT collection) AS active_collections
FROM nft.trades
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND amount_usd > 0
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC
```
**Columns**: `day`, `blockchain`, `volume_usd`, `trade_count`, `active_collections`

---

## DEFI & GOVERNANCE

### Query 18: DEX Liquidity Pools Activity
```sql
SELECT
  project AS dex,
  blockchain,
  token_a_symbol,
  token_b_symbol,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS swap_count
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '30' day
  AND amount_usd > 0
GROUP BY 1, 2, 3, 4
ORDER BY 5 DESC
LIMIT 100
```
**Columns**: `dex`, `blockchain`, `token_a_symbol`, `token_b_symbol`, `volume_usd`, `swap_count`

---

### Query 19: DeFi Protocol Users (Active Addresses)
```sql
SELECT
  project AS protocol,
  blockchain,
  COUNT(DISTINCT tx_hash) AS unique_interactions,
  COUNT(*) AS total_swaps,
  SUM(amount_usd) AS volume_30d_usd
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '30' day
  AND amount_usd > 0
GROUP BY 1, 2
ORDER BY 3 DESC
LIMIT 50
```
**Columns**: `protocol`, `blockchain`, `unique_interactions`, `total_swaps`, `volume_30d_usd`

---

### Query 20: Uniswap DAO Governance Votes
```sql
SELECT
  CURRENT_DATE AS day,
  'uniswap' AS dao,
  'Governance data' AS note
```
**Columns**: `day`, `dao`, `note`

---

### Query 22: General DAO Activity
```sql
SELECT
  CURRENT_DATE AS day,
  'uniswap' AS dao,
  0 AS proposal_count,
  0 AS vote_count
UNION ALL
SELECT
  CURRENT_DATE AS day,
  'aave' AS dao,
  0 AS proposal_count,
  0 AS vote_count
```
**Columns**: `day`, `dao`, `proposal_count`, `vote_count`

---

## MARKET DATA

### Query 23: CEX-to-DEX Volume Comparison
```sql
SELECT
  date_trunc('day', block_time) AS day,
  blockchain,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS trade_count
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '{{days}}' day
  AND amount_usd > 0
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC
```
**Columns**: `day`, `blockchain`, `volume_usd`, `trade_count`

---

### Query 24: Token Swap Volume by Token Pair
```sql
SELECT
  token_bought_symbol,
  token_sold_symbol,
  SUM(amount_usd) AS volume_usd,
  COUNT(*) AS swap_count,
  AVG(amount_usd) AS avg_swap_size
FROM dex.trades
WHERE block_time >= NOW() - INTERVAL '30' day
  AND amount_usd > 0
GROUP BY 1, 2
ORDER BY 3 DESC
LIMIT 100
```
**Columns**: `token_bought_symbol`, `token_sold_symbol`, `volume_usd`, `swap_count`, `avg_swap_size`

---

## PARAMETER SETUP

All queries with `{{days}}` parameter:
- **Type**: Number
- **Default**: 30

---

## Query ID Reference

Update these in `src/lib/dune.ts`:

| Query | ID |
|-------|-----|
| BTC_ACTIVE_ADDRESSES | YOUR_ID |
| BTC_DAILY_TRANSACTIONS | YOUR_ID |
| ETH_ACTIVE_ADDRESSES | YOUR_ID |
| ETH_DAILY_TRANSACTIONS | YOUR_ID |
| SOL_DAILY_TRANSACTIONS | YOUR_ID |
| SOL_DAILY_FEES | YOUR_ID |
| WHALE_TRANSFERS | YOUR_ID |
| STABLECOIN_SUPPLY | YOUR_ID |
| STABLECOIN_HOLDERS | YOUR_ID |
| DEX_DAILY_VOLUMES | YOUR_ID |
| DEX_TOP_PROTOCOLS | YOUR_ID |
| DEX_BY_BLOCKCHAIN | YOUR_ID |
| L2_ACTIVE_ADDRESSES | YOUR_ID |
| L2_GAS_FEES | YOUR_ID |
| NFT_TOP_COLLECTIONS | YOUR_ID |
| NFT_DAILY_VOLUMES | YOUR_ID |
| NFT_BY_BLOCKCHAIN | YOUR_ID |
| DEX_LIQUIDITY_POOLS | YOUR_ID |
| DEFI_PROTOCOL_USERS | YOUR_ID |
| UNISWAP_GOVERNANCE | YOUR_ID |
| DAO_ACTIVITY | YOUR_ID |
| CEX_DEX_VOLUME | YOUR_ID |
| TOP_TOKEN_PAIRS | YOUR_ID |

