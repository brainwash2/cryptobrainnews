import React, { Suspense }       from 'react';
import { DataHeader }             from '../../_components/DataHeader';
import { ChartSkeleton }          from '../../_components/ChartSkeleton';
import ScalingTable               from '../_components/ScalingTable';
import TvlBars                    from '../_components/TvlBars';
import {
  getAllL2s,
  getOptimisticRollups,
  getZkRollups,
  getL2FeeData,
} from '@/lib/scaling-data';

export const metadata = {
  title: 'L2 Comparison | CryptoBrainNews',
  description: 'Side-by-side comparison of all Ethereum Layer 2 solutions by TVL, fees, and ecosystem size.',
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return n > 0 ? `$${n.toLocaleString()}` : '—';
}

async function L2ComparisonData() {
  const [allL2s, optimistic, zk, fees] = await Promise.all([
    getAllL2s(),
    getOptimisticRollups(),
    getZkRollups(),
    getL2FeeData(),
  ]);

  const totalTvl = allL2s.reduce((s, c) => s + c.tvl, 0);
  const optTvl   = optimistic.reduce((s, c) => s + c.tvl, 0);
  const zkTvl    = zk.reduce((s, c) => s + c.tvl, 0);
  const top1     = allL2s[0];

  // Fee map for quick lookup
  const feeMap = new Map(fees.map((f) => [f.name.toLowerCase(), f]));

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="L2 Comparison"
        description="Comprehensive side-by-side comparison of Ethereum Layer 2 solutions – TVL, fees, protocols, and growth."
      />

      {/* ── Summary KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total L2 Ecosystem TVL', value: fmtUsd(totalTvl),                  color: '#FABF2C' },
          { label: 'Largest L2',              value: top1?.name ?? '—',                 color: '#fff', sub: fmtUsd(top1?.tvl ?? 0) },
          { label: 'Optimistic TVL',          value: fmtUsd(optTvl),                    color: '#3b82f6' },
          { label: 'ZK Rollup TVL',           value: fmtUsd(zkTvl),                     color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Side-by-side bars ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TvlBars chains={optimistic} title="Optimistic Rollups TVL" maxItems={6} />
        <TvlBars chains={zk}         title="ZK Rollups TVL"          maxItems={6} />
      </div>

      {/* ── Detailed comparison table with fees ────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Full Comparison Table
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Network', 'Type', 'TVL', '24h %', '7d %', '24h Fees', 'Protocols', 'Share'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${
                      ['#', 'Network', 'Type'].includes(h) ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allL2s.map((c, i) => {
                const share     = totalTvl > 0 ? (c.tvl / totalTvl) * 100 : 0;
                const feeData   = feeMap.get(c.name.toLowerCase());
                const typeColor = c.type === 'optimistic' ? '#3b82f6' : '#8b5cf6';
                const typeLabel = c.type === 'optimistic' ? 'Optimistic' : 'ZK';
                return (
                  <tr
                    key={c.slug}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                    }`}
                  >
                    <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                        <span className="font-bold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 border"
                        style={{ color: typeColor, borderColor: `${typeColor}40`, background: `${typeColor}15` }}
                      >
                        {typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums" style={{ color: c.color }}>
                      {fmtUsd(c.tvl)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.change1d != null ? (
                        <span className={`font-mono font-bold text-xs ${c.change1d >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                          {c.change1d >= 0 ? '+' : ''}{c.change1d.toFixed(2)}%
                        </span>
                      ) : <span className="text-[#333]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.change7d != null ? (
                        <span className={`font-mono font-bold text-xs ${c.change7d >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                          {c.change7d >= 0 ? '+' : ''}{c.change7d.toFixed(2)}%
                        </span>
                      ) : <span className="text-[#333]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#00d672]">
                      {feeData?.total24h != null ? `$${(feeData.total24h / 1e3).toFixed(0)}K` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {c.protocols ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                      {share.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: DefiLlama · Cached 1 hour</p>
      </div>
    </div>
  );
}

export default function L2ComparisonPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <L2ComparisonData />
      </Suspense>
    </main>
  );
}
