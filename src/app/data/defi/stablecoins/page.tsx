import React, { Suspense }         from 'react';
import { getStablecoins }          from '@/lib/api';
import { getStablecoinsByChain }   from '@/lib/defi-data';
import { DataHeader }              from '../../_components/DataHeader';
import { ChartSkeleton }           from '../../_components/ChartSkeleton';
import { DataTable }               from '../../_components/DataTable';
import GaugeCard                   from '../../_components/charts/GaugeCard';
import StablecoinChainChart        from './_components/StablecoinChainChart';

export const metadata = { title: 'Stablecoin Intelligence | CryptoBrainNews' };
export const revalidate = 3600;

async function StablecoinsData() {
  const [data, chainData] = await Promise.all([
    getStablecoins(),
    getStablecoinsByChain(),
  ]);

  const currentMcap = data.reduce((sum, d) => sum + d.circulating, 0);
  const usdtMcap    = data.find(d => d.symbol === 'USDT')?.circulating || 0;
  const dominance   = currentMcap > 0 ? (usdtMcap / currentMcap) * 100 : 0;

  const formatUsd = (v: unknown): string => {
    const n = Number(v);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-8 pb-20">
      <DataHeader
        title="Stablecoin Intelligence"
        description="Aggregate stablecoin market cap, peg health, chain distribution, and liquidity."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 flex flex-col justify-center">
          <p className="text-[10px] text-[#555] font-black uppercase tracking-widest mb-4">Total Circulating</p>
          <p className="text-5xl font-black text-[#00d672] tabular-nums">${(currentMcap / 1e9).toFixed(2)}B</p>
        </div>
        <GaugeCard
          title="USDT Dominance"
          value={dominance}
          color="#00d672"
          description="Tether share of total stablecoin market cap"
        />
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 flex flex-col justify-center">
          <p className="text-[10px] text-[#555] font-black uppercase tracking-widest mb-4">Assets Tracked</p>
          <p className="text-5xl font-black text-white tabular-nums">{data.length}</p>
        </div>
      </div>

      {/* Unit 4 — Stablecoin Supply by Blockchain */}
      {chainData.length > 0 && <StablecoinChainChart data={chainData} />}

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Asset',
              format: (v: unknown, row: Record<string, unknown>) => (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{row.name as string}</span>
                  <span className="text-[9px] font-black text-[#FABF2C] uppercase tracking-widest px-2 py-0.5 bg-[#FABF2C]/10 rounded">
                    {row.symbol as string}
                  </span>
                </div>
              )
            },
            { key: 'pegType',     label: 'Peg Type' },
            { key: 'price',       label: 'Price (USD)', format: (v) => `$${Number(v).toFixed(4)}`, align: 'right' },
            { key: 'circulating', label: 'Circulating Supply', format: formatUsd, align: 'right' }
          ]}
          data={data as unknown as Record<string, unknown>[]}
          emptyMessage="Syncing stablecoin data..."
        />
      </div>
    </div>
  );
}

export default function StablecoinsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <StablecoinsData />
      </Suspense>
    </main>
  );
}
