import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import { getRestakingProtocols }        from '@/lib/defi-data';

export const metadata = {
  title: 'Restaking | CryptoBrainNews',
  description: 'EigenLayer, Symbiotic, and liquid restaking protocols – TVL and ecosystem metrics.',
};
export const revalidate = 3600;

async function RestakingData() {
  const protocols = await getRestakingProtocols();
  const totalTvl  = protocols.reduce((s, p) => s + p.tvl, 0);
  const rows      = protocols.map((p) => ({ ...p })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Restaking"
        description="EigenLayer, Symbiotic, Karak, and liquid restaking protocols – restaked ETH and TVL metrics."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Restaking TVL',  value: fmtUsd(totalTvl),          color: '#6366f1' },
          { label: 'Protocols Tracked',    value: String(protocols.length),  color: '#888' },
          { label: 'Largest Protocol',     value: protocols[0]?.name ?? '—', color: '#fff', sub: fmtUsd(protocols[0]?.tvl ?? 0) },
          { label: 'Source',               value: 'DefiLlama',               color: '#888', sub: 'Cached 1 hour' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#6366f1] rounded-full" />
          Restaking Protocols
        </h3>
        <DefiTable
          columns={[
            { key: 'name',      label: 'Protocol',  render: (v) => <span className="font-bold text-white">{String(v)}</span> },
            { key: 'category',  label: 'Category',  render: (v) => <span className="text-[#888] font-mono text-[10px]">{String(v)}</span> },
            { key: 'tvl',       label: 'TVL',       align: 'right', render: (v) => <span className="font-mono font-black text-[#6366f1] tabular-nums">{fmtUsd(v)}</span> },
            { key: 'change_1d', label: '24h %',     align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
            { key: 'change_7d', label: '7d %',      align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
          ]}
          data={rows}
          source="Source: DefiLlama · Cached 1 hour"
        />
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">What Is Restaking?</h3>
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          Restaking allows staked ETH (or LSTs like stETH) to be reused as cryptoeconomic security
          for other protocols (called Actively Validated Services / AVSs on EigenLayer).
          This earns additional yield on top of base staking rewards, but also extends slashing risk.
          EigenLayer pioneered restaking; Symbiotic and Karak are newer competitors offering
          multi-asset restaking with different security models.
        </p>
      </div>
    </div>
  );
}

export default function RestakingPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <RestakingData />
      </Suspense>
    </main>
  );
}
