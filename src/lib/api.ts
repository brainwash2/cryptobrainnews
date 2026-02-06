const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFILLAMA_BASE = 'https://api.llama.fi';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// Realistic Fallback
export const FALLBACK_MARKET_DATA = [
  { id: 'bitcoin', rank: 1, name: 'Bitcoin', symbol: 'btc', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 76038, price_change_percentage_24h: -2.86, price_change_percentage_1h_in_currency: -0.1, price_change_percentage_7d_in_currency: 12.5, market_cap: 1500000000000, total_volume: 45000000000, sparkline_in_7d: { price: Array(20).fill(0).map(() => 75000 + Math.random() * 2000) } },
];

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

// 1. LIVE PRICES
export async function getLivePrices(currency = 'usd', category = 'all') {
  let url = `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`;
  if (category !== 'all') url += `&category=${category.toLowerCase().replace(/\s+/g, '-')}`;
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : FALLBACK_MARKET_DATA;
}

// 2. ENHANCED NEWS ENGINE (With Category Support)
export async function getRealNews(category = '') {
  let url = NEWS_API;
  // CryptoCompare categories: BTC, ETH, DeFi, etc.
  if (category) url += `&categories=${category.toUpperCase()}`;
  
  const data = await safeFetch(url);
  if (data?.Data) {
    return data.Data.slice(0, 15).map((a: any) => ({
      id: String(a.id),
      title: a.title,
      body: a.body || "",
      image: a.imageurl,
      source: a.source_info.name,
      published_on: a.published_on,
      url: a.url,
      tags: a.categories
    }));
  }
  return [];
}

// 3. THE BLOCK STYLE METRICS
export async function getDexVolume() {
  const data = await safeFetch('https://api.llama.fi/overview/dexs?excludeTotalVolumeChart=false');
  return data?.totalVolumeChart?.slice(-30).map((d: any) => ({
    date: new Date(d[0] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: d[1]
  })) || [];
}

export async function getStablecoinData() {
  const data = await safeFetch('https://stablecoins.llama.fi/stablecoincharts/all');
  return Array.isArray(data) ? data.slice(-30).map((d: any) => ({
    date: new Date(d.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mcap: d.totalCirculating.peggedUSD
  })) : [];
}

export async function getDeFiProtocols() {
  const data = await safeFetch(`${DEFILLAMA_BASE}/protocols`);
  return Array.isArray(data) ? data.slice(0, 20) : [];
}

export async function getCachedData(key: string, fn: Function) { return fn(); }
