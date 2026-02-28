import React, { Suspense } from 'react';
import { getStablecoinSupply } from '@/lib/dune';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'USD Stablecoins | CryptoBrainNews' };
export const revalidate = 3600;

async function StablecoinData() {
  // Catching errors to prevent build failures if Dune API is exhausted
  const supplyData = await getStablecoinSupply(30).catch(() =>[]);

  // Map Dune rows into Recharts format
  const formattedData = supplyData.map((d) => ({
    date: String(d.day).slice(0, 10),
    volume: Number(d.daily_volume || 0),
    transfers: Number(d.transfer_count || 0)
  }));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="USD Stablecoins" 
        description="Daily transaction volumes and transfer counts for major USD-pegged stablecoins." 
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BlockChartCard 
          title="Stablecoin Daily Transfer Volume" 
          type="barStack" 
          yAxisFormat="currency"
          data={formattedData} 
          colors={{ volume: '#22c55e' }} 
        />
        <BlockChartCard 
          title="Stablecoin Transfer Count" 
          type="area" 
          yAxisFormat="number"
          data={formattedData} 
          colors={{ transfers: '#f59e0b' }} 
        />
      </div>
    </div>
  );
}

export default function StablecoinsUsdPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <StablecoinData />
      </Suspense>
    </main>
  );
}
