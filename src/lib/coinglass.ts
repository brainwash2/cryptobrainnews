// src/lib/coinglass.ts
// CoinGlass — futures liquidations and exchange OI rankings
// Sign‑up: coinglass.com → free account → API key
// Free tier: 50 data points/day via API
import 'server-only';
import { cached } from '@/lib/cache';

const COINGLASS_API = 'https://open-api-v2.coinglass.com/api';
const API_KEY = process.env.COINGLASS_API_KEY;

interface CoinGlassLiquidation {
  exchangeName: string;
  symbol: string;
  side: string;
  volume: number;
  price: number;
  timestamp: number;
}

interface CoinGlassExchangeOI {
  exchangeName: string;
  btcOi: number;
  ethOi: number;
  solOi: number;
  totalOi: number;
  oiChangePercent: number;
}

interface CoinGlassLiquidationStats {
  exchangeName: string;
  longLiq24h: number;
  shortLiq24h: number;
  totalLiq24h: number;
}

async function coinglassFetch<T>(path: string, fallback: T): Promise<T> {
  if (!API_KEY) {
    console.warn('[CoinGlass] COINGLASS_API_KEY not set');
    return fallback;
  }
  try {
    const res = await fetch(`${COINGLASS_API}${path}`, {
      headers: { 'CG-API-KEY': API_KEY, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export interface LiquidationRecord {
  exchange: string;
  symbol: string;
  side: 'Long' | 'Short';
  qty: number;
  price: number;
  timestamp: number;
}

export interface ExchangeOI {
  exchange: string;
  totalOiUsd: number;
  oiChange24h: number;
}

export async function getCoinGlassLiquidations(limit = 50): Promise<LiquidationRecord[]> {
  return cached('coinglass:liquidations', async () => {
    const data = await coinglassFetch<{ data?: CoinGlassLiquidation[] }>(
      '/futures/liquidation/v2?limit=200',
      { data: [] },
    );
    return (data.data ?? []).slice(0, limit).map((r) => ({
      exchange: r.exchangeName ?? 'Unknown',
      symbol: r.symbol ?? '—',
      side: r.side === 'Short' ? 'Short' as const : 'Long' as const,
      qty: r.volume ?? 0,
      price: r.price ?? 0,
      timestamp: r.timestamp ?? 0,
    }));
  }, 300);
}

export async function getExchangeOI(): Promise<ExchangeOI[]> {
  return cached('coinglass:exchange-oi', async () => {
    const data = await coinglassFetch<{ data?: CoinGlassExchangeOI[] }>(
      '/futures/openInterest/exchange/list',
      { data: [] },
    );
    return (data.data ?? []).map((r) => ({
      exchange: r.exchangeName ?? 'Unknown',
      totalOiUsd: r.totalOi ?? 0,
      oiChange24h: r.oiChangePercent ?? 0,
    })).sort((a, b) => b.totalOiUsd - a.totalOiUsd);
  }, 300);
}

export async function getCoinGlassLiquidationStats(): Promise<CoinGlassLiquidationStats[]> {
  return cached('coinglass:liq-stats', async () => {
    const data = await coinglassFetch<{ data?: Array<{
      exchangeName: string;
      longVolUsd: number;
      shortVolUsd: number;
      volUsd: number;
    }> }>(
      '/futures/liquidation/stats?timeType=1',
      { data: [] },
    );
    return (data.data ?? []).map((r) => ({
      exchangeName: r.exchangeName ?? 'Unknown',
      longLiq24h: r.longVolUsd ?? 0,
      shortLiq24h: r.shortVolUsd ?? 0,
      totalLiq24h: r.volUsd ?? 0,
    }));
  }, 3600);
}
