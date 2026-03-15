import React, { Suspense }        from 'react';
import { ChartSkeleton }           from '../../_components/ChartSkeleton';
import TreasuryPageLayout          from '../_components/TreasuryPageLayout';
import { getEthereumTreasuries }   from '@/lib/treasury-data';
import { DataHeader }              from '../../_components/DataHeader';

export const metadata = {
  title: 'Ethereum Treasuries | CryptoBrainNews',
  description: 'Public companies holding Ethereum on their balance sheet – holdings, current value, and unrealised P&L.',
};
export const revalidate = 21600;

async function EthTreasuryData() {
  const data = await getEthereumTreasuries();

  if (!data) {
    return (
      <div className="space-y-8 pb-20">
        <DataHeader title="Ethereum Treasuries" description="Public companies holding ETH on their balance sheet." />
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-20 text-center">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
            Unable to load treasury data. CoinGecko API may be rate-limited. Please try again shortly.
          </p>
        </div>
      </div>
    );
  }

  return <TreasuryPageLayout coin="ETH" data={data} />;
}

export default function EthereumTreasuriesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <EthTreasuryData />
      </Suspense>
    </main>
  );
}
