'use client';
import React, { useState } from 'react';

export default function OnChainClient({ metrics }: { metrics: any }) {
  const [chain, setChain] = useState('bitcoin');

  const chains = ['bitcoin', 'ethereum', 'solana'];

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        {chains.map((c) => (
          <button
            key={c}
            onClick={() => setChain(c)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
              chain === c
                ? 'bg-[#FABF2C] text-black border-[#FABF2C]'
                : 'bg-transparent text-[#555] border-[#1a1a1a] hover:text-white hover:border-[#333]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Addresses', value: '—' },
          { label: 'Transactions (24h)', value: '—' },
          { label: 'Average Fee', value: '—' },
          { label: 'Whale Transfers', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <div className="text-2xl font-black text-[#FABF2C]">{stat.value}</div>
            <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
        <p className="text-[#333] font-mono text-xs uppercase tracking-widest">
          Dune data will populate here once queries are created
        </p>
      </div>
    </div>
  );
}
