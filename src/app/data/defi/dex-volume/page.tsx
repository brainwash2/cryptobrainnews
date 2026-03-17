import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import { getDexVolumes }                from '@/lib/defi-data';

export const metadata = {
  title: 'DEX Volume | CryptoBrainNews',
  description: 'Decentralized exchange trading volumes – ranked by 24h volume across all chains.',
};
export const revalidate = 1800;

async function DexVolumeData() {
  const dexes      = await getDexVolumes(30);
  const total24h   = dexes.reduce((s, d) => s + (d.total24h ?? 0), 0);
  const total7d    = dexes.reduce((s, d) => s + (d.total7d  ?? 0), 0);
  const rows       = dexes.map((d) => ({ ...d })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="DEX Volume"
        description="Decentralized exchange trading activity – all protocols ranked by 24h volume."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total DEX Volume (24h)', value: fmtUsd(total24h), color: '#FABF2C' },
          { label: 'Total DEX Volume (7d)',  value: fmtUsd(total7d),  color: '#FABF2C' },
          { label: 'DEXes Tracked',          value: String(dexes.length), color: '#888' },
          { label: 'Source',                 value: 'DefiLlama', color: '#888', sub: 'Cached 30 min' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Market share mini-bars ─────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-5">
          24h Volume Market Share (Top 10)
        </h3>
        <div className="space-y-2">
          {dexes.slice(0, 10).map((d) => {
            const share = total24h > 0 && d.total24h ? (d.total24h / total24h) * 100 : 0;
            const maxD  = dexes[0]?.total24h ?? 1;
            return (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-28 text-right text-[10px] font-bold text-white shrink-0 truncate">{d.name}</span>
                <div className="flex-1 h-4 bg-[#111]">
                  <div className="h-full bg-[#FABF2C] opacity-75" style={{ width: `${((d.total24h ?? 0) / maxD) * 100}%` }} />
                </div>
                <span className="w-20 text-right font-mono text-[10px] text-[#FABF2C] tabular-nums shrink-0">{fmtUsd(d.total24h)}</span>
                <span className="w-10 text-right font-mono text-[10px] text-[#555] shrink-0">{share.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All DEX Protocols
        </h3>
        <DefiTable
          columns={[
            { key: 'name',      label: 'Protocol',  render: (v) => <span className="font-bold text-white">{String(v)}</span> },
            { key: 'total24h',  label: '24h Volume', align: 'right', render: (v) => <span className="font-mono font-black text-[#FABF2C] tabular-nums">{fmtUsd(v)}</span> },
            { key: 'total7d',   label: '7d Volume',  align: 'right', render: (v) => <span className="font-mono tabular-nums text-[#888]">{fmtUsd(v)}</span> },
            { key: 'change_1d', label: '24h %',      align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
            { key: 'chains',    label: 'Chains',     render: (v) => <span className="text-[#555] font-mono text-[10px]">{(v as string[]).slice(0, 3).join(', ')}</span> },
          ]}
          data={rows}
          source="Source: DefiLlama DEX overview · Cached 30 min"
        />
      </div>
    </div>
  );
}

export default function DexVolumePage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <DexVolumeData />
      </Suspense>
    </main>
  );
}
