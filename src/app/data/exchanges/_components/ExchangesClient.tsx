'use client';
import React, { useState } from 'react';

interface DexData {
  name: string;
  volume_24h: number;
  volume_7d: number;
  chain: string;
}

const MOCK_DEXES: DexData[] = [
  { name: 'Uniswap', volume_24h: 2100000000, volume_7d: 14200000000, chain: 'Multi' },
  { name: 'Curve', volume_24h: 1850000000, volume_7d: 12400000000, chain: 'Multi' },
  { name: 'Raydium', volume_24h: 890000000, volume_7d: 5200000000, chain: 'Solana' },
  { name: '0x Protocol', volume_24h: 624000000, volume_7d: 3800000000, chain: 'Multi' },
];

export default function ExchangesClient() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d'>('24h');

  const totalVolume = MOCK_DEXES.reduce(
    (sum, d) => sum + (timeframe === '24h' ? d.volume_24h : d.volume_7d),
    0
  );

  const getVolume = (dex: DexData): number =>
    timeframe === '24h' ? dex.volume_24h : dex.volume_7d;

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        {(['24h', '7d'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
              timeframe === tf
                ? 'bg-[#FABF2C] text-black border-[#FABF2C]'
                : 'bg-transparent text-[#555] border-[#1a1a1a]'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="text-2xl font-black text-[#FABF2C]">
          ${(totalVolume / 1e9).toFixed(2)}B
        </div>
        <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">
          Total {timeframe} Volume
        </div>
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Protocol</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">{timeframe} Volume</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Chain</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DEXES.map((dex) => (
              <tr key={dex.name} className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a]">
                <td className="px-4 py-4 text-white font-bold">{dex.name}</td>
                <td className="px-4 py-4 text-right text-[#FABF2C]">
                  ${(getVolume(dex) / 1e9).toFixed(2)}B
                </td>
                <td className="px-4 py-4 text-right text-[#aaa]">{dex.chain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
