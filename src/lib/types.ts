export interface CoinMarketData {
  id: string;
  market_cap_rank?: number;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  image: string;
  url: string;
  source: string;
  published_on: number;
  categories?: string[]; // Array of strings
  tags?: string[];       // Array of strings
}

export interface DeFiProtocol {
  name: string;
  chain: string;
  chains?: string[];
  category: string;
  tvl: number;
  change_1d: number | null;
  change_7d?: number | null;
}

export interface DexVolumePoint {
  date: string;
  volume: number;
}

export interface StablecoinPoint {
  date: string;
  mcap: number;
}

export interface PriceTableRow {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
}
