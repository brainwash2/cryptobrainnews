import React from 'react';
import { getDeFiProtocols } from '@/lib/api';

export const metadata = {
  title: 'DeFi TVL | CryptoBrainNews',
  description: 'DeFi Protocol Rankings by Total Value Locked.',
};

export const revalidate = 300;

export default async function TVLPage() {
  const protocols = await getDeFiProtocols();

  const formatUsd = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const formattedRows = protocols.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    category: (p as unknown as Record<string, string>).category ?? 'N/A',
    chain: (p as unknown as Record<string, string>).chain ?? 'Multi',
    tvl: p.tvl >= 1e9 ? `$${(p.tvl / 1e9).toFixed(2)}B` : `$${(p.tvl / 1e6).toFixed(1)}M`,
    change_1d: '—',
  }));

  const totalTvl = protocols.reduce((sum, p) => sum + p.tvl, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter mb-1">
          TVL <span className="text-[#FABF2C]">Rankings</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Total Value Locked by Protocol
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Total DeFi TVL</p>
          <p className="text-2xl font-black text-[#FABF2C]">{formatUsd(totalTvl)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Protocols Tracked</p>
          <p className="text-2xl font-black text-[#FABF2C]">{protocols.length}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Source</p>
          <p className="text-2xl font-black text-[#FABF2C]">DefiLlama</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080808] text-[#555] uppercase tracking-wider font-mono border-b border-[#1a1a1a]">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Protocol</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Chain</th>
                <th className="px-6 py-3 text-right">TVL</th>
                <th className="px-6 py-3 text-right">24H</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111]">
              {formattedRows.map((row, i) => (
                <tr
                  key={row.name}
                  className={`hover:bg-[#111] transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'}`}
                >
                  <td className="px-6 py-3 text-[#555]">{row.rank}</td>
                  <td className="px-6 py-3 font-semibold text-white">{row.name}</td>
                  <td className="px-6 py-3 text-[#888] text-[10px]">{row.category}</td>
                  <td className="px-6 py-3 text-[#888]">{row.chain}</td>
                  <td className="px-6 py-3 text-right font-bold text-[#FABF2C]">{row.tvl}</td>
                  <td className="px-6 py-3 text-right text-[#888]">{row.change_1d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
