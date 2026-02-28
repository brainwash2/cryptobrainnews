import React, { Suspense } from 'react';
import { getL2ActiveAddresses, getL2GasFees } from '@/lib/dune';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'Optimistic Rollups | CryptoBrainNews' };
export const revalidate = 3600;

async function OptimisticData() {
  const[addresses, fees] = await Promise.all([
    getL2ActiveAddresses(30).catch(() => []),
    getL2GasFees(30).catch(() =>[])
  ]);

  const pivotAddresses: Record<string, any> = {};
  addresses.filter(r => r.chain !== 'base').forEach(row => {
    const d = String(row.day).slice(0, 10);
    if (!pivotAddresses[d]) pivotAddresses[d] = { date: d, arbitrum: 0, optimism: 0 };
    pivotAddresses[d][String(row.chain).toLowerCase()] = Number(row.active_addresses || 0);
  });

  const pivotFees: Record<string, any> = {};
  fees.filter(r => r.chain !== 'base').forEach(row => {
    const d = String(row.day).slice(0, 10);
    if (!pivotFees[d]) pivotFees[d] = { date: d, arbitrum: 0, optimism: 0 };
    pivotFees[d][String(row.chain).toLowerCase()] = Number(row.avg_gas_price_gwei || 0);
  });

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Optimistic Rollups" 
        description="Performance metrics for Arbitrum and Optimism." 
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BlockChartCard 
          title="Daily Active Addresses" 
          type="lineDual" 
          yAxisFormat="number"
          data={Object.values(pivotAddresses).sort((a, b) => a.date.localeCompare(b.date))} 
          colors={{ arbitrum: '#3b82f6', optimism: '#ef4444' }} 
        />
        <BlockChartCard 
          title="Average Gas Price (Gwei)" 
          type="barStack" 
          yAxisFormat="number"
          data={Object.values(pivotFees).sort((a, b) => a.date.localeCompare(b.date))} 
          colors={{ arbitrum: '#3b82f6', optimism: '#ef4444' }} 
        />
      </div>
    </div>
  );
}

export default function OptimisticPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <OptimisticData />
      </Suspense>
    </main>
  );
}
