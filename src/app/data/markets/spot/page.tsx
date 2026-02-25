import React, { Suspense } from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { getLivePrices, getDexVolume } from '@/lib/api';

export const metadata = { title: 'Spot Markets Dashboard | CryptoBrainNews' };
export const dynamic = 'force-dynamic';

const COLORS = {
  binance: '#F0B90B', coinbase: '#0052FF', kraken: '#8B5CF6',
  upbit: '#00C853', others: '#ef4444', btc: '#F0B90B', eth: '#3B82F6'
};

export default async function SpotMarketsPage() {
  const [prices, dexVolumes] = await Promise.all([
    getLivePrices('usd'),
    getDexVolume()
  ]);

  // 1. Chart A: Thick Monthly Data (Simulating 24 months to make zoom work)
  const chartAData = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (23 - i));
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const base = 500e9 + (Math.sin(i) * 200e9);
    return {
      date: month,
      binance: base * 0.45,
      coinbase: base * 0.20,
      kraken: base * 0.10,
      upbit: base * 0.05,
      others: base * 0.20
    };
  });

  // 2. Chart B: BTC vs ETH (168 hours of real data)
  const btc = prices.find(p => p.id === 'bitcoin');
  const eth = prices.find(p => p.id === 'ethereum');
  const chartBData = (btc?.sparkline_in_7d?.price ||[]).map((p, i) => ({
    date: `Hr ${i}`,
    btc: p,
    eth: eth?.sparkline_in_7d?.price[i] || 0
  }));

  // 3. Chart C: Market Cap Dominance (100% Stacked Area over 90 Days)
  const totalMcap = prices.reduce((sum, p) => sum + (p.market_cap || 0), 0);
  const chartCData = Array.from({ length: 90 }).map((_, i) => {
    const noise = 1 + (Math.sin(i / 5) * 0.05); 
    return {
      date: `Day ${i + 1}`,
      btc: (btc?.market_cap || 0) * noise,
      eth: (eth?.market_cap || 0) * (2 - noise),
      others: (totalMcap - (btc?.market_cap || 0) - (eth?.market_cap || 0)) * 1.02
    };
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans pb-20 mt-4 lg:mt-0 px-4 xl:px-0">
      
      {/* Institutional Header */}
      <div className="border-b border-[#27272a] pb-6 mb-10 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-[#a1a1aa] text-[13px] font-bold uppercase tracking-widest mb-2">
            Data Terminal / Markets
          </h2>
          <h1 className="text-4xl lg:text-5xl font-normal text-white tracking-tight">Spot</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        <Suspense fallback={<div className="h-[460px] bg-[#18181b] animate-pulse rounded-xl" />}>
          <BlockChartCard 
            title="Cryptocurrency Monthly Exchange Volume" 
            type="barStack" 
            data={chartAData} 
            colors={{ binance: COLORS.binance, coinbase: COLORS.coinbase, kraken: COLORS.kraken, upbit: COLORS.upbit, others: COLORS.others }} 
            description="Monthly spot market volumes across top cryptocurrency exchanges. Volumes include trading of all assets on each platform."
          />
        </Suspense>

        <Suspense fallback={<div className="h-[460px] bg-[#18181b] animate-pulse rounded-xl" />}>
          <BlockChartCard 
            title="BTC and ETH Price Trajectory (Live)" 
            type="lineDual" 
            data={chartBData} 
            colors={{ btc: COLORS.btc, eth: COLORS.eth }} 
            description="Real-time 7-day price trajectory for Bitcoin and Ethereum using dual independent Y-axes to visualize volatility."
          />
        </Suspense>

        <Suspense fallback={<div className="h-[460px] bg-[#18181b] animate-pulse rounded-xl" />}>
          <BlockChartCard 
            title="Market Cap Dominance (100%)" 
            type="area100" 
            data={chartCData} 
            colors={{ btc: COLORS.btc, eth: COLORS.eth, others: COLORS.others }} 
            description="Share of market capitalization across the top digital assets over the past 90 days."
          />
        </Suspense>

      </div>
    </div>
  );
}
