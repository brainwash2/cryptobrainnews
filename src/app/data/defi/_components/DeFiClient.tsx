'use client';
import React, { useState, useMemo } from 'react';
import { formatNumber } from '../../_lib/formatters';

interface Protocol {
  name: string;
  tvl: number;
  chainTvls?: Record<string, number>;
}

export default function DeFiClient({ protocols }: { protocols: Protocol[] }) {
  const [search, setSearch] = useState('');
  const [chain, setChain] = useState('all');

  const filtered = useMemo(() => {
    let result = (protocols || []).slice(0, 100);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name?.toLowerCase().includes(q));
    }
    return result.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
  }, [protocols, search, chain]);

  const totalTVL = filtered.reduce((sum, p) => sum + (p.tvl || 0), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-2xl font-black text-[#FABF2C]">${formatNumber(totalTVL)}</div>
          <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">
            Total TVL
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search protocol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2 text-xs font-mono outline-none focus:border-[#FABF2C]/50 placeholder:text-[#333] uppercase"
        />
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Protocol</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">TVL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((p) => (
              <tr key={p.name} className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a] transition-colors">
                <td className="px-4 py-4 text-[#aaa]">{p.name}</td>
                <td className="px-4 py-4 text-right font-black text-[#FABF2C]">${formatNumber(p.tvl || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
          <p className="text-[#333] font-mono text-xs uppercase tracking-widest">No protocols found</p>
        </div>
      )}
    </div>
  );
}
