import 'server-only';
import { cached } from './cache';
import { FALLBACK_MARKET_DATA } from './fallback-data';
import type {
  CoinMarketData,
  NewsArticle,
  DeFiProtocol,
  DexVolumePoint,
  StablecoinPoint,
} from './types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFILLAMA_BASE = 'https://api.llama.fi';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// Safety wrapper for fetch
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise])
    .then((res) => { clearTimeout(timeoutId); return res; })
    .catch(() => fallback);
}

export async function getLivePrices(): Promise<CoinMarketData[]> {
  const task = async () => {
    const res = await fetch(`${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`, { cache: 'no-store' });
    return res.ok ? res.json() : FALLBACK_MARKET_DATA;
  };
  return withTimeout(task(), 5000, FALLBACK_MARKET_DATA);
}

export async function getRealNews(): Promise<NewsArticle[]> {
  const task = async () => {
    const res = await fetch(NEWS_API, { cache: 'no-store' });
    const data = await res.json();
    return data.Data.slice(0, 20).map((a: any) => ({
      id: String(a.id),
      title: a.title,
      body: a.body || "",
      image: a.imageurl,
      source: a.source_info?.name || 'Unknown',
      published_on: a.published_on,
      url: a.url,
      categories: a.categories?.split('|') || [],
      tags: a.tags?.split('|') || [],
    }));
  };
  return withTimeout(task(), 5000, []);
}

export async function getDeFiProtocols(): Promise<DeFiProtocol[]> {
  return cached('defi:protocols', async () => {
    const res = await fetch(`${DEFILLAMA_BASE}/protocols`, { cache: 'no-store' });
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 50).map((p: any) => ({
      name: p.name,
      chain: p.chain || 'Multi',
      category: p.category,
      tvl: p.tvl,
      change_1d: p.change_1d,
    }));
  }, 600);
}

export async function getDexVolume(): Promise<DexVolumePoint[]> {
  return cached('defi:dex-volume', async () => {
    const res = await fetch(`${DEFILLAMA_BASE}/overview/dexs?excludeTotalDataChart=false`, { cache: 'no-store' });
    const data = await res.json();
    if (!data?.totalDataChart) return [];
    return data.totalDataChart.slice(-30).map((d: any) => ({
      date: new Date(d[0] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: d[1],
    }));
  }, 3600);
}

export async function getStablecoinData(): Promise<StablecoinPoint[]> {
  return cached('defi:stables', async () => {
    const res = await fetch('https://stablecoins.llama.fi/stablecoincharts/all', { cache: 'no-store' });
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(-30).map((d: any) => ({
      date: new Date(d.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mcap: d.totalCirculating?.peggedUSD || 0,
    }));
  }, 3600);
}

export async function getArticleById(id: string) {
  const news = await getRealNews();
  return news.find(a => a.id === id) || null;
}

export async function getRelatedArticles(id: string) {
  const news = await getRealNews();
  return news.filter(a => a.id !== id).slice(0, 4);
}

export function calculateReadingTime(text: string) {
  const words = (text || "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
