import React from 'react';
import { getDeFiProtocols } from '@/lib/api';
import { MetricCard } from '../_components/MetricCard';

export default async function DeFiOverviewPage() {
  const protocols = await getDeFiProtocols();
  const totalTVL = protocols.reduce((sum, p) => sum + (p.tvl || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          DeFi <span className="text-primary">Intelligence</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">Institutional Protocol Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Global DeFi TVL" value={`$${(totalTVL / 1e9).toFixed(2)}B`} />
        <MetricCard label="Active Protocols" value={String(protocols.length)} />
        <MetricCard label="Market State" value="EXPANDING" />
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <th className="px-6 py-3 text-[10px] font-black text-[#444] uppercase tracking-widest">Protocol</th>
              <th className="px-6 py-3 text-[10px] font-black text-[#444] uppercase tracking-widest">Category</th>
              <th className="px-6 py-3 text-[10px] font-black text-[#444] uppercase tracking-widest text-right">TVL</th>
            </tr>
          </thead>
          <tbody>
            {protocols.slice(0, 10).map((p, i) => (
              <tr key={i} className="border-b border-[#111] hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-white text-sm">{p.name}</td>
                <td className="px-6 py-4 text-[#666] text-xs uppercase font-mono">{p.category}</td>
                <td className="px-6 py-4 text-right font-mono text-primary text-sm">${(p.tvl / 1e6).toFixed(1)}M</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
