import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import { getRwaProtocols }              from '@/lib/defi-data';

export const metadata = {
  title: 'Real World Assets (RWA) | CryptoBrainNews',
  description: 'Tokenised real world assets – treasury bills, bonds, credit, and commodities on-chain.',
};
export const revalidate = 3600;

async function RwaData() {
  const protocols = await getRwaProtocols();
  const totalTvl  = protocols.reduce((s, p) => s + p.tvl, 0);
  const rows      = protocols.map((p) => ({ ...p })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Real World Assets (RWA)"
        description="Tokenised treasuries, bonds, credit, and commodities on-chain – total TVL and protocol breakdown."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total RWA TVL',     value: fmtUsd(totalTvl),          color: '#f97316' },
          { label: 'Protocols Tracked', value: String(protocols.length),  color: '#888' },
          { label: 'Largest Protocol',  value: protocols[0]?.name ?? '—', color: '#fff', sub: fmtUsd(protocols[0]?.tvl ?? 0) },
          { label: 'Source',            value: 'DefiLlama',               color: '#888', sub: 'Cached 1 hour' },
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
          <span className="w-2 h-2 bg-[#f97316] rounded-full" />
          RWA Protocols Ranked by TVL
        </h3>
        <DefiTable
          columns={[
            { key: 'name',      label: 'Protocol',  render: (v) => <span className="font-bold text-white">{String(v)}</span> },
            { key: 'category',  label: 'Category',  render: (v) => <span className="text-[#888] font-mono text-[10px]">{String(v)}</span> },
            { key: 'tvl',       label: 'TVL',       align: 'right', render: (v) => <span className="font-mono font-black text-[#f97316] tabular-nums">{fmtUsd(v)}</span> },
            { key: 'change_1d', label: '24h %',     align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
            { key: 'change_7d', label: '7d %',      align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
            { key: 'chains',    label: 'Chains',    render: (v) => <span className="text-[#555] font-mono text-[10px]">{(v as string[]).slice(0, 3).join(', ')}</span> },
          ]}
          data={rows}
          source="Source: DefiLlama · Cached 1 hour"
          emptyMessage={protocols.length === 0 ? 'No RWA protocols found — category may be named differently in DefiLlama' : 'Syncing...'}
        />
      </div>
    </div>
  );
}

export default function RwaPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <RwaData />
      </Suspense>
    </main>
  );
}
