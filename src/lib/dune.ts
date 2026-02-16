// src/lib/dune.ts
// ─── Production Dune Analytics Client ────────────────────────────────────
import 'server-only';
import { QueryParameter, DuneClient } from '@duneanalytics/client-sdk';
import { cached } from './cache';

// ═══ Query ID Registry ═══
// MANUAL: Create each query in your Dune dashboard, then replace these IDs.
// The SQL for each query is in Phase 5 of the refactor plan.
export const QUERY_IDS = {
  // DeFi
  DAILY_DEX_VOLUME:        6698390, // Replace after creating in Dune
  TOP_DEX_BY_VOLUME:       6698400,
  WHALE_TRANSFERS:         6698403,
  LARGE_DEX_SWAPS:         6698406,
  STABLECOIN_SUPPLY:       6698408,
  PROTOCOL_REVENUE:        6698491,
  DEFI_TVL_CHANGES:        0,
  LENDING_RATES:           0,

  // On-Chain
  ETH_ACTIVE_ADDRESSES:    6698410,
  ETH_DAILY_TX:            6698411,
  ETH_GAS_METRICS:         6698412,
  BTC_ACTIVE_ADDRESSES:    0,
  SOL_DAILY_TX:            0,
  CEX_NET_FLOWS:           6698427,

  // L2 / Scaling
  L2_METRICS:              6698451,
  L2_COMPARISON:           0,

  // NFTs
  NFT_SALES_VOLUME:        6698468,
  NFT_TOP_COLLECTIONS:     0,

  // Markets
  FUTURES_OPEN_INTEREST:   0,
  EXCHANGE_VOLUMES:        0,

  // ETFs (off-chain — we use a hybrid approach)
  ETF_DAILY_FLOWS:         0,
} as const;

// ═══ Singleton Client ═══
let client: DuneClient | null = null;

function getClient(): DuneClient {
  if (!client) {
    const key = process.env.DUNE_API_KEY;
    if (!key) throw new Error('DUNE_API_KEY environment variable is not set');
    client = new DuneClient(key);
  }
  return client;
}

// ═══ Core Query Executor ═══
export async function queryDune<T = Record<string, unknown>>(
  queryId: number,
  params?: Record<string, string | number>,
  ttlSeconds = 300
): Promise<T[]> {
  if (queryId === 0) {
    console.warn(`[Dune] Query ID is 0 (placeholder). Create the query in Dune and update QUERY_IDS.`);
    return [];
  }

  const cacheKey = `dune:${queryId}:${JSON.stringify(params ?? {})}`;

  return cached(
    cacheKey,
    async () => {
      const dune = getClient();

      const formattedParams = params
        ? Object.entries(params).map(([name, value]) =>
            typeof value === 'number'
              ? QueryParameter.number(name, value)
              : QueryParameter.text(name, String(value))
          )
        : undefined;

      const response = await dune.runQuery({
        queryId,
        query_parameters: formattedParams,
      });

      const rows = response?.result?.rows;
      if (!rows || !Array.isArray(rows)) {
        console.warn(`[Dune] Query ${queryId} returned no rows.`);
        return [];
      }

      return rows as T[];
    },
    ttlSeconds
  );
}

// ═══ Typed Fetch Functions ═══

import type {
  WhaleTransfer,
  DexSwap,
  DailyDexVolume,
  DailyActiveAddresses,
  DailyTransactions,
  GasMetrics,
  StablecoinSupply,
  NftSalesVolume,
  ProtocolRevenue,
  CEXNetFlow,
  L2Metrics,
} from './types';

export function getWhaleTransfers() {
  return queryDune<WhaleTransfer>(QUERY_IDS.WHALE_TRANSFERS, {}, 120);
}

export function getLargeDexSwaps() {
  return queryDune<DexSwap>(QUERY_IDS.LARGE_DEX_SWAPS, {}, 120);
}

export function getDailyDexVolume(days = 30) {
  return queryDune<DailyDexVolume>(QUERY_IDS.DAILY_DEX_VOLUME, { days }, 600);
}

export function getEthActiveAddresses(days = 30) {
  return queryDune<DailyActiveAddresses>(QUERY_IDS.ETH_ACTIVE_ADDRESSES, { days }, 600);
}

export function getEthDailyTransactions(days = 30) {
  return queryDune<DailyTransactions>(QUERY_IDS.ETH_DAILY_TX, { days }, 600);
}

export function getEthGasMetrics(days = 30) {
  return queryDune<GasMetrics>(QUERY_IDS.ETH_GAS_METRICS, { days }, 600);
}

export function getStablecoinSupply() {
  return queryDune<StablecoinSupply>(QUERY_IDS.STABLECOIN_SUPPLY, {}, 900);
}

export function getNftSalesVolume(days = 30) {
  return queryDune<NftSalesVolume>(QUERY_IDS.NFT_SALES_VOLUME, { days }, 600);
}

export function getProtocolRevenue() {
  return queryDune<ProtocolRevenue>(QUERY_IDS.PROTOCOL_REVENUE, {}, 900);
}

export function getCexNetFlows(days = 7) {
  return queryDune<CEXNetFlow>(QUERY_IDS.CEX_NET_FLOWS, { days }, 300);
}

export function getL2Metrics(days = 30) {
  return queryDune<L2Metrics>(QUERY_IDS.L2_METRICS, { days }, 600);
}
