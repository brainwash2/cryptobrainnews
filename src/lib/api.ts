import { fetchWithTimeout } from './fetch-with-timeout';
import { cached } from './cache';
import type { CoinMarketData, DeFiProtocol } from './types';
import { FALLBACK_MARKET_DATA } from './fallback-data';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFI_LLAMA_BASE = 'https://api.llama.fi';

export async function getLiveMarketPrices(currency = 'usd', category = 'all'): Promise<CoinMarketData[]> {
  return cached(`market:prices:${currency}:${category}`, async () => {
    try {
      const categoryParam = category !== 'all' ? `&category=${category}` : '';
      const res = await fetchWithTimeout(
        `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}${categoryParam}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`, 
        { cache: 'no-store' }
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

export const getLivePrices = getLiveMarketPrices;

export async function getCoinPrice(coinId: string): Promise<number> {
  try {
    const res = await fetchWithTimeout(`${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`, { next: { revalidate: 60 } });
    if (!res.ok) return 0;
    const data = await res.json() as Record<string, { usd?: number }>;
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
      return Array.isArray(data) ? data as DeFiProtocol[] : [];
    } catch { return[]; }
  }, 600);
}

export interface DexVolumeDataPoint { date: string; volume: number; }

export async function getDexVolume(): Promise<DexVolumeDataPoint[]> {
  return cached('dex:volume:llama', async () => {
    try {
      const res = await fetchWithTimeout(`${DEFI_LLAMA_BASE}/overview/dexs?excludeTotalDataChart=false`, { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json() as { totalDataChart?: Array<[number, number]> };
      const chart: Array<[number, number]> = json.totalDataChart ??[];
      return chart.map(([ts, vol]) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), volume: vol }));
    } catch { return[]; }
  }, 600);
}

export interface YieldPool { project: string; chain: string; symbol: string; tvlUsd: number; apy: number; apyPct1D: number; pool: string; }
interface DefiLlamaPool { project?: string; chain?: string; symbol?: string; tvlUsd?: number; apy?: number; apyPct1D?: number; pool?: string; }

export async function getTopYields(): Promise<YieldPool[]> {
  return cached('defi:yields', async () => {
    try {
      const res = await fetchWithTimeout('https://yields.llama.fi/pools', { cache: 'no-store' });
      if (!res.ok) return[];
      const json = await res.json() as { data?: DefiLlamaPool[] };
      if (!json.data || !Array.isArray(json.data)) return[];
      return json.data
        .filter((p) => (p.tvlUsd ?? 0) > 1_000_000 && (p.apy ?? 0) > 0 && (p.apy ?? 0) < 1000)
        .sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))
        .slice(0, 50)
        .map((p): YieldPool => ({ project: p.project ?? 'Unknown', chain: p.chain ?? 'Unknown', symbol: p.symbol ?? '—', tvlUsd: p.tvlUsd ?? 0, apy: p.apy ?? 0, apyPct1D: p.apyPct1D ?? 0, pool: p.pool ?? '' }));
    } catch { return[]; }
  }, 600);
}
