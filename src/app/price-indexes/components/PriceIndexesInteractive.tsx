'use client';

import React, { useState, useEffect } from 'react';
import { getLivePrices, getRealNews } from '@/lib/api';
import { CRYPTO_CATEGORIES } from '@/lib/categories';
import MarketHighlights from './MarketHighlights';
import CryptoTableRow from './CryptoTableRow';
import Icon from '@/components/ui/AppIcon';

export default function PriceIndexesInteractive() {
  const [coins, setCoins] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All Coins');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiCategory = activeCategory === 'All Coins' ? 'all' : activeCategory;
        
        // 1. Fetch Prices
        const priceRes = await fetch('/api/prices');
        const marketData = await priceRes.json();
        
        if (Array.isArray(marketData)) {
          const formatted = marketData.map((coin: any, index: number) => ({
            id: coin.id,
            rank: coin.market_cap_rank || index + 1,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            price: Number(coin.current_price || coin.price || 0),
            change24h: Number(coin.price_change_percentage_24h || 0),
            change7d: Number(coin.price_change_percentage_7d_in_currency || 0),
            marketCap: Number(coin.market_cap || 0),
            volume24h: Number(coin.total_volume || 0),
            chartData: coin.sparkline_in_7d?.price?.map((p: number) => ({ value: p })) || []
          }));
          setCoins(formatted);
        }

        // 2. Fetch News (Directly from utility for simplicity in Client Components)
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
  const moreCategories = CRYPTO_CATEGORIES.slice(4);

  return (
    <div className="pb-20">
      
      {/* SECTION 1: HEADER & HIGHLIGHTS */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-heading text-white mb-8">Today's Cryptocurrency Prices</h1>
        
        {/* MARKET HIGHLIGHTS (GAINERS/LOSERS) - PASSING FULL DATA */}
        {/* We pass the full 'coins' array so it can calculate top movers */}
        <MarketHighlights coins={coins} news={news} />
      </div>

      {/* SECTION 2: CATEGORY FILTER (Moved DOWN as requested) */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card border border-border rounded-lg">
        <span className="text-xs font-bold text-muted-foreground mr-2 uppercase tracking-wide">Filter By:</span>
        
        {mainCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeCategory === cat 
                ? 'bg-primary text-black' 
                : 'bg-secondary text-muted-foreground hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}

        <div className="relative">
          <button 
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              !mainCategories.includes(activeCategory) ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground hover:text-white'
            }`}
          >
            {mainCategories.includes(activeCategory) ? 'More Categories' : activeCategory}
            <Icon name="ChevronDownIcon" size={14} />
          </button>

          {isCategoryMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-black border border-gray-700 shadow-xl z-50 rounded-lg p-2 grid grid-cols-1">
              {moreCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setIsCategoryMenuOpen(false); }}
                  className="text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-primary hover:text-black rounded transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: DATA TABLE */}
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
              {coins.length > 0 ? coins.map((coin, index) => (
                <CryptoTableRow key={coin.id} crypto={coin} isStriped={index % 2 === 0} />
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    {loading ? "Loading Market Data..." : "No coins found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}