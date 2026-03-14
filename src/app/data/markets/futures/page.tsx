import React, { Suspense } from 'react';
import { getDerivativesExchanges, getFundingRates } from '@/lib/derivatives';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';
import { MetricCard } from '../../_components/MetricCard';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { ChartSkeleton } from '../../_components/ChartSkeleton';
import type { DerivativeMarketData, FundingRateData } from '@/lib/types';

export const metadata = { title: 'Futures & Perpetuals | CryptoBrainNews' };
export const revalidate = 300;

interface TrendPoint {
  date: string;
  volume: number;
  open_interest: number;
  // Add index signature to satisfy Record<string, unknown>
  [key: string]: string | number;
}

function generateSimulatedTrend(
  currentVol: number,
  currentOi: number
): TrendPoint[] {
  return Array.from({ length: 30 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (29 - i));
    const variance = Math.sin(i / 3) * 0.1;
    return {
      date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.max(0, currentVol * (1 - (29 - i) * 0.01 + variance)),
      open_interest: Math.max(0, currentOi * (1 - (29 - i) * 0.005 + variance * 0.5)),
    };
  });
}

function formatUsd(v: unknown): string {
  const num = Number(v ?? 0);
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

async function FuturesData() {
  const [exchanges, fundingRates]: [DerivativeMarketData[], FundingRateData[]] =
    await Promise.all([
      getDerivativesExchanges().catch(() => []),
      getFundingRates().catch(() => []),
    ]);

  const totalVolume = exchanges.reduce((sum, e) => sum + (e.volume24h ?? 0), 0);
  const totalOi     = exchanges.reduce((sum, e) => sum + (e.openInterest ?? 0), 0);
  const avgFunding  =
    fundingRates.length > 0
      ? fundingRates.reduce((sum, f) => sum + (f.fundingRate ?? 0), 0) / fundingRates.length
      : 0;

  const trendData = generateSimulatedTrend(totalVolume, totalOi);

  return (
    <div className="space-y-12 pb-20">
      <DataHeader
        title="Futures & Perpetuals"
        description="Live derivatives exchange volumes, open interest, and perpetual funding rates."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="24h Global Volume"   value={formatUsd(totalVolume)} />
        <MetricCard label="Total Open Interest" value={formatUsd(totalOi)} />
        <MetricCard label="Avg Funding Rate"    value={`${avgFunding.toFixed(4)}%`} />
        <MetricCard label="Exchanges Tracked"   value={String(exchanges.length)} />
      </div>

      <BlockChartCard
        title="Global Futures Activity (30D)"
        type="composed"
        yAxisFormat="currency"
        data={trendData}
        colors={{ volume: '#1a1a1a', open_interest: '#FABF2C' }}
        description="Simulated historical trend based on current live DefiLlama aggregates. Real historical data coming in Phase 38."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#FABF2C] rounded-full" /> Top Exchanges
          </h3>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
            <DataTable
              columns={[
                { key: 'exchange',     label: 'Exchange',      format: (v) => <span className="font-bold text-white capitalize">{String(v)}</span> },
                { key: 'volume24h',    label: '24h Volume',    format: formatUsd,  align: 'right' },
                { key: 'openInterest', label: 'Open Interest', format: formatUsd,  align: 'right' },
              ]}
              data={exchanges.slice(0, 15)}
              emptyMessage="Syncing exchange data..."
            />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#00d672] rounded-full animate-pulse" />
              Live Funding Rates
            </div>
            <span className="text-[9px] text-[#00d672] font-mono tracking-widest bg-[#00d672]/10 border border-[#00d672]/30 px-2 py-1">
              Binance
            </span>
          </h3>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
            <DataTable
              columns={[
                { key: 'symbol',    label: 'Pair',       format: (v) => <span className="font-bold text-white">{String(v)}</span> },
                { key: 'markPrice', label: 'Mark Price', format: (v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, align: 'right' },
                {
                  key: 'fundingRate',
                  label: 'Funding (8h)',
                  format: (v) => {
                    const num = Number(v);
                    const color =
                      num > 0.01  ? 'text-[#00d672]' :
                      num < -0.01 ? 'text-[#ff4757]' : 'text-[#888]';
                    return (
                      <span className={`${color} font-mono font-bold`}>
                        {num > 0 ? '+' : ''}{num.toFixed(4)}%
                      </span>
                    );
                  },
                  align: 'right',
                },
              ]}
              data={fundingRates.slice(0, 15)}
              emptyMessage="Syncing funding rates..."
            />
          </div>
        </div>
      </div>
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
