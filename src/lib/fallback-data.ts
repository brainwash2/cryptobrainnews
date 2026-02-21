import type { CoinMarketData } from './types';

export const FALLBACK_MARKET_DATA: CoinMarketData[] = [
  {
    id: 'bitcoin',
    market_cap_rank: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 45000,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: 5.2,
    market_cap: 900000000000,
    total_volume: 25000000000,
    sparkline_in_7d: {
      price: Array(168)
        .fill(0)
        .map(() => Math.random() * 5000 + 40000),
    },
  },
  {
    id: 'ethereum',
    market_cap_rank: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 2500,
    price_change_percentage_24h: 1.8,
    price_change_percentage_7d: 3.5,
    market_cap: 300000000000,
    total_volume: 15000000000,
    sparkline_in_7d: {
      price: Array(168)
        .fill(0)
        .map(() => Math.random() * 200 + 2300),
    },
  },
  {
    id: 'solana',
    market_cap_rank: 5,
    name: 'Solana',
    symbol: 'SOL',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 140,
    price_change_percentage_24h: 3.2,
    price_change_percentage_7d: 8.1,
    market_cap: 60000000000,
    total_volume: 3000000000,
    sparkline_in_7d: {
      price: Array(168)
        .fill(0)
        .map(() => Math.random() * 20 + 130),
    },
  },
];