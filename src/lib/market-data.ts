/**
 * src/lib/market-data.ts
 * Phase 38: Global market data fetchers.
 * Sources: CoinGecko (free tier), alternative.me, Binance Futures.
 * All functions use the `cached` utility with appropriate TTLs.
 */
import { cached } from '@/lib/cache';

// ─── Global Market Data (CoinGecko) ─────────────────────────────────────────

export interface GlobalMarketData {
  active_cryptocurrencies: number;
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
}

export async function getGlobalMarketData(): Promise<GlobalMarketData | null> {
  return cached('coingecko:global', async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/global');
      if (!res.ok) return null;
      const json = await res.json() as { data: GlobalMarketData };
      return json.data ?? null;
    } catch {
      return null;
    }
  }, 300);
}

// ─── Fear & Greed Index (alternative.me) ────────────────────────────────────

export interface FearAndGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update: string;
}

export async function getFearAndGreedIndex(): Promise<FearAndGreedData | null> {
  return cached('alternative:fng', async () => {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      if (!res.ok) return null;
      const json = await res.json() as { data: FearAndGreedData[] };
      return json.data?.[0] ?? null;
    } catch {
      return null;
    }
  }, 3600);
}

// ─── Extended Coin Data (CoinGecko) ─────────────────────────────────────────

export interface ExtendedCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  price_change_percentage_30d_in_currency: number | null;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
}

export async function getTopCoinsExtended(limit = 50): Promise<ExtendedCoinData[]> {
  return cached(`coingecko:extended:${limit}`, async () => {
    try {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: String(limit),
        page: '1',
        sparkline: 'false',
        price_change_percentage: '1h,24h,7d,30d',
      });
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`
      );
      if (!res.ok) return [];
      const data = await res.json() as ExtendedCoinData[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, 300);
}

// ─── Exchange Volumes (CoinGecko) ────────────────────────────────────────────

export interface CoinGeckoExchange {
  id: string;
  name: string;
  trust_score: number | null;
  trust_score_rank: number | null;
  trade_volume_24h_btc: number;
  trade_volume_24h_btc_normalized: number;
  country: string | null;
  year_established: number | null;
  url: string;
  image: string;
}

export async function getTopExchangeVolumes(limit = 25): Promise<CoinGeckoExchange[]> {
  return cached(`coingecko:exchanges:${limit}`, async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/exchanges?per_page=${limit}&page=1`
      );
      if (!res.ok) return [];
      const data = await res.json() as CoinGeckoExchange[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, 3600);
}

// ─── Coin Categories / Sector Indices (CoinGecko) ────────────────────────────

export interface CoinGeckoCategory {
  id: string;
  name: string;
  market_cap: number | null;
  market_cap_change_24h: number | null;
  content: string | null;
  top_3_coins: string[];
  volume_24h: number | null;
  updated_at: string;
}

export async function getCoinCategories(limit = 40): Promise<CoinGeckoCategory[]> {
  return cached(`coingecko:categories:${limit}`, async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/categories?order=market_cap_desc'
      );
      if (!res.ok) return [];
      const data = await res.json() as CoinGeckoCategory[];
      return Array.isArray(data) ? data.slice(0, limit) : [];
    } catch {
      return [];
    }
  }, 3600);
}

// ─── Binance Open Interest History ─────────────────────────────────────────

export interface OIHistoryPoint {
  date: string;
  btc: number;
  eth: number;
}

interface BinanceOIRow {
  symbol: string;
  sumOpenInterest: string;
  sumOpenInterestValue: string;
  timestamp: number;
}

async function fetchBinanceOIHist(
  symbol: string,
  limit: number
): Promise<BinanceOIRow[]> {
  try {
    const res = await fetch(
      `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=1d&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json() as BinanceOIRow[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getOIHistory(days = 30): Promise<OIHistoryPoint[]> {
  return cached(`binance:oi:history:${days}`, async () => {
    const [btcRows, ethRows] = await Promise.all([
      fetchBinanceOIHist('BTCUSDT', days),
      fetchBinanceOIHist('ETHUSDT', days),
    ]);

    const btcMap = new Map<number, number>(
      btcRows.map((r) => [r.timestamp, Number(r.sumOpenInterestValue)])
    );
    const ethMap = new Map<number, number>(
      ethRows.map((r) => [r.timestamp, Number(r.sumOpenInterestValue)])
    );

    const timestamps = [
      ...new Set([...btcMap.keys(), ...ethMap.keys()]),
    ].sort((a, b) => a - b);

    return timestamps.map((ts) => ({
      date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      btc: btcMap.get(ts) ?? 0,
      eth: ethMap.get(ts) ?? 0,
    }));
  }, 3600);
}

// ─── Binance Funding Rate History ────────────────────────────────────────────

export interface FundingHistoryPoint {
  date: string;
  btc: number;
  eth: number;
}

interface BinanceFundingRow {
  symbol: string;
  fundingTime: number;
  fundingRate: string;
  markPrice: string;
}

async function fetchBinanceFundingHist(
  symbol: string,
  limit: number
): Promise<BinanceFundingRow[]> {
  try {
    const res = await fetch(
      `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json() as BinanceFundingRow[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getFundingRateHistory(days = 30): Promise<FundingHistoryPoint[]> {
  return cached(`binance:funding:hist:${days}`, async () => {
    const limit = days * 3; // 3 settlements per day (every 8h)
    const [btcRows, ethRows] = await Promise.all([
      fetchBinanceFundingHist('BTCUSDT', limit),
      fetchBinanceFundingHist('ETHUSDT', limit),
    ]);

    // Average per calendar day
    const avg = (rows: BinanceFundingRow[]): Map<string, number> => {
      const grouped = new Map<string, number[]>();
      rows.forEach((r) => {
        const d = new Date(r.fundingTime).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        });
        if (!grouped.has(d)) grouped.set(d, []);
        grouped.get(d)!.push(Number(r.fundingRate) * 100);
      });
      return new Map(
        [...grouped.entries()].map(([d, vals]) => [
          d,
          vals.reduce((a, b) => a + b, 0) / vals.length,
        ])
      );
    };

    const btcAvg = avg(btcRows);
    const ethAvg = avg(ethRows);
    const allDates = [...new Set([...btcAvg.keys(), ...ethAvg.keys()])].slice(-days);

    return allDates.map((date) => ({
      date,
      btc: Number((btcAvg.get(date) ?? 0).toFixed(5)),
      eth: Number((ethAvg.get(date) ?? 0).toFixed(5)),
    }));
  }, 1800);
}
