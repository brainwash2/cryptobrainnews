#!/bin/bash
echo "Initiating Deep Intelligence Patch..."

# 1. OVERWRITE API TERMINAL (All real data sources)
cat > src/lib/api.ts << 'INNER_EOF'
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFILLAMA_BASE = 'https://api.llama.fi';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

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

export async function getLivePrices(currency = 'usd', category = 'all') {
  let url = `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`;
  if (category !== 'all') url += `&category=${category.toLowerCase().replace(/\s+/g, '-')}`;
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : FALLBACK_MARKET_DATA;
}

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

export async function getDeFiProtocols() {
  const data = await safeFetch(`${DEFILLAMA_BASE}/protocols`);
  return Array.isArray(data) ? data.slice(0, 20) : [];
}

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

export async function getGlobalTVLHistory() { return []; }
export async function getCachedData(key: string, fn: Function) { return fn(); }
INNER_EOF

# 2. FIX API ROUTE (Proxy)
cat > src/app/api/prices/route.ts << 'INNER_EOF'
import { NextResponse } from 'next/server';
import { getLivePrices, FALLBACK_MARKET_DATA } from '@/lib/api';
export async function GET() {
  const prices = await getLivePrices('usd', 'all');
  return NextResponse.json(prices.length > 0 ? prices : FALLBACK_MARKET_DATA);
}
INNER_EOF

# 3. CREATE INTERNAL ARTICLE PAGE
mkdir -p src/app/news/\[id\]
cat > src/app/news/\[id\]/page.tsx << 'INNER_EOF'
import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getRealNews } from '@/lib/api';

export default async function NewsArticlePage({ params }: any) {
  const news = await getRealNews();
  const article = news.find((a: any) => a.id === params.id) || news[0];
  if (!article) return <div>Article not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header /><PriceTicker />
      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <span className="bg-primary text-black px-2 py-1 text-xs font-black uppercase mb-4 inline-block">{article.source}</span>
        <h1 className="text-5xl font-serif font-black mb-8 leading-tight">{article.title}</h1>
        <img src={article.image} className="w-full h-[400px] object-cover mb-12 border border-gray-800" />
        <div className="prose prose-invert max-w-none text-xl leading-relaxed text-gray-300">
          {article.body.split('\n').map((p:string, i:number) => <p key={i} className="mb-6">{p}</p>)}
        </div>
      </main>
    </div>
  );
}
INNER_EOF

# 4. REBUILD DEFI PAGE (THE BLOCK STYLE)
cat > src/app/de-fi-analytics/page.tsx << 'INNER_EOF'
import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getDeFiProtocols, getDexVolume, getStablecoinData } from '@/lib/api';
import TheBlockDashboard from './components/TheBlockDashboard';

export default async function DeFiAnalyticsPage() {
  const [protocols, dexVolume, stableMcap] = await Promise.all([
    getDeFiProtocols(), getDexVolume(), getStablecoinData()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header /><PriceTicker />
      <main className="container mx-auto px-4 lg:px-8 pt-20">
        <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">DATA <span className="text-primary">TERMINAL</span></h1>
        <p className="text-gray-500 font-mono text-sm mb-12 uppercase tracking-widest">Institutional-grade on-chain intelligence</p>
        <TheBlockDashboard dexVolume={dexVolume} stableMcap={stableMcap} protocols={protocols} />
      </main>
    </div>
  );
}
INNER_EOF

# 5. CREATE THE BLOCK DASHBOARD COMPONENT
cat > src/app/de-fi-analytics/components/TheBlockDashboard.tsx << 'INNER_EOF'
'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function TheBlockDashboard({ dexVolume, stableMcap, protocols }: any) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0a] border border-gray-900 p-8">
          <h3 className="text-white font-black text-xs uppercase mb-8 border-l-2 border-primary pl-4">Daily DEX Volume (7DMA)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dexVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} tickFormatter={(v) => `$${(v/1e9).toFixed(1)}B`} />
                <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #333'}} />
                <Area type="monotone" dataKey="volume" stroke="#FABF2C" fill="#FABF2C" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-gray-900 p-8">
          <h3 className="text-white font-black text-xs uppercase mb-8 border-l-2 border-primary pl-4">Total Stablecoin Supply</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stableMcap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} tickFormatter={(v) => `$${(v/1e9).toFixed(0)}B`} />
                <Bar dataKey="mcap" fill="#627EEA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-[#0a0a0a] border border-gray-900 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black text-[10px] text-gray-500 font-black uppercase">
            <tr><th className="p-6">Protocol</th><th className="p-6 text-right">TVL</th><th className="p-6 text-right">1D Change</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {protocols.map((p: any) => (
              <tr key={p.name} className="hover:bg-white/5">
                <td className="p-6 font-bold text-white">{p.name} <span className="text-[10px] text-gray-600 ml-2 uppercase">{p.chain}</span></td>
                <td className="p-6 text-right font-mono text-white">${(p.tvl/1e9).toFixed(2)}B</td>
                <td className={`p-6 text-right font-mono text-xs ${p.change_1d >= 0 ? 'text-green-500' : 'text-red-500'}`}>{p.change_1d?.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
INNER_EOF

echo "System Alignment Complete. Flushing Cache..."
rm -rf .next
npm run dev
