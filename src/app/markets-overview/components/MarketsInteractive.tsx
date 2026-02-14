// src/app/markets-overview/components/MarketsInteractive.tsx
'use client';

import React, { useState, useEffect } from 'react';
// FIX: Import from fallback-data directly, NOT from api.ts
import { FALLBACK_MARKET_DATA } from '@/lib/fallback-data';

export default function MarketsInteractive() {
  const [data, setData] = useState<any[]>(FALLBACK_MARKET_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/prices', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) setData(json);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('[Markets] Fetch failed, using fallback');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.slice(0, 6).map((coin, index) => {
        const barWidth = `${((index + 1) * 15 + 20) % 100}%`;
        const change = coin.price_change_percentage_24h ?? 0;

        return (
          <div
            key={coin.id}
            className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 hover:border-primary/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={coin.image}
                  className="w-7 h-7 rounded-full grayscale group-hover:grayscale-0 transition-all"
                  alt={coin.name}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{coin.name}</h3>
                  <span className="text-[10px] text-[#555] font-mono uppercase">
                    {coin.symbol}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                  change >= 0
                    ? 'bg-[#00d672]/10 text-[#00d672]'
                    : 'bg-[#ff4757]/10 text-[#ff4757]'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {change.toFixed(2)}%
              </span>
            </div>
            <p className="text-xl font-black text-white font-mono tabular-nums mb-1">
              ${coin.current_price?.toLocaleString()}
            </p>
            <div className="h-0.5 w-full bg-[#111] mt-3 overflow-hidden">
              <div
                className="h-full bg-primary/50"
                style={{ width: barWidth }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
