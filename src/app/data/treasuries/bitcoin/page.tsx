import React, { Suspense }        from 'react';
import { ChartSkeleton }           from '../../_components/ChartSkeleton';
import TreasuryPageLayout          from '../_components/TreasuryPageLayout';
import { getBitcoinTreasuries }    from '@/lib/treasury-data';
import { DataHeader }              from '../../_components/DataHeader';

export const metadata = {
  title: 'Bitcoin Treasuries | CryptoBrainNews',
  description: 'Public companies holding Bitcoin on their balance sheet – holdings, current value, and unrealised P&L.',
};
export const revalidate = 21600;

async function BtcTreasuryData() {
  const data = await getBitcoinTreasuries();

  if (!data) {
    return (
      <div className="space-y-8 pb-20">
        <DataHeader title="Bitcoin Treasuries" description="Public companies holding BTC on their balance sheet." />
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-20 text-center">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
            Unable to load treasury data. CoinGecko API may be rate-limited. Please try again shortly.
          </p>
        </div>
      </div>
    );
  }

  return <TreasuryPageLayout coin="BTC" data={data} />;
}

export default function BitcoinTreasuriesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <BtcTreasuryData />
      </Suspense>
    </main>
  );
}
