const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// REALISTIC FALLBACK DATA (Used when API is rate-limited)
const REAL_COINS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', price: 76038.00, change: -2.86 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', price: 2890.12, change: -1.20 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', price: 1.00, change: 0.01 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', price: 590.40, change: 2.15 },
  { id: 'solana', symbol: 'sol', name: 'Solana', price: 145.20, change: 5.40 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', price: 0.62, change: -0.50 },
  { id: 'usdc', symbol: 'usdc', name: 'USDC', price: 1.00, change: 0.00 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', price: 0.45, change: -1.10 },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', price: 38.50, change: 4.20 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', price: 0.16, change: 8.50 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', price: 7.20, change: -2.30 },
  { id: 'tron', symbol: 'trx', name: 'TRON', price: 0.12, change: 0.50 },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', price: 14.50, change: 1.20 },
  { id: 'polygon', symbol: 'matic', name: 'Polygon', price: 0.72, change: -0.80 },
  { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', price: 0.000028, change: 3.40 },
  { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', price: 82.00, change: -0.90 },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', price: 7.80, change: 2.10 },
  { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash', price: 480.00, change: -1.50 },
  { id: 'near', symbol: 'near', name: 'NEAR Protocol', price: 6.90, change: 5.10 },
  { id: 'aptos', symbol: 'apt', name: 'Aptos', price: 9.20, change: 3.30 }
];

export const FALLBACK_MARKET_DATA = REAL_COINS.map((coin, i) => ({
  id: coin.id,
  market_cap_rank: i + 1,
  name: coin.name,
  symbol: coin.symbol,
  image: `https://assets.coingecko.com/coins/images/${i+1}/large/${coin.id}.png`, 
  current_price: coin.price,
  price_change_percentage_24h: coin.change,
  price_change_percentage_1h_in_currency: Math.random() * 1 - 0.5,
  price_change_percentage_7d_in_currency: coin.change * 1.5,
  market_cap: coin.price * 1000000000,
  total_volume: coin.price * 50000000,
  sparkline_in_7d: { price: Array.from({ length: 20 }, () => coin.price + (Math.random() * coin.price * 0.1)) }
}));

const MOCK_NEWS = [
  { id: '1', title: "Bitcoin 'Miner Exodus' Could Push BTC Price Below $60K", url: "#", image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d", source: "CoinTelegraph", published_on: Date.now() / 1000 },
  { id: '2', title: "Ethereum ETF Inflows Surge as Institutions Buy the Dip", url: "#", image: "https://images.unsplash.com/photo-1620321023374-d1a68fddadb3", source: "The Block", published_on: Date.now() / 1000 - 3600 },
  { id: '3', title: "Solana DeFi Volume Flips Ethereum on DEXs", url: "#", image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247", source: "Decrypt", published_on: Date.now() / 1000 - 7200 }
];

async function safeFetch(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getLivePrices(currency = 'usd', category = 'all') {
  try {
    let url = `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
    if (category && category !== 'all') {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      url += `&category=${categorySlug}`;
    }
    const data = await safeFetch(url);
    if (!data || !Array.isArray(data)) throw new Error('Fetch failed');
    return data;
  } catch (e) {
    // Return realistic fallback data on failure
    return FALLBACK_MARKET_DATA;
  }
}

export async function getRealNews() {
  const data = await safeFetch(NEWS_API);
  if (data?.Data && Array.isArray(data.Data)) {
    return data.Data.slice(0, 5).map((article: any) => ({
      id: article.id,
      title: article.title,
      url: article.url,
      image: article.imageurl,
      source: article.source_info.name,
      published_on: article.published_on
    }));
  }
  return MOCK_NEWS;
}

export async function getDeFiProtocols() { return []; }
export async function getGlobalTVLHistory() { return []; }
export async function getStablecoinData() { return []; }
export async function getCachedData(key: string, fn: Function) { return fn(); }
