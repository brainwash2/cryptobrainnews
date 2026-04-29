import React, { Suspense } from 'react';
import { DataHeader }     from '../../_components/DataHeader';
import { ChartSkeleton }  from '../../_components/ChartSkeleton';
import OptionsClient      from './_components/OptionsClient';
import { getOptionsAggregate, getDeribitHistVol } from '@/lib/options';
import { getOptionsFlow }  from '@/lib/greekslive';

export const metadata = { title: 'Options Markets | CryptoBrainNews' };
export const revalidate = 300;

async function OptionsData() {
  const [btcAgg, ethAgg, btcVol, ethVol, greeksFlow] = await Promise.all([
    getOptionsAggregate('BTC').catch(() => null),
    getOptionsAggregate('ETH').catch(() => null),
    getDeribitHistVol('BTC', 30).catch(() => []),
    getDeribitHistVol('ETH', 30).catch(() => []),
    getOptionsFlow().catch(() => null),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Options Markets"
        description="Aggregated BTC & ETH options – OI, volume, put/call ratio, historical implied volatility, and block trades."
      />
      <OptionsClient
        btcAgg={btcAgg}
        ethAgg={ethAgg}
        btcVol={btcVol}
        ethVol={ethVol}
        greeksFlow={greeksFlow}
      />
    </div>
  );
}

export default function OptionsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <OptionsData />
      </Suspense>
    </main>
  );
}
