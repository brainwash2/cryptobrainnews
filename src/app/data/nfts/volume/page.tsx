import React, { Suspense } from 'react';
import { getNFTDailyVolumes } from '@/lib/dune';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'NFT Volume | CryptoBrainNews' };
export const revalidate = 3600;

async function NFTVolumeData() {
  const volumes = await getNFTDailyVolumes(30).catch(() =>[]);

  const chartData = volumes.map((d) => ({ 
    date: String(d.day).slice(0, 10), 
    volume: Number(d.volume_usd || 0),
    trades: Number(d.trade_count || 0)
  }));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Global NFT Volume" 
        description="Daily non-fungible token trading volume and transaction counts." 
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BlockChartCard 
          title="Daily NFT Volume (USD)" 
          type="area" 
          yAxisFormat="currency"
          data={chartData} 
          colors={{ volume: '#8b5cf6' }} 
        />
        <BlockChartCard 
          title="Daily NFT Sales Count" 
          type="barStack" 
          yAxisFormat="number"
          data={chartData} 
          colors={{ trades: '#f59e0b' }} 
        />
      </div>
    </div>
  );
}

export default function NFTVolumePage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <NFTVolumeData />
      </Suspense>
    </main>
  );
}
