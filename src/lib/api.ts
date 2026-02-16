// src/lib/api.ts
// ─── External API integration (CoinGecko, DefiLlama, CryptoCompare) ─────
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

// ─── CoinGecko ───────────────────────────────────────────────────────────
export async function getLivePrices(): Promise<CoinMarketData[]> {
  return cached(
    'cg:markets',
    async () => {
      // Keep revalidate for small requests like this
      const res = await fetch(
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) return FALLBACK_MARKET_DATA;
      const data: CoinMarketData[] = await res.json();
      return Array.isArray(data) ? data : FALLBACK_MARKET_DATA;
    },
    60
  );
}

// ─── CryptoCompare News ──────────────────────────────────────────────────
export async function getRealNews(): Promise<NewsArticle[]> {
  return cached(
    'news:latest',
    async () => {
      const res = await fetch(NEWS_API, { next: { revalidate: 300 } });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data?.Data || !Array.isArray(data.Data)) return [];

      return data.Data.slice(0, 30).map(
        (a: {
          id: number;
          title: string;
          body: string;
          imageurl: string;
          url: string;
          source_info?: { name: string };
          published_on: number;
          categories?: string;
          tags?: string;
        }): NewsArticle => ({
          id: String(a.id),
          title: a.title,
          body: a.body || '',
          image: a.imageurl,
          source: a.source_info?.name || 'Unknown',
          published_on: a.published_on,
          url: a.url,
          categories: a.categories?.split('|') || [],
          tags: a.tags?.split('|') || [],
        })
      );
    },
    300
  );
}

// ─── DefiLlama (Optimized for Large Responses) ───────────────────────────
export async function getDeFiProtocols(): Promise<DeFiProtocol[]> {
  return cached(
    'defi:protocols',
    async () => {
      // Use no-store to bypass Next.js file cache (avoids 2MB limit warning)
      // Our in-memory 'cached' wrapper will still handle caching!
      const res = await fetch(`${DEFILLAMA_BASE}/protocols`, {
        cache: 'no-store', 
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.slice(0, 100).map(
        (p: {
          name: string;
          chain: string;
          chains?: string[];
          category: string;
          tvl: number;
          change_1d: number | null;
          change_7d?: number | null;
        }): DeFiProtocol => ({
          name: p.name,
          chain: p.chain || 'Multi',
          chains: p.chains,
          category: p.category,
          tvl: p.tvl,
          change_1d: p.change_1d,
          change_7d: p.change_7d ?? null,
        })
      );
    },
    600 // In-memory cache for 10 minutes
  );
}

export async function getDexVolume(): Promise<DexVolumePoint[]> {
  return cached(
    'defi:dex-volume',
    async () => {
      // HUGE response (19MB) - Must disable Next.js cache
      const res = await fetch(
        `${DEFILLAMA_BASE}/overview/dexs?excludeTotalDataChart=false`,
        { cache: 'no-store' }
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (!data?.totalDataChart) return [];
      return data.totalDataChart.slice(-30).map(
        (d: [number, number]): DexVolumePoint => ({
          date: new Date(d[0] * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          volume: d[1],
        })
      );
    },
    3600 // In-memory cache for 1 hour
  );
}

export async function getStablecoinData(): Promise<StablecoinPoint[]> {
  return cached(
    'defi:stables',
    async () => {
      const res = await fetch(
        'https://stablecoins.llama.fi/stablecoincharts/all',
        { cache: 'no-store' }
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.slice(-60).map(
        (d: {
          date: number;
          totalCirculating?: { peggedUSD?: number };
        }): StablecoinPoint => ({
          date: new Date(d.date * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          mcap: d.totalCirculating?.peggedUSD || 0,
        })
      );
    },
    3600
  );
}

// ─── Article helpers ─────────────────────────────────────────────────────
export async function getArticleById(
  id: string
): Promise<NewsArticle | null> {
  const news = await getRealNews();
  return news.find((a) => a.id === id) ?? null;
}

export async function getRelatedArticles(
  id: string,
  limit = 4
): Promise<NewsArticle[]> {
  const news = await getRealNews();
  return news.filter((a) => a.id !== id).slice(0, limit);
}

export function calculateReadingTime(text: string): number {
  const words = (text || '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Yields Data (DefiLlama) ─────────────────────────────────────────────
export interface YieldPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyPct1D: number; // APY change
}

export async function getTopYields(): Promise<YieldPool[]> {
  return cached(
    'defi:yields',
    async () => {
      const res = await fetch('https://yields.llama.fi/pools', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data?.data || !Array.isArray(data.data)) return [];

      // Filter for:
      // 1. TVL > $1M (Remove junk)
      // 2. APY < 500% (Remove scams/glitches)
      // 3. APY > 2% (Remove dead pools)
      return data.data
        .filter((p: any) => p.tvlUsd > 1_000_000 && p.apy < 500 && p.apy > 2)
        .sort((a: any, b: any) => b.tvlUsd - a.tvlUsd) // Sort by TVL (Safety)
        .slice(0, 50)
        .map((p: any) => ({
          chain: p.chain,
          project: p.project,
          symbol: p.symbol,
          tvlUsd: p.tvlUsd,
          apy: p.apy,
          apyPct1D: p.apyPct1D || 0,
        }));
    },
    600 // Cache for 10 mins
  );
}

// ─── CEX Volume Data (DefiLlama) ─────────────────────────────────────────
export async function getCexVolume(): Promise<any[]> {
  return cached(
    'market:cex-volume',
    async () => {
      // Fetch historical CEX volume
      const res = await fetch('https://api.llama.fi/summary/dexs/cexs?excludeTotalDataChart=false&dataType=dailyVolume', {
        cache: 'no-store'
      });
      if (!res.ok) return [];
      const data = await res.json();
      
      if (!data?.totalDataChart) return [];
      
      // Process last 90 days
      return data.totalDataChart.slice(-90).map((d: any) => ({
        date: new Date(d[0] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: d[1],
      }));
    },
    3600
  );
}

export async function getGlobalCapHistory(): Promise<any[]> {
  return cached(
    'market:global-cap',
    async () => {
      // Use DefiLlama Chain TVL as a proxy for market health/activity history
      // (Since CoinGecko global history requires Pro API)
      const res = await fetch('https://api.llama.fi/v2/chains', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      
      // Just return top 10 chains current stats for the table
      return data.slice(0, 10).map((c: any) => ({
        name: c.name,
        token: c.tokenSymbol,
        tvl: c.tvl,
      }));
    },
    3600
  );
}
