import React, { Suspense } from 'react';
import { getCEXDEXVolume } from '@/lib/dune';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'CEX vs DEX Flows | CryptoBrainNews' };
export const revalidate = 300;

async function FlowsData() {
  const flows = await getCEXDEXVolume(30).catch(() =>[]);

  const flowData = flows.map((d: any) => ({
    date: String(d.day).slice(0, 10),
    volume: Number(d.volume_usd || 0)
  }));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="CEX vs DEX Flows" 
        description="Comparing trading volumes and liquidity flows between centralized and decentralized exchanges." 
      />
      <div className="grid grid-cols-1 gap-6">
        <BlockChartCard 
          title="DEX Volume Profile (USD)" 
          type="area" 
          yAxisFormat="currency"
          data={flowData} 
          colors={{ volume: '#8b5cf6' }} 
        />
      </div>
    </div>
  );
}

export default function FlowsPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <FlowsData />
      </Suspense>
    </main>
  );
}
