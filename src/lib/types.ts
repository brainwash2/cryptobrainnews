export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  image: string;
  source: string;
  published_on: number;
  url: string;
  categories: string[];
  tags: string[];
  author_name?: string;
  author_bio?: string;
}

export interface WeightedArticle extends NewsArticle {
  weight: number;
  sourceType: 'editorial' | 'alpha' | 'ai_summary' | 'wire';
  aiSummary?: string;
  aiBullets?: string[];
  aiSentiment?: 'Positive' | 'Negative' | 'Neutral';
  rawHtml?: string;  // NEW: raw HTML body from AI pipeline
}

export interface CryptoEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  url: string;
  location_city: string;
  location_country: string;
  venue: string;
  start_date: string;
  end_date: string | null;
  event_type: string;
  is_online: boolean;
  is_featured: boolean;
  source: string;
  tags: string[];
  image_url?: string;
}

export interface AdLead {
  company_name: string;
  contact_name: string;
  email: string;
  telegram?: string;
  website?: string;
  budget_range: string;
  package_interest: string;
  message: string;
}

export interface SidebarSection {
  label: string;
  icon: string;
  basePath: string;
  children?: Array<{
    label: string;
    href: string;
  }>;
}

export interface CoinMarketData {
  id: string;
  market_cap_rank: number;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface DeFiProtocol {
  name: string;
  tvl: number | null;
  symbol?: string;
  category?: string;
  chain?: string;
  chainTvls?: Record<string, number>;
}

export interface DexVolumePoint {
  day: string;
  dex: string;
  blockchain: string;
  volume_usd: number;
  trade_count: number;
  unique_traders: number;
}

export interface StablecoinPoint {
  day: string;
  token_symbol: string;
  supply_moved: number;
  blockchain: string;
  total_stablecoin_volume: number;
  dominance_pct: number;
}
export type PriceTableRow = CoinMarketData;

export interface StablecoinData {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  price: number;
  circulating: number;
}

export interface ProtocolRevenueData {
  name: string;
  category: string;
  dailyFees: number;
  dailyRevenue: number;
  total1d: number;
  total7d: number;
}

export interface L2ScalingData {
  name: string;
  tvl: number | null;
  dailyTps?: number;
  marketShare?: number;
}

export interface DerivativeMarketData {
  exchange: string;
  volume24h: number;
  openInterest: number;
}

export interface FundingRateData {
  symbol: string;
  fundingRate: number;
  markPrice: number;
}

export interface GlobalMarketSummary {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  activeCryptocurrencies: number;
}

export interface OIHistoryPoint {
  date: string;
  btc: number;
  eth: number;
}

export interface FundingHistoryPoint {
  date: string;
  btc: number;
  eth: number;
}

export interface OptionsAggregateData {
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

export interface HistoricalVolPoint {
  date: string;
  value: number;
}

export interface CoinSectorCategory {
  id: string;
  name: string;
  market_cap: number | null;
  market_cap_change_24h: number | null;
  volume_24h: number | null;
}
