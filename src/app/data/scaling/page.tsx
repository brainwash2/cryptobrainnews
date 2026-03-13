import React, { Suspense } from 'react';
import { getL2ActiveAddresses } from '@/lib/dune';
import { getL2ScalingData } from '@/lib/l2beat';
import BlockChartCard from '../_components/charts/BlockChartCard';
import { DataHeader } from '../_components/DataHeader';
import { ChartSkeleton } from '../_components/ChartSkeleton';
import { DataTable } from '../_components/DataTable';

export const metadata = { title: 'L2 Scaling Overview | CryptoBrainNews' };
export const revalidate = 3600;

async function ScalingData() {
  const [duneData, l2Data] = await Promise.all([
    getL2ActiveAddresses(30).catch(() => []),
    getL2ScalingData()
  ]);
  
  const pivoted: Record<string, any> = {};
  duneData.forEach(row => {
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
        description="Daily active addresses, network usage, and TVL across rollup solutions." 
      />
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <BlockChartCard 
          title="Daily Active Addresses by Chain" 
          type="lineDual" 
          yAxisFormat="number"
          data={chartData} 
          colors={{ arbitrum: '#3b82f6', optimism: '#ef4444', base: '#22c55e' }} 
        />
      </div>

      <h3 className="text-xl font-black uppercase tracking-tighter text-white mt-12 mb-4">Rollup Total Value Locked (TVL)</h3>
      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'name', label: 'Network' },
            { key: 'tvl', label: 'TVL (USD)', format: (v) => `$${(Number(v) / 1e9).toFixed(2)}B`, align: 'right' }
          ]}
          data={l2Data}
          emptyMessage="Syncing L2 data..."
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
