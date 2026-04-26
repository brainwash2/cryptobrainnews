'use client';

import React, { Suspense, useState } from 'react';
import { DataHeader }       from '../_components/DataHeader';
import { ChartSkeleton }    from '../_components/ChartSkeleton';
import ScalingTable          from './_components/ScalingTable';
import TvlBars               from './_components/TvlBars';
import {
  getAllL2s,
  getL2FeeData,
  getOptimisticRollups,
  getZkRollups,
} from '@/lib/scaling-data';
import Link from 'next/link';

export const metadata = {
  title: 'L2 Scaling Overview | CryptoBrainNews',
  description: 'Complete overview of Layer 2 rollup TVL, fees, and adoption across Optimistic and ZK solutions.',
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return '—';
}

function QuickLink({ href, label, color }: { href: string; label: string; color: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      className="px-4 py-2 border text-[10px] font-black uppercase tracking-widest transition-all"
      style={{
        borderColor: color,
        color: hover ? '#000' : color,
        background: hover ? color : 'transparent',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </Link>
  );
}

async function ScalingOverviewData() {
  const [allL2s, fees, optimistic, zk] = await Promise.all([
    getAllL2s(),
    getL2FeeData(),
    getOptimisticRollups(),
    getZkRollups(),
  ]);

  const totalL2Tvl    = allL2s.reduce((s, c) => s + c.tvl, 0);
  const optTvl        = optimistic.reduce((s, c) => s + c.tvl, 0);
  const zkTvl         = zk.reduce((s, c) => s + c.tvl, 0);
  const total24hFees  = fees.reduce((s, f) => s + (f.total24h ?? 0), 0);

  const QUICK_LINKS = [
    { label: 'L2 Comparison',      href: '/data/scaling/l2-comparison',   color: '#FABF2C' },
    { label: 'Optimistic Rollups', href: '/data/scaling/optimistic',       color: '#3b82f6' },
    { label: 'ZK Rollups',         href: '/data/scaling/zk',              color: '#8b5cf6' },
    { label: 'L1 EVM Chains',      href: '/data/scaling/l1-evm',          color: '#00d672' },
    { label: 'L1 Non-EVM',         href: '/data/scaling/l1-non-evm',      color: '#f97316' },
    { label: 'Data Availability',  href: '/data/scaling/data-availability',color: '#ec4899' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Scaling Solutions"
        description="Total value locked, fees, and ecosystem metrics across all Layer 2 rollups and scaling solutions."
      />

      {/* ── Quick Nav ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {QUICK_LINKS.map((l) => (
          <QuickLink key={l.href} href={l.href} label={l.label} color={l.color} />
        ))}
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total L2 TVL',        value: fmtUsd(totalL2Tvl),         color: '#FABF2C' },
          { label: 'Optimistic TVL',       value: fmtUsd(optTvl),             color: '#3b82f6' },
          { label: 'ZK Rollup TVL',        value: fmtUsd(zkTvl),              color: '#8b5cf6' },
          { label: 'L2 Fees (24h)',         value: total24hFees > 0 ? `$${(total24hFees / 1e6).toFixed(2)}M` : '—', color: '#00d672' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Optimistic vs ZK split ─────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 border-l-2 border-[#FABF2C] pl-3">
          Optimistic vs ZK TVL Split
        </h3>
        {totalL2Tvl > 0 && (
          <div className="flex h-8 rounded overflow-hidden mb-4">
            <div
              className="flex items-center justify-center text-[10px] font-black text-white"
              style={{ width: `${(optTvl / totalL2Tvl) * 100}%`, background: '#3b82f6' }}
            >
              {((optTvl / totalL2Tvl) * 100) > 12 ? `OPT ${((optTvl / totalL2Tvl) * 100).toFixed(1)}%` : ''}
            </div>
            <div
              className="flex items-center justify-center text-[10px] font-black text-white"
              style={{ width: `${(zkTvl / totalL2Tvl) * 100}%`, background: '#8b5cf6' }}
            >
              {((zkTvl / totalL2Tvl) * 100) > 12 ? `ZK ${((zkTvl / totalL2Tvl) * 100).toFixed(1)}%` : ''}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Optimistic Rollups', tvl: optTvl, count: optimistic.length, color: '#3b82f6', examples: 'Arbitrum, OP, Base' },
            { label: 'ZK Rollups',          tvl: zkTvl,  count: zk.length,         color: '#8b5cf6', examples: 'zkSync, Starknet, Scroll' },
          ].map((s) => (
            <div key={s.label} className="border border-[#1a1a1a] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: s.color }}>{s.label}</p>
              <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{fmtUsd(s.tvl)}</p>
              <p className="text-[10px] font-mono text-[#555] mt-1">{s.count} chains · {s.examples}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TVL Bars ───────────────────────────────────────────────── */}
      <TvlBars chains={allL2s} title="All L2 TVL Market Share" maxItems={12} />

      {/* ── L2 Fee Leaderboard ─────────────────────────────────────── */}
      {fees.length > 0 && (
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#00d672] rounded-full" />
            L2 Fee Revenue (24h)
          </h3>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {['#', 'Protocol', '24h Fees', '7d Fees', '24h Change'].map((h) => (
                    <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${['#', 'Protocol'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map((f, i) => (
                  <tr key={f.name} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                    <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-white">{f.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-[#00d672] tabular-nums">
                      {f.total24h != null ? `$${(f.total24h / 1e3).toFixed(0)}K` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {f.total7d != null ? `$${(f.total7d / 1e6).toFixed(2)}M` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {f.change_1d != null ? (
                        <span className={`font-mono font-bold tabular-nums text-xs ${f.change_1d >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                          {f.change_1d >= 0 ? '+' : ''}{f.change_1d.toFixed(1)}%
                        </span>
                      ) : <span className="text-[#333]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: DefiLlama fees overview · Cached 1 hour</p>
        </div>
      )}

      {/* ── Full L2 table ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All L2 Networks – Ranked by TVL
        </h3>
        <ScalingTable chains={allL2s} showType />
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: DefiLlama · Cached 1 hour</p>
      </div>
    </div>
  );
}

export default function ScalingPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <ScalingOverviewData />
      </Suspense>
    </main>
  );
}