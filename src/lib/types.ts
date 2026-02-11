export interface CoinMarketData {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
}

export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  image: string;
  url: string;
  source: string;
  published_on: number;
  categories?: string;
}

export interface DeFiProtocol {
  name: string;
  chain: string;
  category: string;
  tvl: number;
  change_1d: number;
}
