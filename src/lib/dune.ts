import { cached } from './cache';
import 'server-only';

// ═══ Dune Query IDs ═══
export const QUERY_IDS = {
  BTC_ACTIVE_ADDRESSES:    6705328,
  BTC_DAILY_TRANSACTIONS:  6705623,
  ETH_ACTIVE_ADDRESSES:    6705462,
  ETH_DAILY_TRANSACTIONS:  6705475,
  SOL_DAILY_TRANSACTIONS:  6704569,
  SOL_DAILY_FEES:          6705036,
  WHALE_TRANSFERS:         6705679,
  STABLECOIN_SUPPLY:       6705686,
  STABLECOIN_HOLDERS:      6705803,
  DEX_DAILY_VOLUMES:       6705479,
  DEX_TOP_PROTOCOLS:       6705632,
  DEX_BY_BLOCKCHAIN:       6705655,
  L2_ACTIVE_ADDRESSES:     6705808,
  L2_GAS_FEES:             6704769,
  NFT_TOP_COLLECTIONS:     6705026,
  NFT_DAILY_VOLUMES:       6705030,
  NFT_BY_BLOCKCHAIN:       6705034,
  DEX_LIQUIDITY_POOLS:     6705658,
  DEFI_PROTOCOL_USERS:     6705851,
  UNISWAP_GOVERNANCE:      6705858,
  DAO_ACTIVITY:            6705938,
  CEX_DEX_VOLUME:          6705817,
  TOP_TOKEN_PAIRS:         6705951,
} as const;

export interface DuneRow {
  [key: string]: string | number | null;
}

export interface DuneResponse {
  execution_id: string;
  state: 'QUERY_STATE_EXECUTING' | 'QUERY_STATE_COMPLETED' | 'QUERY_STATE_FAILED';
  result?: { rows: DuneRow[] };
  error?: string;
}

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const DUNE_BASE_URL = 'https://api.dune.com/api/v1';

// Cache TTL constants (seconds)
const TTL_30_MIN  = 1800;
const TTL_1_HOUR  = 3600;
const TTL_6_HOURS = 21600;

// ─── Core fetch + poll (internal — never call directly from pages) ──────────
async function fetchDuneQuery(
  queryId: number,
  parameters: Record<string, string | number> = {}
): Promise<DuneRow[]> {
  if (!DUNE_API_KEY) {
    console.error('[Dune] API key not configured — set DUNE_API_KEY env var');
    return [];
  }

  try {
    // 1. Trigger execution
    const execRes = await fetch(`${DUNE_BASE_URL}/query/${queryId}/execute`, {
      method: 'POST',
      headers: {
        'X-DUNE-API-KEY': DUNE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query_parameters: parameters }),
    });

    if (!execRes.ok) {
      throw new Error(`[Dune] Execute failed: ${execRes.statusText}`);
    }

    const execData = (await execRes.json()) as { execution_id?: string };
    const executionId = execData.execution_id;
    if (!executionId) throw new Error('[Dune] No execution_id returned');

    // 2. Poll for results (max 30 seconds, 500ms interval)
    for (let attempts = 0; attempts < 60; attempts++) {
      const statusRes = await fetch(
        `${DUNE_BASE_URL}/execution/${executionId}/results`,
        { headers: { 'X-DUNE-API-KEY': DUNE_API_KEY } }
      );

      if (!statusRes.ok) {
        throw new Error(`[Dune] Status check failed: ${statusRes.statusText}`);
      }

      const data = (await statusRes.json()) as DuneResponse;

      if (data.state === 'QUERY_STATE_COMPLETED') return data.result?.rows ?? [];
      if (data.state === 'QUERY_STATE_FAILED')    throw new Error(`[Dune] Query failed: ${data.error}`);

      await new Promise((r) => setTimeout(r, 500));
    }

    throw new Error('[Dune] Query timeout after 30 seconds');
  } catch (err) {
    console.error('[Dune] Error:', err);
    return [];
  }
}

// ─── Public exports — all wrapped with cached() ──────────────────────────────
// Rule: fast-moving data (prices, volumes) = 30 min TTL
//       slow-moving data (governance, holders) = 1–6 hour TTL

export async function getBTCActiveAddresses(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:btc-active-addresses:${days}`,
    () => fetchDuneQuery(QUERY_IDS.BTC_ACTIVE_ADDRESSES, { days }),
    TTL_30_MIN
  );
}

export async function getBTCDailyTransactions(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:btc-daily-txns:${days}`,
    () => fetchDuneQuery(QUERY_IDS.BTC_DAILY_TRANSACTIONS, { days }),
    TTL_30_MIN
  );
}

export async function getETHActiveAddresses(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:eth-active-addresses:${days}`,
    () => fetchDuneQuery(QUERY_IDS.ETH_ACTIVE_ADDRESSES, { days }),
    TTL_30_MIN
  );
}

export async function getETHDailyTransactions(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:eth-daily-txns:${days}`,
    () => fetchDuneQuery(QUERY_IDS.ETH_DAILY_TRANSACTIONS, { days }),
    TTL_30_MIN
  );
}

export async function getSOLDailyTransactions(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:sol-daily-txns:${days}`,
    () => fetchDuneQuery(QUERY_IDS.SOL_DAILY_TRANSACTIONS, { days }),
    TTL_30_MIN
  );
}

export async function getSOLDailyFees(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:sol-daily-fees:${days}`,
    () => fetchDuneQuery(QUERY_IDS.SOL_DAILY_FEES, { days }),
    TTL_30_MIN
  );
}

export async function getWhaleTransfers(days = 30): Promise<DuneRow[]> {
  return cached(
    `dune:whale-transfers:${days}`,
    () => fetchDuneQuery(QUERY_IDS.WHALE_TRANSFERS, { days }),
    TTL_30_MIN
  );
}

export async function getStablecoinSupply(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:stablecoin-supply:${days}`,
    () => fetchDuneQuery(QUERY_IDS.STABLECOIN_SUPPLY, { days }),
    TTL_1_HOUR
  );
}

export async function getStablecoinHolders(): Promise<DuneRow[]> {
  return cached(
    'dune:stablecoin-holders',
    () => fetchDuneQuery(QUERY_IDS.STABLECOIN_HOLDERS),
    TTL_6_HOURS
  );
}

export async function getDEXDailyVolumes(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:dex-daily-volumes:${days}`,
    () => fetchDuneQuery(QUERY_IDS.DEX_DAILY_VOLUMES, { days }),
    TTL_30_MIN
  );
}

export async function getDEXTopProtocols(): Promise<DuneRow[]> {
  return cached(
    'dune:dex-top-protocols',
    () => fetchDuneQuery(QUERY_IDS.DEX_TOP_PROTOCOLS),
    TTL_1_HOUR
  );
}

export async function getDEXByBlockchain(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:dex-by-blockchain:${days}`,
    () => fetchDuneQuery(QUERY_IDS.DEX_BY_BLOCKCHAIN, { days }),
    TTL_30_MIN
  );
}

export async function getL2ActiveAddresses(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:l2-active-addresses:${days}`,
    () => fetchDuneQuery(QUERY_IDS.L2_ACTIVE_ADDRESSES, { days }),
    TTL_30_MIN
  );
}

export async function getL2GasFees(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:l2-gas-fees:${days}`,
    () => fetchDuneQuery(QUERY_IDS.L2_GAS_FEES, { days }),
    TTL_30_MIN
  );
}

export async function getNFTTopCollections(): Promise<DuneRow[]> {
  return cached(
    'dune:nft-top-collections',
    () => fetchDuneQuery(QUERY_IDS.NFT_TOP_COLLECTIONS),
    TTL_1_HOUR
  );
}

export async function getNFTDailyVolumes(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:nft-daily-volumes:${days}`,
    () => fetchDuneQuery(QUERY_IDS.NFT_DAILY_VOLUMES, { days }),
    TTL_30_MIN
  );
}

export async function getNFTByBlockchain(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:nft-by-blockchain:${days}`,
    () => fetchDuneQuery(QUERY_IDS.NFT_BY_BLOCKCHAIN, { days }),
    TTL_30_MIN
  );
}

export async function getDEXLiquidityPools(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:dex-liquidity-pools:${days}`,
    () => fetchDuneQuery(QUERY_IDS.DEX_LIQUIDITY_POOLS, { days }),
    TTL_1_HOUR
  );
}

export async function getDeFiProtocolUsers(): Promise<DuneRow[]> {
  return cached(
    'dune:defi-protocol-users',
    () => fetchDuneQuery(QUERY_IDS.DEFI_PROTOCOL_USERS),
    TTL_1_HOUR
  );
}

export async function getUniswapGovernance(): Promise<DuneRow[]> {
  return cached(
    'dune:uniswap-governance',
    () => fetchDuneQuery(QUERY_IDS.UNISWAP_GOVERNANCE),
    TTL_6_HOURS
  );
}

export async function getDAOActivity(): Promise<DuneRow[]> {
  return cached(
    'dune:dao-activity',
    () => fetchDuneQuery(QUERY_IDS.DAO_ACTIVITY),
    TTL_6_HOURS
  );
}

export async function getCEXDEXVolume(days = 90): Promise<DuneRow[]> {
  return cached(
    `dune:cex-dex-volume:${days}`,
    () => fetchDuneQuery(QUERY_IDS.CEX_DEX_VOLUME, { days }),
    TTL_30_MIN
  );
}

export async function getTopTokenPairs(): Promise<DuneRow[]> {
  return cached(
    'dune:top-token-pairs',
    () => fetchDuneQuery(QUERY_IDS.TOP_TOKEN_PAIRS),
    TTL_1_HOUR
  );
}
