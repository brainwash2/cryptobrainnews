import React, { Suspense }   from 'react';
import { ChartSkeleton }      from '../../_components/ChartSkeleton';
import EtfPageLayout          from '../_components/EtfPageLayout';
import { getEthEtfOverview }  from '@/lib/etf-data';

export const metadata = {
  title: 'Ethereum Spot ETFs | CryptoBrainNews',
  description: 'Live AUM, market share, holdings, and fees for all US-listed spot Ethereum ETFs.',
};
export const revalidate = 300;

async function EthEtfData() {
  const overview = await getEthEtfOverview();
  return <EtfPageLayout coin="ETH" overview={overview} />;
}

export default function EthereumEtfsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <EthEtfData />
      </Suspense>
    </main>
  );
}
