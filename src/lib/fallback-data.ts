import type { CoinMarketData } from './types';

// Deterministic fallback generator to prevent React hydration mismatches
// Never use Math.random() in shared Server/Client states.
const generateDeterministicSparkline = (base: number, variance: number) => {
  return Array.from({ length: 168 }).map((_, i) => {
    const wave = Math.sin(i / 10) * variance;
    return base + wave + (i % 5);
  });
};

export const FALLBACK_MARKET_DATA: CoinMarketData[] =[
  {
    id: 'bitcoin',
    market_cap_rank: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 65000,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: 5.2,
    market_cap: 1200000000000,
    total_volume: 35000000000,
    sparkline_in_7d: {
      price: generateDeterministicSparkline(60000, 5000),
    },
  },
  {
    id: 'ethereum',
    market_cap_rank: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3500,
    price_change_percentage_24h: 1.8,
    price_change_percentage_7d: 3.5,
    market_cap: 400000000000,
    total_volume: 15000000000,
    sparkline_in_7d: {
      price: generateDeterministicSparkline(3200, 300),
    },
  },
  {
    id: 'solana',
    market_cap_rank: 5,
    name: 'Solana',
    symbol: 'SOL',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 150,
    price_change_percentage_24h: 3.2,
    price_change_percentage_7d: 8.1,
    market_cap: 70000000000,
    total_volume: 5000000000,
    sparkline_in_7d: {
      price: generateDeterministicSparkline(130, 20),
    },
  },
];
