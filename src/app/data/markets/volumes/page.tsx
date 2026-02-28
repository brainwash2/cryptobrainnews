import React, { Suspense } from 'react';
import { getDexVolume } from '@/lib/api';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'Exchange Volumes | CryptoBrainNews' };
export const revalidate = 3600;

async function VolumesData() {
  const dexVolumes = await getDexVolume();

  const realDexData = dexVolumes.slice(-90).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: v.volume
  }));

  const last24h = realDexData[realDexData.length - 1]?.volume || 0;

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Exchange Volumes" 
        description="Aggregated decentralized exchange (DEX) trading volumes across all major liquidity pools." 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-[#555] text-[10px] font-black tracking-widest uppercase">24H DEX Volume</div>
          <div className="text-3xl font-black text-[#FABF2C] mt-2 tabular-nums">
            ${(last24h / 1e9).toFixed(2)}B
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BlockChartCard 
          title="Global DEX Trading Volume (90D)" 
          type="area" 
          yAxisFormat="currency" 
          data={realDexData} 
          colors={{ volume: '#3b82f6' }} 
        />
      </div>
    </div>
  );
}

export default function VolumesPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <VolumesData />
      </Suspense>
    </main>
  );
}
