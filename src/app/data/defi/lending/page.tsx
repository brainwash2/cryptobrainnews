import React, { Suspense } from 'react';
import { getTopYields } from '@/lib/api';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';

export const metadata = { title: 'DeFi Lending & Yields | CryptoBrainNews' };
export const revalidate = 3600;

async function LendingData() {
  const yields = await getTopYields().catch(() =>[]);

  const formatPct = (v: unknown) => `${Number(v || 0).toFixed(2)}%`;
  const formatUsd = (v: unknown) => `$${(Number(v || 0) / 1e6).toFixed(1)}M`;

  return (
    <div className="space-y-8">
      <DataHeader 
        title="DeFi Yields & Lending" 
        description="Highest yield opportunities risk-adjusted by protocol TVL." 
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'project', label: 'Protocol' },
            { key: 'chain', label: 'Chain' },
            { key: 'symbol', label: 'Asset' },
            { key: 'tvlUsd', label: 'Pool TVL', format: formatUsd, align: 'right' },
            { key: 'apy', label: 'Base APY', format: formatPct, align: 'right' },
            { 
              key: 'apyPct1D', 
              label: '24H Δ', 
              format: (v) => `${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(2)}%`, 
              align: 'right' 
            }
          ]}
          data={yields}
          emptyMessage="Syncing yield data from DefiLlama..."
        />
      </div>
    </div>
  );
}

export default function LendingPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}>
        <LendingData />
      </Suspense>
    </main>
  );
}
