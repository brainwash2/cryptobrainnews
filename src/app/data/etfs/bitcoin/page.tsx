import React, { Suspense }   from 'react';
import { ChartSkeleton }      from '../../_components/ChartSkeleton';
import EtfPageLayout          from '../_components/EtfPageLayout';
import { getBtcEtfOverview }  from '@/lib/etf-data';

export const metadata = {
  title: 'Bitcoin Spot ETFs | CryptoBrainNews',
  description: 'Live AUM, market share, holdings, and fees for all US-listed spot Bitcoin ETFs.',
};
export const revalidate = 300;

async function BtcEtfData() {
  const overview = await getBtcEtfOverview();
  return <EtfPageLayout coin="BTC" overview={overview} />;
}

export default function BitcoinEtfsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <BtcEtfData />
      </Suspense>
    </main>
  );
}
