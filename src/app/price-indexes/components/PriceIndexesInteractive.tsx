'use client';

import React, { useState, useEffect } from 'react';
import { getRealNews } from '@/lib/api';
import { CRYPTO_CATEGORIES } from '@/lib/categories';
import MarketHighlights from './MarketHighlights';
import CryptoTableRow from './CryptoTableRow';
import Icon from '@/components/ui/AppIcon';

export default function PriceIndexesInteractive() {
  const [coins, setCoins] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All Coins');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch Prices from OUR OWN API ROUTE (Bypasses Browser CORS/Blocks)
        const priceRes = await fetch('/api/prices');
        const marketData = await priceRes.json();
        
        if (Array.isArray(marketData)) {
          const formatted = marketData.map((coin: any, index: number) => ({
            id: coin.id,
            rank: coin.market_cap_rank || index + 1,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            // Ensure numbers
            price: Number(coin.current_price || coin.price || 0),
            change24h: Number(coin.price_change_percentage_24h || 0),
            change7d: Number(coin.price_change_percentage_7d_in_currency || 0),
            marketCap: Number(coin.market_cap || 0),
            volume24h: Number(coin.total_volume || 0),
            chartData: coin.sparkline_in_7d?.price?.map((p: number) => ({ value: p })) || []
          }));
          setCoins(formatted);
        }

        // 2. Fetch News (Directly or via lib, Client side is fine for news usually)
        const newsData = await getRealNews();
        setNews(newsData);

      } catch (e) {
        console.error("Data Load Error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeCategory]);

  const mainCategories = CRYPTO_CATEGORIES.slice(0, 4);

  if (loading && coins.length === 0) return <div className="p-20 text-center text-primary font-mono animate-pulse">LOADING MARKET DATA...</div>;

  return (
    <div className="pb-20">
      <div className="mb-8 space-y-6">
        <h1 className="text-4xl font-bold font-heading text-white">Today's Cryptocurrency Prices</h1>
        
        {/* Simple Category List for Demo */}
        <div className="flex flex-wrap items-center gap-3">
          {mainCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeCategory === cat ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <MarketHighlights coins={coins} news={news} />

      <div className="bg-card border border-border overflow-hidden rounded-lg shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">24h %</th>
                <th className="px-6 py-4 text-right">7d %</th>
                <th className="px-6 py-4 text-right">Market Cap</th>
                <th className="px-6 py-4 text-right">Volume</th>
                <th className="px-6 py-4 text-right w-32">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coins.map((coin, index) => (
                <CryptoTableRow key={coin.id} crypto={coin} isStriped={index % 2 === 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
