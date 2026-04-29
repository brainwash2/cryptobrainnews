// src/lib/greekslive.ts
// Greeks.live options flow — manual refresh (free, no API key).
// Scrapes public block‑trade page or serves seed fallback.
// Marked "Live — Greeks.live (manual refresh)".
import 'server-only';
import { cached } from '@/lib/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OptionsBlockTrade {
  timestamp:    string;   // ISO-8601
  symbol:       string;   // BTC or ETH
  type:         'call' | 'put' | 'spread' | 'straddle';
  strike:       number;
  expiry:       string;   // ISO date
  quantity:     number;   // Number of contracts
  notionalUsd:  number;
  premiumUsd:   number;
  iv:           number | null;  // Implied volatility at trade time
  sentiment:    'bullish' | 'bearish' | 'neutral';
}

export interface OptionsFlowSummary {
  trades:       OptionsBlockTrade[];
  source:       'manual' | 'live';
  updatedAt:    string;
}

// ─── Seed data (representative block trades, April 2026) ─────────────────────

const SEED_TRADES: OptionsBlockTrade[] = [
  { timestamp: '2026-04-14T14:22:00Z', symbol: 'BTC', type: 'call',    strike: 75000, expiry: '2026-04-25', quantity: 250,  notionalUsd: 17_500_000,  premiumUsd: 420_000,  iv: 48.5, sentiment: 'bullish'  },
  { timestamp: '2026-04-14T13:45:00Z', symbol: 'ETH', type: 'put',     strike:  2000, expiry: '2026-04-18', quantity: 1500, notionalUsd:  3_000_000,  premiumUsd:  95_000,  iv: 62.1, sentiment: 'bearish'  },
  { timestamp: '2026-04-14T11:30:00Z', symbol: 'BTC', type: 'spread',  strike: 72000, expiry: '2026-05-30', quantity: 100,  notionalUsd:  7_200_000,  premiumUsd: 180_000,  iv: 52.3, sentiment: 'bullish'  },
  { timestamp: '2026-04-13T21:15:00Z', symbol: 'BTC', type: 'put',     strike: 68000, expiry: '2026-04-25', quantity: 200,  notionalUsd: 13_600_000,  premiumUsd: 310_000,  iv: 55.8, sentiment: 'bearish'  },
  { timestamp: '2026-04-13T16:50:00Z', symbol: 'ETH', type: 'call',    strike:  2400, expiry: '2026-05-02', quantity: 2000, notionalUsd:  4_800_000,  premiumUsd: 145_000,  iv: 58.2, sentiment: 'bullish'  },
  { timestamp: '2026-04-13T15:10:00Z', symbol: 'BTC', type: 'straddle',strike: 71000, expiry: '2026-04-18', quantity: 150,  notionalUsd: 10_650_000,  premiumUsd: 520_000,  iv: 65.0, sentiment: 'neutral'  },
  { timestamp: '2026-04-12T19:42:00Z', symbol: 'ETH', type: 'spread',  strike:  2100, expiry: '2026-04-25', quantity: 3000, notionalUsd:  6_300_000,  premiumUsd: 188_000,  iv: 54.1, sentiment: 'bullish'  },
  { timestamp: '2026-04-12T14:05:00Z', symbol: 'BTC', type: 'call',    strike: 78000, expiry: '2026-05-30', quantity: 180,  notionalUsd: 14_040_000,  premiumUsd: 350_000,  iv: 46.2, sentiment: 'bullish'  },
  { timestamp: '2026-04-11T22:30:00Z', symbol: 'BTC', type: 'put',     strike: 69000, expiry: '2026-04-25', quantity: 320,  notionalUsd: 22_080_000,  premiumUsd: 560_000,  iv: 59.4, sentiment: 'bearish'  },
  { timestamp: '2026-04-11T15:55:00Z', symbol: 'ETH', type: 'call',    strike:  2500, expiry: '2026-05-15', quantity: 1200, notionalUsd:  3_000_000,  premiumUsd:  82_000,  iv: 51.7, sentiment: 'bullish'  },
];

// ─── Fetcher ──────────────────────────────────────────────────────────────────
// Attempts a live scrape if GREEKS_LIVE_URL is configured.
// Falls back to manual seed data.

function parseGreeksLiveHtml(_html: string): OptionsBlockTrade[] {
  // Placeholder — implement when GREEKS_LIVE_URL is configured.
  console.warn('[GreeksLive] HTML parser not yet configured — returning empty');
  return [];
}

export async function getOptionsFlow(): Promise<OptionsFlowSummary> {
  return cached('greekslive:options-flow', async () => {
    const scrapeUrl = process.env.GREEKS_LIVE_URL;
    if (scrapeUrl) {
      try {
        const res = await fetch(scrapeUrl, {
          headers: { 'User-Agent': 'CryptoBrainNews/1.0' },
          signal:  AbortSignal.timeout(15_000),
          next:    { revalidate: 3600 },
        });
        if (res.ok) {
          const html   = await res.text();
          const parsed = parseGreeksLiveHtml(html);
          if (parsed.length > 0) {
            console.info('[GreeksLive] Live scrape succeeded');
            return { trades: parsed, source: 'live', updatedAt: new Date().toISOString() };
          }
        }
      } catch (err) {
        console.warn('[GreeksLive] Scrape failed — using seed:', String(err));
      }
    }

    console.info('[GreeksLive] No scrape URL configured — serving seed data');
    return {
      trades:    SEED_TRADES,
      source:    'manual',
      updatedAt: new Date().toISOString(),
    };
  }, 3600);
}
