import React from 'react';
import { getTopYields, type YieldPool } from '@/lib/api';
import { MetricCard } from '../../_components/MetricCard';

export const metadata = { title: 'DeFi Yields | CryptoBrainNews' };
export const revalidate = 600;

export default async function YieldsPage() {
  const yields = await getTopYields();

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

  const avgApy = yields.reduce((sum: number, p: YieldPool) => sum + p.apy, 0) / yields.length;
  const topPool = yields.reduce((prev: YieldPool, current: YieldPool) =>
    prev.apy > current.apy ? prev : current
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          DeFi <span className="text-primary">Yields</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Top Opportunities • Risk-Adjusted by TVL
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Opportunities" value={String(yields.length)} />
        <MetricCard label="Avg APY (Top 50)" value={`${avgApy.toFixed(2)}%`} />
        <MetricCard label="Highest APY" value={`${topPool.apy.toFixed(2)}%`} />
        <MetricCard label="Source" value="DefiLlama API" />
      </div>

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
  );
}
