'use client';
import React, { useState } from 'react';
import type { DuneRow } from '@/lib/dune';

interface ExchangesClientProps { topDexes: DuneRow[]; }

export default function ExchangesClient({ topDexes }: ExchangesClientProps) {
  const[timeframe, setTimeframe] = useState<'24h' | '30d'>('30d');
  const data = Array.isArray(topDexes) ? topDexes :[];
  const totalVolume = data.reduce((sum, d) => sum + Number(d.volume_30d_usd || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        {(['24h', '30d'] as const).map((tf) => (
          <button key={tf} onClick={() => setTimeframe(tf)} disabled={tf === '24h'} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${timeframe === tf ? 'bg-[#FABF2C] text-black border-[#FABF2C]' : 'bg-transparent text-[#555] border-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed'}`}>
            {tf}
          </button>
        ))}
      </div>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 max-w-sm">
        <div className="text-[#555] text-[10px] font-black tracking-widest uppercase mb-2">Total {timeframe} Volume</div>
        <div className="text-3xl font-black text-[#FABF2C]">${(totalVolume / 1e9).toFixed(2)}B</div>
      </div>
      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#050505]">
            <tr>
              <th className="px-6 py-4 text-left font-black text-[#555] uppercase tracking-widest">Protocol</th>
              <th className="px-6 py-4 text-left font-black text-[#555] uppercase tracking-widest">Chain</th>
              <th className="px-6 py-4 text-right font-black text-[#555] uppercase tracking-widest">30d Volume</th>
              <th className="px-6 py-4 text-right font-black text-[#555] uppercase tracking-widest">Trades</th>
            </tr>
          </thead>
          <tbody>
            {data.map((dex, i) => (
              <tr key={`${dex.dex}-${i}`} className={`border-b border-[#111] hover:bg-[#18181b] transition-colors ${i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#080808]'}`}>
                <td className="px-6 py-4 text-white font-bold capitalize">{String(dex.dex || 'Unknown')}</td>
                <td className="px-6 py-4 text-[#888] capitalize">{String(dex.blockchain || 'Unknown')}</td>
                <td className="px-6 py-4 text-right font-mono font-black text-[#FABF2C]">${(Number(dex.volume_30d_usd || 0) / 1e9).toFixed(2)}B</td>
                <td className="px-6 py-4 text-right font-mono text-[#ccc]">{Number(dex.trade_count || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div className="py-20 text-center"><p className="text-[#555] font-mono text-xs uppercase tracking-widest">Syncing DEX data from Dune...</p></div>}
      </div>
    </div>
  );
}
