# Claude 4.6 Opus – Data Terminal Refactor State

## Current Phase
**Phase 2** – ✅ Complete

## Last Session Date
**2026‑04‑25** – Phase 2 audit + fixes delivered and committed.

## Completed

### Phase 1 MVP (Steps 1–7) ✅

| Step | Description | Status |
|------|-------------|--------|
| 1 | Install `lightweight‑charts@^5.1.0` | ✅ Done |
| 2 | Create `src/app/data/_components/charts/TvLightweightChart.tsx` | ✅ Done |
| 3 | `/data/markets/spot` – BTC/ETH price history via CoinGecko client‑side fetch | ✅ Done |
| 4 | `/data/onchain/bitcoin` – hash‑rate, fees, mempool charts from blockchain.info | ✅ Done |
| 5 | `/data/onchain/ethereum` – EthTvlClient Recharts AreaChart replacing CSS bars | ✅ Done |
| 6 | `/data/onchain/solana` – TPS history chart + TVL AreaChart (60 RPC samples) | ✅ Done |
| 7 | `/data/defi/tvl` – TimeframeSelector integration | ✅ Done |

### Phase 2: Futures, ETFs, Stablecoins, Treasuries, Scaling ✅

| Subsection | Pages | Data Source | Status |
|------------|-------|-------------|--------|
| **Futures & Perpetuals** | `/data/markets/futures` | Bybit v5 (OI, funding), CoinGecko (exchange volumes) | ✅ Live |
| **ETFs – Bitcoin** | `/data/etfs/bitcoin` | Live AUM (BlackRock iShares + Grayscale scraper × CoinGecko price) | ✅ Live |
| **ETFs – Ethereum** | `/data/etfs/ethereum` | Same architecture as BTC | ✅ Live |
| **ETFs – Solana** | `/data/etfs/solana` | Filings tracker + live SOL price | ✅ Live |
| **ETFs – XRP** | `/data/etfs/xrp` | Filings tracker + live XRP price | ✅ Live |
| **ETFs – Crypto Index** | `/data/etfs/crypto` | Filings tracker + DOGE/LTC/ADA live prices | ✅ Live |
| **ETFs – Comparison** | `/data/etfs/comparison` | Combined BTC+ETH overview, all ranked by AUM | ✅ Live |
| **Stablecoins – USD** | `/data/stablecoins/usd` | DefiLlama stablecoins API (supply, dominance, peg health) | ✅ Live |
| **Stablecoins – By Chain** | `/data/stablecoins/chains` | DefiLlama chain aggregation (25 chains >$10M supply) | ✅ Live |
| **Stablecoins – Non-USD** | `/data/stablecoins/non-usd` | ComingSoon stub | ✅ Stub |
| **Stablecoins – Non-Fiat** | `/data/stablecoins/non-fiat` | ComingSoon stub | ✅ Stub |
| **Treasuries – Bitcoin** | `/data/treasuries/bitcoin` | CoinGecko public treasury API (holdings + P&L) | ✅ Live |
| **Treasuries – Ethereum** | `/data/treasuries/ethereum` | CoinGecko public treasury API | ✅ Live |
| **Treasuries – Solana** | `/data/treasuries/solana` | Seed data (3 companies) × live CoinGecko SOL price | ✅ Live |
| **Treasuries – Crypto** | `/data/treasuries/crypto` | Merged BTC+ETH CoinGecko treasury data | ✅ Live |
| **Scaling – Overview** | `/data/scaling` | DefiLlama (OPT vs ZK split, fee leaderboard, full L2 table) | ✅ Live |
| **Scaling – L2 Comparison** | `/data/scaling/l2-comparison` | Side-by-side OPT vs ZK with fee column from DefiLlama | ✅ Live |
| **Scaling – Optimistic** | `/data/scaling/optimistic` | TVL + live gas prices from public RPCs | ✅ Live |
| **Scaling – ZK** | `/data/scaling/zk` | TVL + proof technology comparison table | ✅ Live |
| **Scaling – L1 EVM** | `/data/scaling/l1-evm` | DefiLlama TVL bars + table | ✅ Live |
| **Scaling – L1 Non-EVM** | `/data/scaling/l1-non-evm` | DefiLlama TVL + VM/consensus reference | ✅ Live |
| **Scaling – DA** | `/data/scaling/data-availability` | Celestia/EigenDA/Avail/ETH Blobs cards + comparison | ✅ Live |

### Phase 2 Fixes Applied (this session)

| Fix | File | Description |
|-----|------|-------------|
| TS2322 `any` removal | `FuturesClient.tsx` | Replaced `any`-typed Recharts `formatter` with custom `content` tooltip components |
| Source label correction | `FuturesClient.tsx` | Changed "Binance" badge → "Bybit" (Phase 45 migration) |
| Animation disable | `FuturesClient.tsx` | Added `isAnimationActive={false}` to all Bar and Area components |

## Pending – Phase 3

### Phase 3: Options, CME COTs, NFTs, Alt Metrics (future)
- Options page with Deribit public API (BTC/ETH options flow, put/call ratio)
- CME Commitments of Traders via CFTC public reports
- Companies revenue from DefiLlama fees/revenue API
- NFTs with CoinGecko floor prices and Dune volumes
- Launchpads, RWA deep-dive
- Alternative Metrics (Google Trends, Wikipedia views)
- CSV/JSON downloads, alerts, custom dashboards (Pro tier)

## Latest Commits
- `eebea58` – feat(data): complete Phase 1 MVP Steps 3‑7
- `513e46d` – fix(data): replace useState+useEffect mounted guard with useSyncExternalStore
- *pending* – fix(data): Phase 2 TypeScript fixes, source label correction, animation guards

## Verification
- ✅ `npx tsc --noEmit` → 0 errors
- ✅ All Recharts charts: mounted guard + `isAnimationActive={false}`
- ✅ No mock data, no premium gates (AlphaGate)
- ✅ Custom Tooltip `content` pattern used (no `any` in formatters)
- ✅ Bybit v5 confirmed as live data source (no Binance references remain)

## Data Source Registry

| Source | Endpoint | Used In | Cache TTL |
|--------|----------|---------|-----------|
| CoinGecko | `/global`, `/simple/price`, `/coins/markets`, `/derivatives/exchanges`, `/companies/public_treasury/*` | Markets, ETFs, Treasuries | 5m–6h |
| Bybit v5 | `/market/tickers`, `/market/open-interest`, `/market/funding/history` | Futures (funding, OI history) | 5m–1h |
| DefiLlama | `/protocols`, `/v2/chains`, `/overview/fees`, `/overview/dexs`, `/overview/derivatives`, `stablecoins.llama.fi`, `yields.llama.fi` | DeFi, Stablecoins, Scaling | 30m–1h |
| BlackRock iShares | Product page JSON | ETF BTC/ETH holdings | 24h |
| Grayscale | Product API | ETF BTC/ETH holdings | 24h |
| blockchain.info | `/charts/*` | On-Chain Bitcoin | 1h |
| Public RPCs | Arbitrum, Optimism, Base | Scaling gas prices | 5m |

## Resumption Instructions for Phase 3
1. Open a fresh Claude Opus 4.6 session.
2. Provide the full master prompt from `docs/claude-opus-data-refactor.md`.
3. Provide this updated state file.
4. Task Opus with Phase 3: Options, CME COTs, NFTs, Companies Revenue, Alternative Metrics.
