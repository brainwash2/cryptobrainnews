// src/lib/coinshares.ts
// CoinShares weekly fund flows — manual scrape (free, no API key).
// Data is human‑entered weekly; this module returns a cached seed table
// marked "Data updated weekly — manual entry".
import 'server-only';
import { cached } from '@/lib/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoinSharesFlowWeek {
  weekEnding:     string;   // ISO date (Friday)
  btcFlowUsd:     number;   // Net flow in USD (negative = outflow)
  ethFlowUsd:     number;
  solFlowUsd:     number;
  totalFlowUsd:   number;
  aumUsd:         number;   // Total crypto ETP AUM
  source:         'manual' | 'live';
}

export interface CoinSharesSummary {
  weeks:         CoinSharesFlowWeek[];
  latestWeek:    CoinSharesFlowWeek | null;
  ytdFlowUsd:    number;
  source:        'manual' | 'live';
}

// ─── Manually‑updated seed data (CoinShares weekly report, Apr 2026) ─────────
// Update this array weekly from https://coinshares.com/research
// Last updated: Week ending 2026-04-11

const SEED_FLOWS: CoinSharesFlowWeek[] = [
  { weekEnding: '2026-03-14', btcFlowUsd:  142_000_000, ethFlowUsd:  -22_000_000, solFlowUsd:   8_500_000, totalFlowUsd:  128_500_000, aumUsd: 112_500_000_000, source: 'manual' },
  { weekEnding: '2026-03-21', btcFlowUsd:  276_000_000, ethFlowUsd:   48_000_000, solFlowUsd:  12_000_000, totalFlowUsd:  336_000_000, aumUsd: 115_800_000_000, source: 'manual' },
  { weekEnding: '2026-03-28', btcFlowUsd:  -89_000_000, ethFlowUsd:  -35_000_000, solFlowUsd:  -3_200_000, totalFlowUsd: -127_200_000, aumUsd: 113_200_000_000, source: 'manual' },
  { weekEnding: '2026-04-04', btcFlowUsd:  198_000_000, ethFlowUsd:   18_000_000, solFlowUsd:   6_800_000, totalFlowUsd:  222_800_000, aumUsd: 114_800_000_000, source: 'manual' },
  { weekEnding: '2026-04-11', btcFlowUsd:  312_000_000, ethFlowUsd:   62_000_000, solFlowUsd:  14_500_000, totalFlowUsd:  388_500_000, aumUsd: 116_200_000_000, source: 'manual' },
];

// ─── Fetcher ──────────────────────────────────────────────────────────────────
// Attempts a live scrape if COINSHARES_SCRAPE_URL is configured.
// Falls back to manual seed data.

export async function getWeeklyFlows(): Promise<CoinSharesSummary> {
  return cached('coinshares:weekly-flows', async () => {
    const scrapeUrl = process.env.COINSHARES_SCRAPE_URL;
    if (scrapeUrl) {
      try {
        const res = await fetch(scrapeUrl, {
          headers: { 'User-Agent': 'CryptoBrainNews/1.0' },
          signal:  AbortSignal.timeout(15_000),
          next:    { revalidate: 604800 }, // 7 days
        });
        if (res.ok) {
          const text = await res.text();
          const parsed = parseCoinSharesHtml(text);
          if (parsed.length > 0) {
            console.info('[CoinShares] Live scrape succeeded');
            return buildSummary(parsed, 'live');
          }
        }
      } catch (err) {
        console.warn('[CoinShares] Scrape failed — using manual seed:', String(err));
      }
    }

    // Fallback to manual seed
    console.info('[CoinShares] No scrape URL configured — serving manual seed data');
    return buildSummary(SEED_FLOWS, 'manual');
  }, 604800); // 7‑day cache
}

// ─── HTML parser (minimal — extend when a real scrape URL is registered) ──────
// CoinShares publishes table data; adapt this parser to match their HTML structure.

function parseCoinSharesHtml(_html: string): CoinSharesFlowWeek[] {
  // Placeholder — implement when COINSHARES_SCRAPE_URL is configured.
  // Expected format: table rows with columns [weekEnding, btcFlow, ethFlow, solFlow, totalFlow, aum]
  console.warn('[CoinShares] HTML parser not yet configured — returning empty');
  return [];
}

function buildSummary(weeks: CoinSharesFlowWeek[], source: 'manual' | 'live'): CoinSharesSummary {
  const sorted  = [...weeks].sort((a, b) => b.weekEnding.localeCompare(a.weekEnding));
  const ytdFlow = sorted.reduce((s, w) => s + w.totalFlowUsd, 0);
  return {
    weeks:       sorted,
    latestWeek:  sorted[0] ?? null,
    ytdFlowUsd:  ytdFlow,
    source,
  };
}
