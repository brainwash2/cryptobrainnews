import React from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { getLivePrices, getDexVolume } from '@/lib/api';

export const metadata = { title: 'Spot Markets Dashboard | CryptoBrainNews' };
export const dynamic = 'force-dynamic';

const colors = {
  binance: '#f59e0b', coinbase: '#3b82f6', upbit: '#10b981', kraken: '#8b5cf6', 
  others: '#ef4444', usdt: '#10b981', usdc: '#3b82f6', gray: '#3f3f46'
};

export default async function SpotMarketsPage() {
  const [prices, dexVolumes] = await Promise.all([
    getLivePrices('usd'),
    getDexVolume()
  ]);

  // 1. 7D Trajectory (Fixed Flat Line Issue)
  const btc = prices.find(p => p.id === 'bitcoin');
  const eth = prices.find(p => p.id === 'ethereum');
  const hourlyData = (btc?.sparkline_in_7d?.price ||[]).map((price, i) => {
    if (i % 6 !== 0) return null; // Sample every 6 hours for smoother curve
    return { 
      date: `Hr ${i}`, 
      btc: price, 
      eth: eth?.sparkline_in_7d?.price[i] || 0 
    };
  }).filter(Boolean);

  // 2. 24H Volume Stacked
  const topVolume = [...prices].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);
  const volumeData =[{
    date: 'Last 24H',
    ...topVolume.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.total_volume}), {})
  }];
  const volumeSeries = topVolume.map((c, i) => ({
    key: c.symbol, name: c.symbol.toUpperCase(), color: Object.values(colors)[i]
  }));

  // 3. 30D DEX Volume
  const realDexData = dexVolumes.slice(-30).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  // 4. Market Cap Dominance
  const totalMcap = prices.reduce((sum, p) => sum + p.market_cap, 0);
  const top4Mcap = prices.slice(0, 4);
  const mcapDominanceData =[{
    date: 'Live Market Share',
    ...top4Mcap.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.market_cap}), {}),
    others: totalMcap - top4Mcap.reduce((sum, coin) => sum + coin.market_cap, 0)
  }];
  const mcapSeries =[
    ...top4Mcap.map((c, i) => ({ key: c.symbol, name: c.symbol.toUpperCase(), color: Object.values(colors)[i] })),
    { key: 'others', name: 'OTHERS', color: colors.gray }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden font-sans pb-20 pt-6 lg:pt-0">
      
      <div className="border-b border-[#27272a] pb-6 mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            Data Terminal <span className="text-[#3f3f46]">/</span> Markets
          </h2>
          <h1 className="text-4xl lg:text-5xl font-normal text-white tracking-tight">Spot</h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded text-[10px] font-mono text-green-500 uppercase self-start md:self-auto">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
          Live APIs Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
        
        <BlockChartCard 
          title="Daily Global DEX Volume (30D)" type="area" yAxisFormat="currency" data={realDexData}
          series={[{ key: 'volume', name: 'Volume', color: colors.coinbase }]}
        />

        <BlockChartCard 
          title="Market Cap Dominance" type="area" stacked expandType="expand" yAxisFormat="percent" data={mcapDominanceData} series={mcapSeries}
        />

        <BlockChartCard 
          title="BTC & ETH Trajectories (7D)" type="line" yAxisFormat="currency" data={hourlyData}
          series={[{ key: 'btc', name: 'Bitcoin', color: colors.binance }, { key: 'eth', name: 'Ethereum', color: colors.kraken }]}
        />

        <BlockChartCard 
          title="Top Assets by 24H Volume" type="bar" yAxisFormat="currency" data={volumeData} series={volumeSeries}
        />

      </div>
    </div>
  );
}
