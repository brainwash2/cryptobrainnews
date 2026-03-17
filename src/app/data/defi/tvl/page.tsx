import React, { Suspense } from 'react';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import {
  getTopProtocolsByTvl,
  getTvlByCategory,
} from '@/lib/defi-data';

export const metadata = {
  title: 'DeFi TVL Rankings | CryptoBrainNews',
  description: 'Total value locked by protocol and category across all DeFi – live from DefiLlama.',
};
export const revalidate = 3600;

function CategoryBars({ cats }: { cats: Array<{ category: string; tvl: number; share: number }> }) {
  const max = cats[0]?.tvl ?? 1;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-5">
        TVL by Category
      </h3>
      <div className="space-y-2">
        {cats.map((c) => (
          <div key={c.category} className="flex items-center gap-3">
            <span className="w-32 text-right text-[10px] font-bold text-white shrink-0 truncate">{c.category}</span>
            <div className="flex-1 h-4 bg-[#111]">
              <div className="h-full bg-[#FABF2C] opacity-75" style={{ width: `${(c.tvl / max) * 100}%` }} />
            </div>
            <span className="w-20 text-right font-mono text-[10px] text-[#FABF2C] tabular-nums shrink-0">{fmtUsd(c.tvl)}</span>
            <span className="w-10 text-right font-mono text-[10px] text-[#555] shrink-0">{c.share.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function TvlData() {
  const [protocols, categories] = await Promise.all([
    getTopProtocolsByTvl(60),
    getTvlByCategory(),
  ]);

  const totalTvl       = protocols.reduce((s, p) => s + p.tvl, 0);
  const totalProtocols = protocols.length;
  const top1           = protocols[0];

  const rows = protocols.map((p) => ({
    ...p,
    tvl_fmt:    fmtUsd(p.tvl),
    change_1d:  p.change_1d,
    change_7d:  p.change_7d,
    chains_fmt: p.chains.slice(0, 3).join(', '),
  })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="DeFi Value Locked"
        description="Total value locked (TVL) by protocol and category – all blockchains, live from DefiLlama."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total DeFi TVL',   value: fmtUsd(totalTvl),      color: '#FABF2C' },
          { label: 'Protocols Ranked', value: String(totalProtocols), color: '#FABF2C' },
          { label: 'Largest Protocol', value: top1?.name ?? '—',      color: '#fff', sub: fmtUsd(top1?.tvl ?? 0) },
          { label: 'Source',           value: 'DefiLlama',            color: '#888', sub: 'Cached 1 hour' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <CategoryBars cats={categories} />

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Top Protocols by TVL
        </h3>
        <DefiTable
          columns={[
            { key: 'name',       label: 'Protocol', render: (v: unknown) => <span className="font-bold text-white">{String(v)}</span> },
            { key: 'category',   label: 'Category', render: (v: unknown) => <span className="text-[#888] font-mono">{String(v)}</span> },
            { key: 'tvl',        label: 'TVL',       align: 'right', render: (v: unknown) => <span className="font-mono font-black text-[#FABF2C] tabular-nums">{fmtUsd(v)}</span> },
            { key: 'change_1d',  label: '24h %',     align: 'right', render: (v: unknown) => <PctBadge v={v as number | null} /> },
            { key: 'change_7d',  label: '7d %',      align: 'right', render: (v: unknown) => <PctBadge v={v as number | null} /> },
            { key: 'chains_fmt', label: 'Chains',    render: (v: unknown) => <span className="text-[#555] font-mono">{String(v)}</span> },
          ]}
          data={rows}
          source="Source: DefiLlama · Cached 1 hour"
        />
      </div>
    </div>
  );
}

export default function TvlPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <TvlData />
      </Suspense>
    </main>
  );
}
