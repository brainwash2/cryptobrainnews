import { fetchWithTimeout } from './fetch-with-timeout';
import { cached } from './cache';
import type { CoinMarketData, DeFiProtocol } from './types';
import { FALLBACK_MARKET_DATA } from './fallback-data';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFI_LLAMA_BASE = 'https://api.llama.fi';

export async function getLiveMarketPrices(currency = 'usd'): Promise<CoinMarketData[]> {
  return cached(`market:prices:${currency}`, async () => {
    try {
      const res = await fetchWithTimeout(
        `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`, 
        { cache: 'no-store' }
      );
      if (!res.ok) return FALLBACK_MARKET_DATA;
      const data = await res.json();
      // CRITICAL FIX: Ensure it is an array so .map() doesn't crash the server
      if (!Array.isArray(data)) return FALLBACK_MARKET_DATA;
      return data;
    } catch {
      return FALLBACK_MARKET_DATA;
    }
  }, 300);
}

export const getLivePrices = getLiveMarketPrices;

export async function getCoinPrice(coinId: string): Promise<number> {
  try {
    const res = await fetchWithTimeout(
      `${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data[coinId]?.usd === 'number' ? data[coinId].usd : 0;
  } catch {
    return 0;
  }
}

export async function getDeFiProtocols(): Promise<DeFiProtocol[]> {
  return cached('defi:protocols', async () => {
    try {
      const res = await fetchWithTimeout(`${DEFI_LLAMA_BASE}/protocols`, { cache: 'no-store' });
      if (!res.ok) return[];
      const data = await res.json();
      return Array.isArray(data) ? data :[];
    } catch {
      return[];
    }
  }, 600);
}

export interface DexVolumeDataPoint { date: string; volume: number; }

export async function getDexVolume(): Promise<DexVolumeDataPoint[]> {
  return cached('dex:volume:llama', async () => {
    try {
      const res = await fetchWithTimeout(`${DEFI_LLAMA_BASE}/overview/dexs?excludeTotalDataChart=false`, { cache: 'no-store' });
      if (!res.ok) return[];
      const json = await res.json();
      const chart: Array<[number, number]> = json.totalDataChart ?? [];
      return chart.map(([ts, vol]) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        volume: vol,
      }));
    } catch {
      return[];
    }
  }, 600);
}

export interface YieldPool {
  project: string; chain: string; symbol: string; tvlUsd: number; apy: number; apyPct1D: number; pool: string;
}

export async function getTopYields(): Promise<YieldPool[]> {
  return cached('defi:yields', async () => {
    try {
      const res = await fetchWithTimeout('https://yields.llama.fi/pools', { cache: 'no-store' });
      if (!res.ok) return[];
      const json = await res.json();
      if (!json.data || !Array.isArray(json.data)) return[];
      return json.data
        .filter((p: any) => p.tvlUsd > 1_000_000 && p.apy > 0 && p.apy < 1000)
        .sort((a: any, b: any) => b.tvlUsd - a.tvlUsd)
        .slice(0, 50)
        .map((p: any): YieldPool => ({
          project: p.project ?? 'Unknown', chain: p.chain ?? 'Unknown', symbol: p.symbol ?? '—',
          tvlUsd: p.tvlUsd ?? 0, apy: p.apy ?? 0, apyPct1D: p.apyPct1D ?? 0, pool: p.pool ?? '',
        }));
    } catch {
      return[];
    }
  }, 600);
}
