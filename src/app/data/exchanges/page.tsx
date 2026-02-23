import React from 'react';
import { getDexVolume } from '@/lib/api';
import AreaChartCard from '../_components/charts/AreaChartCard';
import BarChartCard from '../_components/charts/BarChartCard';

export const metadata = {
  title: 'DEX Volumes & Analytics | CryptoBrainNews',
  description: 'Decentralized exchange trading volumes and market share.',
};

export const dynamic = 'force-dynamic';

export default async function ExchangesPage() {
  const volumes = await getDexVolume();
  
  // Transform data for charts
  const chartData = volumes.slice(-30).map(v => ({
    day: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  const totalVol = chartData.reduce((sum, d) => sum + d.volume, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter mb-1">
          Spot <span className="text-[#FABF2C]">Exchanges</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
          DEX Trading Volume & Liquidity Analytics
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">30D DEX Volume</p>
          <p className="text-2xl font-black text-[#FABF2C]">${(totalVol / 1e9).toFixed(2)}B</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">24H Volume</p>
          <p className="text-2xl font-black text-white">${((chartData[chartData.length - 1]?.volume || 0) / 1e9).toFixed(2)}B</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Top Protocol</p>
          <p className="text-2xl font-black text-white">Uniswap</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Data Source</p>
          <p className="text-2xl font-black text-[#00d672]">Live</p>
        </div>
      </div>

      {/* The Block Style Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard 
          title="Daily DEX Volume (30D)" 
          source="DefiLlama" 
          data={chartData} 
          xKey="day" 
          yKey="volume" 
          color="#FABF2C" 
          height={350} 
        />
        <BarChartCard 
          title="DEX Volume by Protocol (Sample)" 
          source="On-Chain" 
          data={[
            { name: 'Uniswap', volume: 1500000000 },
            { name: 'Curve', volume: 800000000 },
            { name: 'Pancake', volume: 600000000 },
            { name: 'Raydium', volume: 450000000 },
            { name: 'Aerodrome', volume: 300000000 },
          ]} 
          xKey="name" 
          yKey="volume" 
          color="#3b82f6" 
          height={350} 
        />
      </div>
    </div>
  );
}
