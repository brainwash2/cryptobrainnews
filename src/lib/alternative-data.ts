/**
 * src/lib/alternative-data.ts
 * Phase 43: Alternative market signals.
 *
 * Sources:
 *   Wikipedia pageviews API (free, no key)
 *   VC funding: curated reference data (Q1 2026)
 *   App store rankings: curated reference data
 *   Crypto PAC: curated FEC public data reference
 */
import { cached } from '@/lib/cache';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WikiPageviewPoint {
  date:   string;
  views:  number;
}

export interface VcDeal {
  company:   string;
  round:     string;
  amount:    number;         // USD
  category:  string;
  investors: string[];
  date:      string;
}

export interface AppRankEntry {
  app:      string;
  category: string;
  platform: 'ios' | 'android' | 'both';
  rank:     number;
  change:   number | null;   // rank delta vs prior week
  country:  string;
}

export interface PacEntry {
  committee:   string;
  cycle:       string;
  raised:      number;
  spent:       number;
  focus:       string;
}

// ─── Wikipedia Pageviews ──────────────────────────────────────────────────────

export async function getWikiPageviews(
  article: string,
  days = 30
): Promise<WikiPageviewPoint[]> {
  return cached(`wiki:pageviews:${article}:${days}`, async () => {
    try {
      const end   = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      const fmt = (d: Date) =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}00`;

      const url =
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/` +
        `en.wikipedia/all-access/all-agents/${encodeURIComponent(article)}/daily/${fmt(start)}/${fmt(end)}`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'CryptoBrainNews/1.0 (https://cryptobrainnews.vercel.app)' },
      });
      if (!res.ok) return [];

      const json = await res.json() as {
        items?: Array<{ timestamp: string; views: number }>;
      };

      return (json.items ?? []).map((item) => ({
        date:  `${item.timestamp.slice(4, 6)}/${item.timestamp.slice(6, 8)}`,
        views: item.views,
      }));
    } catch {
      return [];
    }
  }, 86400); // 24h cache — pageviews are daily
}

// ─── VC Funding Reference (Q1 2026) ──────────────────────────────────────────

export const VC_DEALS_2026: VcDeal[] = [
  { company: 'Movement Labs',  round: 'Series B',  amount: 100_000_000, category: 'Layer 1',    investors: ['Polychain', 'Binance Labs'],        date: 'Jan 2026' },
  { company: 'Privy',          round: 'Series B',  amount:  50_000_000, category: 'Infra/Auth', investors: ['Sequoia', 'Paradigm'],             date: 'Jan 2026' },
  { company: 'Monad Labs',     round: 'Series B',  amount: 225_000_000, category: 'Layer 1',    investors: ['Paradigm'],                        date: 'Apr 2024' },
  { company: 'Farcaster',      round: 'Series A',  amount:  150_000_000,category: 'Social',     investors: ['a16z Crypto'],                     date: 'May 2024' },
  { company: 'EigenLayer',     round: 'Series B',  amount: 100_000_000, category: 'Restaking',  investors: ['a16z Crypto', 'Coinbase Ventures'], date: 'Feb 2024' },
  { company: 'Polymarket',     round: 'Series B',  amount:  70_000_000, category: 'Prediction', investors: ['Peter Thiel', 'Vitalik Buterin'],   date: 'May 2024' },
  { company: 'Botanix Labs',   round: 'Series A',  amount:  11_500_000, category: 'Bitcoin L2', investors: ['Placeholder', 'UTXO Management'],  date: 'Jan 2026' },
  { company: 'Caldera',        round: 'Series A',  amount:  15_000_000, category: 'Rollup-as-a-Service', investors: ['Sequoia', 'Dragonfly'],   date: 'Oct 2023' },
  { company: 'Karak',          round: 'Series A',  amount:  48_000_000, category: 'Restaking',  investors: ['Coinbase Ventures', 'Bain Capital'], date: 'Mar 2024' },
  { company: 'Hyperliquid',    round: 'Bootstrapped', amount: 0,        category: 'Derivatives',investors: ['Self-funded'],                    date: 'Oct 2023' },
  { company: 'Berachain',      round: 'Series B',  amount: 100_000_000, category: 'Layer 1',    investors: ['Brevan Howard', 'OKX Ventures'],   date: 'Apr 2024' },
  { company: 'Babylon',        round: 'Series A',  amount:  18_000_000, category: 'Bitcoin Staking', investors: ['Polychain', 'Hack VC'],      date: 'Dec 2023' },
];

export const VC_CATEGORIES_2026 = [
  { category: 'Layer 1 / L2',     deals: 28, totalUsd: 850_000_000,  share: 24.1 },
  { category: 'DeFi / DEX',       deals: 22, totalUsd: 620_000_000,  share: 17.6 },
  { category: 'Infrastructure',   deals: 35, totalUsd: 580_000_000,  share: 16.5 },
  { category: 'Gaming / NFT',     deals: 18, totalUsd: 340_000_000,  share:  9.7 },
  { category: 'Wallets / Auth',   deals: 14, totalUsd: 280_000_000,  share:  7.9 },
  { category: 'Data / Analytics', deals: 12, totalUsd: 210_000_000,  share:  6.0 },
  { category: 'Restaking / AVS',  deals:  8, totalUsd: 198_000_000,  share:  5.6 },
  { category: 'AI + Crypto',      deals: 20, totalUsd: 450_000_000,  share: 12.8 },
];

// ─── App Store Rankings Reference ─────────────────────────────────────────────

export const APP_RANKINGS: AppRankEntry[] = [
  { app: 'Coinbase',        category: 'Finance',   platform: 'both',    rank:  3, change: +2,   country: 'US' },
  { app: 'Crypto.com',      category: 'Finance',   platform: 'both',    rank:  8, change: -1,   country: 'US' },
  { app: 'Binance',         category: 'Finance',   platform: 'both',    rank: 12, change:  0,   country: 'US' },
  { app: 'Robinhood',       category: 'Finance',   platform: 'both',    rank:  6, change: +1,   country: 'US' },
  { app: 'Kraken',          category: 'Finance',   platform: 'both',    rank: 18, change: -3,   country: 'US' },
  { app: 'OKX',             category: 'Finance',   platform: 'both',    rank: 22, change: +4,   country: 'US' },
  { app: 'MetaMask',        category: 'Utilities', platform: 'both',    rank:  7, change: +2,   country: 'US' },
  { app: 'Phantom',         category: 'Utilities', platform: 'both',    rank: 14, change: +6,   country: 'US' },
  { app: 'Trust Wallet',    category: 'Finance',   platform: 'both',    rank: 25, change: -2,   country: 'US' },
  { app: 'Uniswap',         category: 'Finance',   platform: 'both',    rank: 31, change: +5,   country: 'US' },
  { app: 'Hyperliquid',     category: 'Finance',   platform: 'both',    rank: 45, change: -8,   country: 'US' },
  { app: 'Magic Eden',      category: 'Utilities', platform: 'both',    rank: 52, change: +12,  country: 'US' },
];

// ─── Crypto PAC Reference ─────────────────────────────────────────────────────

export const PAC_DATA: PacEntry[] = [
  { committee: 'Fairshake',             cycle: '2024', raised: 202_000_000, spent: 178_000_000, focus: 'Pro-crypto candidates (bipartisan)' },
  { committee: 'Defend American Jobs',  cycle: '2024', raised:  12_000_000, spent:  10_500_000, focus: 'Coinbase-backed crypto advocacy' },
  { committee: 'Crypto4Harris',         cycle: '2024', raised:   8_400_000, spent:   7_200_000, focus: 'Democratic crypto advocates' },
  { committee: 'Stand With Crypto',     cycle: '2024', raised:   6_000_000, spent:   4_800_000, focus: 'Coinbase voter mobilization' },
  { committee: 'Blockchain4America',    cycle: '2024', raised:   3_200_000, spent:   2_900_000, focus: 'Blockchain industry advocacy' },
];

// ─── Wikipedia article suggestions ────────────────────────────────────────────

export const WIKI_ARTICLES = [
  { id: 'Bitcoin',             label: 'Bitcoin',    color: '#FABF2C' },
  { id: 'Ethereum',            label: 'Ethereum',   color: '#3b82f6' },
  { id: 'Cryptocurrency',      label: 'Crypto',     color: '#9945ff' },
  { id: 'Non-fungible_token',  label: 'NFT',        color: '#f97316' },
];
