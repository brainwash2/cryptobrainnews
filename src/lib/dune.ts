// src/lib/dune.ts
// Phase D — Live Dune SQL Integration
// All 9 analytics functions now call the real Dune API with 24‑hour cache.
// Falls back to seed arrays when DUNE_API_KEY is missing, the fetch fails,
// or the query returns zero rows.
import 'server-only';
import { cached } from '@/lib/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DuneRow {
  [key: string]: string | number | null;
}

export interface DuneResultSet {
  rows:   DuneRow[];
  source: 'live' | 'seed';
}

interface DuneExecutionResponse {
  execution_id?:  string;
  state?:          string;
  result?: {
    rows?: Array<Record<string, unknown>>;
  };
}

// ─── Dune Query ID Map ───────────────────────────────────────────────────────
// Override any of these in .env.local / Vercel with the real Dune query ID
// once the SQL from docs/DeepSeekV4‑Research‑Blueprint.md is deployed on dune.com.

const Q = {
  DAO_GOVERNANCE:        process.env.DUNE_DAO_GOVERNANCE_ID,
  NFT_TOP_COLLECTIONS:   process.env.DUNE_NFT_COLLECTIONS_ID,
  DEX_LIQUIDITY_POOLS:   process.env.DUNE_DEX_POOLS_ID,
  STABLECOIN_HOLDERS:   process.env.DUNE_STABLECOIN_HOLDERS_ID,
  CROSS_CHAIN_WHALES:   process.env.DUNE_WHALES_ID,
  PROTOCOL_DAU:          process.env.DUNE_PROTOCOL_DAU_ID,
  TOP_TOKEN_PAIRS:       process.env.DUNE_TOP_PAIRS_ID,
  L2_ACTIVE_ADDRESSES:   process.env.DUNE_L2_ACTIVE_ID,
  CEX_VS_DEX_VOLUME:     process.env.DUNE_CEX_DEX_VOLUME_ID,
} as const;

const DUNE_API_BASE = 'https://api.dune.com/api/v1';
const DUNE_TTL       = 86400; // 24 hours — required by safety rules

// ─── Core Dune Fetcher ────────────────────────────────────────────────────────

/** Execute a Dune query by ID and return typed rows, or [] on any failure. */
async function executeDuneQuery(
  queryId: string,
  label: string,
): Promise<DuneRow[]> {
  const apiKey = process.env.DUNE_API_KEY?.trim();
  if (!apiKey) {
    console.info(`[Dune] DUNE_API_KEY not set — using seed for ${label}`);
    return [];
  }

  try {
    // 1. Try cached results (fast path)
    const cachedRes = await fetch(
      `${DUNE_API_BASE}/query/${queryId}/results`,
      {
        headers: {
          'X-Dune-API-Key': apiKey,
          'Accept':         'application/json',
        },
        signal: AbortSignal.timeout(45_000),
      },
    );

    if (cachedRes.ok) {
      const data = (await cachedRes.json()) as DuneExecutionResponse;
      if (data.result?.rows?.length) {
        console.info(
          `[Dune] ${label} → ${data.result.rows.length} rows (cached, live)`,
        );
        return data.result.rows.map(normaliseRow);
      }
    }

    // 2. Execute fresh
    console.info(`[Dune] Executing ${label} (${queryId})…`);
    const execRes = await fetch(
      `${DUNE_API_BASE}/query/${queryId}/execute`,
      {
        method:  'POST',
        headers: {
          'X-Dune-API-Key': apiKey,
          'Content-Type':   'application/json',
        },
        signal: AbortSignal.timeout(45_000),
      },
    );
    if (!execRes.ok) {
      console.warn(`[Dune] Execute ${label} HTTP ${execRes.status}`);
      return [];
    }
    const execData = (await execRes.json()) as DuneExecutionResponse;
    const execId   = execData.execution_id;
    if (!execId) {
      console.warn(`[Dune] No execution_id for ${label}`);
      return [];
    }

    // 3. Poll for completion (max 30 s)
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 3_000));
      const pollRes = await fetch(
        `${DUNE_API_BASE}/execution/${execId}/results`,
        {
          headers: {
            'X-Dune-API-Key': apiKey,
            'Accept':         'application/json',
          },
          signal: AbortSignal.timeout(15_000),
        },
      );
      if (!pollRes.ok) continue;

      const pollData = (await pollRes.json()) as DuneExecutionResponse;
      if (pollData.state === 'QUERY_STATE_COMPLETED') {
        const rows = pollData.result?.rows ?? [];
        if (rows.length > 0) {
          console.info(
            `[Dune] ${label} → ${rows.length} rows (fresh execution, live)`,
          );
          return rows.map(normaliseRow);
        }
        console.warn(`[Dune] ${label} completed with 0 rows`);
        return [];
      }
      if (pollData.state === 'QUERY_STATE_FAILED') {
        console.warn(`[Dune] ${label} execution failed`);
        return [];
      }
    }

    console.warn(`[Dune] Timed out polling ${label}`);
    return [];
  } catch (err) {
    console.warn(`[Dune] Error fetching ${label}:`, String(err));
    return [];
  }
}

/** Convert an API row to DuneRow, dropping undefined values. */
function normaliseRow(raw: Record<string, unknown>): DuneRow {
  const row: DuneRow = {};
  for (const [k, v] of Object.entries(raw)) {
    row[k] = v === undefined || v === null ? null : (v as string | number);
  }
  return row;
}

/** Wraps the Dune call + cached() + seed‑fallback pattern used by every function. */
async function duneOrSeed(
  cacheKey: string,
  queryId: string | undefined,
  label: string,
  seedRows: DuneRow[],
): Promise<DuneResultSet> {
  return cached(cacheKey, async (): Promise<DuneResultSet> => {
    if (!queryId) {
      console.info(`[Dune] No query ID configured for ${label} — using seed`);
      return { rows: seedRows, source: 'seed' };
    }

    const liveRows = await executeDuneQuery(queryId, label);
    if (liveRows.length > 0) {
      return { rows: liveRows, source: 'live' };
    }

    console.info(`[Dune] ${label} returned 0 rows — falling back to seed`);
    return { rows: seedRows, source: 'seed' };
  }, DUNE_TTL);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DAO Governance — Tally + Snapshot proposals & votes
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_DAO_GOVERNANCE: DuneRow[] = [
  { day: '2026-04-14', dao: 'Aave',              proposals_created: 2, vote_count: 1820, category: 'top-5-daos' },
  { day: '2026-04-13', dao: 'Uniswap',            proposals_created: 1, vote_count: 3450, category: 'top-5-daos' },
  { day: '2026-04-13', dao: 'Compound',           proposals_created: 3, vote_count: 1200, category: 'top-5-daos' },
  { day: '2026-04-12', dao: 'MakerDAO',           proposals_created: 1, vote_count: 980,  category: 'top-5-daos' },
  { day: '2026-04-12', dao: 'Arbitrum DAO',       proposals_created: 4, vote_count: 5600, category: 'top-5-daos' },
  { day: '2026-04-11', dao: 'Aave',              proposals_created: 2, vote_count: 2100, category: 'top-5-daos' },
  { day: '2026-04-11', dao: 'Optimism Collective', proposals_created: 1, vote_count: 8900, category: 'top-5-daos' },
  { day: '2026-04-10', dao: 'Uniswap',            proposals_created: 3, vote_count: 4200, category: 'top-5-daos' },
  { day: '2026-04-10', dao: 'Compound',           proposals_created: 1, vote_count: 750,  category: 'top-5-daos' },
  { day: '2026-04-09', dao: 'Aave',              proposals_created: 1, vote_count: 1650, category: 'top-5-daos' },
];

export async function getDAOGovernance(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:dao-governance',
    Q.DAO_GOVERNANCE,
    'DAO Governance',
    SEED_DAO_GOVERNANCE,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. NFT Top Collections by 7‑Day Volume (Cross‑Chain)
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_NFT_COLLECTIONS: DuneRow[] = [
  { collection: 'CryptoPunks',           blockchain: 'ethereum',  volume_7d_usd: 6_200_000, trade_count: 142, unique_sellers: 89,  avg_price_usd: 43700,  min_price_usd: 28000, max_price_usd: 125000 },
  { collection: 'Bored Ape Yacht Club',  blockchain: 'ethereum',  volume_7d_usd: 4_100_000, trade_count: 210, unique_sellers: 134, avg_price_usd: 19500,  min_price_usd: 12000, max_price_usd: 58000  },
  { collection: 'Pudgy Penguins',        blockchain: 'ethereum',  volume_7d_usd: 2_800_000, trade_count: 320, unique_sellers: 195, avg_price_usd: 8750,   min_price_usd: 5200,  max_price_usd: 22000  },
  { collection: 'Mad Lads',              blockchain: 'solana',    volume_7d_usd: 1_900_000, trade_count: 540, unique_sellers: 310, avg_price_usd: 3520,   min_price_usd: 1800,  max_price_usd: 8900   },
  { collection: 'Chromie Squiggle',       blockchain: 'ethereum',  volume_7d_usd: 1_200_000, trade_count: 85,  unique_sellers: 52,  avg_price_usd: 14100,  min_price_usd: 8200,  max_price_usd: 31000  },
  { collection: 'NodeMonkes',            blockchain: 'bitcoin',   volume_7d_usd: 950_000,   trade_count: 180, unique_sellers: 120, avg_price_usd: 5280,   min_price_usd: 3200,  max_price_usd: 14000  },
  { collection: 'Azuki',                 blockchain: 'ethereum',  volume_7d_usd: 820_000,   trade_count: 95,  unique_sellers: 68,  avg_price_usd: 8630,   min_price_usd: 5100,  max_price_usd: 18500  },
  { collection: 'Claynosaurz',           blockchain: 'solana',    volume_7d_usd: 640_000,   trade_count: 290, unique_sellers: 175, avg_price_usd: 2210,   min_price_usd: 900,   max_price_usd: 6200   },
];

export async function getNFTTopCollectionsByVolume(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:nft-collections',
    Q.NFT_TOP_COLLECTIONS,
    'NFT Top Collections',
    SEED_NFT_COLLECTIONS,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DEX Liquidity Pools — Top 20 by 24h Volume & Depth
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_DEX_POOLS: DuneRow[] = [
  { dex: 'Uniswap',     blockchain: 'ethereum', token_a: 'WETH',  token_b: 'USDC',  volume_24h_usd: 820_000_000, swap_count: 24_500, avg_swap_usd: 33469  },
  { dex: 'Uniswap',     blockchain: 'ethereum', token_a: 'WBTC',  token_b: 'USDC',  volume_24h_usd: 510_000_000, swap_count: 12_800, avg_swap_usd: 39844  },
  { dex: 'PancakeSwap', blockchain: 'bsc',      token_a: 'WBNB',  token_b: 'USDT',  volume_24h_usd: 340_000_000, swap_count: 45_200, avg_swap_usd: 7522   },
  { dex: 'Orca',        blockchain: 'solana',   token_a: 'SOL',   token_b: 'USDC',  volume_24h_usd: 280_000_000, swap_count: 82_000, avg_swap_usd: 3415   },
  { dex: 'Curve',       blockchain: 'ethereum', token_a: 'USDC',  token_b: 'USDT',  volume_24h_usd: 195_000_000, swap_count: 8_100,  avg_swap_usd: 24074  },
  { dex: 'Aerodrome',   blockchain: 'base',     token_a: 'WETH',  token_b: 'USDC',  volume_24h_usd: 160_000_000, swap_count: 18_400, avg_swap_usd: 8696   },
  { dex: 'Raydium',     blockchain: 'solana',   token_a: 'SOL',   token_b: 'RAY',   volume_24h_usd: 125_000_000, swap_count: 52_000, avg_swap_usd: 2404   },
  { dex: 'dYdX',        blockchain: 'cosmos',   token_a: 'ETH',   token_b: 'USDC',  volume_24h_usd: 98_000_000,  swap_count: 3_200,  avg_swap_usd: 30625  },
  { dex: 'Balancer',    blockchain: 'ethereum', token_a: 'WETH',  token_b: 'DAI',   volume_24h_usd: 72_000_000,  swap_count: 5_600,  avg_swap_usd: 12857  },
  { dex: 'Trader Joe',  blockchain: 'avalanche',token_a: 'AVAX',  token_b: 'USDC',  volume_24h_usd: 55_000_000,  swap_count: 14_200, avg_swap_usd: 3873   },
];

export async function getDEXLiquidityPools(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:dex-pools',
    Q.DEX_LIQUIDITY_POOLS,
    'DEX Liquidity Pools',
    SEED_DEX_POOLS,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Stablecoin Holder Distribution — USDT/USDC balance buckets
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_STABLECOIN_HOLDERS: DuneRow[] = [
  { contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7', bucket: '0-1K',     holder_count: 4_200_000, total_balance: 520_000_000   },
  { contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7', bucket: '1K-10K',   holder_count: 580_000,   total_balance: 1_840_000_000 },
  { contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7', bucket: '10K-100K', holder_count: 85_000,    total_balance: 2_950_000_000 },
  { contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7', bucket: '100K-1M',  holder_count: 12_000,    total_balance: 3_800_000_000 },
  { contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7', bucket: '1M+',      holder_count: 2_100,     total_balance: 28_500_000_000},
  { contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', bucket: '0-1K',     holder_count: 3_800_000, total_balance: 440_000_000   },
  { contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', bucket: '1K-10K',   holder_count: 420_000,   total_balance: 1_520_000_000 },
  { contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', bucket: '10K-100K', holder_count: 62_000,    total_balance: 2_100_000_000 },
  { contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', bucket: '100K-1M',  holder_count: 9_500,     total_balance: 2_800_000_000 },
  { contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', bucket: '1M+',      holder_count: 1_400,     total_balance: 23_200_000_000},
];

export async function getStablecoinHolderDistribution(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:stablecoin-holders',
    Q.STABLECOIN_HOLDERS,
    'Stablecoin Holders',
    SEED_STABLECOIN_HOLDERS,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Cross‑Chain Whale Transfers — >$1M across 6+ chains
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_WHALES: DuneRow[] = [
  { block_time: '2026-04-14T22:15:00Z', blockchain: 'ethereum',  whale_address: '0x28c6c06298d51408901ae4a9b5b678fcb9eb4d4e', recipient: '0xf89d7b9c864f589bbf53a521051922dc23a6da2a', contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', amount_usd: 28_500_000  },
  { block_time: '2026-04-14T18:42:00Z', blockchain: 'arbitrum',  whale_address: '0x6c8ec127ee0c1f4e4f50a2e2dd8f1b0c0b8b0c0b', recipient: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', contract_address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', symbol: 'USDC', amount_usd: 14_200_000  },
  { block_time: '2026-04-14T15:30:00Z', blockchain: 'base',      whale_address: '0xab5c7e260e6f1a3b9422e8b0b5c0d0e0f0a0b0c0', recipient: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', contract_address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC', amount_usd:  8_100_000  },
  { block_time: '2026-04-14T12:05:00Z', blockchain: 'polygon',   whale_address: '0x1234567890123456789012345678901234567890', recipient: '0x0987654321098765432109876543210987654321', contract_address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', symbol: 'USDT', amount_usd:  5_500_000  },
  { block_time: '2026-04-14T08:20:00Z', blockchain: 'solana',    whale_address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV', recipient: '9wH4PkFz7GgHrJKeLQKpbfRRJnv6UbVxGfB6mTn3XwhW', contract_address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', amount_usd:  4_800_000  },
  { block_time: '2026-04-13T21:45:00Z', blockchain: 'ethereum',  whale_address: '0xbeefcafe0102030405060708090a0b0c0d0e0f1011', recipient: '0xdecafbad0102030405060708090a0b0c0d0e0f1011', contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', amount_usd: 42_000_000  },
  { block_time: '2026-04-13T16:10:00Z', blockchain: 'optimism', whale_address: '0xa1b2c3d4e5f60102030405060708090a0b0c0d0e0f', recipient: '0xf0e0d0c0b0a0090807060504030201000f0e0d0c', contract_address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', symbol: 'USDT', amount_usd:  3_600_000  },
  { block_time: '2026-04-13T12:00:00Z', blockchain: 'arbitrum',  whale_address: '0x1111111111111111111111111111111111111111', recipient: '0x2222222222222222222222222222222222222222', contract_address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', symbol: 'USDT', amount_usd: 11_300_000  },
];

export async function getCrossChainWhaleTransfers(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:whale-transfers',
    Q.CROSS_CHAIN_WHALES,
    'Cross-Chain Whales',
    SEED_WHALES,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Protocol Daily Active Users — Top 15 DeFi Protocols (30‑Day)
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_PROTOCOL_DAU: DuneRow[] = [
  { day: '2026-04-14', project: 'Uniswap',    active_users: 84_200,  transaction_count: 285_000 },
  { day: '2026-04-14', project: 'PancakeSwap',active_users: 62_100,  transaction_count: 210_000 },
  { day: '2026-04-14', project: 'Raydium',    active_users: 48_500,  transaction_count: 195_000 },
  { day: '2026-04-14', project: 'Orca',       active_users: 38_200,  transaction_count: 162_000 },
  { day: '2026-04-14', project: '1inch',      active_users: 32_800,  transaction_count: 78_000  },
  { day: '2026-04-13', project: 'Uniswap',    active_users: 86_100,  transaction_count: 292_000 },
  { day: '2026-04-13', project: 'PancakeSwap',active_users: 64_300,  transaction_count: 218_000 },
  { day: '2026-04-13', project: 'Raydium',    active_users: 47_200,  transaction_count: 188_000 },
  { day: '2026-04-13', project: 'Orca',       active_users: 39_100,  transaction_count: 165_000 },
  { day: '2026-04-13', project: 'Aerodrome',  active_users: 27_500,  transaction_count: 92_000  },
  { day: '2026-04-12', project: 'Uniswap',    active_users: 82_400,  transaction_count: 278_000 },
  { day: '2026-04-12', project: 'PancakeSwap',active_users: 60_800,  transaction_count: 205_000 },
  { day: '2026-04-12', project: 'Raydium',    active_users: 45_900,  transaction_count: 182_000 },
  { day: '2026-04-12', project: 'Orca',       active_users: 36_500,  transaction_count: 158_000 },
  { day: '2026-04-12', project: 'Curve',      active_users: 22_100,  transaction_count: 48_000  },
];

export async function getProtocolDailyActiveUsers(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:protocol-dau',
    Q.PROTOCOL_DAU,
    'Protocol DAU',
    SEED_PROTOCOL_DAU,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Top Token Pairs — Top 20 by 24h DEX Volume
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_TOKEN_PAIRS: DuneRow[] = [
  { buy_token: 'WETH',  sell_token: 'USDC', volume_24h_usd: 1_250_000_000, swap_count: 42_000, avg_swap_size: 29762  },
  { buy_token: 'WBTC',  sell_token: 'USDC', volume_24h_usd: 890_000_000,   swap_count: 18_500, avg_swap_size: 48108  },
  { buy_token: 'SOL',   sell_token: 'USDC', volume_24h_usd: 620_000_000,   swap_count: 95_000, avg_swap_size: 6526   },
  { buy_token: 'USDC',  sell_token: 'USDT', volume_24h_usd: 480_000_000,   swap_count: 22_000, avg_swap_size: 21818  },
  { buy_token: 'WETH',  sell_token: 'USDT', volume_24h_usd: 410_000_000,   swap_count: 28_400, avg_swap_size: 14437  },
  { buy_token: 'WBNB',  sell_token: 'USDT', volume_24h_usd: 310_000_000,   swap_count: 68_000, avg_swap_size: 4559   },
  { buy_token: 'ARB',   sell_token: 'USDC', volume_24h_usd: 185_000_000,   swap_count: 32_000, avg_swap_size: 5781   },
  { buy_token: 'LINK',  sell_token: 'USDC', volume_24h_usd: 140_000_000,   swap_count: 15_200, avg_swap_size: 9211   },
  { buy_token: 'AVAX',  sell_token: 'USDC', volume_24h_usd: 105_000_000,   swap_count: 24_500, avg_swap_size: 4286   },
  { buy_token: 'PEPE',  sell_token: 'WETH', volume_24h_usd: 95_000_000,    swap_count: 38_000, avg_swap_size: 2500   },
];

export async function getTopTokenPairs(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:top-pairs',
    Q.TOP_TOKEN_PAIRS,
    'Top Token Pairs',
    SEED_TOKEN_PAIRS,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. L2 Active Addresses Comparison — 5 Chains, 30‑Day
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_L2_ADDRESSES: DuneRow[] = [
  { day: '2026-04-14', chain: 'arbitrum', tx_count: 2_850_000, active_addresses: 620_000 },
  { day: '2026-04-14', chain: 'optimism', tx_count: 1_420_000, active_addresses: 340_000 },
  { day: '2026-04-14', chain: 'base',     tx_count: 3_100_000, active_addresses: 780_000 },
  { day: '2026-04-14', chain: 'zksync',   tx_count: 980_000,   active_addresses: 210_000 },
  { day: '2026-04-14', chain: 'scroll',   tx_count: 340_000,   active_addresses: 85_000  },
  { day: '2026-04-13', chain: 'arbitrum', tx_count: 2_780_000, active_addresses: 605_000 },
  { day: '2026-04-13', chain: 'optimism', tx_count: 1_380_000, active_addresses: 332_000 },
  { day: '2026-04-13', chain: 'base',     tx_count: 3_050_000, active_addresses: 762_000 },
  { day: '2026-04-13', chain: 'zksync',   tx_count: 950_000,   active_addresses: 205_000 },
  { day: '2026-04-13', chain: 'scroll',   tx_count: 325_000,   active_addresses: 82_000  },
  { day: '2026-04-12', chain: 'arbitrum', tx_count: 2_720_000, active_addresses: 598_000 },
  { day: '2026-04-12', chain: 'optimism', tx_count: 1_350_000, active_addresses: 328_000 },
  { day: '2026-04-12', chain: 'base',     tx_count: 2_980_000, active_addresses: 748_000 },
  { day: '2026-04-12', chain: 'zksync',   tx_count: 920_000,   active_addresses: 198_000 },
  { day: '2026-04-12', chain: 'scroll',   tx_count: 310_000,   active_addresses: 78_000  },
];

export async function getL2ActiveAddressesComparison(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:l2-active-addresses',
    Q.L2_ACTIVE_ADDRESSES,
    'L2 Active Addresses',
    SEED_L2_ADDRESSES,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. CEX‑to‑DEX Volume Ratio — 90‑Day DEX aggregate
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_CEX_DEX_VOLUME: DuneRow[] = [
  { day: '2026-04-14', dex_volume_usd: 8_200_000_000,  dex_trades: 520_000 },
  { day: '2026-04-13', dex_volume_usd: 7_800_000_000,  dex_trades: 498_000 },
  { day: '2026-04-12', dex_volume_usd: 6_900_000_000,  dex_trades: 455_000 },
  { day: '2026-04-11', dex_volume_usd: 7_200_000_000,  dex_trades: 475_000 },
  { day: '2026-04-10', dex_volume_usd: 8_500_000_000,  dex_trades: 542_000 },
  { day: '2026-04-09', dex_volume_usd: 9_100_000_000,  dex_trades: 568_000 },
  { day: '2026-04-08', dex_volume_usd: 7_500_000_000,  dex_trades: 488_000 },
  { day: '2026-04-07', dex_volume_usd: 7_000_000_000,  dex_trades: 462_000 },
];

export async function getCEXvsDEXVolumeRatio(): Promise<DuneResultSet> {
  return duneOrSeed(
    'dune:cex-dex-volume',
    Q.CEX_VS_DEX_VOLUME,
    'CEX vs DEX Volume',
    SEED_CEX_DEX_VOLUME,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Token Unlocks — re‑exported from DefiLlama (already implemented)
// ═══════════════════════════════════════════════════════════════════════════════

import { getNextUnlocks as _getNextUnlocks } from '@/lib/defi-data';
import type { TokenUnlock } from '@/lib/defi-data';

export type { TokenUnlock };
export const getNextUnlocks = _getNextUnlocks;
