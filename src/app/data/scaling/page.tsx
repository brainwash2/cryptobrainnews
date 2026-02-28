import React, { Suspense } from 'react';
import { getL2ActiveAddresses } from '@/lib/dune';
import BlockChartCard from '../_components/charts/BlockChartCard';
import { DataHeader } from '../_components/DataHeader';
import { ChartSkeleton } from '../_components/ChartSkeleton';

export const metadata = { title: 'L2 Scaling Overview | CryptoBrainNews' };
export const revalidate = 3600;

async function ScalingData() {
  // Dune query returns data for multiple chains. We must pivot it for Recharts.
  const rawData = await getL2ActiveAddresses(30).catch(() =>[]);
  
  // Pivot rows: { day, arbitrum, optimism, base }
  const pivoted: Record<string, any> = {};
  rawData.forEach(row => {
    const d = String(row.day).slice(0, 10);
    const chain = String(row.chain).toLowerCase();
    if (!pivoted[d]) pivoted[d] = { date: d, arbitrum: 0, optimism: 0, base: 0 };
    pivoted[d][chain] = Number(row.active_addresses || 0);
  });
  
  const chartData = Object.values(pivoted).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Layer 2 Scaling" 
        description="Daily active addresses and network usage across EVM rollup solutions." 
      />
      <div className="grid grid-cols-1 gap-6">
        <BlockChartCard 
          title="Daily Active Addresses by Chain" 
          type="lineDual" 
          yAxisFormat="number"
          data={chartData} 
          colors={{ arbitrum: '#3b82f6', optimism: '#ef4444', base: '#22c55e' }} 
        />
      </div>
    </div>
  );
}

export default function ScalingPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <ScalingData />
      </Suspense>
    </main>
  );
}
