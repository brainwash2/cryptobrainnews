import React from 'react';
import { getDeFiProtocols } from '@/lib/api';

export default async function TVLPage() {
  const protocols = await getDeFiProtocols();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white font-heading uppercase">TVL <span className="text-primary">Rankings</span></h1>
      <div className="grid grid-cols-1 gap-2">
        {protocols.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-[#333] font-mono text-xs">#{(i + 1).toString().padStart(2, '0')}</span>
              <span className="font-bold text-white uppercase">{p.name}</span>
            </div>
            <span className="font-mono text-primary">${p.tvl?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
