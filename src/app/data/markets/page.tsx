import React from 'react';
import { getLivePrices } from '@/lib/api';
import AreaChartCard from '../_components/charts/AreaChartCard';

export const metadata = {
  title: 'Markets Terminal | CryptoBrainNews',
  description: 'Global crypto market data, charts, and metrics.',
};

export const dynamic = 'force-dynamic';

export default async function MarketsPage() {
  const prices = await getLivePrices();
  
  // Format sparkline data for Recharts
  const formatChartData = (sparkline: number[]) => {
    return sparkline.map((price, index) => ({
      hour: index,
      price: price
    }));
  };

  const topAssets = prices.slice(0, 6).filter(p => p.sparkline_in_7d?.price);
  const globalMcap = prices.reduce((sum, p) => sum + (p.market_cap || 0), 0);
  const globalVol = prices.reduce((sum, p) => sum + (p.total_volume || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter mb-1 flex items-center gap-3">
          Markets <span className="text-[#FABF2C]">Terminal</span>
          <span className="text-[9px] font-mono bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE
          </span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
          Global Macro & 7D Asset Trajectories
        </p>
      </div>

      {/* Global Macros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Total Market Cap</p>
          <p className="text-2xl font-black text-[#FABF2C]">${(globalMcap / 1e12).toFixed(2)}T</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">24h Volume</p>
          <p className="text-2xl font-black text-white">${(globalVol / 1e9).toFixed(1)}B</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Assets Tracked</p>
          <p className="text-2xl font-black text-white">{prices.length}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Data Source</p>
          <p className="text-2xl font-black text-[#FABF2C]">CoinGecko API</p>
        </div>
      </div>

      {/* The Block Style Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topAssets.map(asset => {
          const chartData = formatChartData(asset.sparkline_in_7d!.price);
          const isPos = (asset.price_change_percentage_7d || 0) >= 0;
          const color = isPos ? '#00d672' : '#ff4757';

          return (
            <div key={asset.id} className="relative">
              {/* Overlay Meta */}
              <div className="absolute top-6 right-6 z-10 text-right">
                <p className="text-sm font-black text-white">${asset.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className={`text-[10px] font-mono font-bold ${isPos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                  {isPos ? '+' : ''}{asset.price_change_percentage_7d?.toFixed(2)}% (7D)
                </p>
              </div>
              <AreaChartCard 
                title={`${asset.name} (${asset.symbol.toUpperCase()})`} 
                data={chartData} 
                xKey="hour" 
                yKey="price" 
                color={color} 
                height={280} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
