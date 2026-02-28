import React, { Suspense } from 'react';
import { getNFTTopCollections } from '@/lib/dune';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';

export const metadata = { title: 'Top NFT Collections | CryptoBrainNews' };
export const revalidate = 3600;

async function CollectionsData() {
  const collections = await getNFTTopCollections().catch(() =>[]);

  const formatUsd = (v: unknown) => `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const formatCompact = (v: unknown) => {
    const num = Number(v || 0);
    return num >= 1e6 ? `$${(num / 1e6).toFixed(2)}M` : `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Top NFT Collections" 
        description="Highest volume NFT collections across Ethereum, Solana, and Layer 2 networks." 
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'collection', label: 'Collection' },
            { key: 'blockchain', label: 'Chain' },
            { key: 'trade_count', label: 'Sales (7D)', align: 'right' },
            { key: 'unique_sellers', label: 'Sellers (7D)', align: 'right' },
            { key: 'volume_7d_usd', label: 'Volume (7D)', format: formatCompact, align: 'right' },
            { key: 'avg_price_usd', label: 'Avg Price', format: formatUsd, align: 'right' }
          ]}
          data={collections}
          emptyMessage="Syncing NFT collection data from Dune Analytics..."
        />
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}>
        <CollectionsData />
      </Suspense>
    </main>
  );
}
