import "server-only";
import { cached }           from "./cache";
import { fetchWithTimeout } from "./fetch-with-timeout";
import type { DerivativeMarketData, FundingRateData } from "./types";

/**
 * src/lib/derivatives.ts
 * Phase 45 — Binance → Bybit migration.
 *
 * ROOT CAUSE: Binance blocks Vercel's AWS us-east-1 IP range (documented issue).
 * fapi.binance.com returns 403/timeout from all Vercel serverless regions.
 *
 * REPLACEMENTS:
 *   Funding rates:    Binance fapi/v1/premiumIndex  → Bybit /v5/market/tickers (linear)
 *   Exchange volumes: DefiLlama /overview/derivatives → CoinGecko /derivatives/exchanges
 *
 * Both Bybit and CoinGecko are accessible from Vercel with no IP restrictions.
 * No API keys required for either endpoint.
 */

// ─── Exchange rankings ─────────────────────────────────────────────────────────
// CoinGecko /derivatives/exchanges returns 24h volume and OI per exchange.
// Free tier, no key, no IP restrictions, 1-hour cache.

interface CgDerivativeExchange {
  id:                    string;
  name:                  string;
  trade_volume_24h_btc?: number;
  open_interest_btc?:    number;
  number_of_perpetual_pairs?: number;
}

export async function getDerivativesExchanges(): Promise<DerivativeMarketData[]> {
  return cached("derivatives:exchanges:v2", async () => {
    try {
      const res = await fetchWithTimeout(
        "https://api.coingecko.com/api/v3/derivatives/exchanges?order=open_interest_btc_desc&per_page=20&page=1",
        { cache: "no-store" }
      );
      if (!res.ok) return [];
      const data = await res.json() as CgDerivativeExchange[];
      if (!Array.isArray(data)) return [];

      return data
        .filter((e) => (e.open_interest_btc ?? 0) > 0)
        .map((e) => ({
          exchange:     e.name,
          volume24h:    e.trade_volume_24h_btc ?? 0,   // BTC-denominated volume
          openInterest: e.open_interest_btc    ?? 0,   // BTC-denominated OI
        }))
        .sort((a, b) => b.openInterest - a.openInterest);
    } catch {
      return [];
    }
  }, 3600);
}

// ─── Live funding rates ────────────────────────────────────────────────────────
// Bybit v5 /market/tickers?category=linear returns all perpetual pairs.
// Public endpoint, no key, no IP restrictions from Vercel.
// fundingRate field is the current rate (refreshed every 8h settlement).

interface BybitTicker {
  symbol:      string;
  markPrice:   string;
  fundingRate: string;
  nextFundingTime?: string;
}

interface BybitTickersResponse {
  retCode: number;
  result: { list?: BybitTicker[] };
}

export async function getFundingRates(): Promise<FundingRateData[]> {
  return cached("derivatives:funding-rates:v2", async () => {
    try {
      const res = await fetchWithTimeout(
        "https://api.bybit.com/v5/market/tickers?category=linear",
        { cache: "no-store" }
      );
      if (!res.ok) return [];
      const data = await res.json() as BybitTickersResponse;
      const list = data.result?.list;
      if (!Array.isArray(list)) return [];

      return list
        .filter((t) => t.symbol.endsWith("USDT") && t.fundingRate)
        .map((t) => ({
          symbol:      t.symbol,
          fundingRate: parseFloat(t.fundingRate) * 100,   // convert to %
          markPrice:   parseFloat(t.markPrice),
        }))
        .sort((a, b) => b.fundingRate - a.fundingRate);
    } catch {
      return [];
    }
  }, 300);  // 5-min cache — funding rates settle every 8h
}
