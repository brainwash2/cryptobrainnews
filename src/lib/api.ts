import { cached } from './cache';
import { FALLBACK_MARKET_DATA } from './fallback-data'; // We will create this next
import type { CoinMarketData, NewsArticle, DeFiProtocol } from './types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFILLAMA_BASE = 'https://api.llama.fi';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// Safe Fetch with Timeout and Logging
async function safeFetch<T = any>(url: string, ttl = 60): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: ttl } });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`[API Fail] ${url}`);
    return null;
  }
}

// 1. Live Prices
export async function getLivePrices(currency = 'usd', category = 'all') {
  return cached(`prices:${currency}:${category}`, async () => {
    let url = `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`;
    if (category !== 'all') url += `&category=${category.toLowerCase().replace(/\s+/g, '-')}`;
    
    const data = await safeFetch<CoinMarketData[]>(url);
    return Array.isArray(data) ? data : FALLBACK_MARKET_DATA;
  }, 60);
}

// 2. News
export async function getRealNews() {
  return cached('news:latest', async () => {
    const data = await safeFetch(NEWS_API, 300);
    if (data?.Data) {
      return data.Data.slice(0, 15).map((a: any) => ({
        id: String(a.id),
        title: a.title,
        body: a.body || "",
        image: a.imageurl,
        source: a.source_info.name,
        published_on: a.published_on,
        url: a.url,
        categories: a.categories
      }));
    }
    return [];
  }, 300);
}

// 3. DeFi Protocols
export async function getDeFiProtocols() {
  return cached('defi:protocols', async () => {
    const data = await safeFetch<DeFiProtocol[]>(`${DEFILLAMA_BASE}/protocols`, 600);
    return Array.isArray(data) ? data.slice(0, 20) : [];
  }, 600);
}

// 4. Dex Volume
export async function getDexVolume() {
  return cached('defi:dex-volume', async () => {
    const data = await safeFetch('https://api.llama.fi/overview/dexs?excludeTotalVolumeChart=false', 3600);
    return data?.totalVolumeChart?.slice(-30).map((d: any) => ({
      date: new Date(d[0] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: d[1]
    })) || [];
  }, 3600);
}

// 5. Stablecoins
export async function getStablecoinData() {
  return cached('defi:stables', async () => {
    const data = await safeFetch('https://stablecoins.llama.fi/stablecoincharts/all', 3600);
    return data?.slice(-30).map((d: any) => ({
      date: new Date(d.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mcap: d.totalCirculating.peggedUSD
    })) || [];
  }, 3600);
}

export { FALLBACK_MARKET_DATA };
