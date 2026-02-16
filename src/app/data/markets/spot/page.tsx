import React from 'react';
import { getCexVolume } from '@/lib/api';
import { MetricCard } from '../../_components/MetricCard';
import BarChartCard from '../../_components/charts/BarChartCard';

export const metadata = { title: 'Spot Markets | CryptoBrainNews' };

export default async function SpotMarketPage() {
  const volumeData = await getCexVolume();
  const latestVol = volumeData[volumeData.length - 1]?.volume || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          Spot <span className="text-primary">Markets</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Exchange Volumes & Market Share
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="24h Spot Volume" value={`$${(latestVol / 1e9).toFixed(2)}B`} />
        <MetricCard label="Trend (30d)" value="See Chart" />
        <MetricCard label="Data Source" value="DefiLlama" />
        <MetricCard label="Status" value="Live" />
      </div>

      {/* The Block Style Layout: Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard 
          title="Daily Spot Volume (USD)" 
          subtitle="Aggregate volume across all monitored CEXs"
          source="DefiLlama"
          data={volumeData} 
          xKey="date" 
          yKey="volume" 
          height={400} 
        />
        
        <BarChartCard 
          title="Volume Trend (Log Scale)" 
          subtitle="Relative market activity visualization"
          source="DefiLlama"
          data={volumeData} 
          xKey="date" 
          yKey="volume" 
          color="#2ecc71"
          height={400} 
        />
      </div>
    </div>
  );
}
