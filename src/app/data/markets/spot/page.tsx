import React from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { getLivePrices, getDexVolume } from '@/lib/api';

export const metadata = {
  title: 'Spot Markets Dashboard | CryptoBrainNews',
  description: 'Live cryptocurrency spot market volumes and exchange dominance.',
};
export const dynamic = 'force-dynamic';

export default async function SpotMarketsPage() {
  // FETCH 100% REAL DATA FROM APIS
  const [prices, dexVolumes] = await Promise.all([
    getLivePrices('usd'),
    getDexVolume()
  ]);

  // 1. Chart Data: Real 7-Day Trajectory for Top Assets (Line Chart)
  const btc = prices.find(p => p.id === 'bitcoin');
  const eth = prices.find(p => p.id === 'ethereum');
  const sol = prices.find(p => p.id === 'solana');
  
  const hourlyTrajectoryData = (btc?.sparkline_in_7d?.price || []).map((price, i) => {
    // Show 1 data point per day for cleaner chart (168 hours / 24 = 7 days)
    if (i % 24 !== 0) return null;
    return {
      date: `Day ${Math.floor(i / 24) + 1}`,
      btc: price,
      eth: eth?.sparkline_in_7d?.price[i] || 0,
      sol: sol?.sparkline_in_7d?.price[i] || 0,
    };
  }).filter(Boolean);

  // 2. Chart Data: Real Top 5 Assets by 24h Volume (Bar Chart)
  const topVolume = [...prices].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);
  const realVolumeData = [{
    date: 'Last 24H',
    ...topVolume.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.total_volume}), {})
  }];
  const volumeSeries = topVolume.map((c, i) => ({
    key: c.symbol, name: c.symbol.toUpperCase(), 
    color: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'][i]
  }));

  // 3. Chart Data: Real DEX Volume Timeline (Area Chart)
  const realDexData = dexVolumes.slice(-30).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  // 4. Chart Data: Real Market Cap Dominance (100% Stacked Area)
  const totalMcap = prices.reduce((sum, p) => sum + p.market_cap, 0);
  const top4Mcap = prices.slice(0, 4);
  const mcapDominanceData = [{
    date: 'Live Market Share',
    ...top4Mcap.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.market_cap}), {}),
    others: totalMcap - top4Mcap.reduce((sum, coin) => sum + coin.market_cap, 0)
  }];
  const mcapSeries = [
    ...top4Mcap.map((c, i) => ({ 
      key: c.symbol, name: c.symbol.toUpperCase(), 
      color: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][i] 
    })),
    { key: 'others', name: 'OTHERS', color: '#64748b' }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden font-sans pb-20">
      
      {/* Header aligned with The Block */}
      <div className="border-b border-[#27272a] pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-1">Data Terminal</h2>
          <h1 className="text-4xl font-normal text-white">Spot Markets</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded text-[10px] font-mono text-green-500 uppercase">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
          Live Network Data
        </div>
      </div>

      {/* Grid of Real Data Dashboards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* CHART 1: Real Daily DEX Volume */}
        <BlockChartCard 
          title="Global DEX Trading Volume (30D)"
          type="area"
          yAxisFormat="currency"
          data={realDexData}
          series={[{ key: 'volume', name: 'Total Volume', color: '#3b82f6' }]}
        />

        {/* CHART 2: Real 7-Day Asset Trajectories */}
        <BlockChartCard 
          title="Major Asset Price Trajectories (7D)"
          type="line"
          yAxisFormat="currency"
          data={hourlyTrajectoryData}
          series={[
            { key: 'btc', name: 'Bitcoin', color: '#f59e0b' },
            { key: 'eth', name: 'Ethereum', color: '#8b5cf6' },
          ]}
        />

        {/* CHART 3: Real 24h Volume by Asset */}
        <BlockChartCard 
          title="24H Trading Volume by Asset"
          type="bar"
          yAxisFormat="currency"
          data={realVolumeData}
          series={volumeSeries}
        />

        {/* CHART 4: Real Market Dominance */}
        <BlockChartCard 
          title="Total Market Cap Dominance"
          type="bar"
          stacked={true}
          expandType="expand"
          yAxisFormat="percent"
          data={mcapDominanceData}
          series={mcapSeries}
        />
      </div>
    </div>
  );
}
