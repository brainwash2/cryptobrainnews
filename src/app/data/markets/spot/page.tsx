import React, { Suspense } from 'react';
import { DataHeader }           from '../../_components/DataHeader';
import { ChartSkeleton }        from '../../_components/ChartSkeleton';
import { FreshnessBadge }       from '@/components/common/FreshnessBadge';
import SpotClient               from './_components/SpotClient';
import {
  getGlobalMarketData,
  getFearAndGreedIndex,
  getTopCoinsExtended,
  getTopExchangeVolumes,
} from '@/lib/market-data';

export const metadata = {
  title: 'Spot Markets | CryptoBrainNews',
  description: 'Live crypto spot market data – prices, volumes, market caps, and exchange rankings.',
};
export const revalidate = 300;

async function SpotData() {
  const [globalData, fearAndGreed, coins, exchanges] = await Promise.all([
    getGlobalMarketData(),
    getFearAndGreedIndex(),
    getTopCoinsExtended(50),
    getTopExchangeVolumes(25),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Spot Markets"
        description="Real-time global cryptocurrency market data – prices, dominance, volumes, and exchange rankings."
      />
      <div className="flex items-center gap-3">
        <FreshnessBadge ttlSeconds={300} />
      </div>
      <SpotClient
        globalData={globalData}
        fearAndGreed={fearAndGreed}
        coins={coins}
        exchanges={exchanges}
      />
    </div>
  );
}

export default function SpotPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <SpotData />
      </Suspense>
    </main>
  );
}
