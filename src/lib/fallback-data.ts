import type { CoinMarketData } from './types';

// Deterministic fallback generator to prevent React hydration mismatches.
// Never use Math.random() in shared Server/Client states.
const generateDeterministicSparkline = (base: number, variance: number) => {
  return Array.from({ length: 168 }).map((_, i) => {
    const wave = Math.sin(i / 10) * variance;
    return base + wave + (i % 5);
  });
};

/**
 * Phase 45 · C5 — Fallback price snapshot updated.
 *
 * Previous values ($65 000 BTC / $3 500 ETH / $150 SOL) dated from an earlier
 * market cycle and were materially stale. These prices surface whenever the
 * CoinGecko API is unavailable, so accuracy matters for user trust.
 *
 * Snapshot date : 2026-03-21
 * Sources       : CoinDesk (BTC, SOL), CoinMarketCap (ETH) — all as of Mar 21 2026
 *   BTC : $70 325  · mktcap $1.407T · vol $14.06B
 *   ETH : $2 154   · mktcap $260B   · vol $17.72B
 *   SOL : $89.85   · mktcap ~$39.5B · vol $816M   (circ. supply ~440M SOL)
 *
 * Action required: re-run this update whenever a major price regime change occurs
 * (>20% move sustained >7 days). The live CoinGecko path is always preferred —
 * this data is only served on API failure.
 */
export const FALLBACK_MARKET_DATA: CoinMarketData[] = [
  {
    id: 'bitcoin',
    market_cap_rank: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 70325,
    price_change_percentage_24h: 0.8,
    price_change_percentage_7d: -1.4,
    market_cap: 1_406_709_000_000,
    total_volume: 14_063_000_000,
    sparkline_in_7d: {
      price: generateDeterministicSparkline(67500, 2500),
    },
  },
  {
    id: 'ethereum',
    market_cap_rank: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 2154,
    price_change_percentage_24h: 0.9,
    price_change_percentage_7d: -3.2,
    market_cap: 260_028_000_000,
    total_volume: 17_721_000_000,
    sparkline_in_7d: {
      price: generateDeterministicSparkline(2050, 95),
    },
  },
  {
    id: 'solana',
    market_cap_rank: 7,
    name: 'Solana',
    symbol: 'SOL',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 90,
    price_change_percentage_24h: 1.0,
    price_change_percentage_7d: -5.5,
    market_cap: 39_534_000_000,
    total_volume: 816_000_000,
    sparkline_in_7d: {
      price: generateDeterministicSparkline(85, 6),
    },
  },
];
