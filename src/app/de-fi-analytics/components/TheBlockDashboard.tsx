'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function TheBlockDashboard({ dexVolume, stableMcap, protocols }: any) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0a] border border-gray-900 p-8 shadow-2xl">
          <h3 className="text-white font-black text-xs uppercase mb-8 border-l-2 border-primary pl-4 tracking-widest">Daily DEX Volume (7DMA)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dexVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} tickFormatter={(v) => `$${(v/1e9).toFixed(1)}B`} />
                <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #333'}} />
                <Area type="monotone" dataKey="volume" stroke="#FABF2C" fill="#FABF2C" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-gray-900 p-8 shadow-2xl">
          <h3 className="text-white font-black text-xs uppercase mb-8 border-l-2 border-primary pl-4 tracking-widest">Total Stablecoin Supply</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stableMcap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} tickFormatter={(v) => `$${(v/1e9).toFixed(0)}B`} />
                <Bar dataKey="mcap" fill="#627EEA" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-[#0a0a0a] border border-gray-900 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-black text-[10px] text-gray-500 font-black uppercase">
            <tr><th className="p-6">Protocol</th><th className="p-6 text-right">TVL</th><th className="p-6 text-right">1D Change</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {protocols.map((p: any) => (
              <tr key={p.name} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-bold text-white text-sm">{p.name} <span className="text-[10px] text-gray-600 ml-2 uppercase font-mono">{p.chain}</span></td>
                <td className="p-6 text-right font-mono text-white text-sm">${(p.tvl/1e9).toFixed(2)}B</td>
                <td className={`p-6 text-right font-mono text-xs ${p.change_1d >= 0 ? 'text-green-500' : 'text-red-500'}`}>{p.change_1d?.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
