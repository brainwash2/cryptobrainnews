import React, { Suspense }  from 'react';
import { DataHeader }        from '../../_components/DataHeader';
import { ChartSkeleton }     from '../../_components/ChartSkeleton';
import PricesClient          from './_components/PricesClient';
import {
  getGlobalMarketData,
  getFearAndGreedIndex,
  getTopCoinsExtended,
} from '@/lib/market-data';

export const metadata = {
  title: 'Crypto Prices & Market Health | CryptoBrainNews',
  description: 'Total market cap, BTC/ETH dominance, Fear & Greed Index, and multi-timeframe price performance.',
};
export const revalidate = 300;

async function PricesData() {
  const [globalData, fearAndGreed, coins] = await Promise.all([
    getGlobalMarketData(),
    getFearAndGreedIndex(),
    getTopCoinsExtended(100),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Prices & Market Health"
        description="Total market cap, dominance, Fear & Greed Index, and cross-timeframe price performance for the top 100 assets."
      />
      <PricesClient
        globalData={globalData}
        fearAndGreed={fearAndGreed}
        coins={coins}
      />
    </div>
  );
}

export default function PricesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <PricesData />
      </Suspense>
    </main>
  );
}
