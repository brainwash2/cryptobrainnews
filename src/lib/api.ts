const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFILLAMA_BASE = 'https://api.llama.fi';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// 1. INSTITUTIONAL FALLBACK DATA (Named Export)
export const FALLBACK_MARKET_DATA = [
  { id: 'bitcoin', rank: 1, name: 'Bitcoin', symbol: 'btc', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 76038, price_change_percentage_24h: -2.86, market_cap: 1500000000000, total_volume: 45000000000, sparkline_in_7d: { price: [75000, 76000, 75500, 77000, 76038] } },
  { id: 'ethereum', rank: 2, name: 'Ethereum', symbol: 'eth', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2890, price_change_percentage_24h: -1.20, market_cap: 350000000000, total_volume: 15000000000, sparkline_in_7d: { price: [2800, 2900, 2850, 2890] } },
];

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

// 2. LIVE PRICES (Supports 2 Arguments)
export async function getLivePrices(currency = 'usd', category = 'all') {
  let url = `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`;
  if (category !== 'all') url += `&category=${category.toLowerCase().replace(/\s+/g, '-')}`;
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : FALLBACK_MARKET_DATA;
}

// 3. NEWS (Stay Internal)
export async function getRealNews() {
  const data = await safeFetch(NEWS_API);
  return data?.Data?.map((a: any) => ({
    id: String(a.id),
    title: a.title,
    body: a.body || "",
    image: a.imageurl,
    source: a.source_info.name,
    published_on: a.published_on,
    url: a.url
  })) || [];
}

// 4. THE BLOCK STYLE METRICS
export async function getDexVolume() {
  const data = await safeFetch('https://api.llama.fi/overview/dexs?excludeTotalVolumeChart=false');
  return data?.totalVolumeChart?.slice(-30).map((d: any) => ({
    date: new Date(d[0] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: d[1]
  })) || [];
}

export async function getStablecoinData() {
  const data = await safeFetch('https://stablecoins.llama.fi/stablecoincharts/all');
  return data?.slice(-30).map((d: any) => ({
    date: new Date(d.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mcap: d.totalCirculating.peggedUSD
  })) || [];
}

export async function getDeFiProtocols() {
  const data = await safeFetch(`${DEFILLAMA_BASE}/protocols`);
  return Array.isArray(data) ? data.slice(0, 20) : [];
}

export async function getGlobalTVLHistory() { return []; }
export async function getCachedData(key: string, fn: Function) { return fn(); }
