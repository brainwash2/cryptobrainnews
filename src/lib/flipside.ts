// src/lib/flipside.ts — updated with gating note
// Flipside Crypto — gated behind organization invitation as of April 2026.
// The free-tier self-signup page redirects to "Access Required".
// This module is retained as reference; set FLIPSIDE_ORG_TOKEN if you
// obtain organization access in the future.
import 'server-only';
import { cached } from '@/lib/cache';

const FLIPSIDE_API = 'https://api-v2.flipsidecrypto.xyz/json-rpc';
const API_KEY = process.env.FLIPSIDE_API_KEY;
const ORG_TOKEN = process.env.FLIPSIDE_ORG_TOKEN;

// True when both API key AND org token are present.
// Without org access, all functions return empty [] immediately.
const FLIPSIDE_AVAILABLE = !!(API_KEY && ORG_TOKEN);

interface FlipsideRow {
  [column: string]: string | number | boolean | null;
}

interface FlipsideResult {
  rows: FlipsideRow[];
  columns: string[];
  totalRows: number;
}

interface FlipsideResponse {
  result?: FlipsideResult;
  error?: { message: string };
}

export async function getFlipsideData(
  sql: string,
  ttlSeconds = 86400
): Promise<FlipsideRow[]> {
  if (!FLIPSIDE_AVAILABLE) {
    console.warn('[Flipside] Not available — FLIPSIDE_API_KEY + FLIPSIDE_ORG_TOKEN required');
    return [];
  }
  const cacheKey = `flipside:${Buffer.from(sql).toString('base64').slice(0, 80)}`;
  return cached(cacheKey, async () => {
    try {
      const res = await fetch(FLIPSIDE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY!,
          'Authorization': `Bearer ${ORG_TOKEN}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'createQueryRun',
          params: [{ sql, resultTTLHours: Math.ceil(ttlSeconds / 3600) }],
          id: 1,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) return [];
      const json = await res.json() as FlipsideResponse;
      return json.result?.rows ?? [];
    } catch (err) {
      console.warn('[Flipside] Query failed:', String(err));
      return [];
    }
  }, ttlSeconds);
}

// Pre‑defined query: DeSo (Social DeFi) — retained for when Flipside is available
export async function getDeSoMetrics(): Promise<FlipsideRow[]> {
  if (!FLIPSIDE_AVAILABLE) return [];
  return getFlipsideData(`
    SELECT
      DATE_TRUNC('day', block_timestamp) AS day,
      COUNT(DISTINCT tx_hash)            AS transactions,
      COUNT(DISTINCT from_address)       AS active_users,
      SUM(tx_fee)                        AS fees_eth
    FROM ethereum.core.fact_transactions
    WHERE block_timestamp >= DATEADD(day, -30, CURRENT_DATE())
      AND to_address IN (
        '0x00000000fc6c5f01fc30151999387bb99a9f489b',
        '0xfe3b138879d6d0555be4132dcfe6e7424e257a2e'
      )
    GROUP BY 1
    ORDER BY 1 DESC
  `, 86400);
}

// Pre‑defined query: Cross‑chain active addresses — retained for when Flipside is available
export async function getChainActiveAddresses(): Promise<FlipsideRow[]> {
  if (!FLIPSIDE_AVAILABLE) return [];
  return getFlipsideData(`
    SELECT chain, DATE_TRUNC('day', block_timestamp) AS day,
           COUNT(DISTINCT from_address) AS active_addresses
    FROM (
      SELECT 'ethereum' AS chain, block_timestamp, from_address
      FROM ethereum.core.fact_transactions
      WHERE block_timestamp >= DATEADD(day, -30, CURRENT_DATE())
      UNION ALL
      SELECT 'polygon' AS chain, block_timestamp, from_address
      FROM polygon.core.fact_transactions
      WHERE block_timestamp >= DATEADD(day, -30, CURRENT_DATE())
      UNION ALL
      SELECT 'arbitrum' AS chain, block_timestamp, from_address
      FROM arbitrum.core.fact_transactions
      WHERE block_timestamp >= DATEADD(day, -30, CURRENT_DATE())
    ) combined
    GROUP BY 1, 2
    ORDER BY 1, 2 DESC
  `, 86400);
}
