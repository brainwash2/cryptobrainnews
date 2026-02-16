// src/lib/types.ts
// ─── Canonical type definitions for CryptoBrainNews ──────────────────────

// ═══ Market Data (CoinGecko) ═══
export interface CoinMarketData {
  id: string;
  market_cap_rank: number | null;
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

// ═══ News ═══
export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  image: string;
  url: string;
  source: string;
  published_on: number;
  categories: string[];
  tags: string[];
}

// ═══ DeFi (DefiLlama) ═══
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

// ═══ Dune Analytics Response Types ═══

export interface WhaleTransfer {
  block_time: string;
  sender: string;
  receiver: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
  tx_hash: string;
  chain: string;
}

export interface DexSwap {
  block_time: string;
  project: string;
  token_a_symbol: string;
  token_b_symbol: string;
  token_a_amount: number;
  token_b_amount: number;
  usd_amount: number;
  tx_hash: string;
}

export interface DailyDexVolume {
  day: string;
  volume_usd: number;
  trade_count: number;
}

export interface DailyActiveAddresses {
  day: string;
  active_addresses: number;
  chain: string;
}

export interface DailyTransactions {
  day: string;
  tx_count: number;
  chain: string;
}

export interface GasMetrics {
  day: string;
  avg_gas_price_gwei: number;
  median_gas_price_gwei: number;
  total_gas_used: number;
}

export interface StablecoinSupply {
  day: string;
  symbol: string;
  total_supply: number;
  chain: string;
}

export interface NftSalesVolume {
  day: string;
  volume_usd: number;
  sales_count: number;
  marketplace: string;
}

export interface ProtocolRevenue {
  protocol: string;
  revenue_7d: number;
  revenue_30d: number;
}

export interface ETFFlowData {
  date: string;
  ticker: string;
  inflows: number;
  outflows: number;
  net: number;
  aum: number;
}

export interface CEXNetFlow {
  day: string;
  token_symbol: string;
  inflow_usd: number;
  outflow_usd: number;
  net_flow_usd: number;
}

export interface L2Metrics {
  day: string;
  chain: string;
  tx_count: number;
  active_addresses: number;
  tvl_usd: number;
}

// ═══ Chart Config ═══
export interface ChartConfig {
  title: string;
  subtitle?: string;
  source: string;
  yAxisLabel?: string;
  yAxisFormat?: 'usd' | 'number' | 'percent';
}

// ═══ Sidebar Navigation ═══
export interface SidebarSection {
  label: string;
  icon: string;
  basePath: string;
  children: SidebarItem[];
}

export interface SidebarItem {
  label: string;
  href: string;
}
