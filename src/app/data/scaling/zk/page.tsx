import React from 'react';
import { MetricCard } from '../../_components/MetricCard';

export const metadata = { title: 'scaling / zk | CryptoBrainNews' };

export default function Page() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          scaling / zk <span className="text-primary">Data</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Coming Soon • Powered by Dune Analytics
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Status" value="Building" />
        <MetricCard label="Source" value="Dune" />
      </div>
      <div className="p-20 border-2 border-dashed border-[#1a1a1a] text-center text-[#333] font-mono text-xs uppercase tracking-[0.3em]">
        Data pipeline initializing...
      </div>
    </div>
  );
}
