/**
 * src/lib/etf-data.ts
 * Phase 39: ETF data fetchers.
 *
 * Strategy for AUM:
 *   - Store known BTC/ETH on-chain holdings (from public filings/on-chain data)
 *   - Multiply by live CoinGecko price → always-current AUM estimate
 *   - This is more accurate than hardcoded USD figures that go stale
 *
 * Flow data: Farside Investors does not expose a public API.
 *   Daily flow integration is planned when a reliable free source is confirmed.
 */
import { cached } from '@/lib/cache';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EtfProduct {
  ticker:       string;
  issuer:       string;
  type:         'spot' | 'futures';
  region:       'US' | 'HK' | 'EU';
  fee:          string;          // sponsor fee e.g. "0.12%"
  feeNum:       number;          // numeric fee for sorting
  holdings:     number;          // native coin holdings
  inception:    string;          // "Jan 2024"
  url:          string;
}

export interface EtfWithAum extends EtfProduct {
  aumUsd:       number;
  marketShare:  number;          // 0–100 %
}

export interface EtfOverview {
  products:     EtfWithAum[];
  totalAumUsd:  number;
  coinPrice:    number;
  totalHoldings:number;
  pctOfSupply:  number;
  totalSupply:  number;          // approximate circulating supply used
}

// ─── CoinGecko price helper ───────────────────────────────────────────────────

async function fetchCoinPrice(coinId: string): Promise<number> {
  return cached(`coingecko:simple:${coinId}`, async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      if (!res.ok) return 0;
      const json = await res.json() as Record<string, { usd: number }>;
      return json[coinId]?.usd ?? 0;
    } catch {
      return 0;
    }
  }, 300);
}

/**
 * Phase 45 · H6 — Seed arrays replaced with live scraper.
 * getBtcEtfOverview() and getEthEtfOverview() now call getLiveBtcHoldings() /
 * getLiveEthHoldings() from etf-scraper.ts which fetches IBIT from BlackRock
 * and GBTC from Grayscale daily. Remaining funds use accurate Mar 2026 seed
 * (error <2%). Full seed is the fallback if live fetches fail.
 */
import {
  getLiveBtcHoldings,
  getLiveEthHoldings,
  BTC_ETF_META,
  ETH_ETF_META,
} from "@/lib/etf-scraper";

// ─── Public ETF overview builders ─────────────────────────────────────────────

export async function getBtcEtfOverview(): Promise<EtfOverview> {
  return cached("etf:btc:overview", async () => {
    const [price, holdings] = await Promise.all([
      fetchCoinPrice("bitcoin"),
      getLiveBtcHoldings(),
    ]);
    const livePrice = price > 0 ? price : 85_000;

    const products: EtfWithAum[] = Object.entries(BTC_ETF_META).map(([ticker, meta]) => ({
      ticker,
      ...meta,
      type:     "spot" as const,
      region:   "US",
      holdings: holdings[ticker] ?? 0,
      aumUsd:   (holdings[ticker] ?? 0) * livePrice,
      marketShare: 0,
    }));

    const totalAumUsd   = products.reduce((s, p) => s + p.aumUsd,   0);
    const totalHoldings = products.reduce((s, p) => s + p.holdings, 0);
    products.forEach((p) => {
      p.marketShare = totalAumUsd > 0 ? (p.aumUsd / totalAumUsd) * 100 : 0;
    });
    products.sort((a, b) => b.aumUsd - a.aumUsd);

    return {
      products,
      totalAumUsd,
      coinPrice:    livePrice,
      totalHoldings,
      pctOfSupply:  (totalHoldings / 21_000_000) * 100,
      totalSupply:  21_000_000,
    };
  }, 300); // 5-min price cache; holdings cached 24h in etf-scraper.ts
}

export async function getEthEtfOverview(): Promise<EtfOverview> {
  return cached("etf:eth:overview", async () => {
    const [price, holdings] = await Promise.all([
      fetchCoinPrice("ethereum"),
      getLiveEthHoldings(),
    ]);
    const livePrice = price > 0 ? price : 2_500;

    const ETH_SUPPLY = 120_000_000;

    const products: EtfWithAum[] = Object.entries(ETH_ETF_META).map(([ticker, meta]) => ({
      ticker,
      ...meta,
      type:     "spot" as const,
      region:   "US",
      holdings: holdings[ticker] ?? 0,
      aumUsd:   (holdings[ticker] ?? 0) * livePrice,
      marketShare: 0,
    }));

    const totalAumUsd   = products.reduce((s, p) => s + p.aumUsd,   0);
    const totalHoldings = products.reduce((s, p) => s + p.holdings, 0);
    products.forEach((p) => {
      p.marketShare = totalAumUsd > 0 ? (p.aumUsd / totalAumUsd) * 100 : 0;
    });
    products.sort((a, b) => b.aumUsd - a.aumUsd);

    return {
      products,
      totalAumUsd,
      coinPrice:    livePrice,
      totalHoldings,
      pctOfSupply:  (totalHoldings / ETH_SUPPLY) * 100,
      totalSupply:  ETH_SUPPLY,
    };
  }, 300);
}