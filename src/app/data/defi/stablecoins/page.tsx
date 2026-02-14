import React from 'react';
import { getStablecoinData } from '@/lib/api';
import { MetricCard } from '../../_components/MetricCard';

export default async function StablecoinsPage() {
  const data = await getStablecoinData();
  const currentMcap = data[data.length - 1]?.mcap || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          Stablecoin <span className="text-primary">Intelligence</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">Aggregate Market Cap & Liquidity Flows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Circulating" value={`$${(currentMcap / 1e9).toFixed(2)}B`} />
        <MetricCard label="Dominance" value="72.4%" />
        <MetricCard label="Data Source" value="DefiLlama" />
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] p-8 text-center">
        <p className="text-[#333] font-mono text-xs uppercase tracking-widest italic">Chart Visualization Module Loading...</p>
      </div>
    </div>
  );
}
