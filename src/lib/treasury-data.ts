/**
 * src/lib/treasury-data.ts
 * Phase 39: Public company crypto treasury data.
 * Source: CoinGecko /companies/public_treasury/{coin}
 * No API key required. Cache 6 hours (data updates slowly).
 */
import { cached } from '@/lib/cache';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TreasuryCompany {
  name:                  string;
  symbol:                string;
  country:               string;
  total_holdings:        number;
  total_entry_value_usd: number;
  total_current_value_usd: number;
  percentage_of_total_supply: string;
}

export interface TreasuryOverview {
  total_holdings:         number;
  total_value_usd:        number;
  market_cap_dominance:   string;
  companies:              TreasuryCompany[];
}

interface CoinGeckoTreasuryResponse {
  total_holdings:       number;
  total_value_usd:      number;
  market_cap_dominance: string;
  companies: Array<{
    name:                       string;
    symbol:                     string;
    country:                    string;
    total_holdings:             number;
    total_entry_value_usd:      number;
    total_current_value_usd:    number;
    percentage_of_total_supply: string;
  }>;
}

// ─── Fetcher ─────────────────────────────────────────────────────────────────

async function fetchTreasury(coin: 'bitcoin' | 'ethereum'): Promise<TreasuryOverview | null> {
  return cached(`coingecko:treasury:${coin}`, async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/companies/public_treasury/${coin}`
      );
      if (!res.ok) return null;
      const json = await res.json() as CoinGeckoTreasuryResponse;
      if (!json?.companies) return null;
      return {
        total_holdings:       json.total_holdings,
        total_value_usd:      json.total_value_usd,
        market_cap_dominance: json.market_cap_dominance,
        companies:            json.companies,
      };
    } catch {
      return null;
    }
  }, 21_600); // 6 hours
}

export async function getBitcoinTreasuries(): Promise<TreasuryOverview | null> {
  return fetchTreasury('bitcoin');
}

export async function getEthereumTreasuries(): Promise<TreasuryOverview | null> {
  return fetchTreasury('ethereum');
}
