import React from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { getLivePrices, getDexVolume } from '@/lib/api';

export const metadata = { title: 'Spot Markets Dashboard | CryptoBrainNews' };
export const dynamic = 'force-dynamic';

export default async function SpotMarketsPage() {
  // 1. THIS IS 100% REAL LIVE DATA FROM YOUR APIS
  const [prices, dexVolumes] = await Promise.all([
    getLivePrices('usd'),
    getDexVolume()
  ]);

  // Transform Data: 7-Day Asset Trajectories
  const btc = prices.find(p => p.id === 'bitcoin');
  const eth = prices.find(p => p.id === 'ethereum');
  const hourlyData = (btc?.sparkline_in_7d?.price || []).map((price, i) => {
    if (i % 24 !== 0) return null;
    return { date: `Day ${Math.floor(i / 24) + 1}`, btc: price, eth: eth?.sparkline_in_7d?.price[i] || 0 };
  }).filter(Boolean);

  // Transform Data: Live 24H Volume (Top 5)
  const topVolume = [...prices].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);
  const volumeData = [{
    date: 'Last 24H',
    ...topVolume.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.total_volume}), {})
  }];
  const volumeSeries = topVolume.map((c, i) => ({
    key: c.symbol, name: c.symbol.toUpperCase(), color: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'][i]
  }));

  // Transform Data: Real 30D DEX Volume
  const realDexData = dexVolumes.slice(-30).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  // Transform Data: Real Live Market Cap Dominance
  const totalMcap = prices.reduce((sum, p) => sum + p.market_cap, 0);
  const top4Mcap = prices.slice(0, 4);
  const mcapDominanceData = [{
    date: 'Live Market Share',
    ...top4Mcap.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.market_cap}), {}),
    others: totalMcap - top4Mcap.reduce((sum, coin) => sum + coin.market_cap, 0)
  }];
  const mcapSeries = [
    ...top4Mcap.map((c, i) => ({ key: c.symbol, name: c.symbol.toUpperCase(), color: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][i] })),
    { key: 'others', name: 'OTHERS', color: '#3f3f46' }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden font-sans pb-20 mt-4 lg:mt-0">
      
      <div className="border-b border-[#27272a] pb-4 mb-6">
        <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-1">Data Terminal</h2>
        <h1 className="text-4xl font-normal text-white">Spot Markets</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-10">
        
        {/* REAL CHART 1: 30D DEX Volume */}
        <BlockChartCard 
          title="Daily Global DEX Volume (30D)" type="area" yAxisFormat="currency" data={realDexData}
          series={[{ key: 'volume', name: 'Volume', color: '#3b82f6' }]}
        />

        {/* REAL CHART 2: Market Cap Dominance */}
        <BlockChartCard 
          title="Live Market Cap Dominance" type="bar" stacked expandType="expand" yAxisFormat="percent" data={mcapDominanceData} series={mcapSeries}
        />

        {/* REAL CHART 3: 7D Price Trajectory */}
        <BlockChartCard 
          title="BTC & ETH Trajectories (7D)" type="line" yAxisFormat="currency" data={hourlyData}
          series={[{ key: 'btc', name: 'BTC', color: '#f59e0b' }, { key: 'eth', name: 'ETH', color: '#3b82f6' }]}
        />

        {/* REAL CHART 4: Top 24H Volume */}
        <BlockChartCard 
          title="Top 5 Assets by 24H Volume" type="bar" yAxisFormat="currency" data={volumeData} series={volumeSeries}
        />

      </div>
    </div>
  );
}
