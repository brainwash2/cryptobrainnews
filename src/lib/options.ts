/**
 * src/lib/options.ts
 * Phase 38: Deribit public options data.
 * No API key required – Deribit market data is publicly accessible.
 */
import { cached } from '@/lib/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OptionsAggregate {
  currency: 'BTC' | 'ETH';
  totalOiContracts: number;
  totalOiUsd: number;
  totalVolumeUsd: number;
  callOiUsd: number;
  putOiUsd: number;
  putCallRatio: number;
  avgIV: number;
  expiryCount: number;
}

interface DeribitBookSummary {
  instrument_name: string;
  open_interest: number;
  volume: number;
  volume_usd: number;
  underlying_price: number;
  mark_iv: number | null;
  mid_iv: number | null;
  creation_timestamp: number;
}

export interface HistVolPoint {
  date: string;
  value: number;
}

// ─── Options Aggregate (OI, Volume, Put/Call) ────────────────────────────────

async function fetchDeribitSummaries(
  currency: 'BTC' | 'ETH'
): Promise<DeribitBookSummary[]> {
  try {
    const res = await fetch(
      `https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=${currency}&kind=option`
    );
    if (!res.ok) return [];
    const json = await res.json() as {
      result?: DeribitBookSummary[];
      error?: unknown;
    };
    return Array.isArray(json.result) ? json.result : [];
  } catch {
    return [];
  }
}

export async function getOptionsAggregate(
  currency: 'BTC' | 'ETH'
): Promise<OptionsAggregate> {
  return cached(`deribit:options:agg:${currency}`, async () => {
    const opts = await fetchDeribitSummaries(currency);

    let totalOiContracts = 0;
    let totalOiUsd      = 0;
    let totalVolumeUsd  = 0;
    let callOiUsd       = 0;
    let putOiUsd        = 0;
    let ivSum           = 0;
    let ivCount         = 0;
    const expirySet     = new Set<string>();

    for (const o of opts) {
      const price   = Number(o.underlying_price ?? 0);
      const oi      = Number(o.open_interest ?? 0);
      const oiUsd   = oi * price;
      const volUsd  = Number(o.volume_usd ?? 0);

      totalOiContracts += oi;
      totalOiUsd       += oiUsd;
      totalVolumeUsd   += volUsd;

      // instrument_name format: BTC-25APR25-70000-C / BTC-25APR25-70000-P
      if (o.instrument_name.endsWith('-C')) {
        callOiUsd += oiUsd;
      } else {
        putOiUsd += oiUsd;
      }

      // extract expiry (second segment)
      const parts = o.instrument_name.split('-');
      if (parts.length >= 2) expirySet.add(parts[1]);

      const iv = o.mark_iv ?? o.mid_iv;
      if (iv !== null && iv > 0 && iv < 500) {
        ivSum += iv;
        ivCount++;
      }
    }

    return {
      currency,
      totalOiContracts,
      totalOiUsd,
      totalVolumeUsd,
      callOiUsd,
      putOiUsd,
      putCallRatio:  callOiUsd > 0 ? putOiUsd / callOiUsd : 0,
      avgIV:         ivCount > 0 ? ivSum / ivCount : 0,
      expiryCount:   expirySet.size,
    } satisfies OptionsAggregate;
  }, 300);
}

// ─── Historical Volatility (Deribit DVol) ───────────────────────────────────

export async function getDeribitHistVol(
  currency: 'BTC' | 'ETH',
  days = 30
): Promise<HistVolPoint[]> {
  return cached(`deribit:histvol:${currency}:${days}`, async () => {
    try {
      const res = await fetch(
        `https://www.deribit.com/api/v2/public/get_historical_volatility?currency=${currency}`
      );
      if (!res.ok) return [];
      const json = await res.json() as { result?: [number, number][] };
      if (!Array.isArray(json.result)) return [];
      return json.result
        .slice(-days)
        .map(([ts, val]) => ({
          date: new Date(ts).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          }),
          value: Number(Number(val).toFixed(1)),
        }));
    } catch {
      return [];
    }
  }, 3600);
}
