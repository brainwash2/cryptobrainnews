// src/lib/lunarcrush.ts — gated availability check
import 'server-only';
import { cached } from '@/lib/cache';

const LC_API = 'https://lunarcrush.com/api4/public';
const API_KEY = process.env.LUNARCRUSH_API_KEY;
const LUNARCRUSH_AVAILABLE = !!API_KEY;

export interface LunarCrushCoin {
  id: string;
  symbol: string;
  name: string;
  galaxy_score: number | null;
  alt_rank: number | null;
  social_volume: number | null;
  social_volume_24h: number | null;
  social_score: number | null;
  sentiment: number | null;
  bullish_sentiment: number | null;
  bearish_sentiment: number | null;
  market_cap: number | null;
  price: number | null;
  percent_change_24h: number | null;
  url_shares: number | null;
  tweet_spam: number | null;
  influencer_sentiment: number | null;
}

interface LCResponse {
  data: LunarCrushCoin[];
}

async function lcFetch<T>(path: string, fallback: T): Promise<T> {
  if (!LUNARCRUSH_AVAILABLE) return fallback;
  try {
    const res = await fetch(`${LC_API}${path}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getSocialSentiment(top = 20): Promise<LunarCrushCoin[]> {
  return cached('lunarcrush:social-sentiment', async () => {
    const data = await lcFetch<LCResponse>(
      `/coins/list/v2?sort=social_volume_24h&limit=${top}&interval=24h`,
      { data: [] },
    );
    return data.data.slice(0, top);
  }, 3600);
}

export async function getCoinSentiment(coinId: string): Promise<LunarCrushCoin | null> {
  return cached(`lunarcrush:coin:${coinId}`, async () => {
    const data = await lcFetch<LCResponse>(
      `/coins/list/v2?symbol=${encodeURIComponent(coinId)}&limit=1&interval=24h`,
      { data: [] },
    );
    return data.data[0] ?? null;
  }, 3600);
}
