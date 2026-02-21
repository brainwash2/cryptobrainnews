'use client';
import React from 'react';

const MOCK_STABLECOINS = [
  { symbol: 'USDT', name: 'Tether', supply: 120500000000, change_24h: 0.5, chains: 9 },
  { symbol: 'USDC', name: 'Circle USD Coin', supply: 28400000000, change_24h: -0.2, chains: 8 },
  { symbol: 'DAI', name: 'MakerDAO DAI', supply: 5200000000, change_24h: 0.1, chains: 7 },
  { symbol: 'BUSD', name: 'Binance USD', supply: 4800000000, change_24h: -0.3, chains: 5 },
];

export default function StablecoinClient({ stablecoins }: { stablecoins: any }) {
  const totalSupply = MOCK_STABLECOINS.reduce((sum, s) => sum + s.supply, 0);

  return (
    <div className="space-y-8">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="text-2xl font-black text-[#FABF2C]">${(totalSupply / 1e9).toFixed(1)}B</div>
        <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">Total Supply</div>
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Stablecoin</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Supply</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">24h Change</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Chains</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_STABLECOINS.map((s) => (
              <tr key={s.symbol} className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a]">
                <td className="px-4 py-4 text-white font-bold">{s.symbol}</td>
                <td className="px-4 py-4 text-[#aaa]">${(s.supply / 1e9).toFixed(1)}B</td>
                <td
                  className={`px-4 py-4 text-right font-black ${s.change_24h > 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {s.change_24h > 0 ? '+' : ''}{s.change_24h}%
                </td>
                <td className="px-4 py-4 text-right text-[#FABF2C]">{s.chains}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
