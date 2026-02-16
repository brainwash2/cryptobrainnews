import React from 'react';
import { getLivePrices, getCexVolume, getDexVolume } from '@/lib/api';
import { MetricCard } from '../_components/MetricCard';
import AreaChartCard from '../_components/charts/AreaChartCard';
import BarChartCard from '../_components/charts/BarChartCard';
import DataTable from '../_components/charts/DataTable';

export const metadata = { title: 'Markets Overview | CryptoBrainNews' };

export default async function MarketsPage() {
  // Parallel fetch
  const [prices, cexVolume, dexVolume] = await Promise.all([
    getLivePrices(),
    getCexVolume(),
    getDexVolume(),
  ]);

  const btc = prices.find((c) => c.symbol === 'btc');
  const eth = prices.find((c) => c.symbol === 'eth');
  const sol = prices.find((c) => c.symbol === 'sol');

  // Format data for charts
  const topGainers = [...prices].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 1. Header Metrics (Like The Block's ticker) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="BTC Price" value={`$${btc?.current_price.toLocaleString()}`} trend={btc?.price_change_percentage_24h || 0} />
        <MetricCard label="ETH Price" value={`$${eth?.current_price.toLocaleString()}`} trend={eth?.price_change_percentage_24h || 0} />
        <MetricCard label="SOL Price" value={`$${sol?.current_price.toLocaleString()}`} trend={sol?.price_change_percentage_24h || 0} />
        <MetricCard label="CEX Vol (24h)" value={`$${(cexVolume[cexVolume.length-1]?.volume / 1e9).toFixed(2)}B`} />
        <MetricCard label="DEX Vol (24h)" value={`$${(dexVolume[dexVolume.length-1]?.volume / 1e9).toFixed(2)}B`} />
      </div>

      {/* 2. "The Block" Style Grid (3 Columns) */}
      <h2 className="text-xl font-black text-white uppercase tracking-widest border-b border-[#333] pb-4">
        Market Activity
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Spot Volume */}
        <div className="lg:col-span-2">
           <BarChartCard 
              title="Spot Exchange Volume" 
              subtitle="Daily volume across major CEXs (Binance, Coinbase, OKX)"
              source="DefiLlama"
              data={cexVolume} 
              xKey="date" 
              yKey="volume" 
              height={350} 
            />
        </div>

        {/* Chart 2: DEX vs CEX */}
        <div className="lg:col-span-1">
           <AreaChartCard 
              title="DEX Volume Trend" 
              subtitle="Decentralized Exchange Activity"
              source="DefiLlama"
              data={dexVolume} 
              xKey="date" 
              yKey="volume" 
              color="#ff4757"
              height={350} 
            />
        </div>
      </div>

      {/* 3. Asset Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
          <div className="p-4 border-b border-[#1a1a1a]">
            <h3 className="text-white font-bold uppercase text-xs tracking-widest">Top Gainers (24h)</h3>
          </div>
          <DataTable 
            columns={[
              { key: 'rank', label: '#' },
              { key: 'name', label: 'Asset' },
              { key: 'price', label: 'Price', align: 'right' },
              { key: 'change', label: '24h', align: 'right' },
            ]}
            rows={topGainers.map((c, i) => ({
              rank: i + 1,
              name: c.symbol.toUpperCase(),
              price: `$${c.current_price}`,
              change: `${c.price_change_percentage_24h?.toFixed(2)}%`
            }))}
          />
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
          <div className="p-4 border-b border-[#1a1a1a]">
            <h3 className="text-white font-bold uppercase text-xs tracking-widest">Market Leaders</h3>
          </div>
          <DataTable 
            columns={[
              { key: 'name', label: 'Asset' },
              { key: 'mcap', label: 'Market Cap', align: 'right' },
              { key: 'vol', label: 'Volume (24h)', align: 'right' },
            ]}
            rows={prices.slice(0, 5).map((c) => ({
              name: c.name,
              mcap: `$${(c.market_cap / 1e9).toFixed(2)}B`,
              vol: `$${(c.total_volume / 1e9).toFixed(2)}B`,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
