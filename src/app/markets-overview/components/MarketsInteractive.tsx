'use client';
import React, { useState, useEffect } from 'react';
import { FALLBACK_MARKET_DATA } from '@/lib/api';

export default function MarketsInteractive() {
  const [data, setData] = useState<any[]>(FALLBACK_MARKET_DATA); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prices')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json) && json.length > 0) setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.slice(0, 6).map((coin, index) => {
        // DETERMINISTIC WIDTH CALCULATION (Fixes Hydration Error)
        // Uses the index to create a stable percentage instead of Math.random()
        const barWidth = `${((index + 1) * 15 + 20) % 100}%`;

        return (
          <div key={coin.id} className="bg-[#111] border border-gray-800 p-6 rounded-sm hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={coin.image} className="w-8 h-8 rounded-full grayscale group-hover:grayscale-0 transition-all" alt={coin.name} onError={(e) => e.currentTarget.style.display='none'} />
                <div>
                  <h3 className="font-bold text-white">{coin.name}</h3>
                  <span className="text-xs text-gray-500 font-mono uppercase">{coin.symbol}</span>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${coin.price_change_percentage_24h >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
            <p className="text-2xl font-black text-white font-mono mb-1">
              ${coin.current_price?.toLocaleString()}
            </p>
            <div className="h-1 w-full bg-gray-800 mt-4 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: barWidth }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
