import React, { Suspense } from 'react';
import { getDerivativesExchanges, getFundingRates } from '@/lib/derivatives';
import { getOIHistory, getFundingRateHistory }      from '@/lib/market-data';
import { ChartSkeleton }                             from '../../_components/ChartSkeleton';
import { DataHeader }                                from '../../_components/DataHeader';
import FuturesClient                                 from './_components/FuturesClient';
import type { DerivativeMarketData, FundingRateData } from '@/lib/types';

export const metadata = { title: 'Futures & Perpetuals | CryptoBrainNews' };
export const revalidate = 300;

async function FuturesData() {
  const [exchanges, fundingRates, oiHistory, fundingHistory]: [
    DerivativeMarketData[],
    FundingRateData[],
    Awaited<ReturnType<typeof getOIHistory>>,
    Awaited<ReturnType<typeof getFundingRateHistory>>,
  ] = await Promise.all([
    getDerivativesExchanges().catch(() => []),
    getFundingRates().catch(() => []),
    getOIHistory(30).catch(() => []),
    getFundingRateHistory(30).catch(() => []),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Futures & Perpetuals"
        description="Live derivatives volumes, open interest history, and perpetual funding rates."
      />
      <FuturesClient
        exchanges={exchanges}
        fundingRates={fundingRates}
        oiHistory={oiHistory}
        fundingHistory={fundingHistory}
      />
    </div>
  );
}

export default function FuturesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <FuturesData />
      </Suspense>
    </main>
  );
}
