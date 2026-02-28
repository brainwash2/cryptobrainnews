import React, { Suspense } from 'react';
import { getDeFiProtocols } from '@/lib/api';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';

export const metadata = { title: 'DeFi TVL Rankings | CryptoBrainNews' };
export const revalidate = 3600;

async function TvlData() {
  const protocols = await getDeFiProtocols().catch(() =>[]);

  const formatUsd = (v: unknown) => {
    const num = Number(v || 0);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const tableData = protocols.slice(0, 100).map((p, i) => ({
    rank: i + 1,
    name: p.name,
    category: (p as any).category || 'DeFi',
    chain: (p as any).chain || 'Multi',
    tvl: p.tvl
  }));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="TVL Rankings" 
        description="Total Value Locked across all major Decentralized Finance protocols." 
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'rank', label: '#', width: '60px' },
            { key: 'name', label: 'Protocol' },
            { key: 'category', label: 'Category' },
            { key: 'chain', label: 'Chain' },
            { key: 'tvl', label: 'TVL (USD)', format: formatUsd, align: 'right' }
          ]}
          data={tableData}
          emptyMessage="Syncing TVL data from DefiLlama..."
        />
      </div>
    </div>
  );
}

export default function TvlPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}>
        <TvlData />
      </Suspense>
    </main>
  );
}
