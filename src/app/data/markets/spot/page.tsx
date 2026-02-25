import React from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { getLivePrices, getDexVolume } from '@/lib/api';

export const metadata = { title: 'Spot Markets Dashboard | CryptoBrainNews' };
export const dynamic = 'force-dynamic';

const colors = {
  binance: '#f59e0b', coinbase: '#3b82f6', kraken: '#8b5cf6',
  upbit: '#10b981', others: '#ef4444', gray: '#3f3f46'
};

export default async function SpotMarketsPage() {
  // Fetch real data simultaneously
  const [prices, dexVolumes] = await Promise.all([
    getLivePrices('usd'),
    getDexVolume()
  ]);

  // --- Transform Real Data for 6 Charts --- //

  // 1. 7-Day Line Chart (BTC vs ETH)
  const btc = prices.find(p => p.id === 'bitcoin');
  const eth = prices.find(p => p.id === 'ethereum');
  const hourlyData = (btc?.sparkline_in_7d?.price || []).map((price, i) => {
    if (i % 24 !== 0) return null;
    return { date: `Day ${Math.floor(i / 24) + 1}`, btc: price, eth: eth?.sparkline_in_7d?.price[i] || 0 };
  }).filter(Boolean);

  // 2. 24H Volume Bar Chart (Top 5 Assets)
  const topVolume = [...prices].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);
  const volumeData = [{
    date: 'Last 24H',
    ...topVolume.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.total_volume}), {})
  }];
  const volumeSeries = topVolume.map((c, i) => ({
    key: c.symbol, name: c.symbol.toUpperCase(), color: Object.values(colors)[i]
  }));

  // 3. 30D DEX Volume Area Chart
  const realDexData = dexVolumes.slice(-30).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  // 4. Market Cap Dominance (Stacked Area)
  const totalMcap = prices.reduce((sum, p) => sum + p.market_cap, 0);
  const top4Mcap = prices.slice(0, 4);
  const mcapDominanceData = [{
    date: 'Live Market Share',
    ...top4Mcap.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.market_cap}), {}),
    others: totalMcap - top4Mcap.reduce((sum, coin) => sum + coin.market_cap, 0)
  }];
  const mcapSeries = [
    ...top4Mcap.map((c, i) => ({ key: c.symbol, name: c.symbol.toUpperCase(), color: Object.values(colors)[i] })),
    { key: 'others', name: 'OTHERS', color: colors.gray }
  ];

  // 5. Stablecoin Comparison (Stacked Bar)
  const stablecoins = prices.filter(p => ['usdt', 'usdc', 'dai', 'fdusd'].includes(p.symbol.toLowerCase()));
  const stableData = [{
    date: 'Total Supply',
    ...stablecoins.reduce((acc, coin) => ({...acc, [coin.symbol]: coin.market_cap}), {})
  }];
  const stableSeries = stablecoins.map((c, i) => ({
    key: c.symbol, name: c.symbol.toUpperCase(), color: [colors.coinbase, colors.upbit, colors.binance, colors.others][i]
  }));

  // 6. Top Gainers vs Losers (Diverging Bar)
  const topGainers = [...prices].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 3);
  const topLosers = [...prices].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 3);
  const volatilityData = [...topGainers, ...topLosers].map(c => ({
    date: c.symbol.toUpperCase(),
    change: c.price_change_percentage_24h
  }));

  return (
    <div className="space-y-6 max-w-full overflow-hidden font-sans pb-20 mt-6 lg:mt-0">
      
      {/* Top Header */}
      <div className="border-b border-[#27272a] pb-6 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            Data Terminal <span className="text-[#3f3f46]">/</span> Markets
          </h2>
          <h1 className="text-4xl lg:text-5xl font-normal text-white tracking-tight">Spot</h1>
        </div>
      </div>

      {/* Grid of 6 Real Dashboards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-10">
        
        <BlockChartCard 
          title="Daily Exchange Volume (7DMA)" type="area" yAxisFormat="currency" data={realDexData}
          series={[{ key: 'volume', name: 'Global Volume', color: '#3b82f6' }]}
          description="Spot market total volume across decentralized exchanges using a 7-day moving average."
        />

        <BlockChartCard 
          title="BTC and ETH Trajectories (7D)" type="line" yAxisFormat="currency" data={hourlyData}
          series={[{ key: 'btc', name: 'BTC', color: '#f59e0b' }, { key: 'eth', name: 'ETH', color: '#3b82f6' }]}
          description="Price performance of top digital assets over the past 168 hours."
        />

        <BlockChartCard 
          title="Monthly Exchange Volume Market Share" type="area" stacked expandType="expand" yAxisFormat="percent" data={mcapDominanceData} series={mcapSeries}
          description="Share of market capitalization across top tier digital assets."
        />

        <BlockChartCard 
          title="Top Assets by 24H Trading Volume" type="bar" yAxisFormat="currency" data={volumeData} series={volumeSeries}
          description="Global 24-hour trading volume denomination across the top 5 liquid assets."
        />

        <BlockChartCard 
          title="USD Support Stablecoin Volume" type="bar" stacked yAxisFormat="currency" data={stableData} series={stableSeries}
          description="Total circulating supply of major USD-pegged stablecoins."
        />

        <BlockChartCard 
          title="24H High Volatility Assets" type="bar" yAxisFormat="percent" data={volatilityData}
          series={[{ key: 'change', name: '24H % Change', color: '#8b5cf6' }]}
          description="Top 3 gainers and losers in the top 100 assets by market cap."
        />

      </div>
    </div>
  );
}
