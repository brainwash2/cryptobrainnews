'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

const PriceTicker = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        // FETCH FROM OUR LOCAL API ROUTE (/api/prices) - This is the key fix
        const res = await fetch('/api/prices'); 
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const formatted = data.map((c) => ({
            symbol: c.symbol.toUpperCase(),
            price: c.current_price,
            changePercent24h: c.price_change_percentage_24h
          }));
          setPrices(formatted);
        }
      } catch (e) {
        console.error("Ticker client fetch failed", e);
        // If the client fetch fails, we show nothing until the next check
        setPrices([]); 
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); 
    return () => clearInterval(interval);
  }, []);

  if (loading || prices.length === 0) {
    return (
      <div className="sticky top-16 z-[999] bg-black border-b border-primary/20 h-14 flex items-center px-4">
        <span className="text-xs font-data text-primary animate-pulse tracking-tighter">ESTABLISHING SECURE DATA STREAM...</span>
      </div>
    );
  }

  const displayPrices = [...prices, ...prices];

  return (
    <div className="sticky top-16 z-[999] bg-black border-b border-primary h-14 flex items-center overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap gap-8 px-4">
        {displayPrices.map((crypto, index) => (
          <div key={`${crypto.symbol}-${index}`} className="flex items-center gap-3">
            <span className="text-sm font-black text-primary font-heading italic">{crypto.symbol}</span>
            <span className="text-sm font-bold text-white font-data">
              ${crypto.price > 1 ? crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2}) : crypto.price.toFixed(4)}
            </span>
            <span className={`text-xs font-bold font-data ${crypto.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {crypto.changePercent24h >= 0 ? '▲' : '▼'} {Math.abs(crypto.changePercent24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 60s linear infinite; }
      `}</style>
    </div>
  );
};

export default PriceTicker;
