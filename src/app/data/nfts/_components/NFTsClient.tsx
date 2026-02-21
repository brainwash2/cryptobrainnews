'use client';
import React, { useState } from 'react';

const MOCK_NFTS = [
  { collection: 'Pudgy Penguins', volume_24h: 2400000, floor_price: 1850, sales_count: 156 },
  { collection: 'Doodles', volume_24h: 1680000, floor_price: 15.2, sales_count: 89 },
  { collection: 'Blur Blur Blur', volume_24h: 1240000, floor_price: 0.85, sales_count: 2340 },
  { collection: 'MomokaKu', volume_24h: 890000, floor_price: 22.5, sales_count: 45 },
];

export default function NFTsClient({ nftData }: { nftData: any }) {
  const [sortBy, setSortBy] = useState('volume');

  const sorted = [...MOCK_NFTS].sort((a, b) => {
    if (sortBy === 'volume') return b.volume_24h - a.volume_24h;
    if (sortBy === 'floor') return b.floor_price - a.floor_price;
    return b.sales_count - a.sales_count;
  });

  const totalVolume = MOCK_NFTS.reduce((sum, n) => sum + n.volume_24h, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-2xl font-black text-[#FABF2C]">${(totalVolume / 1e6).toFixed(1)}M</div>
          <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">24h Volume</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-2xl font-black text-[#FABF2C]">{MOCK_NFTS.length}</div>
          <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">Top Collections</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['volume', 'floor', 'sales'].map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
              sortBy === s
                ? 'bg-[#FABF2C] text-black border-[#FABF2C]'
                : 'bg-transparent text-[#555] border-[#1a1a1a]'
            }`}
          >
            Sort by {s}
          </button>
        ))}
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Collection</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">24h Volume</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Floor Price</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Sales</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((nft) => (
              <tr key={nft.collection} className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a]">
                <td className="px-4 py-4 text-white font-bold">{nft.collection}</td>
                <td className="px-4 py-4 text-right text-[#FABF2C]">${(nft.volume_24h / 1e6).toFixed(2)}M</td>
                <td className="px-4 py-4 text-right text-[#aaa]">{nft.floor_price} ETH</td>
                <td className="px-4 py-4 text-right text-[#888]">{nft.sales_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
