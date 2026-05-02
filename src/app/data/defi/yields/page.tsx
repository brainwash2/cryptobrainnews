import React                              from 'react';
import { getTopYields, type YieldPool }  from '@/lib/api';
import { getTopYieldPools }              from '@/lib/defi-data';
import type { YieldPool as DefiYieldPool } from '@/lib/defi-data';
import { MetricCard }                    from '../../_components/MetricCard';
import { DefiTable, fmtUsd }            from '../_components/DefiTable';

export const metadata = { title: 'DeFi Yields | CryptoBrainNews' };
export const revalidate = 600;

// ── APY colour ────────────────────────────────────────────────────────────────
function apyColor(v: number): string {
  if (v >= 15) return '#00d672';
  if (v >= 5)  return '#FABF2C';
  return '#888';
}

// ── Risk-tier badge ───────────────────────────────────────────────────────────
function riskTier(tvl: number): { label: string; color: string; border: string } {
  if (tvl >= 10_000_000) return { label: 'Established', color: '#00d672', border: 'rgba(0,214,114,0.35)' };
  if (tvl >= 1_000_000)  return { label: 'New',         color: '#FABF2C', border: 'rgba(250,191,44,0.35)' };
  return                         { label: 'Unverified',  color: '#888',    border: 'rgba(136,136,136,0.35)' };
}

// ── Stablecoin scanner section (server-rendered) ──────────────────────────────
function StablecoinScanner({ pools }: { pools: DefiYieldPool[] }) {
  const stables = pools
    .filter((p) => p.stablecoin)
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 25);

  if (!stables.length) return null;

  // KPI computations
  const topPool    = stables[0];
  const poolCount  = stables.length;
  const sortedTvl  = [...stables].sort((a, b) => a.tvlUsd - b.tvlUsd);
  const medianTvl  = sortedTvl[Math.floor(sortedTvl.length / 2)]?.tvlUsd ?? 0;

  // Rows for DefiTable — add computed risk field
  const rows = stables.map((p) => ({
    project:  p.project,
    chain:    p.chain,
    symbol:   p.symbol,
    apy:      p.apy,
    tvlUsd:   p.tvlUsd,
    _tier:    riskTier(p.tvlUsd),
  })) as Record<string, unknown>[];

  return (
    <div>
      {/* Section heading */}
      <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[#00d672]" />
        Stablecoin Yield Opportunities
      </h2>

      {/* 3-KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Top Stablecoin APY */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Top Stablecoin APY
          </p>
          <p className="text-2xl font-black tabular-nums" style={{ color: apyColor(topPool.apy) }}>
            {topPool.apy.toFixed(2)}%
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            {topPool.project} · {topPool.symbol} · {topPool.chain}
          </p>
        </div>

        {/* Stable Pools Count */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Stable Pools Tracked
          </p>
          <p className="text-2xl font-black tabular-nums text-white">{poolCount}</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            stablecoin pools with active yield
          </p>
        </div>

        {/* Median Stablecoin TVL */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Median Pool TVL
          </p>
          <p className="text-2xl font-black tabular-nums text-[#3b82f6]">
            {fmtUsd(medianTvl)}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">across tracked stable pools</p>
        </div>
      </div>

      {/* Ranked table */}
      <DefiTable
        columns={[
          {
            key: 'project',
            label: 'Protocol',
            render: (v) => (
              <span className="font-bold text-white capitalize">{String(v)}</span>
            ),
          },
          {
            key: 'chain',
            label: 'Chain',
            render: (v) => (
              <span className="text-[#888] font-mono text-[10px]">{String(v)}</span>
            ),
          },
          {
            key: 'symbol',
            label: 'Asset',
            render: (v) => (
              <span className="font-mono font-black text-[#FABF2C] text-[11px]">{String(v)}</span>
            ),
          },
          {
            key: 'apy',
            label: 'APY',
            align: 'right',
            render: (v) => {
              const n = v as number;
              return (
                <span className="font-mono font-black tabular-nums" style={{ color: apyColor(n) }}>
                  {n.toFixed(2)}%
                </span>
              );
            },
          },
          {
            key: 'tvlUsd',
            label: 'TVL',
            align: 'right',
            render: (v) => (
              <span className="font-mono font-black text-[#3b82f6] tabular-nums">
                {fmtUsd(v)}
              </span>
            ),
          },
          {
            key: '_tier',
            label: 'Risk Tier',
            render: (v) => {
              const t = v as { label: string; color: string; border: string };
              return (
                <span
                  className="font-mono font-black text-[10px] px-2 py-0.5 border"
                  style={{ color: t.color, borderColor: t.border }}
                >
                  {t.label}
                </span>
              );
            },
          },
        ]}
        data={rows}
        source="Source: DefiLlama yields API · Stablecoin pools only · Ranked by APY · Cached 10 min"
      />

      {/* Risk tier key */}
      <div className="flex gap-5 mt-3 flex-wrap">
        {[
          { label: 'Established', desc: '>$10M TVL', color: '#00d672' },
          { label: 'New',         desc: '$1M–$10M',  color: '#FABF2C' },
          { label: 'Unverified',  desc: '<$1M TVL',  color: '#888'    },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
            <span className="text-[9px] font-mono text-[#555]">
              {t.label} — {t.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function YieldsPage() {
  const [yields, allPools] = await Promise.all([
    getTopYields(),
    getTopYieldPools(200),   // larger slice so stablecoin filter has enough data
  ]);

  if (yields.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
            DeFi <span className="text-primary">Yields</span>
          </h1>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-12 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">No yield data available.</p>
        </div>
      </div>
    );
  }

  const avgApy  = yields.reduce((sum: number, p: YieldPool) => sum + p.apy, 0) / yields.length;
  const topPool = yields.reduce((prev: YieldPool, cur: YieldPool) =>
    prev.apy > cur.apy ? prev : cur,
  );

  return (
    <div className="space-y-8 pb-20">
      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          DeFi <span className="text-primary">Yields</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Top Opportunities • Risk-Adjusted by TVL
        </p>
      </div>

      {/* ── Existing KPI strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Opportunities"   value={String(yields.length)} />
        <MetricCard label="Avg APY (Top 50)" value={`${avgApy.toFixed(2)}%`} />
        <MetricCard label="Highest APY"     value={`${topPool.apy.toFixed(2)}%`} />
        <MetricCard label="Source"          value="DefiLlama API" />
      </div>

      {/* ── Batch 20: Stablecoin Yield Scanner ──────────────────────────── */}
      <StablecoinScanner pools={allPools} />

      {/* ── Existing full yields table ───────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#FABF2C]" />
          All Top Yield Pools
        </h2>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] text-[#555] uppercase tracking-wider font-mono border-b border-[#1a1a1a]">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Protocol</th>
                  <th className="px-6 py-3">Chain</th>
                  <th className="px-6 py-3">Token</th>
                  <th className="px-6 py-3 text-right">TVL</th>
                  <th className="px-6 py-3 text-right">APY</th>
                  <th className="px-6 py-3 text-right">1D Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {yields.map((pool: YieldPool, i: number) => (
                  <tr
                    key={pool.pool || `${pool.project}-${i}`}
                    className={`hover:bg-[#111] transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'}`}
                  >
                    <td className="px-6 py-3 text-[#555]">{i + 1}</td>
                    <td className="px-6 py-3 font-semibold text-white">{pool.project}</td>
                    <td className="px-6 py-3 text-[#888]">{pool.chain}</td>
                    <td className="px-6 py-3 text-[#888]">{pool.symbol}</td>
                    <td className="px-6 py-3 text-right text-[#888]">
                      ${(pool.tvlUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-[#FABF2C]">
                      {pool.apy.toFixed(2)}%
                    </td>
                    <td className={`px-6 py-3 text-right font-mono ${
                      (pool.apyPct1D ?? 0) > 0
                        ? 'text-[#00d672]'
                        : (pool.apyPct1D ?? 0) < 0
                        ? 'text-[#ff4757]'
                        : 'text-[#555]'
                    }`}>
                      {pool.apyPct1D != null
                        ? `${pool.apyPct1D > 0 ? '+' : ''}${pool.apyPct1D.toFixed(2)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
