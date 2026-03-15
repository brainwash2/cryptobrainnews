/**
 * src/lib/onchain-data.ts
 * Phase 40: On-chain metrics from free public APIs.
 *
 * Strategy by chain:
 *   Bitcoin  → mempool.space/api (no key, CORS-friendly from server)
 *              + blockchain.info/stats
 *   Ethereum → DefiLlama /v2/historicalChainTvl/Ethereum
 *              + beaconcha.in public API (no key for basic stats)
 *   Solana   → DefiLlama /v2/historicalChainTvl/Solana
 *              + StepN/SolanaBeach (fallback to DefiLlama summary)
 *   Avalanche/Aptos → DefiLlama /v2/chains summary
 *   Comparison → DefiLlama /v2/chains (TVL + fees per chain)
 *   Flows    → DefiLlama /api/v2/overview/dexs (exchange inflow proxy)
 */
import { cached } from '@/lib/cache';

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChainHistoryPoint {
  date:  string;   // "Jan 01"
  tvl:   number;   // USD
}

export interface BitcoinStats {
  hashRate:           number;   // EH/s
  difficulty:         number;
  mempoolTxCount:     number;
  mempoolSizeBytes:   number;
  avgFeeRate:         number;   // sat/vB
  blockHeight:        number;
  totalTransactions:  number;
  unconfirmedCount:   number;
}

export interface EthereumStats {
  ethPrice:           number;
  totalStaked:        number;   // ETH
  validatorCount:     number;
  stakingApr:         number;   // %
  avgGasGwei:         number;
  tvlUsd:             number;
  burnedTotal:        number;   // ETH approximate cumulative
}

export interface SolanaStats {
  tvlUsd:             number;
  tps:                number;   // approximate from DefiLlama
  validatorCount:     number;
  stakingApr:         number;   // %
}

export interface ChainSummaryRow {
  name:       string;
  tvl:        number;
  change1d:   number | null;
  change7d:   number | null;
  protocols:  number | null;
}

// ─── 1. Bitcoin: mempool.space ────────────────────────────────────────────────

export async function getBitcoinStats(): Promise<BitcoinStats | null> {
  return cached('onchain:btc:stats', async () => {
    try {
      const [statsRes, mempoolRes, feeRes] = await Promise.all([
        fetch('https://blockchain.info/stats?format=json'),
        fetch('https://mempool.space/api/mempool'),
        fetch('https://mempool.space/api/v1/fees/recommended'),
      ]);

      if (!statsRes.ok || !mempoolRes.ok) return null;

      const stats   = await statsRes.json() as {
        hash_rate: number;
        difficulty: number;
        n_tx: number;
        blocks_size: number;
        n_blocks_total: number;
        timestamp: number;
      };
      const mempool = await mempoolRes.json() as {
        count: number;
        vsize: number;
        total_fee: number;
      };
      const fees    = feeRes.ok
        ? await feeRes.json() as { hourFee: number; halfHourFee: number; fastestFee: number }
        : { hourFee: 0, halfHourFee: 0, fastestFee: 0 };

      // blockchain.info hash_rate is in GH/s → convert to EH/s
      const hashRateEhs = (stats.hash_rate ?? 0) / 1e9;

      return {
        hashRate:          Number(hashRateEhs.toFixed(2)),
        difficulty:        stats.difficulty ?? 0,
        mempoolTxCount:    mempool.count ?? 0,
        mempoolSizeBytes:  mempool.vsize ?? 0,
        avgFeeRate:        fees.halfHourFee ?? 0,
        blockHeight:       stats.n_blocks_total ?? 0,
        totalTransactions: stats.n_tx ?? 0,
        unconfirmedCount:  mempool.count ?? 0,
      };
    } catch {
      return null;
    }
  }, 300);
}

// ─── 2. Ethereum: beaconcha.in + DefiLlama ────────────────────────────────────

export async function getEthereumStats(): Promise<EthereumStats | null> {
  return cached('onchain:eth:stats', async () => {
    try {
      const [beaconRes, chainRes] = await Promise.all([
        fetch('https://beaconcha.in/api/v1/epoch/latest', {
          headers: { 'Accept': 'application/json' },
        }),
        fetch('https://api.llama.fi/v2/historicalChainTvl/Ethereum'),
      ]);

      let totalStaked   = 0;
      let validatorCount = 0;
      let stakingApr     = 3.5; // reasonable fallback APR

      if (beaconRes.ok) {
        const beaconJson = await beaconRes.json() as {
          data?: {
            eligibleether?: number;
            validatorscount?: number;
            stakingapr?: number;
          };
        };
        const d = beaconJson.data;
        totalStaked    = d?.eligibleether    ? d.eligibleether / 1e9   : 0;
        validatorCount = d?.validatorscount  ?? 0;
        stakingApr     = d?.stakingapr       ? Number((d.stakingapr * 100).toFixed(2)) : 3.5;
      }

      let tvlUsd = 0;
      if (chainRes.ok) {
        const history = await chainRes.json() as Array<{ date: number; tvl: number }>;
        if (Array.isArray(history) && history.length > 0) {
          tvlUsd = history[history.length - 1]?.tvl ?? 0;
        }
      }

      // Gas: public RPC eth_gasPrice (fallback 20 gwei)
      let avgGasGwei = 20;
      try {
        const gasRes = await fetch('https://api.blocknative.com/gasprices/blockprices', {
          headers: { 'Authorization': process.env.BLOCKNATIVE_API_KEY ?? '' },
        });
        if (gasRes.ok) {
          const gasJson = await gasRes.json() as {
            blockPrices?: Array<{ estimatedPrices?: Array<{ maxFeePerGas: number }> }>;
          };
          const price = gasJson.blockPrices?.[0]?.estimatedPrices?.[0]?.maxFeePerGas;
          if (price) avgGasGwei = price;
        }
      } catch { /* use fallback */ }

      return {
        ethPrice:      0,        // fetched separately to avoid circular cache
        totalStaked:   Number(totalStaked.toFixed(0)),
        validatorCount,
        stakingApr,
        avgGasGwei,
        tvlUsd,
        burnedTotal:   0,        // cumulative ETH burn — update via Dune when IDs are set
      };
    } catch {
      return null;
    }
  }, 300);
}

// ─── 3. Solana: DefiLlama + solanabeach fallback ──────────────────────────────

export async function getSolanaStats(): Promise<SolanaStats | null> {
  return cached('onchain:sol:stats', async () => {
    try {
      const chainRes = await fetch('https://api.llama.fi/v2/historicalChainTvl/Solana');
      let tvlUsd = 0;
      if (chainRes.ok) {
        const history = await chainRes.json() as Array<{ date: number; tvl: number }>;
        if (Array.isArray(history) && history.length > 0) {
          tvlUsd = history[history.length - 1]?.tvl ?? 0;
        }
      }

      // Solana validator stats — public RPC getVoteAccounts (simplified count)
      let validatorCount = 1_500; // reasonable fallback
      try {
        const validRes = await fetch('https://api.mainnet-beta.solana.com', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            jsonrpc: '2.0', id: 1,
            method: 'getVoteAccounts',
            params: [{ commitment: 'finalized' }],
          }),
        });
        if (validRes.ok) {
          const vJson = await validRes.json() as {
            result?: { current?: unknown[]; delinquent?: unknown[] };
          };
          const current    = vJson.result?.current?.length    ?? 0;
          const delinquent = vJson.result?.delinquent?.length ?? 0;
          validatorCount = current + delinquent;
        }
      } catch { /* use fallback */ }

      return {
        tvlUsd,
        tps:            2_500,   // public TPS is ~2500 sustainable; real-time requires websocket
        validatorCount,
        stakingApr:     6.5,     // approximate network APY
      };
    } catch {
      return null;
    }
  }, 300);
}

// ─── 4. Historical TVL for a DefiLlama chain (30-point series) ───────────────

export async function getChainTvlHistory(
  chain: string,
  days = 90
): Promise<ChainHistoryPoint[]> {
  return cached(`onchain:tvl:history:${chain}:${days}`, async () => {
    try {
      const res = await fetch(
        `https://api.llama.fi/v2/historicalChainTvl/${encodeURIComponent(chain)}`
      );
      if (!res.ok) return [];
      const data = await res.json() as Array<{ date: number; tvl: number }>;
      if (!Array.isArray(data)) return [];

      const slice = data.slice(-days);
      return slice.map((d) => ({
        date: new Date(d.date * 1000).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        }),
        tvl: d.tvl,
      }));
    } catch {
      return [];
    }
  }, 3600);
}

// ─── 5. All chains summary: DefiLlama /v2/chains ─────────────────────────────

export async function getAllChainsSummary(): Promise<ChainSummaryRow[]> {
  return cached('onchain:all-chains', async () => {
    try {
      const res = await fetch('https://api.llama.fi/v2/chains');
      if (!res.ok) return [];
      const data = await res.json() as Array<{
        name: string;
        tvl: number;
        change_1d: number | null;
        change_7d: number | null;
        protocols: number | null;
      }>;
      return data
        .filter((c) => c.tvl > 1_000_000)
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, 40)
        .map((c) => ({
          name:      c.name,
          tvl:       c.tvl,
          change1d:  c.change_1d ?? null,
          change7d:  c.change_7d ?? null,
          protocols: c.protocols ?? null,
        }));
    } catch {
      return [];
    }
  }, 3600);
}

// ─── 6. DEX flows per chain (DefiLlama overview/dexs) ────────────────────────

export interface DexFlowRow {
  name:            string;
  total24h:        number;
  total7d:         number;
  change_1d:       number | null;
}

export async function getDexFlowsByChain(): Promise<DexFlowRow[]> {
  return cached('onchain:dex-flows:chains', async () => {
    try {
      const res = await fetch(
        'https://api.llama.fi/overview/dexs?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true'
      );
      if (!res.ok) return [];
      const data = await res.json() as {
        protocols?: Array<{
          name: string;
          total24h: number | null;
          total7d: number | null;
          change_1d: number | null;
        }>;
      };
      return (data.protocols ?? [])
        .filter((p) => (p.total24h ?? 0) > 0)
        .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
        .slice(0, 25)
        .map((p) => ({
          name:      p.name,
          total24h:  p.total24h ?? 0,
          total7d:   p.total7d  ?? 0,
          change_1d: p.change_1d ?? null,
        }));
    } catch {
      return [];
    }
  }, 1800);
}
