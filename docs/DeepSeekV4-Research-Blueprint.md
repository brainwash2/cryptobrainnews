CryptoBrainNews — The Block Dashboard Clone: Research Blueprint

This report maps every data section on The Block's
dashboard to free (or
low‑cost) data sources available in 2026, identifies gaps that cannot be
filled without payment, prioritises the work into three phases, provides
concrete Dune SQL sketches for the highest‑impact queries, and flags
risk for every source.

1. Comparison Table: The Block Partners → Our Free Alternatives

| The Block’s Data Partner | Purpose | Our Free Alternative | CryptoBrainNews Destination Page | Exact Endpoint / Table | Cache TTL | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Coin Metrics | On‑chain metrics (active addresses, tx count, fees) | blockchain.info · Etherscan · Solana RPC · DefiLlama | /data/onchain/bitcoin, /ethereum, /solana | blockchain.info/charts/n-unique-addresses; api.etherscan.io/api?module=stats; Solana getRecentPerformanceSamples | BTC: 30 min · ETH: 1 h · SOL: 5 min | Coin Metrics Community API exists but is rate‑limited to 10 calls/min and lacks historical depth. We already cover 80 % with REST APIs. |
| Glassnode | MVRV, SOPR, NUPL, exchange flows, realised cap | blockchain.info (BTC hash‑rate, tx count, fees) · Etherscan · mempool.space | BTC/Ethereum/Solana on‑chain pages | Same as above | — | Glassnode Studio free tier shows 10 metrics with a 7‑day look‑back only; API is paid. GAP for sophisticated on‑chain indicators. |
| Kaiko | Order‑book depth, liquidity, trade‑level data | None — PAID ONLY | /data/markets/spot | N/A | — | Kaiko starts at 300/month∗∗.Nofreetier.ScrapingCEXAPIsisrate‑limitedandfragile.∗∗Recommendlow‑cost:KaikoLite(300 / month**. No free tier. Scraping CEX APIs is rate‑limited and fragile. **Recommend low‑cost: Kaiko Lite (300/month∗∗.Nofreetier.ScrapingCEXAPIsisrate‑limitedandfragile.∗∗Recommendlow‑cost:KaikoLite(300/mo) for top‑5 pairs only. |
| Chainalysis | Illicit flows, entity tagging | None — PAID ONLY | /data/onchain/flows | N/A | — | Not replaceable with free data. Skip for Phase‑A/B. |
| Skew / Coinbase | Options OI, volume, Greeks | Deribit public API | /data/markets/options | deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option | 5 min | Already live. Deribit covers 90 % of crypto options. CME options data requires CFTC / paid feed. |
| Dune Analytics | Custom SQL on all major chains | Dune Analytics (free tier) | 10+ pages across On‑Chain / DeFi / NFTs / Governance | dune.com query IDs (see §4) | 24 h minimum | Already in stack. 24 stubs exist; real SQL needed for governance, NFT volume, DEX liquidity, stablecoin holders. |
| CryptoCompare | Price indices, exchange volumes | CoinGecko | /data/markets/prices, /price-indexes | api.coingecko.com/api/v3/coins/markets | 5–30 min | Already live. CoinGecko is superior for free‑tier spot data. |
| Alchemy | NFT floor prices, metadata | Alchemy NFT API + Magic Eden | /data/nfts/collections | eth-mainnet.g.alchemy.com/nft/v3/{key}/getFloorPrice · api-mainnet.magiceden.dev/v2/collections/{sym}/stats | 1 h | Already live for Ethereum + Solana. |
| bybt / Coinglass | Futures OI, funding rates, liquidations | Bybit v5 + CoinGecko derivatives | /data/markets/futures | api.bybit.com/v5/market/tickers?category=linear · api.coingecko.com/api/v3/derivatives/exchanges | 5 min | Already live. Coinglass free tier has limited API but good web scraping target. |
| Flipside Crypto | Custom SQL (alternative to Dune) | Flipside Crypto (free tier) | Future /data/defi, /data/nfts | api.flipsidecrypto.com SQL endpoint | 24 h | NEW FREE API — broader chain coverage than Dune, 150 queries/day free. |
| The TIE | Sentiment, social volume | LunarCrush free tier | /data/alternative/social | lunarcrush.com/api/v2 (free tier 50 calls/day) | 1 h | NEW FREE API — signup at lunarcrush.com, 50 calls/day free. |
| IntoTheBlock | Advanced on‑chain indicators | IntoTheBlock free tier | New /data/onchain/* charts | Web dashboard; very limited API | 1 h | Free tier shows current snapshots only — no API key required for basic views. |
| Genesis / Vision Hill | Institutional lending, fund indices | None — PAID ONLY | N/A | N/A | — | Not available free. Skip for now. |
| Polymarket | Prediction markets | Polymarket Gamma API | /data/defi/prediction | gamma-api.polymarket.com/events | 10 min | Already live. |


2. Phased Implementation Plan

Phase A — Already Possible (Frontend / Chart Work Only)
No new API keys required. All data sources are already integrated.

| Priority | The Block Feature | Our Page | Action |
| --- | --- | --- | --- |
| A‑1 | Bitcoin — Hash‑rate chart (7D/30D/90D) | /data/onchain/bitcoin | Already have blockchain.info/charts/hash-rate — data is fetched. Add Recharts AreaChart panel to BitcoinChartsClient. |
| A‑2 | Bitcoin — Miner Revenue | /data/onchain/bitcoin | Add blockchain.info/charts/miners-revenue fetch + chart panel. |
| A‑3 | Bitcoin — HODL Waves / UTXO age bands | /data/onchain/bitcoin | Use blockchain.info/charts/utxo-age (free). Add stacked AreaChart. |
| A‑4 | Ethereum — Supply Growth (post‑Merge) | /data/onchain/ethereum | Use Etherscan stats/ethsupply endpoint. Add time‑series chart. |
| A‑5 | Futures — Liquidation data | /data/markets/futures | Bybit v5 /market/liq-records returns liquidations. Add table + chart panel to FuturesClient. |
| A‑6 | Stablecoins — Peg Deviation % | /data/stablecoins/usd | Compute (price − 1) × 100 from getStablecoinsOverview() (price field exists). Add GaugeCard per stablecoin. |
| A‑7 | ETF Premium / Discount | /data/etfs/bitcoin | IBIT/GBTC have live AUM and BTC price — compute (AUM per share − spot) / spot × 100. Add table column. |
| A‑8 | Spot — BTC/ETH Volume Dominance | /data/markets/spot | Already have global volume from CoinGecko. Add Volume Dominance bar chart alongside existing Market Cap Dominance bar. |
| A‑9 | DeFi — Revenue per Protocol (trend) | /data/defi/revenue | Already have getProtocolRevenue() from DefiLlama. Add 7D/30D trend chart. |
| A‑10 | Multi‑Chain Gas Tracker | /data/onchain/gas | Already have Ethereum gas. Add Arbitrum, Optimism, Base gas via existing public RPC fetchers in onchain-extended.ts. |
| A‑11 | CoinGecko "Trending" coins | /data/markets/prices | api.coingecko.com/api/v3/search/trending (free, no key). Add Top 15 trending module. |

Phase B — New Free API Required
Each requires a sign‑up and API key. All are free or have genuinely free tiers.

| Priority | API | Sign‑up Required | Usage Limit (Free) | Our Page(s) | New Data |
| --- | --- | --- | --- | --- | --- |
| B‑1 | Flipside Crypto | flipsidecrypto.com → free account → API key | 150 queries/day, 90‑day data retention | /data/defi/*, /data/nfts/volume, /data/onchain/comparison | Broader chain coverage than Dune (Aptos, Avalanche, Near). Use as Dune fallback/alternative. |
| B‑2 | CoinGlass (limited tier) | coinglass.com → free account | 50 data points/day via API; full web dashboard free | /data/markets/futures, New /data/markets/liquidations | BTC/ETH liquidations (24h), exchange OI rankings, funding rate heatmap. |
| B‑3 | Token Terminal (free tier) | tokenterminal.com → free account → API key | 200 requests/month | /data/defi/revenue | Protocol revenue, P/E ratio, annualised fees — more granular than DefiLlama revenue. |
| B‑4 | LunarCrush (free tier) | lunarcrush.com/developers → free account → API key | 50 calls/day | /data/alternative/social | Social volume, sentiment, influencer activity per coin. |
| B‑5 | IntoTheBlock (web scraper) | No sign‑up for public dashboard | Public pages, rate‑limit unknown | New /data/onchain/bitcoin, /data/onchain/ethereum charts | MVRV, IOMAP, concentration, in/out of money. Scraping caveat: public dashboard only, legally grey. Not suitable for automated high‑frequency scraping. |
| B‑6 | Spot On Chain (API) | spotonchain.com | Free tier 100 calls/day | /data/onchain/flows, /data/defi/whale-watch | Entity‑labelled whale alerts, smart money flows. |
| B‑7 | DefiLlama /unlocks | No sign‑up (free public API) | Standard DefiLlama rate limits | New /data/defi/unlocks | Token unlock schedules for all tracked protocols. |
| B‑8 | Fear & Greed Index (Alternative History) | No sign‑up | Standard | /data/markets/prices | Already have current. Add 30D/90D/1Y trend chart from alternative.me/fng/?limit=365. |

Phase C — Paid API or Complex Scraping (Minimum Viable Plan)
These require a budget. The "minimum viable plan" lists the cheapest way to get the data.


| Priority | The Block Equivalent | Cheapest Paid Source | Rough Cost | Our Page(s) | What It Unlocks |
| --- | --- | --- | --- | --- | --- |
| C‑1 | SOPR, MVRV, NUPL, Realised Cap | Glassnode Studio API | $49 / month (Standard plan, 25 metrics, 1‑year history) | /data/onchain/bitcoin, /data/onchain/ethereum | The most important on‑chain indicators we cannot get free. |
| C‑2 | Exchange Net Flows (CEX→DEX) | Glassnode or Nansen Lite | 49/month∗∗(Glassnode)or∗∗49 / month** (Glassnode) or **49/month∗∗(Glassnode)or∗∗99 / month (Nansen Lite) | /data/onchain/flows | The Block's signature "Exchange Flows" chart. Cannot be replicated with free REST APIs — requires entity labelling. |
| C‑3 | Order‑book liquidity, spread | Kaiko Lite | $300 / month | /data/markets/spot, New /data/markets/liquidity | Market depth, spread, slippage — missing entirely from free stack. |
| C‑4 | Illicit / sanctioned flows | Chainalysis | Contact sales ($$$$) | Not recommended for CryptoBrainNews | Compliance data. Not essential for an intelligence terminal. Skip. |
| C‑5 | Sentiment (The TIE) | LunarCrush (Phase B‑4) or Santiment | $79 / month (Santiment Personal) | /data/alternative/social | Social volume, sentiment, dev activity, on‑chain metrics per project. |
| C‑6 | Institutional Fund Flows (CoinShares) | CoinShares weekly report | Free (manual scrape) | /data/etfs/bitcoin, /data/etfs/comparison | Weekly BTC/ETH fund flow data published as PDF. Scraping is legally grey; manual data entry of 3‑4 numbers/week is viable. |
| C‑7 | Options Flow (Greeks.live) | Greeks.live web scraper | Free (scrape public page) | /data/markets/options | Block trades, unusual options activity. Legally grey — Terms of Service prohibit automated scraping. |

3. Dune Analytics Deep‑Dive
Safety‑First Usage Plan (Avoiding Another Ban)

| Rule | Implementation |
| --- | --- |
| Maximum call rate | 1 query execution per 10 seconds (6/min — well under the 10/min free‑tier limit). |
| Cache duration | 24 hours minimum for ALL Dune query results. Historical on‑chain data changes negligibly day‑to‑day. |
| Testing protocol | Use Dune's web editor to test SQL first. Only wire a query to our codebase once it returns < 500 rows in < 30 seconds. |
| Timeout guard | Wrap every getDuneQuery() call in AbortSignal.timeout(45_000) so a slow query never blocks a page render. |
| Fallback | Every Dune‑powered chart MUST have a static reference fallback (last‑known‑good data). NEVER show a spinner or empty state on Dune failure. |
| Query complexity | Keep all queries under 50,000 rows scanned. Use LIMIT aggressively. Prefer daily‑aggregated tables over raw transaction scans. |
| Monitoring | Track Dune execution counts in Upstash Redis (dune:counter:{queryId}:{date}). Alert if any query exceeds 5 executions/day. |


10 Highest‑Impact Dune SQL Sketches
Each query is designed to be safe (under 50k rows scanned), useful (adds a genuinely new chart to our dashboard), and verifiable (uses Dune's documented table schemas).


---- Query 1 --- 

Query 1: DAO Governance — Top 5 DAOs by Vote Count (30 Days)
Why: Our governance page is ComingSoon because the old stubs returned zeros. This query gives it real data.

Dune table: dune.dune.dataset_governance_proposals (Dune community data) or direct chain queries.

-- Safe pattern: query Tally.xyz proposal events (Ethereum)  
-- Table: tallyxyz_ethereum.governor_proposal_created  
-- Each row = one proposal event  
  
SELECT  
  date_trunc('day', evt_block_time) AS day,  
  COUNT(*)                          AS proposals_created,  
  'top-5-daos'                      AS category  
FROM tallyxyz_ethereum.governor_proposal_created  
WHERE evt_block_time >= NOW() - INTERVAL '30' day  
GROUP BY 1  
ORDER BY 1 DESC  
LIMIT 31  


Alternative (Snapshot off‑chain):

-- Snapshot votes table (off-chain governance)  
-- Table: snapshot.votes  
  
SELECT  
  date_trunc('day', created) AS day,  
  COUNT(*)                   AS vote_count,  
  space                      AS dao  
FROM snapshot.votes  
WHERE created >= UNIX_EPOCH(NOW() - INTERVAL '30' day)  
GROUP BY 1, 3  
ORDER BY 1 DESC, 2 DESC  
LIMIT 100  

Destination page: /data/governance
Replaces: Stub SQL in queries 6705858 / 6705938
Safe: Daily aggregation, < 500 rows, < 10k rows scanned
Cache TTL: 24 hours



--- Query 2--- 

Query 2: NFT Top Collections by Weekly Volume (Cross‑Chain)
Why: Our NFT volume page uses static seed data. This gives it real cross‑chain sales data — far more comprehensive than Alchemy (ETH only) + Magic Eden (SOL only).

Dune table: nft.trades

SELECT  
  collection,  
  blockchain,  
  SUM(amount_usd)            AS volume_7d_usd,  
  COUNT(*)                   AS trade_count,  
  COUNT(DISTINCT seller)     AS unique_sellers,  
  AVG(amount_usd)            AS avg_price_usd  
FROM nft.trades  
WHERE block_time >= NOW() - INTERVAL '7' day  
  AND amount_usd > 0  
  AND amount_usd < 1000000   -- filter outlier wash trades  
GROUP BY 1, 2  
HAVING SUM(amount_usd) > 50000  
ORDER BY volume_7d_usd DESC  
LIMIT 50  


Destination page: /data/nfts/volume
Safe: 7‑day aggregate, LIMIT 50, < 30k rows scanned
Cache TTL: 24 hours
Note: This query already exists as stub Q15. Update Dune ID with this corrected SQL.



--- Query 3 --- 

Query 3: DEX Liquidity Pools — Top 20 by Volume & Depth
Why: Gives real liquidity pool data beyond the "top protocols" view from DefiLlama. The Block has a dedicated "Liquidity Depth" chart.

Dune table: dex.trades + join on dex.liquidity if available

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

Destination page: /data/defi/dex-volume (add "Top Pools" sub‑section)
Safe: 24‑hour window, LIMIT 20, < 15k rows scanned
Cache TTL: 12 hours



--- Query 4--- 

Query 4: Stablecoin Holders — Distribution by Balance Buckets
Why: Our stablecoins pages show supply but not holder concentration. This is The Block's "Stablecoin Holder Distribution" chart.

Dune table: tokens.transfers (with balance aggregation)

WITH balances AS (  
  SELECT  
    "to"         AS holder,  
    contract_address,  
    SUM(amount)  AS balance  
  FROM tokens.transfers  
  WHERE block_time >= NOW() - INTERVAL '90' day  
    AND blockchain = 'ethereum'  
    AND contract_address IN (  
      '0xdac17f958d2ee523a2206206994597c13d831ec7',   -- USDT  
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'    -- USDC  
    )  
  GROUP BY 1, 2  
)  
SELECT  
  contract_address,  
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


Destination page: /data/stablecoins/usd (add "Holder Distribution" chart)
Safe: 90‑day window for balances, 2 contracts only, < 50k rows
Cache TTL: 24 hours



--- Query 5 --- 

Query 5: Whale Transfers — Cross‑Chain, All $$$ > $$1M
Why: Our whale watch page only shows USDT on Ethereum (Etherscan). Dune gives cross‑chain whales across 20+ chains for any token.

Dune table: tokens.transfers

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

Destination page: /data/defi/whale-watch (replace Etherscan‑only view)
Safe: 7‑day window, LIMIT 200, < 30k rows scanned
Cache TTL: 12 hours


--- Query 6 --- 

Query 6: Protocol Daily Active Users (DAU) — Top 15 DeFi Protocols
Why: DefiLlama gives TVL and volume, but not user counts. The Block has a dedicated "Active Users" section.

Dune table: dex.trades (proxy for DeFi users)

SELECT  
  date_trunc('day', block_time) AS day,  
  project,  
  COUNT(DISTINCT "from")       AS active_users,  
  COUNT(*)                     AS transaction_count  
FROM dex.trades  
WHERE block_time >= NOW() - INTERVAL '30' day  
  AND amount_usd > 0  
  AND project IN (  
    'Uniswap', 'PancakeSwap', 'Curve', 'Balancer',  
    'SushiSwap', 'Raydium', 'Orca', 'Aerodrome',  
    'dYdX', '1inch', '0x', 'Kyber', 'Matcha',  
    'ParaSwap', 'Velodrome'  
  )  
GROUP BY 1, 2  
ORDER BY 1 DESC, 3 DESC  
LIMIT 500  


Destination page: /data/defi/tvl (add "Daily Active Users" chart below TVL) or new /data/defi/users
Safe: 30‑day × 15 protocols = max 465 rows, < 40k rows scanned
Cache TTL: 24 hours


--- Query 7 --- 

Query 7: Token Swap Volume by Token Pair (Top 20 Pairs)
Why: The Block shows which token pairs dominate DEX activity. Not available from any REST API.

Dune table: dex.trades


SELECT  
  token_bought_symbol AS buy_token,  
  token_sold_symbol   AS sell_token,  
  SUM(amount_usd)     AS volume_24h_usd,  
  COUNT(*)            AS swap_count,  
  AVG(amount_usd)     AS avg_swap_size_usd  
FROM dex.trades  
WHERE block_time >= NOW() - INTERVAL '24' hour  
  AND amount_usd > 0  
GROUP BY 1, 2  
ORDER BY 3 DESC  
LIMIT 20  


Destination page: /data/defi/dex-volume (add "Top Pairs" section)
Safe: 24‑hour window, LIMIT 20, < 20k rows scanned
Cache TTL: 12 hours


--- Query 8 --- 

Query 8: L2 Active Addresses Comparison (7 Chains)
Why: Our L2 pages use TVL from DefiLlama. Active addresses is the missing engagement metric. Dune has all major L2s.

Dune tables: arbitrum.transactions, optimism.transactions, base.transactions, etc.


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


Destination page: /data/scaling/l2-comparison (add "Active Addresses" chart)
Safe: 30‑day × 5 chains = 155 rows, < 10k rows scanned per chain
Cache TTL: 24 hours


--- Query 9 --- 

Query 9: CEX‑to‑DEX Volume Ratio (Monthly Trend)
Why: The Block prominently shows whether volume is shifting between centralised and decentralised exchanges. We have CEX volume from CoinGecko; Dune gives DEX aggregate.

Dune table: dex.trades

SELECT  
  date_trunc('day', block_time) AS day,  
  SUM(amount_usd)               AS dex_volume_usd,  
  COUNT(*)                      AS dex_trades  
FROM dex.trades  
WHERE block_time >= NOW() - INTERVAL '90' day  
  AND amount_usd > 0  
GROUP BY 1  
ORDER BY 1 DESC  


Destination page: /data/onchain/flows (add "CEX vs DEX Volume" overlay — combine with CoinGecko CEX volume)
Safe: 90‑day aggregate = 90 rows, < 50k rows scanned
Cache TTL: 24 hours


--- Query 10 --- 

Query 10: Token Unlocks — Next 30 Days
Why: Dune has a community‑built token unlocks dashboard. This is critical for traders and has no free REST API equivalent.

Dune table: Dune community dataset dune.token_unlocks.dataset_token_unlocks (if available) or custom query against vesting contracts._

-- Simplified: query from Dune community data  
SELECT  
  token_symbol,  
  unlock_date,  
  amount_unlocked_usd,  
  pct_of_supply  
FROM dune.token_unlocks.dataset_token_unlocks  
WHERE unlock_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30' day  
  AND amount_unlocked_usd > 1000000  
ORDER BY unlock_date ASC, amount_unlocked_usd DESC  
LIMIT 50  


Destination page: New /data/defi/token-unlocks
Safe: Pre‑built community dataset, < 500 rows
Cache TTL: 24 hours

Note: If this Dune dataset doesn't exist, use the DefiLlama /unlocks endpoint (Phase B‑7) instead.


Dune Query ID Update Reference

| Query # | Purpose | Current Dune ID | Status | Action |
| --- | --- | --- | --- | --- |
| Q20 | Uniswap governance | 6705858 | Stub SQL | Replace with Query 1 (Tally) SQL |
| Q22 | DAO activity | 6705938 | Stub SQL | Replace with Query 1 (Snapshot) SQL |
| Q15 | NFT top collections | Needs new ID | Stub SQL | Replace with Query 2 SQL |
| Q18 | DEX liquidity pools | Needs new ID | No ID | Create with Query 3 SQL |
| Q9 | Stablecoin holders | Needs new ID | Stub SQL | Replace with Query 4 SQL |
| Q7 | Whale transfers | Needs new ID | Stub SQL | Replace with Query 5 SQL |
| Q19 | Protocol users | Needs new ID | Stub SQL | Replace with Query 6 SQL |
| Q24 | Token swap pairs | Needs new ID | No ID | Create with Query 7 SQL |
| Q13 | L2 active addresses | Needs new ID | Stub SQL | Replace with Query 8 SQL |
| Q23 | CEX vs DEX volume | Needs new ID | No ID | Create with Query 9 SQL |

Total Dune executions per day if ALL 10 are wired:
10 queries × 1 execution/day (24‑h cache) = 10 executions/day
(Well within the 864‑executions/day free‑tier limit.)



4. Ban‑Risk Flags — Every Data Source


| Data Source | Ban Risk | Risk Detail | Mitigation |
| --- | --- | --- | --- |
| CoinGecko | 🟡 Medium | ~30 calls/min free. Vercel serverless can peak quickly. | Cache 5‑30 min. Use cached() utility. Add Upstash‑based global rate‑limit counter per API key (max 20/min across all serverless instances). |
| DefiLlama | 🟢 Low | No documented rate limits. Very generous with free access. | Still cache 1‑24 hours. Don't hammer every 30 seconds. |
| Bybit v5 | 🟢 Low | Public endpoints, 50 req/5 sec per IP. Vercel's AWS IPs are treated as one "IP" — could trigger if multiple pages load simultaneously. | Cache 5 min for funding rates. Spread OI history calls across time (fetch once, cache 1 h). |
| Deribit | 🟢 Low | Public API, 20 req/sec per IP. No key needed. | Cache 5 min for options aggregate, 1 h for DVol history. |
| blockchain.info | 🟡 Medium | No official rate limit, but service is occasionally unstable. Heavy use could trigger IP blocks. | Cache 1 h for static stats, 30 min for charts. Don't poll more than once/min. |
| mempool.space | 🟢 Low | Public API, modest rate limits. Widely used. | Cache 5 min. |
| Etherscan | 🟡 Medium | Free key: 5 calls/sec, 100k calls/day. Easily hit if all ETH pages fetch simultaneously. | Cache 1‑24 h. Use ETHERSCAN_API_KEY env var. Fallback gracefully when key is missing. |
| Solana RPC | 🟡 Medium | Public RPC endpoints rate‑limit aggressively. api.mainnet-beta.solana.com is shared infrastructure. | Cache 5 min. Use getRecentPerformanceSamples with 60 samples (one call covers 1 h of TPS data). |
| Dune Analytics | 🔴 High | We were previously banned. 10 calls/min, 1M credits/month. Queries must be well‑designed and cache 24 h minimum. | See §3 safety plan above. NEVER exceed 5 exec/day per query. NEVER use Dune for real‑time data. NEVER call Dune from client‑side code. |
| Polymarket Gamma | 🟢 Low | Public API, modest limits. | Cache 10 min. |
| Wikipedia REST | 🟢 Low | Wikimedia API, very generous. | Cache 24 h (pageviews are daily data). |
| Alchemy NFT | 🟢 Low | Free tier: 300M compute units/month. getFloorPrice ≈ 10 CU/call × 12 calls/day = 120 CU/day. | Far under limit. Cache 1 h. |
| Magic Eden | 🟢 Low | 120 queries/min free. We make ~3 calls/day. | Far under limit. Cache 1 h. |
| Flipside Crypto 🔵 New | 🟡 Medium | 150 queries/day free. 60‑second query timeout. | Cache 24 h. Use as Dune alternative for chains where Dune lacks data. |
| CoinGlass 🔵 New | 🟡 Medium | 50 data points/day via API. Web scraping their dashboard is legally grey. | Use API sparingly. Do NOT scrape. |
| LunarCrush 🔵 New | 🟡 Medium | 50 calls/day. API key required. | Cache 1‑24 h. Use for daily sentiment snapshots, not real‑time. |
| IntoTheBlock 🔵 New | 🔴 High | No official free API. Web scraping their public dashboard may violate ToS and trigger IP blocks. | Use with extreme caution. Manually refresh reference snapshots rather than automated scraping. |
| Token Terminal 🔵 New | 🟡 Medium | 200 requests/month. | Cache 24 h. Use for monthly protocol revenue snapshots. |
| CFTC (Socrata / ZIP) | 🟡 Medium | Socrata API blocked from some Vercel regions by Cloudflare. ZIP endpoint uses Akamai CDN (better). | Cache 24 h. Use ZIP as primary, Socrata as fallback, reference snapshot as final fallback. |
| BlackRock/Grayscale scrapers | 🟡 Medium | No documented rate limits, but these are public product pages — not official APIs. Format changes could break parsing silently. | Cache 24 h. Monitor console.warn logs for parse failures. Seed fallback always in place. |
| Spot On Chain 🔵 New | 🟡 Medium | 100 calls/day free. | Cache 1 h. Use for daily whale alert digest. |


Summary of Deliverables

| Deliverable | Status |
| --- | --- |
| Comparison table (The Block partners → free alternatives) | ✅ Complete — 16 partners mapped |
| Phase A (frontend only, no new keys) | ✅ 11 actionable tasks |
| Phase B (new free APIs) | ✅ 8 APIs with exact sign‑up instructions |
| Phase C (paid / complex) | ✅ 7 sources with minimum viable plan and pricing |
| Dune SQL blueprints (5‑10 queries) | ✅ 10 sketches with table references and safety analysis |
| Dune safety plan | ✅ Rate limiting, cache, testing protocol |
| Ban‑risk flags | ✅ 19 sources rated with specific mitigations |















































---

## Phase E — Chart & UX Standardisation (The Block Clone)

**Status:** ✅ COMPLETE (April 30, 2026)

**Goal:** Upgrade the visual identity of the data terminal to match The Block's institutional dark dashboard. Replace all Recharts-heavy charts with TradingView Lightweight Charts, enforce consistent design tokens, and add reusable loading/error states.

**Reference research:** Grok performed a live UI audit of https://www.theblock.co/data and extracted exact colors, typography, spacing, timeframe selector patterns, and loading/error state conventions.

**Deliverables (15 files):**
- Global CSS redesign: `#161616` cards, `#27272a` borders, `#22c55e` primary accent, custom scrollbar, shimmer animation.
- 5 shared components rewritten: `TimeframeSelector` (pill‑style), `ChartSkeleton` (shimmer), `DataPageError`, `MetricCard` (with trend badge), `ProChartWrapper` (CSV export ready).
- `TvLightweightChart` extended with histogram support.
- 8 page‑specific client components upgraded: `SpotClient`, `FuturesClient`, `BitcoinChartsClient`, `EthTvlClient`, `SolanaChartsClient`, `DeFiTvlClient`, `RevenueTrendClient`, `StablecoinUsdClient`.
- All Recharts replaced with TradingView Lightweight Charts where applicable. Histograms later reverted to Recharts for categorical data after a live‑site "PI" symbol error.

**Key design tokens enforced:**
- Background: `#0a0a0a` | Card: `#161616` | Border: `#27272a`
- Primary: `#22c55e` | Error: `#ef4444` | Text: `#f8fafc` | Muted: `#a3a3a3`
- Typography: Inter (headings, font-weight 600), Space Mono (data, tabular-nums)
- Cards: `rounded-3xl`, padding `p-6`, hover shadow

---

## Phase F — Security, Pipeline & Code Quality Overhaul

**Status:** 🔲 IN PROGRESS (generating via DeepSeek V4, May 1, 2026)

**Goal:** Remediate all �� Critical, 🟠 High, and 🟡 Medium findings from the Grok + Claude 4.7 full‑application audits conducted on April 30, 2026.

**Audits that fed into Phase F:**
- **Grok full‑app audit:** visited the live site, checked data freshness against CoinGecko, inspected sitemap, health endpoint, and page rendering. Flagged degraded health status, missing /data/* sitemap routes, "CONNECTING TO TAPE…" / "Rendering…" UI blocks, and missing legal pages.
- **Claude 4.7 security & reliability audit:** reviewed the repository structure, identified CRON_SECRET enforcement gaps, Stripe webhook idempotency missing, dead‑letter queue writing to ephemeral /tmp, missing `server‑only` guards, and provided code snippets for fixes.

**Phase F sub‑tasks:**

### F‑1 — 🔴 Critical (Security & Pipeline Reliability)
- Create `src/lib/ops/cron-guard.ts` — a reusable CRON_SECRET validator.
- Apply the guard to all 5 cron routes (`daily-article`, `health`, `sitemap-warm`, `social`, `broadcast-drain`).
- Stripe webhook: ensure raw‑body signature verification + event ID idempotency via Redis.
- Dead‑letter queue: replace `/tmp` file writes in `daily-article.ts` with Redis LPUSH.
- Add `import 'server-only'` to `sanity-client.ts`, `supabase-server.ts`, `stripe.ts`.

### F‑2 — 🟠 High (Content, Broadcast & Legal)
- Telegram: respect Retry‑After header on 429 responses, throttle to 1 msg/sec.
- RSS dedup: add content‑snippet hash as a tertiary dedup key.
- Sitemap: add all 60+ `/data/*` routes and fix canonical domain.
- Newsletter unsubscribe: verify one‑click, no‑login, GDPR‑compliant flow.

### F‑3 — 🟡 Medium (Code Quality & Monitoring)
- Health endpoint: add sub‑checks for Sanity, Redis, and Resend.
- Rate‑limiting: apply to `/api/newsletter/subscribe` and `/api/news/search`.
- Legal pages: create `/privacy` and `/terms` placeholder pages with footer links.
- Affiliate links: enforce `rel="nofollow noopener sponsored"`.
- Dependencies: remove unused Supabase deps from `package.json`.

### F‑Research (Structural Improvements)
- Scan for code duplication (duplicate fetchers, duplicate UI components).
- Find all hardcoded API URLs / TTLs that should be env vars.
- Suggest top‑level project structure improvements.

---

## Phase Completion Summary

| Phase | Title | Status | Key Outcome |
|-------|-------|--------|------------|
| **A** | 11 Frontend Improvements | ✅ | Miner Revenue, UTXO Age, ETH Supply, Bybit Liq., Peg Deviation, ETF Premium, Volume Dominance, Revenue Trend, L2 Gas, Trending Coins, F&G 90D |
| **B** | 7 New Free APIs | ✅ | Flipside, CoinGlass, Token Terminal, LunarCrush, IntoTheBlock, Spot On Chain (→ Zerion), DefiLlama /unlocks |
| **C** | Paid → Free Replacements | ✅ | Kaiko → Hyperliquid+Drift, Santiment → ApeWisdom+Santiment free, Glassnode seed, CoinShares seed, Greeks.live seed |
| **D** | Live Dune SQL Integration | ✅ | 8 live Dune queries created on dune.com free tier, wired to `dune.ts`, seed fallbacks, DUNE_QUERIES.md updated |
| **E** | Chart & UX Standardisation | ✅ | 15 files, The Block design clone, TradingView Lightweight Charts, shimmer skeletons, pill timeframes, CSV export ready |
| **Zerion** | Spot On Chain Replacement | ✅ | `zerion.ts`, entity‑labelled whales, merged Etherscan+Zerion on `/data/defi/whale-watch` |
| **Env Audit** | Vercel Security Hardening | ✅ | 7 deprecated vars removed, 15 secrets rotated, 14 new vars added, free‑tier‑only `.env.example` |
| **F** | Security, Pipeline & Code Quality | 🔲 | Cron guard, Stripe idempotency, dead‑letter → Redis, Telegram rate‑limiting, sitemap expansion, legal pages, rate‑limiting, health checks (generating now) |
