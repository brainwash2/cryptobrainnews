import React from 'react';
import { MetricCard } from '../_components/MetricCard';

export default function OnChainPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-white font-heading uppercase">On-Chain <span className="text-primary">Metrics</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="ETH Gas" value="14 Gwei" />
        <MetricCard label="Active Addr" value="452K" trend={2.4} />
        <MetricCard label="Daily Tx" value="1.1M" />
        <MetricCard label="Burned ETH" value="2.1K" />
      </div>
      <div className="h-64 border border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center text-[#222] font-black text-4xl">NETWORK ACTIVITY</div>
    </div>
  );
}
