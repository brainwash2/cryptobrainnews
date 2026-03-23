/**
 * src/lib/api.ts
 *
 * This file is the public API surface for market prices, coin data, and legacy
 * DeFi fetchers. Three functions (getStablecoins, getProtocolFees, getTopYields)
 * are now thin compatibility shims over canonical implementations in defi-data.ts.
 *
 * Phase 45 · H1 — Duplicate fetcher consolidation
 *
 * BEFORE:
 *   api.ts and defi-data.ts both fetched stablecoins, protocol fees, and yields
 *   from the same DefiLlama endpoints, maintaining two separate caches and
 *   returning slightly different field shapes (circulating vs circulatingUsd,
 *   dailyFees vs total24h), causing pages using one file to get inconsistent
 *   data vs pages using the other.
 *
 * AFTER:
 *   getStablecoins()   → calls getStablecoinsOverview() + maps circulatingUsd → circulating
 *   getProtocolFees()  → calls defi-data.getProtocolFees() + maps total24h → dailyFees/total1d
 *   getTopYields()     → delegates to getTopYieldPools() (shapes already match)
 *   Single cache entry per data type. One API call. Zero divergence.
 *
 * NOTE: getDexVolume() is NOT a duplicate of getDexVolumes() in defi-data.ts.
 *   getDexVolume()  returns [{date, volume}] — a time-series for chart use.
 *   getDexVolumes() returns [{name, total24h}] — a protocol ranking snapshot.
 *   Different shapes, different consumers, both kept.
 */
import type { StablecoinData, ProtocolRevenueData } from "./types";
import { fetchWithTimeout } from "./fetch-with-timeout";
import { cached }           from "./cache";
import type { CoinMarketData, DeFiProtocol } from "./types";
import { FALLBACK_MARKET_DATA } from "./fallback-data";
import {
  getStablecoinsOverview,
  getProtocolFees    as _getProtocolFees,
  getTopYieldPools,
  type YieldPool     as DefiYieldPool,
} from "./defi-data";

const COINGECKO_BASE  = "https://api.coingecko.com/api/v3";
const DEFI_LLAMA_BASE = "https://api.llama.fi";

// ── Unique to api.ts — no defi-data.ts equivalent ────────────────────────────

export async function getLiveMarketPrices(
  currency = "usd",
  category = "all"
): Promise<CoinMarketData[]> {
  return cached(`market:prices:${currency}:${category}`, async () => {
    try {
      const categoryParam = category !== "all" ? `&category=${category}` : "";
      const res = await fetchWithTimeout(
        `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}${categoryParam}` +
          `&order=market_cap_desc&per_page=100&page=1&sparkline=true` +
          `&price_change_percentage=1h,24h,7d`,
        { cache: "no-store" }
      );
      if (!res.ok) return FALLBACK_MARKET_DATA;
      const data = await res.json();
      if (!Array.isArray(data)) return FALLBACK_MARKET_DATA;
      return data as CoinMarketData[];
    } catch {
      return FALLBACK_MARKET_DATA;
    }
  }, 300);
}

/** Alias for backward-compat — prefer getLiveMarketPrices() for new code. */
export const getLivePrices = getLiveMarketPrices;

export async function getCoinPrice(coinId: string): Promise<number> {
  try {
    const res = await fetchWithTimeout(
      `${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return 0;
    const data = await res.json() as Record<string, { usd?: number }>;
    return typeof data[coinId]?.usd === "number" ? data[coinId].usd : 0;
  } catch {
    return 0;
  }
}

export async function getDeFiProtocols(): Promise<DeFiProtocol[]> {
  return cached("defi:protocols", async () => {
    try {
      const res = await fetchWithTimeout(
        `${DEFI_LLAMA_BASE}/protocols`,
        { cache: "no-store" }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? (data as DeFiProtocol[]) : [];
    } catch {
      return [];
    }
  }, 600);
}

/**
 * getDexVolume — time-series of total DEX volume per day.
 * Returns [{date: "YYYY-MM-DD", volume: number}] — a CHART series.
 *
 * NOT a duplicate of getDexVolumes() in defi-data.ts, which returns a
 * protocol ranking snapshot [{name, total24h, total7d}] for tables.
 */
export interface DexVolumeDataPoint {
  date:   string;
  volume: number;
}

export async function getDexVolume(): Promise<DexVolumeDataPoint[]> {
  return cached("dex:volume:llama", async () => {
    try {
      const res = await fetchWithTimeout(
        `${DEFI_LLAMA_BASE}/overview/dexs?excludeTotalDataChart=false`,
        { cache: "no-store" }
      );
      if (!res.ok) return [];
      const json = await res.json() as {
        totalDataChart?: Array<[number, number]>;
      };
      const chart = json.totalDataChart ?? [];
      return chart.map(([ts, vol]) => ({
        date:   new Date(ts * 1000).toISOString().slice(0, 10),
        volume: vol,
      }));
    } catch {
      return [];
    }
  }, 600);
}

// ── Compatibility shims — delegate to defi-data.ts canonical implementations ──
//
// These preserve the existing api.ts call signatures so no pages need updating.
// Internally they share the same cache entries as defi-data.ts callers —
// one HTTP request, one cache key, zero divergence.

/**
 * @deprecated Prefer getStablecoinsOverview() from @/lib/defi-data for new code.
 * This shim maps circulatingUsd → circulating for backward-compat with pages
 * that read the StablecoinData.circulating field (e.g. defi/stablecoins, api/data/defi).
 */
export async function getStablecoins(): Promise<StablecoinData[]> {
  const rows = await getStablecoinsOverview();
  // Map defi-data shape → legacy api.ts StablecoinData shape
  return rows.map((s) => ({
    id:          s.id,
    name:        s.name,
    symbol:      s.symbol,
    pegType:     s.pegType,
    price:       s.price,
    circulating: s.circulatingUsd,   // field rename: circulatingUsd → circulating
  }));
}

/**
 * @deprecated Prefer getProtocolFees() from @/lib/defi-data for new code.
 * This shim maps total24h → dailyFees and total1d for backward-compat with
 * api/data/defi/route.ts which serialises ProtocolRevenueData to JSON.
 */
export async function getProtocolFees(): Promise<ProtocolRevenueData[]> {
  const rows = await _getProtocolFees(50);
  return rows.map((p) => ({
    name:         p.name,
    category:     p.category,
    dailyFees:    p.total24h   ?? 0,   // total24h → dailyFees
    dailyRevenue: 0,                    // not in defi-data — was never populated accurately
    total1d:      p.total24h   ?? 0,   // total24h → total1d (same value)
    total7d:      p.total7d    ?? 0,
  }));
}

/**
 * YieldPool re-export — same shape as defi-data.ts YieldPool.
 * Consumers importing { type YieldPool } from api.ts continue to work.
 */
export type { DefiYieldPool as YieldPool };

/**
 * @deprecated Prefer getTopYieldPools() from @/lib/defi-data for new code.
 * Delegates directly — shapes are identical.
 */
export async function getTopYields(): Promise<DefiYieldPool[]> {
  return getTopYieldPools(50);
}
