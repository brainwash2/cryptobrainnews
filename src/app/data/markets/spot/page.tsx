import React from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { getLivePrices, getDexVolume } from '@/lib/api';

export const metadata = { title: 'Spot Markets Dashboard | CryptoBrainNews' };
export const dynamic = 'force-dynamic';

const colors = {
  binance: '#f59e0b', coinbase: '#3b82f6', upbit: '#10b981', kraken: '#8b5cf6', 
  others: '#ef4444', usdt: '#10b981', usdc: '#2563eb', gray: '#3f3f46'
};

export default async function SpotMarketsPage() {
  const [prices, dexVolumes] = await Promise.all([
    getLivePrices('usd'),
    getDexVolume()
  ]);

  // 1. BTC & ETH Trajectory (Dual Axis + Smoothed)
  const btc = prices.find(p => p.id === 'bitcoin');
  const eth = prices.find(p => p.id === 'ethereum');
  const hourlyData = (btc?.sparkline_in_7d?.price ||[]).map((price, i) => {
    // Take every 6th data point to smooth the curve
    if (i % 6 !== 0) return null; 
    return { 
      date: `Day ${Math.floor(i / 24) + 1}`, 
      btc: price, 
      eth: eth?.sparkline_in_7d?.price[i] || 0 
    };
  }).filter(Boolean);

  // 2. Volume Dominance (Stacked Bar)
  const topVolume = [...prices].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);
  const volumeData = [{
    date: 'Last 24H',
    ...topVolume.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.total_volume}), {})
  }];
  const volumeSeries = topVolume.map((c, i) => ({
    key: c.symbol, name: c.symbol.toUpperCase(), color: Object.values(colors)[i]
  }));

  // 3. DEX Volume (Area with Gradient)
  const realDexData = dexVolumes.slice(-30).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  // 4. Market Cap Share (100% Stacked Area)
  const totalMcap = prices.reduce((sum, p) => sum + p.market_cap, 0);
  const top4Mcap = prices.slice(0, 4);
  const mcapDominanceData = [{
    date: 'Live Share',
    ...top4Mcap.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.market_cap}), {}),
    others: totalMcap - top4Mcap.reduce((sum, coin) => sum + coin.market_cap, 0)
  }];
  const mcapSeries = [
    ...top4Mcap.map((c, i) => ({ key: c.symbol, name: c.symbol.toUpperCase(), color: Object.values(colors)[i] })),
    { key: 'others', name: 'OTHERS', color: colors.gray }
  ];

  return (
    <div className="space-y-8 max-w-full overflow-hidden font-sans pb-20 mt-6 lg:mt-0">
      
      <div className="border-b border-[#27272a] pb-6 mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            Data Terminal <span className="text-[#3f3f46]">/</span> Markets
          </h2>
          <h1 className="text-4xl lg:text-5xl font-normal text-white tracking-tight">Spot</h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded-sm text-[10px] font-mono text-green-500 uppercase self-start md:self-auto">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
          Live Network Data
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
        
        <BlockChartCard 
          title="Daily Global DEX Volume (30D)" 
          type="area" 
          yAxisFormat="currency" 
          data={realDexData}
          series={[{ key: 'volume', name: 'Global Volume', color: '#3b82f6' }]}
          description="Total decentralized exchange volume aggregated across all major chains."
        />

        <BlockChartCard 
          title="Market Cap Dominance (Live)" 
          type="bar" 
          stacked 
          expandType="expand" 
          yAxisFormat="percent" 
          data={mcapDominanceData} 
          series={mcapSeries}
          description="Relative market capitalization share of top assets vs the rest of the market."
        />

        <BlockChartCard 
          title="BTC vs ETH Price Trajectory (7D)" 
          type="line" 
          yAxisFormat="currency" 
          data={hourlyData}
          series={[
            { key: 'btc', name: 'Bitcoin', color: '#f59e0b' }, 
            { key: 'eth', name: 'Ethereum', color: '#3b82f6' }
          ]}
          description="Comparative price performance over the last week. Dual-axis scaling applied."
        />

        <BlockChartCard 
          title="Top Assets by 24H Volume" 
          type="bar" 
          yAxisFormat="currency" 
          data={volumeData} 
          series={volumeSeries}
          description="Nominal trading volume across centralized and decentralized venues."
        />

      </div>
    </div>
  );
}
