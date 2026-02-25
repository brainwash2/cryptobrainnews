import React from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { getLivePrices, getDexVolume } from '@/lib/api';

export const metadata = {
  title: 'Spot Markets Dashboard | CryptoBrainNews',
};
export const dynamic = 'force-dynamic';

export default async function SpotMarketsPage() {
  // 100% REAL DATA FETCH
  const [prices, dexVolumes] = await Promise.all([
    getLivePrices('usd'),
    getDexVolume()
  ]);

  // 1. Process Real 7-Day Sparkline Data for BTC & ETH
  const btc = prices.find(p => p.id === 'bitcoin');
  const eth = prices.find(p => p.id === 'ethereum');
  const hourlyData = (btc?.sparkline_in_7d?.price || []).map((price, i) => {
    if (i % 24 !== 0) return null; // Sample daily
    return {
      date: `Day ${Math.floor(i / 24) + 1}`,
      btc: price,
      eth: eth?.sparkline_in_7d?.price[i] || 0,
    };
  }).filter(Boolean);

  // 2. Process Real 24h Trading Volume Data (Top 5)
  const topVolume = [...prices].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);
  const volumeData = [{
    date: 'Last 24H Volume',
    ...topVolume.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.total_volume}), {})
  }];
  const volumeSeries = topVolume.map((c, i) => ({
    key: c.symbol, name: c.symbol.toUpperCase(), 
    color: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'][i]
  }));

  // 3. Process Real DefiLlama DEX Volume
  const realDexData = dexVolumes.slice(-30).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  return (
    <div className="space-y-6 max-w-full overflow-hidden font-sans pb-20 mt-10 lg:mt-0">
      
      <div className="border-b border-[#27272a] pb-4 mb-6">
        <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-1">Data Terminal</h2>
        <h1 className="text-4xl font-normal text-white">Spot Markets</h1>
      </div>

      {/* Grid of Real Data Dashboards (Loads Instantly) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        <BlockChartCard 
          title="BTC & ETH Trajectory (7 Days)" type="line" yAxisFormat="currency" data={hourlyData}
          series={[
            { key: 'btc', name: 'Bitcoin', color: '#f59e0b' },
            { key: 'eth', name: 'Ethereum', color: '#3b82f6' },
          ]}
        />

        <BlockChartCard 
          title="24H Global Exchange Volume by Asset" type="bar" yAxisFormat="currency" data={volumeData} series={volumeSeries}
        />

        <BlockChartCard 
          title="Global DEX Trading Volume (30 Days)" type="bar" yAxisFormat="currency" data={realDexData}
          series={[{ key: 'volume', name: 'DEX Volume', color: '#8b5cf6' }]}
        />
        
      </div>
    </div>
  );
}
