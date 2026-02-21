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

// Add these exports to your existing types.ts file

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
  tvl: number;
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

export interface PriceTableRow {
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
