# Claude 4.6 Opus – Data Terminal Refactor State

## Current Phase
**Phase 1 MVP** – In Progress

## Last Session Date
**2026-04-19** – Quota exhausted mid‑execution. Resuming on or after **2026-04-26**.

## Completed (✅)

| Step | Description | Status |
|------|-------------|--------|
| 1 | Install `lightweight-charts@^5.1.0` | ✅ Done |
| 2 | Create `src/app/data/_components/charts/TvLightweightChart.tsx` | ✅ Done, compiles clean |

## Pending (Steps 3‑7)

### Step 3: `/data/markets/spot` – SpotClient.tsx
- **Action:** Add BTC/ETH price history charts using `TvLightweightChart`.
- **Data Source:** CoinGecko `/coins/{id}/market_chart?vs_currency=usd&days=30&interval=daily`
- **Behavior:**
  - Fetch 30‑day daily price data client‑side.
  - Show two side‑by‑side `TvLightweightChart` panels for **7D** and **30D** timeframes.
  - Hide charts when **1D** timeframe is selected (movers chart already sufficient).

### Step 4: `/data/onchain/bitcoin` – BitcoinChartsClient.tsx
- **Action:** Add three new blockchain metric charts.
- **Data Source:** `blockchain.info/charts` (hash‑rate, transaction‑fees, mempool‑size)
- **Implementation:**
  - Server component: add `fetchBtcChart()` calls for each metric.
  - Client component: render three additional Recharts `AreaChart` panels.

### Step 5: `/data/onchain/ethereum` – page.tsx
- **Action:** Replace CSS bar TVL chart with Recharts `AreaChart`.
- **Implementation:**
  - Create new client component `EthTvlClient.tsx`.
  - Move TVL rendering there, using existing DefiLlama data.

### Step 6: `/data/onchain/solana` – page.tsx
- **Action:** Add TPS history chart.
- **Data Source:** Solana RPC `getRecentPerformanceSamples`.
- **Implementation:**
  - Change RPC param from `[1]` to `[60]` to get 60 samples.
  - Create `SolanaChartsClient.tsx` with Recharts `AreaChart` (purple `#9945FF` theme).

### Step 7: `/data/defi/tvl` – DeFiTvlClient.tsx
- **Action:** Integrate shared `TimeframeSelector` component.
- **Implementation:** Replace custom button group. Map `Timeframe` type to days count.

## Ledger & Git
- Append updates to `task.md` and `implementation-plan.md`.
- Final git commit command to be included in output.

## Opus's Planned Implementation Details (Preserved)
- **SpotClient:** Use `useEffect` to fetch CoinGecko market chart. Slice data client‑side based on selected timeframe. Use `TvDataPoint` interface (time as `string` or `number`). Hide chart for 1D.
- **Bitcoin:** Server fetches to blockchain.info, pass data to client, render alongside existing address/tx charts.
- **Ethereum:** Extract chart into `EthTvlClient` with Recharts `AreaChart` (gradient fill, dark tooltips).
- **Solana:** Expand performance samples to 60, compute TPS, render with Recharts.
- **DeFiTvl:** Swap button group for `TimeframeSelector`, adjust data slicing logic.

## Resumption Instructions
1. Open **Antigravity** with the same project.
2. Load the **existing conversation** where Steps 1‑2 were completed.
3. Paste this exact prompt:

```
Continue from Step 3. Output all remaining cat commands for SpotClient, BitcoinChartsClient, EthTvlClient, SolanaChartsClient, DeFiTvlClient, ledger updates, and git commit.
```

4. Execute the generated `cat` commands in the terminal.
5. Test with `npm run dev`.
6. Commit and push.

## Files Touched (Will Be)
- `src/app/data/markets/spot/_components/SpotClient.tsx`
- `src/app/data/onchain/bitcoin/page.tsx`
- `src/app/data/onchain/bitcoin/_components/BitcoinChartsClient.tsx`
- `src/app/data/onchain/ethereum/page.tsx`
- `src/app/data/onchain/ethereum/_components/EthTvlClient.tsx` (new)
- `src/app/data/onchain/solana/page.tsx`
- `src/app/data/onchain/solana/_components/SolanaChartsClient.tsx` (new)
- `src/app/data/defi/tvl/_components/DeFiTvlClient.tsx`
- `task.md`
- `implementation-plan.md`

---
*This file serves as the single source of truth for the Data Terminal refactor progress.*
