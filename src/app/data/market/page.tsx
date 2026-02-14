import React from 'react';
import { getLivePrices } from '@/lib/api';

export default async function MarketOverviewPage() {
  const prices = await getLivePrices();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Market <span className="text-primary">Data</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prices.slice(0, 4).map(coin => (
          <div key={coin.id} className="p-6 border border-[#1a1a1a] bg-[#080808] flex justify-between items-center">
            <span className="font-bold text-white uppercase">{coin.symbol}</span>
            <span className="font-mono text-primary">${coin.current_price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
