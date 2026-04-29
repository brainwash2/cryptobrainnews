// src/lib/apewisdom.ts
// ApeWisdom — free social sentiment / trending crypto mentions.
// Endpoint: GET https://apewisdom.io/api/v1.0/filter/all-crypto
// No API key, no signup required. Cache TTL: 1 hour.
import 'server-only';
import { cached } from '@/lib/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApeWisdomMention {
  ticker:         string;   // e.g. "BTC"
  mentions:       number;   // total mentions count
  upvotes:        number;   // total upvotes
  rank:           number;   // current rank (1 = highest mentions)
  rankChange24h:  number;   // positive = risen in rank, negative = fallen
}

interface ApeWisdomApiRow {
  ticker:           string;
  mentions:         string;
  upvotes:          string;
  rank:             string;
  rank_24h_change?: string;
  name?:            string;
}

interface ApeWisdomApiResponse {
  results?: ApeWisdomApiRow[];
  count?:   number;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

export async function getApeWisdomSentiment(): Promise<ApeWisdomMention[]> {
  return cached('apewisdom:all-crypto', async () => {
    const apiUrl =
      (process.env.APEWISDOM_API_URL ?? 'https://apewisdom.io/api/v1.0') +
      '/filter/all-crypto';

    try {
      const res = await fetch(apiUrl, {
        signal: AbortSignal.timeout(12_000),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CryptoBrainNews/1.0 (https://cryptobrainnews.vercel.app)',
        },
      });

      if (!res.ok) {
        console.warn(`[ApeWisdom] HTTP ${res.status}`);
        return [];
      }

      const json = (await res.json()) as ApeWisdomApiResponse;
      if (!json.results || !Array.isArray(json.results)) {
        console.warn('[ApeWisdom] Unexpected response shape');
        return [];
      }

      const mentions: ApeWisdomMention[] = json.results
        .filter((row) => row.ticker && row.ticker.length <= 10)
        .map((row) => ({
          ticker:        row.ticker.toUpperCase(),
          mentions:      parseInt(row.mentions, 10) || 0,
          upvotes:       parseInt(row.upvotes, 10) || 0,
          rank:          parseInt(row.rank, 10) || 0,
          rankChange24h: parseInt(row.rank_24h_change ?? '0', 10) || 0,
        }))
        .filter((m) => m.mentions > 0)
        .sort((a, b) => b.mentions - a.mentions);

      console.info(`[ApeWisdom] Fetched ${mentions.length} mentions`);
      return mentions;
    } catch (err) {
      console.warn('[ApeWisdom] Fetch error:', String(err));
      return [];
    }
  }, 3600); // 1‑hour cache — data is daily aggregate
}
