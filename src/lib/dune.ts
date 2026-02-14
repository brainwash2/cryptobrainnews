import { DuneClient } from '@duneanalytics/client-sdk';
import { cached } from './cache';

export const QUERY_IDS = {
  WHALE_TRANSFERS: 6695545, 
  LARGE_DEX_SWAPS: 6695545, 
  CEX_NET_FLOWS: 6695545,   
} as const;

let client: DuneClient | null = null;

function getClient(): DuneClient {
  if (!client) {
    const key = process.env.DUNE_API_KEY;
    if (!key) throw new Error('DUNE_API_KEY not set');
    client = new DuneClient(key);
  }
  return client;
}

export async function queryDune<T = Record<string, unknown>>(
  queryId: number,
  params?: Record<string, string | number | boolean>,
  ttlSeconds = 120
): Promise<T[]> {
  const cacheKey = `dune:${queryId}:${JSON.stringify(params || {})}`;

  return cached(cacheKey, async () => {
    try {
      const dune = getClient();

      // Transform into SDK format. 
      // We use 'as any' to bypass the SDK's internal ParameterType mismatch.
      const formattedParams = params 
        ? Object.entries(params).map(([key, value]) => ({
            name: key,
            value: String(value),
            type: typeof value === 'number' ? 'number' : 'text'
          }))
        : undefined;

      const result = await dune.runQuery({
        queryId,
        query_parameters: formattedParams as any,
      });

      return (result?.result?.rows || []) as T[];
    } catch (error) {
      console.error(`[Dune] Query ${queryId} failed:`, error);
      return [];
    }
  }, ttlSeconds);
}

export interface WhaleTransfer {
  block_time: string;
  sender: string;
  receiver: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
  tx_hash: string;
  chain: string;
}

export interface DexSwap {
  block_time: string;
  project: string;
  token_a_symbol: string;
  token_b_symbol: string;
  token_a_amount: number;
  token_b_amount: number;
  usd_amount: number;
  tx_hash: string;
}

export async function getWhaleTransfers(): Promise<WhaleTransfer[]> {
  return queryDune<WhaleTransfer>(QUERY_IDS.WHALE_TRANSFERS, {}, 120);
}

export async function getLargeDexSwaps(): Promise<DexSwap[]> {
  return queryDune<DexSwap>(QUERY_IDS.LARGE_DEX_SWAPS, {}, 120);
}
