import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import { getProtocolRevenue, getProtocolFees } from '@/lib/defi-data';

export const metadata = {
  title: 'Protocol Revenue & Fees | CryptoBrainNews',
  description: 'DeFi protocol revenue and fee generation – daily, weekly, and all-time from DefiLlama.',
};
export const revalidate = 3600;

async function RevenueData() {
  const [revenues, fees] = await Promise.all([
    getProtocolRevenue(40),
    getProtocolFees(40),
  ]);

  const total24hRev  = revenues.reduce((s, p) => s + (p.total24h ?? 0), 0);
  const total24hFees = fees.reduce((s, p) => s + (p.total24h ?? 0), 0);

  const revenueRows = revenues.map((p) => ({ ...p })) as Record<string, unknown>[];
  const feeRows     = fees.map((p) => ({ ...p })) as Record<string, unknown>[];

  const cols = [
    { key: 'name',         label: 'Protocol',    render: (v: unknown) => <span className="font-bold text-white">{String(v)}</span> },
    { key: 'category',     label: 'Category',    render: (v: unknown) => <span className="text-[#888] font-mono text-[10px]">{String(v)}</span> },
    { key: 'total24h',     label: '24h',         align: 'right' as const, render: (v: unknown) => <span className="font-mono font-black text-[#00d672] tabular-nums">{fmtUsd(v)}</span> },
    { key: 'total7d',      label: '7d',          align: 'right' as const, render: (v: unknown) => <span className="font-mono tabular-nums text-[#888]">{fmtUsd(v)}</span> },
    { key: 'totalAllTime', label: 'All Time',    align: 'right' as const, render: (v: unknown) => <span className="font-mono tabular-nums text-[#555]">{fmtUsd(v)}</span> },
    { key: 'change_1d',    label: '24h %',       align: 'right' as const, render: (v: unknown) => <PctBadge v={v as number | null} /> },
  ];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Protocol Revenue & Fees"
        description="DeFi protocol revenue and fee generation – ranked by 24h earnings. Source: DefiLlama."
      />

      {/* ── KPIs ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (24h)', value: fmtUsd(total24hRev),  color: '#00d672' },
          { label: 'Total Fees (24h)',    value: fmtUsd(total24hFees), color: '#FABF2C' },
          { label: 'Protocols (Revenue)', value: String(revenues.length), color: '#888' },
          { label: 'Source',              value: 'DefiLlama',           color: '#888', sub: 'Cached 1 hour' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Revenue Leaderboard ────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#00d672] rounded-full" />
          Revenue Leaderboard (24h)
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Revenue = fees kept by protocol (not distributed to LPs)
          </span>
        </h3>
        <DefiTable columns={cols} data={revenueRows} source="Source: DefiLlama revenue API · Cached 1 hour" />
      </div>

      {/* ── Total Fees ─────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Total Fee Generation (24h)
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Fees = all fees paid by users (revenue + LP earnings)
          </span>
        </h3>
        <DefiTable columns={cols} data={feeRows} source="Source: DefiLlama fees API · Cached 1 hour" />
      </div>
    </div>
  );
}

export default function RevenuePage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueData />
      </Suspense>
    </main>
  );
}
