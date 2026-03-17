import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import { getDerivativesProtocols }      from '@/lib/defi-data';

export const metadata = {
  title: 'DeFi Derivatives | CryptoBrainNews',
  description: 'Hyperliquid, dYdX, GMX and all on-chain derivatives protocols by 24h volume and open interest.',
};
export const revalidate = 1800;

async function DerivativesData() {
  const protocols  = await getDerivativesProtocols(25);
  const total24h   = protocols.reduce((s, p) => s + (p.total24h ?? 0), 0);
  const totalOI    = protocols.reduce((s, p) => s + (p.totalOI  ?? 0), 0);
  const rows       = protocols.map((p) => ({ ...p })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="DeFi Derivatives"
        description="On-chain perpetuals and derivatives – Hyperliquid, dYdX, GMX, and more. Volume and open interest."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume (24h)',  value: fmtUsd(total24h),          color: '#FABF2C' },
          { label: 'Total Open Interest', value: fmtUsd(totalOI),           color: '#FABF2C' },
          { label: 'Protocols Tracked',  value: String(protocols.length),  color: '#888' },
          { label: 'Source',              value: 'DefiLlama',               color: '#888', sub: 'Cached 30 min' },
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
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All DeFi Derivatives Protocols
        </h3>
        <DefiTable
          columns={[
            { key: 'name',      label: 'Protocol',       render: (v) => <span className="font-bold text-white">{String(v)}</span> },
            { key: 'total24h',  label: '24h Volume',     align: 'right', render: (v) => <span className="font-mono font-black text-[#FABF2C] tabular-nums">{fmtUsd(v)}</span> },
            { key: 'totalOI',   label: 'Open Interest',  align: 'right', render: (v) => <span className="font-mono tabular-nums text-[#888]">{fmtUsd(v)}</span> },
            { key: 'change_1d', label: '24h %',          align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
            { key: 'chains',    label: 'Chains',         render: (v) => <span className="text-[#555] font-mono text-[10px]">{(v as string[]).slice(0, 3).join(', ')}</span> },
          ]}
          data={rows}
          source="Source: DefiLlama derivatives overview · Cached 30 min"
        />
      </div>
    </div>
  );
}

export default function DerivativesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <DerivativesData />
      </Suspense>
    </main>
  );
}
