// src/components/common/PriceTicker.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function PriceTicker() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function fetchPrices() {
      try {
        const res = await fetch('/api/prices', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (mounted && Array.isArray(data)) {
          setPrices(
            data.map((c: any) => ({
              symbol: (c.symbol || '').toUpperCase(),
              price: Number(c.current_price ?? 0),
              change: Number(c.price_change_percentage_24h ?? 0),
            }))
          );
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.warn('[Ticker] Fetch failed');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  if (loading || prices.length === 0) {
    return (
      <div className="fixed top-16 left-0 right-0 z-[999] bg-black border-b border-primary/20 h-10 flex items-center px-4">
        <span className="text-[10px] font-mono text-primary animate-pulse tracking-[0.2em]">
          CONNECTING TO DATA FEED...
        </span>
      </div>
    );
  }

  // Double the array for seamless infinite scroll
  const displayPrices = [...prices, ...prices];

  return (
    <div className="fixed top-16 left-0 right-0 z-[999] bg-black border-b border-[#1a1a1a] h-10 flex items-center overflow-hidden">
      <div className="flex ticker-scroll whitespace-nowrap gap-6 px-4">
        {displayPrices.map((crypto, index) => (
          <div
            key={`${crypto.symbol}-${index}`}
            className="flex items-center gap-2"
          >
            <span className="text-[11px] font-black text-primary font-mono">
              {crypto.symbol}
            </span>
            <span className="text-[11px] font-bold text-white font-mono tabular-nums">
              $
              {crypto.price > 1
                ? crypto.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })
                : crypto.price.toFixed(4)}
            </span>
            <span
              className={`text-[10px] font-bold font-mono tabular-nums ${
                crypto.change >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'
              }`}
            >
              {crypto.change >= 0 ? '▲' : '▼'}{' '}
              {Math.abs(crypto.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
