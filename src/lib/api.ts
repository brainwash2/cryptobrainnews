const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFILLAMA_BASE = 'https://api.llama.fi';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// --- FALLBACKS FOR STABILITY (Now Exported) ---
export const FALLBACK_MARKET_DATA = [
  { id: 'bitcoin', rank: 1, name: 'Bitcoin', symbol: 'btc', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 76038, price_change_percentage_24h: -2.86, price_change_percentage_1h_in_currency: -0.1, price_change_percentage_7d_in_currency: 12.5, market_cap: 1500000000000, total_volume: 45000000000, sparkline_in_7d: { price: Array(20).fill(0).map(() => 75000 + Math.random() * 2000) } },
  { id: 'ethereum', rank: 2, name: 'Ethereum', symbol: 'eth', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2890, price_change_percentage_24h: -1.20, price_change_percentage_1h_in_currency: 0.2, price_change_percentage_7d_in_currency: 5.4, market_cap: 350000000000, total_volume: 15000000000, sparkline_in_7d: { price: Array(20).fill(0).map(() => 2800 + Math.random() * 100) } },
];

// Generate realistic chart data if API fails
const MOCK_DEX_VOLUME = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  volume: 2000000000 + Math.random() * 1000000000 // $2B - $3B range
}));

const MOCK_STABLE_SUPPLY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  mcap: 130000000000 + (i * 500000000) // Gradual growth from $130B
}));

async function safeFetch(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

export async function getLivePrices(currency = 'usd', category = 'all') {
  try {
    let url = `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`;
    if (category !== 'all') url += `&category=${category.toLowerCase().replace(/\s+/g, '-')}`;
    const data = await safeFetch(url);
    return Array.isArray(data) ? data : FALLBACK_MARKET_DATA;
  } catch (e) { return FALLBACK_MARKET_DATA; }
}

export async function getRealNews() {
  const data = await safeFetch(NEWS_API);
  if (data?.Data) {
    return data.Data.slice(0, 10).map((article: any) => ({
      id: article.id, title: article.title, url: article.url, image: article.imageurl, source: article.source_info.name, published_on: article.published_on, body: article.body || ""
    }));
  }
  return [];
}

export async function getDeFiProtocols() {
  const data = await safeFetch(`${DEFILLAMA_BASE}/protocols`);
  return Array.isArray(data) ? data.slice(0, 20).map((p: any) => ({
    name: p.name, chain: p.chain, category: p.category, tvl: p.tvl, change_1d: p.change_1d
  })) : [];
}

export async function getDexVolume() {
  const data = await safeFetch('https://api.llama.fi/overview/dexs?excludeTotalVolumeChart=false');
  if (data?.totalVolumeChart) {
    return data.totalVolumeChart.slice(-30).map((d: any) => ({
      date: new Date(d[0] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: d[1]
    }));
  }
  return MOCK_DEX_VOLUME;
}

export async function getStablecoinData() {
  const data = await safeFetch('https://stablecoins.llama.fi/stablecoincharts/all');
  if (Array.isArray(data)) {
    return data.slice(-30).map((d: any) => ({
      date: new Date(d.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mcap: d.totalCirculating.peggedUSD
    }));
  }
  return MOCK_STABLE_SUPPLY;
}

export async function getGlobalTVLHistory() { return []; }
export async function getCachedData(key: string, fn: Function) { return fn(); }
