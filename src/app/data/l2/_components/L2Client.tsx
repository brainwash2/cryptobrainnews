'use client';
import React from 'react';

const L2_DATA = [
  { name: 'Arbitrum', tvl: 4200000000, tx_24h: 45000000, avg_fee: 0.15, token: 'ARB' },
  { name: 'Optimism', tvl: 2100000000, tx_24h: 28000000, avg_fee: 0.18, token: 'OP' },
  { name: 'Base', tvl: 1800000000, tx_24h: 22000000, avg_fee: 0.08, token: 'None' },
  { name: 'ZkSync', tvl: 890000000, tx_24h: 8500000, avg_fee: 0.05, token: 'ZK' },
];

export default function L2Client() {
  const totalTVL = L2_DATA.reduce((sum, l2) => sum + l2.tvl, 0);

  return (
    <div className="space-y-8">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="text-2xl font-black text-[#FABF2C]">${(totalTVL / 1e9).toFixed(1)}B</div>
        <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">Total L2 TVL</div>
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Network</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">TVL</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">24h Txs</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Avg Fee</th>
            </tr>
          </thead>
          <tbody>
            {L2_DATA.map((l2) => (
              <tr key={l2.name} className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a]">
                <td className="px-4 py-4 text-white font-bold">{l2.name}</td>
                <td className="px-4 py-4 text-right text-[#FABF2C]">${(l2.tvl / 1e9).toFixed(2)}B</td>
                <td className="px-4 py-4 text-right text-[#aaa]">{(l2.tx_24h / 1e6).toFixed(1)}M</td>
                <td className="px-4 py-4 text-right text-[#888]">${l2.avg_fee.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
