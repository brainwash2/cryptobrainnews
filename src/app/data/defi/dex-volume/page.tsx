import React, { Suspense } from 'react';
import { getDexVolume } from '@/lib/api';
import { getDailyDexVolume, QUERY_IDS } from '@/lib/dune';
import { MetricCard } from '../../_components/MetricCard';
import AreaChartCard from '../../_components/charts/AreaChartCard';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'DEX Volume | CryptoBrainNews' };

// 1. The Main Page (Instant Load)
export default function DexVolumePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          DEX <span className="text-primary">Volume</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Decentralized Exchange Trading Activity
        </p>
      </div>

      {/* 2. The Suspense Boundary (Streaming) */}
      <Suspense fallback={<ChartSkeleton />}>
        <AsyncDexData />
      </Suspense>
    </div>
  );
}

// 3. The Data Fetching Component (Runs in background)
async function AsyncDexData() {
  // Fetch Llama first (fast)
  const llamaPromise = getDexVolume();
  
  // Fetch Dune (slow/timeout)
  const dunePromise = (async () => {
    const queryId = QUERY_IDS.DAILY_DEX_VOLUME as number;
    if (queryId === 0) return null;
    try {
      // 15s timeout
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000));
      return await Promise.race([getDailyDexVolume(30), timeout]) as any[];
    } catch {
      return null;
    }
  })();

  const [llamaVolume, duneVolume] = await Promise.all([llamaPromise, dunePromise]);

  let chartData: any[] = llamaVolume;
  let source = "DefiLlama";
  let yKey = "volume";
  let xKey = "date";
  let duneSuccess = false;

  if (duneVolume && duneVolume.length > 0) {
    chartData = duneVolume;
    source = "Dune Analytics";
    yKey = "volume_usd";
    xKey = "day";
    duneSuccess = true;
  }

  const totalVol = chartData.reduce((sum, d) => sum + (Number(d[yKey]) || 0), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="30d Volume" 
          value={totalVol >= 1e12 ? `$${(totalVol / 1e12).toFixed(2)}T` : `$${(totalVol / 1e9).toFixed(2)}B`} 
        />
        <MetricCard label="Source" value={source} />
        <MetricCard label="Data Points" value={String(chartData.length)} />
        <MetricCard label="Status" value={duneSuccess ? "Live On-Chain" : "Aggregated"} />
      </div>

      <AreaChartCard
        title="Global DEX Volume"
        subtitle={duneSuccess ? "On-chain data directly from Dune Analytics" : "Aggregated data via DefiLlama"}
        source={source}
        data={chartData}
        xKey={xKey}
        yKey={yKey}
        yFormat="usd"
        height={400}
      />
    </div>
  );
}
