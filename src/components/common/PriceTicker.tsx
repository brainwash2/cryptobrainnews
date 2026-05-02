'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CoinData {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<CoinData[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const data = await res.json();
        if (Array.isArray(data)) {
          setPrices(data.slice(0, 20)); // Take top 20 for the ticker
        }
      } catch (error) {
        console.error("Failed to fetch ticker prices via CoinGecko proxy", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  },[]);

  if (prices.length === 0) {
    return (
      <div className="fixed top-14 left-0 right-0 z-[998] bg-black border-b border-[#1a1a1a] h-10" />
    );
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-[998] bg-black border-b border-[#1a1a1a] h-10 flex items-center overflow-hidden">
      <div className="flex whitespace-nowrap w-max">
        
        <div className="flex animate-scroll hover:[animation-play-state:paused]">
          {prices.map((coin) => (
            <TickerItem key={coin.id} coin={coin} />
          ))}
        </div>

        <div className="flex animate-scroll hover:[animation-play-state:paused]" aria-hidden="true">
          {prices.map((coin) => (
            <TickerItem key={`${coin.id}-duplicate`} coin={coin} />
          ))}
        </div>

      </div>
    </div>
  );
}

function TickerItem({ coin }: { coin: CoinData }) {
  const price = Number(coin.current_price || 0);
  const formattedPrice = price > 1 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toFixed(4);
  const change = Number(coin.price_change_percentage_24h || 0);
  const isPositive = change >= 0;

  return (
    <Link href={`/coins/${coin.id.toLowerCase()}`} className="mx-6 flex items-center space-x-2 text-[11px] font-mono hover:opacity-70 transition-opacity">
      <span className="text-[#FABF2C] font-black">{coin.symbol.toUpperCase()}</span>
      <span className="text-white font-bold">${formattedPrice}</span>
      <span className={isPositive ? "text-[#00d672]" : "text-[#ff4757]"}>
        {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
      </span>
    </Link>
  );
}
