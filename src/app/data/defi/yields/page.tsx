import React from 'react';
import { MetricCard } from '../../_components/MetricCard';

export default function YieldsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Yield <span className="text-primary">Aggregator</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="USDC Yield (Avg)" value="5.2%" trend={0.4} />
        <MetricCard label="ETH Staking" value="3.8%" />
        <MetricCard label="Highest APY" value="124%" />
        <MetricCard label="Risk Level" value="STABLE" />
      </div>
      <div className="p-20 border-2 border-dashed border-[#1a1a1a] rounded text-center text-[#333] font-mono text-xs uppercase tracking-[0.5em]">
        Yield opportunity scanner initializing...
      </div>
    </div>
  );
}
