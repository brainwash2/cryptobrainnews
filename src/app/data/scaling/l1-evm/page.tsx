import React, { Suspense }     from 'react';
import { DataHeader }           from '../../_components/DataHeader';
import { ChartSkeleton }        from '../../_components/ChartSkeleton';
import ScalingTable             from '../_components/ScalingTable';
import TvlBars                  from '../_components/TvlBars';
import { getL1EvmChains }       from '@/lib/scaling-data';

export const metadata = {
  title: 'L1 EVM Blockchains | CryptoBrainNews',
  description: 'Ethereum, BNB Chain, Polygon, Avalanche and other EVM-compatible Layer 1 blockchains by TVL.',
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return n > 0 ? `$${n.toLocaleString()}` : '—';
}

async function L1EvmData() {
  const chains   = await getL1EvmChains();
  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);
  const topChain = chains[0];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Layer 1: EVM Blockchains"
        description="EVM-compatible Layer 1 chains ranked by DeFi TVL – Ethereum, BNB Chain, Polygon, Avalanche, and more."
      />

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total EVM L1 TVL',   value: fmtUsd(totalTvl),                color: '#FABF2C' },
          { label: 'Leading Chain',       value: topChain?.name ?? '—',           color: '#fff', sub: fmtUsd(topChain?.tvl ?? 0) },
          { label: 'Chains Tracked',      value: String(chains.length),           color: '#888' },
          { label: 'ETH Share',           value: totalTvl > 0
            ? `${((chains.find(c => c.name === 'Ethereum')?.tvl ?? 0) / totalTvl * 100).toFixed(1)}%`
            : '—',
            color: '#3b82f6', sub: 'of EVM L1 TVL' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── TVL Bars ───────────────────────────────────────────────── */}
      <TvlBars chains={chains} title="EVM L1 TVL Market Share" maxItems={10} />

      {/* ── Full Table ─────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All EVM L1 Chains
        </h3>
        <ScalingTable chains={chains} />
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: DefiLlama · Cached 1 hour</p>
      </div>
    </div>
  );
}

export default function L1EvmPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <L1EvmData />
      </Suspense>
    </main>
  );
}
