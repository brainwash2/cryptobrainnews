import 'server-only';
import { cached } from './cache';
import { fetchWithTimeout } from './fetch-with-timeout';
import type { DerivativeMarketData, FundingRateData } from './types';

export async function getDerivativesExchanges(): Promise<DerivativeMarketData[]> {
  return cached('derivatives:exchanges', async () => {
    try {
      const res = await fetchWithTimeout('https://api.llama.fi/overview/derivatives?excludeTotalDataChart=true', { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      if (!json.protocols) return[];
      
      // Filter out entirely inactive exchanges
      return json.protocols
        .filter((p: any) => p.dailyVolume > 0 || p.totalOpenInterest > 0)
        .map((p: any) => ({
          exchange: p.name,
          volume24h: p.dailyVolume || 0,
          openInterest: p.totalOpenInterest || 0
        }))
        .sort((a: any, b: any) => b.openInterest - a.openInterest);
    } catch {
      return[];
    }
  }, 3600); // 1 hour cache
}

export async function getFundingRates(): Promise<FundingRateData[]> {
  return cached('derivatives:funding-rates', async () => {
    try {
      const res = await fetchWithTimeout('https://fapi.binance.com/fapi/v1/premiumIndex', { cache: 'no-store' });
      if (!res.ok) return[];
      const data = await res.json();
      return data
        .filter((p: any) => p.symbol.endsWith('USDT'))
        .map((p: any) => ({
          symbol: p.symbol,
          fundingRate: parseFloat(p.lastFundingRate) * 100, // convert to percentage
          markPrice: parseFloat(p.markPrice)
        }))
        .sort((a: any, b: any) => b.fundingRate - a.fundingRate);
    } catch {
      return[];
    }
  }, 300); // 5 minutes cache
}
