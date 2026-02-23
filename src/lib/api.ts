import { fetchWithTimeout } from './fetch-with-timeout';
import { cached } from './cache';
import type { CoinMarketData, DeFiProtocol, DexVolumePoint } from './types';
import { FALLBACK_MARKET_DATA } from './fallback-data';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFI_LLAMA_BASE = 'https://api.llama.fi';

// Updated to accept currency and fetch 1h data!
export async function getLiveMarketPrices(currency = 'usd'): Promise<CoinMarketData[]> {
  return cached(`market:prices:${currency}`, async () => {
    try {
      const res = await fetchWithTimeout(
        `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`, 
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      return await res.json();
    } catch {
      return FALLBACK_MARKET_DATA;
    }
  }, 300);
}

export const getLivePrices = getLiveMarketPrices;

export async function getDeFiProtocols(): Promise<DeFiProtocol[]> {
  return cached('defi:protocols', async () => {
    try {
      const res = await fetchWithTimeout(`${DEFI_LLAMA_BASE}/protocols`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`DefiLlama ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  }, 600);
}

export interface DexVolumeDataPoint { date: string; volume: number; }

export async function getDexVolume(): Promise<DexVolumeDataPoint[]> {
  return cached('dex:volume:llama', async () => {
    try {
      const res = await fetchWithTimeout(`${DEFI_LLAMA_BASE}/overview/dexs?excludeTotalDataChart=false`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`DefiLlama DEX ${res.status}`);
      const json = await res.json();
      const chart: Array<[number, number]> = json.totalDataChart ?? [];
      return chart.map(([ts, vol]) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        volume: vol,
      }));
    } catch {
      return [];
    }
  }, 600);
}
