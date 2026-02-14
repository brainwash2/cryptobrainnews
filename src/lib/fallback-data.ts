// src/lib/fallback-data.ts
// ─── Static fallback for when CoinGecko is rate-limited or down ──────────
import type { CoinMarketData } from './types';

export const FALLBACK_MARKET_DATA: CoinMarketData[] = [
  {
    id: 'bitcoin',
    market_cap_rank: 1,
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 76038,
    price_change_percentage_24h: -2.86,
    price_change_percentage_1h_in_currency: -0.1,
    price_change_percentage_7d_in_currency: 12.5,
    market_cap: 1500000000000,
    total_volume: 45000000000,
    sparkline_in_7d: { price: Array(168).fill(76000) },
  },
  {
    id: 'ethereum',
    market_cap_rank: 2,
    name: 'Ethereum',
    symbol: 'eth',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 2890,
    price_change_percentage_24h: -1.2,
    price_change_percentage_1h_in_currency: 0.2,
    price_change_percentage_7d_in_currency: 5.4,
    market_cap: 350000000000,
    total_volume: 15000000000,
    sparkline_in_7d: { price: Array(168).fill(2800) },
  },
  {
    id: 'solana',
    market_cap_rank: 3,
    name: 'Solana',
    symbol: 'sol',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 185,
    price_change_percentage_24h: 3.45,
    price_change_percentage_1h_in_currency: 0.8,
    price_change_percentage_7d_in_currency: 15.2,
    market_cap: 80000000000,
    total_volume: 4500000000,
    sparkline_in_7d: { price: Array(168).fill(180) },
  },
];
