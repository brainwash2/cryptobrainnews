import React from 'react';
import BlockChartCard from '../../_components/charts/BlockChartCard';

export const metadata = {
  title: 'Spot Markets Dashboard | CryptoBrainNews',
  description: 'Cryptocurrency spot market volumes, pairs, and exchange dominance.',
};

// Generate realistic dummy data for the exact dashboard look
const generateMonthlyData = () => {
  const months = ['Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026'];
  return months.map(month => ({
    date: month,
    binance: Math.random() * 400e9 + 300e9,
    upbit: Math.random() * 100e9 + 50e9,
    bybit: Math.random() * 150e9 + 80e9,
    okx: Math.random() * 120e9 + 60e9,
    coinbase: Math.random() * 90e9 + 40e9,
    kraken: Math.random() * 30e9 + 10e9,
    others: Math.random() * 200e9 + 100e9,
  }));
};

const generateDailyLineData = () => {
  const dates = Array.from({length: 30}, (_, i) => `Jan ${i+1}`);
  let btc = 10e9;
  let eth = 5e9;
  return dates.map(date => {
    btc = btc + (Math.random() * 4e9 - 2e9);
    eth = eth + (Math.random() * 2e9 - 1e9);
    return { date, btc: Math.abs(btc), eth: Math.abs(eth) };
  });
};

const exchangeColors = {
  binance: '#f59e0b', // Yellow
  upbit: '#10b981',   // Green
  bybit: '#eab308',   // Orange
  okx: '#ffffff',     // White
  coinbase: '#3b82f6',// Blue
  kraken: '#8b5cf6',  // Purple
  others: '#ef4444',  // Red
};

export default function SpotMarketsPage() {
  const monthlyData = generateMonthlyData();
  const dailyData = generateDailyLineData();

  return (
    <div className="space-y-6 max-w-full overflow-hidden font-sans">
      
      {/* Header aligned with The Block */}
      <div className="border-b border-[#27272a] pb-4 mb-6">
        <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-1">Markets</h2>
        <h1 className="text-4xl font-normal text-white">Spot</h1>
      </div>

      {/* Grid of Dashboards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* Chart 1: Crypto Monthly Exchange Volume */}
        <BlockChartCard 
          title="Cryptocurrency Monthly Exchange Volume"
          type="bar"
          stacked={true}
          yAxisFormat="currency"
          data={monthlyData}
          series={[
            { key: 'binance', name: 'Binance', color: exchangeColors.binance },
            { key: 'bybit', name: 'ByBit', color: exchangeColors.bybit },
            { key: 'okx', name: 'OKX', color: exchangeColors.okx },
            { key: 'upbit', name: 'Upbit', color: exchangeColors.upbit },
            { key: 'coinbase', name: 'Coinbase', color: exchangeColors.coinbase },
            { key: 'others', name: 'Others', color: exchangeColors.others },
          ]}
        />

        {/* Chart 2: Daily Exchange Volume (7DMA) */}
        <BlockChartCard 
          title="BTC and ETH Total Exchange Volume (7DMA)"
          type="line"
          yAxisFormat="currency"
          data={dailyData}
          series={[
            { key: 'btc', name: 'BTC', color: '#3b82f6' },
            { key: 'eth', name: 'ETH', color: '#ef4444' },
          ]}
        />

        {/* Chart 3: USD Support Exchange Volume */}
        <BlockChartCard 
          title="USD Support Exchange Volume"
          type="bar"
          stacked={true}
          yAxisFormat="currency"
          data={monthlyData}
          series={[
            { key: 'coinbase', name: 'Coinbase', color: exchangeColors.coinbase },
            { key: 'kraken', name: 'Kraken', color: exchangeColors.kraken },
            { key: 'others', name: 'Others', color: '#0ea5e9' },
          ]}
        />

        {/* Chart 4: Share of Trade Volume */}
        <BlockChartCard 
          title="Monthly Exchange Volume Market Share"
          type="area"
          stacked={true}
          expandType="expand"
          yAxisFormat="percent"
          data={monthlyData}
          series={[
            { key: 'binance', name: 'Binance', color: exchangeColors.binance },
            { key: 'bybit', name: 'ByBit', color: exchangeColors.bybit },
            { key: 'okx', name: 'OKX', color: exchangeColors.okx },
            { key: 'upbit', name: 'Upbit', color: exchangeColors.upbit },
            { key: 'coinbase', name: 'Coinbase', color: exchangeColors.coinbase },
            { key: 'others', name: 'Others', color: exchangeColors.others },
          ]}
        />
        
        {/* Chart 5: BTC Spot Trading Volume */}
        <BlockChartCard 
          title="Bitcoin Spot Trading Volume (in terms of BTC)"
          type="bar"
          stacked={true}
          yAxisFormat="number"
          data={monthlyData.map(d => ({...d, binance: d.binance / 65000, coinbase: d.coinbase / 65000, others: d.others / 65000}))}
          series={[
            { key: 'binance', name: 'Binance', color: exchangeColors.binance },
            { key: 'coinbase', name: 'Coinbase', color: exchangeColors.coinbase },
            { key: 'others', name: '37 Others', color: '#64748b' },
          ]}
        />

        {/* Chart 6: Share of Trade Volume by Pair */}
        <BlockChartCard 
          title="Share of Trade Volume by Pair Denomination"
          type="bar"
          stacked={true}
          expandType="expand"
          yAxisFormat="percent"
          data={monthlyData}
          series={[
            { key: 'binance', name: 'USDT', color: '#3b82f6' },
            { key: 'coinbase', name: 'USD', color: '#ef4444' },
            { key: 'bybit', name: 'USDC', color: '#f59e0b' },
            { key: 'others', name: '8 Others', color: '#64748b' },
          ]}
        />

      </div>
    </div>
  );
}
