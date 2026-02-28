import React, { Suspense } from 'react';
import { getStablecoinHolders } from '@/lib/dune';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';

export const metadata = { title: 'Stablecoins by Chain | CryptoBrainNews' };
export const revalidate = 3600;

async function ChainData() {
  const holders = await getStablecoinHolders().catch(() =>[]);

  const formatUsd = (v: unknown) => `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const shorten = (s: unknown) => String(s || '').length > 10 ? String(s).slice(0, 6) + '...' + String(s).slice(-4) : String(s || '—');

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Stablecoin Holder Distribution" 
        description="Top wallets and smart contracts holding stablecoin liquidity across chains." 
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'blockchain', label: 'Chain' },
            { key: 'holder_address', label: 'Holder Address', format: shorten },
            { key: 'balance_usd', label: 'Balance (USD)', format: formatUsd, align: 'right' },
            { key: 'transfer_count', label: 'Transfers (90D)', align: 'right' }
          ]}
          data={holders}
          emptyMessage="Syncing holder data from Dune Analytics..."
        />
      </div>
    </div>
  );
}

export default function StablecoinsChainsPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}>
        <ChainData />
      </Suspense>
    </main>
  );
}
